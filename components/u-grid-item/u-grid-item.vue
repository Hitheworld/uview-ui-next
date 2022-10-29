<template>
	<view
      class="u-grid-item"
      :hover-class="state.parentData.hoverClass"
      :hover-stay-time="200"
      @tap="click"
      :style="{
        background: props.bgColor,
        width: width,
      }"
  >
		<view
        class="u-grid-item-box"
        :style="[props.customStyle]"
        :class="[state.parentData.border ? 'u-border-right u-border-bottom' : '']"
    >
			<slot />
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-grid-item',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, getCurrentInstance, ref, reactive, toRefs, computed, withDefaults, CSSProperties} from "vue";
  import { useComposable } from '../../libs/hooks';

	/**
	 * gridItem 提示
	 * @description 宫格组件一般用于同时展示多个同类项目的场景，可以给宫格的项目设置徽标组件(badge)，或者图标等，也可以扩展为左右滑动的轮播形式。搭配u-grid使用
	 * @tutorial https://www.uviewui.com/components/grid.html
	 * @property {String} bg-color 宫格的背景颜色（默认#ffffff）
	 * @property {String Number} index 点击宫格时，返回的值
	 * @property {Object} custom-style 自定义样式，对象形式
	 * @event {Function} click 点击宫格触发
	 * @example <u-grid-item></u-grid-item>
	 */
  interface UGridItemState {
    parentData: {
      hoverClass: string; // 按下去的时候，是否显示背景灰色
      col: number | string; // 父组件划分的宫格数
      border: boolean; // 是否显示边框，根据父组件决定
    };
  }
  interface UGridItemProps {
    // 背景颜色
    bgColor?: string;
    // 点击时返回的index
    index?: number | string;
    // 自定义样式，对象形式
    customStyle?: CSSProperties;
  }

  const props = withDefaults(defineProps<UGridItemProps>(),{
    // 背景颜色
    bgColor: '#ffffff',
    // 点击时返回的index
    index: '',
    // 自定义样式，对象形式
    customStyle: () => {
      return {
        padding: '30rpx 0'
      }
    },
  });

  const emit = defineEmits<{
    (e: 'click', index: string | number): void;
  }>();

  const { $parentUtil, parent } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UGridItemState>({
    parentData: {
      hoverClass: '', // 按下去的时候，是否显示背景灰色
      col: 3, // 父组件划分的宫格数
      border: true, // 是否显示边框，根据父组件决定
    },
  });

  // 每个grid-item的宽度
  const width = computed(() => {
    return 100 / Number(state.parentData.col) + '%';
  });

  const getParentData = (parentName = '') => {
    // 避免在created中去定义parent变量
    if(!parent.value) parent.value = null;
    // 这里的本质原理是，通过获取父组件实例(也即u-radio-group的this)
    // 将父组件this中对应的参数，赋值给本组件(u-radio的this)的parentData对象中对应的属性
    // 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
    parent.value = $parentUtil(parentName);
    if(parent.value) {
      // 历遍parentData中的属性，将parent中的同名属性赋值给parentData
      Object.keys(state.parentData).map((key: string) => {
        state.parentData[key] = parent.value?.props?.[key];
      });
    }
  };

  // 获取父组件的参数
  const updateParentData = () => {
    // 此方法写在mixin中
    getParentData('u-grid');
  };

  const click = () => {
    emit('click', props.index || '');
    parent.value && parent.value?.exposeProxy?.click(props.index);
  };

  // 父组件的实例
  updateParentData();
  // this.parent在updateParentData()中定义
  parent.value?.exposeProxy?.children?.push(instance);

  defineExpose({
    ...toRefs(state),
    width,
    updateParentData,
    click,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-grid-item {
		box-sizing: border-box;
		background: #fff;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;

		/* #ifdef MP */
		position: relative;
		float: left;
		/* #endif */
	}

	.u-grid-item-hover {
		background: #f7f7f7 !important;
	}

	.u-grid-marker-box {
		position: absolute;
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		line-height: 0;
	}

	.u-grid-marker-wrap {
		position: absolute;
	}

	.u-grid-item-box {
		padding: 30rpx 0;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		flex: 1;
		width: 100%;
		height: 100%;
	}
</style>
