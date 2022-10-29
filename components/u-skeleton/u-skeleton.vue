<template>
	<view
      v-if="props.loading"
      :style="{
        width: state.windowWinth + 'px',
        height: state.windowHeight + 'px',
        backgroundColor: props.bgColor,
        position: 'absolute',
        left: state.left + 'px',
        top: state.top + 'px',
        zIndex: 9998,
        overflow: 'hidden'
      }"
      @touchmove.stop.prevent
  >
		<view
        v-for="(item, index) in state.RectNodes"
        :key="guid()"
        :class="[props.animation ? 'skeleton-fade' : '']"
        :style="{
          width: item.width + 'px',
          height: item.height + 'px',
          backgroundColor: props.elColor,
          position: 'absolute',
          left: (item.left - state.left) + 'px',
          top: (item.top - state.top) + 'px'
        }"
    ></view>
		<view
        v-for="(item, index) in state.circleNodes"
        :key="guid()"
        :class="props.animation ? 'skeleton-fade' : ''"
        :style="{
          width: item.width + 'px',
          height: item.height + 'px',
          backgroundColor: props.elColor,
          borderRadius: item.width/2 + 'px',
          position: 'absolute',
          left: (item.left - state.left) + 'px',
          top: (item.top - state.top) + 'px'
        }"
    ></view>
		<view
        v-for="(item, index) in state.filletNodes"
        :key="guid()"
        :class="props.animation ? 'skeleton-fade' : ''"
        :style="{
          width: item.width + 'px',
          height: item.height + 'px',
          backgroundColor: props.elColor,
          borderRadius: props.borderRadius + 'rpx',
          position: 'absolute',
          left: (item.left - state.left) + 'px',
          top: (item.top - state.top) + 'px'
        }"
    ></view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-skeleton',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, getCurrentInstance, reactive, toRefs, onMounted, withDefaults } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * skeleton 骨架屏
	 * @description 骨架屏一般用于页面在请求远程数据尚未完成时，页面用灰色块预显示本来的页面结构，给用户更好的体验。
	 * @tutorial https://www.uviewui.com/components/skeleton.html
	 * @property {String} el-color 骨架块状元素的背景颜色（默认#e5e5e5）
	 * @property {String} bg-color 骨架组件背景颜色（默认#ffffff）
	 * @property {Boolean} animation 骨架块是否显示动画效果（默认false）
	 * @property {String Number} border-radius u-skeleton-fillet类名元素，对应的骨架块的圆角大小，单位rpx（默认10）
	 * @property {Boolean} loading 是否显示骨架组件，请求完成后，将此值设置为false（默认true）
	 * @example <u-skeleton :loading="true" :animation="true"></u-skeleton>
	 */
  interface NodeItem {
    width: number;
    height: number;
    left: number;
    top: number;
  }
  interface USkeletonState {
    windowWinth: number; // 骨架屏宽度
    windowHeight: number; // 骨架屏高度
    filletNodes: NodeItem[]; // 圆角元素
    circleNodes: NodeItem[]; // 圆形元素
    RectNodes: NodeItem[]; // 矩形元素
    top: number;
    left: number;
  }
  interface USkeletonProps {
    // 需要渲染的元素背景颜色，十六进制或者rgb等都可以
    elColor?: string;
    // 整个骨架屏页面的背景颜色
    bgColor?: string;
    // 是否显示加载动画
    animation?: boolean;
    // 圆角值，只对类名为u-skeleton-fillet的元素生效，为数值，不带单位
    borderRadius?: number | string;
    // 是否显示骨架，true-显示，false-隐藏
    loading?: boolean;
  }

  const props = withDefaults(defineProps<USkeletonProps>(),{
    // 需要渲染的元素背景颜色，十六进制或者rgb等都可以
    elColor: '#e5e5e5',
    // 整个骨架屏页面的背景颜色
    bgColor: '#ffffff',
    // 是否显示加载动画
    animation: false,
    // 圆角值，只对类名为u-skeleton-fillet的元素生效，为数值，不带单位
    borderRadius: "10",
    // 是否显示骨架，true-显示，false-隐藏
    loading: true,
  });

  const { guid, $parentUtil } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<USkeletonState>({
    windowWinth: 750, // 骨架屏宽度
    windowHeight: 1500, // 骨架屏高度
    filletNodes: [], // 圆角元素
    circleNodes: [], // 圆形元素
    RectNodes: [], // 矩形元素
    top: 0,
    left: 0,
  });

  // 矩形元素列表
  const getRectEls = () => {
    let query = null;
    // 在微信小程序中，如果把骨架屏放入组件中使用的话，需要调in(instance)上下文为父组件才有效
    // #ifdef MP-WEIXIN
    query = uni.createSelectorQuery().in($parentUtil());
    // #endif
    // #ifndef MP-WEIXIN
    query = uni.createSelectorQuery();
    // #endif
    query?.selectAll('.u-skeleton-rect').boundingClientRect((result) => result).exec((res) => {
      state.RectNodes = res?.[0];
    });
  };

  // 圆形元素列表
  const getCircleEls = () => {
    let query = null;
    // 在微信小程序中，如果把骨架屏放入组件中使用的话，需要调in(instance)上下文为父组件才有效
    // #ifdef MP-WEIXIN
    query = uni.createSelectorQuery().in($parentUtil());
    // #endif
    // #ifndef MP-WEIXIN
    query = uni.createSelectorQuery();
    // #endif
    query?.selectAll('.u-skeleton-circle').boundingClientRect((result) => result).exec((res) => {
      state.circleNodes = res?.[0];
    });
  };

  // 圆角元素列表
  const getFilletEls = () => {
    let query = null;
    // 在微信小程序中，如果把骨架屏放入组件中使用的话，需要调in(instance)上下文为父组件才有效
    // #ifdef MP-WEIXIN
    query = uni.createSelectorQuery().in($parentUtil());
    // #endif
    // #ifndef MP-WEIXIN
    query = uni.createSelectorQuery();
    // #endif
    query?.selectAll('.u-skeleton-fillet').boundingClientRect((result) => result).exec((res) => {
      state.filletNodes = res?.[0];
    });
  };

  // 查询各节点的信息
  const selecterQueryInfo = () => {
    // 获取整个父组件容器的高度，当做骨架屏的高度
    // 在微信小程序中，如果把骨架屏放入组件中使用的话，需要调in(instance)上下文为父组件才有效
    let query = null;
    // #ifdef MP-WEIXIN
    query = uni.createSelectorQuery().in($parentUtil);
    // #endif
    // #ifndef MP-WEIXIN
    query = uni.createSelectorQuery();
    // #endif
    query?.selectAll('.u-skeleton').boundingClientRect((result) => result).exec((res) => {
      state.windowHeight = res?.[0]?.[0]?.height;
      state.windowWinth = res?.[0]?.[0]?.width;
      state.top = res?.[0]?.[0]?.bottom - res?.[0]?.[0]?.height;
      state.left = res?.[0]?.[0]?.left;
    });
    // 矩形骨架元素
    getRectEls();
    // 圆形骨架元素
    getCircleEls();
    // 圆角骨架元素
    getFilletEls();
  };

  // 组件被挂载
  onMounted(() => {
    // 获取系统信息
    let systemInfo = uni.getSystemInfoSync();
    state.windowHeight = systemInfo.windowHeight;
    state.windowWinth = systemInfo.windowWidth;
    selecterQueryInfo();
  });

  defineExpose({
    ...toRefs(state),
    getRectEls,
    getCircleEls,
    getFilletEls,
    selecterQueryInfo,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.skeleton-fade {
		width: 100%;
		height: 100%;
		background: rgb(194, 207, 214);
		animation-duration: 1.5s;
		animation-name: blink;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0.4;
		}

		100% {
			opacity: 1;
		}
	}
</style>
