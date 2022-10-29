<template>
	<view class="u-waterfall">
		<view
      id="u-left-column"
      class="u-column"
    >
      <slot name="left" :leftList="state.leftList"></slot>
    </view>
		<view
      id="u-right-column"
      class="u-column"
    >
      <slot name="right" :rightList="state.rightList"></slot>
    </view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-waterfall',
  }
</script>

<script setup lang="ts">
  import {
    reactive,
    toRefs,
    computed,
    watch,
    onMounted,
    withDefaults
  } from 'vue';
  import { useComposable } from '../../libs/hooks';
	/**
	 * waterfall 瀑布流
	 * @description 这是一个瀑布流形式的组件，内容分为左右两列，结合uView的懒加载组件效果更佳。相较于某些只是奇偶数左右分别，或者没有利用vue作用域插槽的做法，uView的瀑布流实现了真正的 组件化，搭配LazyLoad 懒加载和loadMore 加载更多组件，让您开箱即用，眼前一亮。
	 * @tutorial https://www.uviewui.com/components/waterfall.html
	 * @property {Array} flow-list 用于渲染的数据
	 * @property {String Number} add-time 单条数据添加到队列的时间间隔，单位ms，见上方注意事项说明（默认200）
	 * @example <u-waterfall :flowList="flowList"></u-waterfall>
	 */
  interface UWaterfallState<T> {
    leftList: T[];
    rightList: T[];
    tempList: T[];
    children: T[];
  }
  interface ModelValue<T> {
    [key: string]: T;
  }
  interface UWaterfallProps<T> {
    modelValue: ModelValue<T>[];
    // 每次向结构插入数据的时间间隔，间隔越长，越能保证两列高度相近，但是对用户体验越不好
    // 单位ms
    addTime?: number | string;
    // id值，用于清除某一条数据时，根据此idKey名称找到并移除，如数据为{idx: 22, name: 'lisa'}
    // 那么该把idKey设置为idx
    idKey?: string | number;
  }
  const props = withDefaults(defineProps<UWaterfallProps<T>>(),{
    modelValue: () => [],
    // 每次向结构插入数据的时间间隔，间隔越长，越能保证两列高度相近，但是对用户体验越不好
    // 单位ms
    addTime: 200,
    // id值，用于清除某一条数据时，根据此idKey名称找到并移除，如数据为{idx: 22, name: 'lisa'}
    // 那么该把idKey设置为idx
    idKey: 'id',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: any[]): void;
  }>();

  const { getRect } = useComposable();

  const state = reactive<UWaterfallState<any>>({
    leftList: [],
    rightList: [],
    tempList: [],
    children: [],
  });

  // 破坏flowList变量的引用，否则watch的结果新旧值是一样的
  const copyFlowList = computed(() => {
    return cloneData(props.modelValue);
  });

  const splitData = async () => {
    if (!state.tempList.length) return;
    let leftRect = await getRect('#u-left-column');
    let rightRect = await getRect('#u-right-column');
    // 如果左边小于或等于右边，就添加到左边，否则添加到右边
    let item = state.tempList[0];
    // 解决多次快速上拉后，可能数据会乱的问题，因为经过上面的两个await节点查询阻塞一定时间，加上后面的定时器干扰
    // 数组可能变成[]，导致此item值可能为undefined
    if(!item) return ;
    if (leftRect.height < rightRect.height) {
      state.leftList.push(item);
    } else if (leftRect.height > rightRect.height) {
      state.rightList.push(item);
    } else {
      // 这里是为了保证第一和第二张添加时，左右都能有内容
      // 因为添加第一张，实际队列的高度可能还是0，这时需要根据队列元素长度判断下一个该放哪边
      if (state.leftList.length <= state.rightList.length) {
        state.leftList.push(item);
      } else {
        state.rightList.push(item);
      }
    }
    // 移除临时列表的第一项
    state.tempList.splice(0, 1);
    // 如果临时数组还有数据，继续循环
    if (state.tempList.length) {
      setTimeout(() => {
        splitData();
      }, Number(props.addTime))
    }
  };

  // 复制而不是引用对象和数组
  const cloneData = (data: ModelValue<T>) => {
    return JSON.parse(JSON.stringify(data));
  };

  // 清空数据列表
  const clear = () => {
    state.leftList = [];
    state.rightList = [];
    // 同时清除父组件列表中的数据
    emit('update:modelValue', []);
    state.tempList = [];
  };

  // 清除某一条指定的数据，根据id实现
  const remove = (id: string) => {
    // 如果findIndex找不到合适的条件，就会返回-1
    let index = -1;
    const _idKey = props.idKey;
    index = state.leftList.findIndex((val: ModelValue<T>) => val[_idKey] == id);
    if(index != -1) {
      // 如果index不等于-1，说明已经找到了要找的id，根据index索引删除这一条数据
      state.leftList.splice(index, 1);
    } else {
      // 同理于上方面的方法
      index = state.rightList.findIndex((val: ModelValue<T>) => val[_idKey] == id);
      if(index != -1) state.rightList.splice(index, 1);
    }
    // 同时清除父组件的数据中的对应id的条目
    index = props.modelValue.findIndex((val: ModelValue<T>) => val[_idKey] == id);
    if(index != -1) emit('update:modelValue', props.modelValue.splice(index, 1));
  };

  // 修改某条数据的某个属性
  const modify = (id: string, key: string, value: any) => {
    const _idKey = props.idKey;
    // 如果findIndex找不到合适的条件，就会返回-1
    let index = -1;
    index = state.leftList.findIndex((val) => val[_idKey] == id);
    if(index != -1) {
      // 如果index不等于-1，说明已经找到了要找的id，修改对应key的值
      state.leftList[index][key] = value;
    } else {
      // 同理于上方面的方法
      index = state.rightList.findIndex((val) => val[_idKey] == id);
      if(index != -1) state.rightList[index][key] = value;
    }
    // 修改父组件的数据中的对应id的条目
    index = props.modelValue.findIndex((val: any) => val[_idKey] == id);
    if(index != -1) {
      // 首先复制一份value的数据
      let data = cloneData(props.modelValue);
      // 修改对应索引的key属性的值为value
      data[index][key] = value;
      // 修改父组件通过v-model绑定的变量的值
      emit('update:modelValue', data);
    }
  };

  watch(() => copyFlowList.value, (newValue, oldValue) => {
    // 取差值，即这一次数组变化新增的部分
    let startIndex = Array.isArray(oldValue) && oldValue.length > 0 ? oldValue.length : 0;
    // 拼接上原有数据
    state.tempList = state.tempList.concat(cloneData(newValue.slice(startIndex)));
    splitData();
  });

  onMounted(() => {
    state.tempList = cloneData(copyFlowList.value);
    splitData();
  });

  defineExpose({
    ...toRefs(state),
    copyFlowList,
    clear,
    remove,
    modify, // 新增API,勿移除
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-waterfall {
		@include vue-flex;
		flex-direction: row;
		align-items: flex-start;
	}

	.u-column {
		@include vue-flex;
		flex: 1;
		flex-direction: column;
		height: auto;
	}

	.u-image {
		width: 100%;
	}
</style>
