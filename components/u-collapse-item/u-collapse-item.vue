<template>
	<view
      class="u-collapse-item"
      :style="[state.itemStyle]"
  >
		<view
        :hover-stay-time="200"
        class="u-collapse-head"
        @tap.stop="headClick"
        :hover-class="state.hoverClass"
        :style="[state.headStyle]"
    >
			<block
          v-if="!titleAllSlot"
      >
				<view
            v-if="!titleSlot"
            class="u-collapse-title u-line-1"
            :style="[
               {
                  textAlign: props.align ? props.align : 'left'
               },
              state.isShow && props.activeStyle && !state.arrow ? props.activeStyle : ''
            ]"
        >
					{{ props.title }}
				</view>
				<slot v-else name="title" />
				<view class="u-icon-wrap">
					<u-icon
              v-if="state.arrow"
              :color="state.arrowColor"
              :class="{ 'u-arrow-down-icon-active': state.isShow }"
              class="u-arrow-down-icon"
              name="arrow-down"
          ></u-icon>
				</view>
			</block>
			<slot v-else name="title-all" />
		</view>
		<view
        class="u-collapse-body"
        :style="[{
				  height: state.isShow ? state.height + 'px' : '0'
			  }]"
    >
			<view
          class="u-collapse-content"
          :id="state.elId"
          :style="[state.bodyStyle]"
      >
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-collapse-item',
  }
</script>

<script setup lang="ts">
  import {
    ComponentInternalInstance,
    CSSProperties,
    getCurrentInstance,
    nextTick,
    reactive,
    toRefs,
    watch,
    onMounted,
    withDefaults,
    useSlots,
    ref,
  } from 'vue';
  import { useComposable } from '../../libs/hooks';
	/**
	 * collapseItem 手风琴Item
	 * @description 通过折叠面板收纳内容区域（搭配u-collapse使用）
	 * @tutorial https://www.uviewui.com/components/collapse.html
	 * @property {String} title 面板标题
	 * @property {String Number} index 主要用于事件的回调，标识那个Item被点击
	 * @property {Boolean} disabled 面板是否可以打开或收起（默认false）
	 * @property {Boolean} open 设置某个面板的初始状态是否打开（默认false）
	 * @property {String Number} name 唯一标识符，如不设置，默认用当前collapse-item的索引值
	 * @property {String} align 标题的对齐方式（默认left）
	 * @property {Object} active-style 不显示箭头时，可以添加当前选择的collapse-item活动样式，对象形式
	 * @event {Function} change 某个item被打开或者收起时触发
	 * @example <u-collapse-item :title="item.head" v-for="(item, index) in itemList" :key="index">{{item.body}}</u-collapse-item>
	 */
  interface UCollapseItemChangeProps {
    index: string | number;
    show: boolean;
  }
  interface UCollapseItemState {
    isShow: boolean;
    elId: string | number;
    height: number; // body内容的高度
    headStyle: CSSProperties; // 头部样式，对象形式
    bodyStyle: CSSProperties; // 主体部分样式
    itemStyle: CSSProperties; // 每个item的整体样式
    arrowColor: string; // 箭头的颜色
    hoverClass: string; // 头部按下时的效果样式类
    arrow: boolean; // 是否显示右侧箭头
  }
  interface UCollapseItemProps  {
    // 标题
    title?: string;
    // 标题的对齐方式
    align?: string;
    // 是否可以点击收起
    disabled?: boolean;
    // collapse显示与否
    open?: boolean;
    // 唯一标识符
    name: string | number;
    //活动样式
    activeStyle?: CSSProperties;
    // 标识当前为第几个
    index: string | number;
  }

  const titleAllSlot = useSlots()['title-all'];
  const titleSlot = useSlots().title;

  const props = withDefaults(defineProps<UCollapseItemProps>(),  {
    // 标题
    title: '',
    // 标题的对齐方式
    align: 'left',
    // 是否可以点击收起
    disabled: false,
    // collapse显示与否
    open: false,
    // 唯一标识符
    name: '',
    //活动样式
    activeStyle: () => {
      return {}
    },
    // 标识当前为第几个
    index: '',
  });

  const emit = defineEmits<{
    (e: 'change', obj: UCollapseItemChangeProps): void;
  }>();

  const { guid, $parentUtil, getRect } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UCollapseItemState>({
    isShow: false,
    elId: guid(),
    height: 0, // body内容的高度
    headStyle: {}, // 头部样式，对象形式
    bodyStyle: {}, // 主体部分样式
    itemStyle: {}, // 每个item的整体样式
    arrowColor: '', // 箭头的颜色
    hoverClass: '', // 头部按下时的效果样式类
    arrow: true, // 是否显示右侧箭头
  });

  const parent = ref<ComponentInternalInstance | null>(null);
  const nameSync = ref<string | number>('');
  // 获取u-collapse的信息，放在u-collapse是为了方便，不用每个u-collapse-item写一遍
  state.isShow = props.open;

  watch(() => props.open, (newValue: boolean, oldValue: boolean) => {
    state.isShow = newValue;
  });

  // 查询内容高度
  const queryRect = () => {
    // $uGetRect为uView自带的节点查询简化方法，详见文档介绍：https://www.uviewui.com/js/getRect.html
    // 组件内部一般用getRect，对外的为getRect，二者功能一致，名称不同
    getRect('#' + state.elId).then((res: any) => {
      state.height = res.height;
    });
  };

  // 异步获取内容，或者动态修改了内容时，需要重新初始化
  const init = () => {
    parent.value = $parentUtil('u-collapse');
    if(parent.value?.exposeProxy) {
      nameSync.value = props.name ? props.name : parent.value?.exposeProxy?.children?.length;
      if (instance) {
        parent.value?.exposeProxy?.children?.push(instance?.exposeProxy);
      }
      state.headStyle = parent.value?.exposeProxy?.headStyle;
      state.bodyStyle = parent.value?.exposeProxy?.bodyStyle;
      state.arrowColor = parent.value?.exposeProxy?.arrowColor;
      state.hoverClass = parent.value?.exposeProxy?.hoverClass;
      state.arrow = parent.value?.exposeProxy?.arrow;
      state.itemStyle = parent.value?.exposeProxy?.itemStyle;
    }
    nextTick(() => {
      queryRect();
    });
  };

  // 点击collapsehead头部
  const headClick = () => {
    if (props.disabled) return;
    if (parent.value?.exposeProxy?.accordion == true) {
      parent.value?.exposeProxy?.children?.map((val: any) => {
        // 自身不设置为false，因为后面有this.isShow = !this.isShow;处理了
        if (instance?.proxy != val) {
          val.isShow = false;
        }
      });
    }

    state.isShow = !state.isShow;
    // 触发本组件的事件
    emit('change', {
      index: props.index,
      show: state.isShow
    })
    // 只有在打开时才发出事件
    if (state.isShow) {
      parent.value?.exposeProxy?.onChange();
    }
    instance?.proxy?.$forceUpdate();
  };

  onMounted(() => {
    init();
  });

  defineExpose({
    ...toRefs(state),
    init,
    headClick,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-collapse-head {
		position: relative;
		@include vue-flex;
		justify-content: space-between;
		align-items: center;
		color: $u-main-color;
		font-size: 30rpx;
		line-height: 1;
		padding: 24rpx 0;
		text-align: left;
	}

	.u-collapse-title {
		flex: 1;
		overflow: hidden;
	}

	.u-arrow-down-icon {
		transition: all 0.3s;
		margin-right: 20rpx;
		margin-left: 14rpx;
	}

	.u-arrow-down-icon-active {
		transform: rotate(180deg);
		transform-origin: center center;
	}

	.u-collapse-body {
		overflow: hidden;
		transition: all 0.3s;
	}

	.u-collapse-content {
		overflow: hidden;
		font-size: 28rpx;
		color: $u-tips-color;
		text-align: left;
	}
</style>
