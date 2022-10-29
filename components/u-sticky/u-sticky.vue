<template>
  <view class="">
    <view
        :class="['u-sticky-wrap', state.elClass]"
        :style="{
          height: state.fixed ? state.height + 'px' : 'auto',
          backgroundColor: props.bgColor
        }"
    >
      <view
          class="u-sticky"
          :style="{
            position: state.fixed ? 'fixed' : 'static',
            top: state.stickyTop + 'px',
            left: state.left + 'px',
            width: state.width == 'auto' ? 'auto' : state.width + 'px',
            zIndex: uZIndex
          }"
      >
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
  export default {
    name: 'u-sticky',
  }
</script>

<script setup lang="ts">
  import {
    ComponentInternalInstance,
    getCurrentInstance,
    ref,
    reactive,
    toRefs,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
    withDefaults
  } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * sticky 吸顶
	 * @description 该组件与CSS中position: sticky属性实现的效果一致，当组件达到预设的到顶部距离时， 就会固定在指定位置，组件位置大于预设的顶部距离时，会重新按照正常的布局排列。
	 * @tutorial https://www.uviewui.com/components/sticky.html
	 * @property {String Number} offset-top 吸顶时与顶部的距离，单位rpx（默认0）
	 * @property {String Number} index 自定义标识，用于区分是哪一个组件
	 * @property {Boolean} enable 是否开启吸顶功能（默认true）
	 * @property {String} bg-color 组件背景颜色（默认#ffffff）
	 * @property {String Number} z-index 吸顶时的z-index值（默认970）
	 * @property {String Number} h5-nav-height 导航栏高度，自定义导航栏时(无导航栏时需设置为0)，需要传入此值，单位px（默认44）
	 * @event {Function} fixed 组件吸顶时触发
	 * @event {Function} unfixed 组件取消吸顶时触发
	 * @example <u-sticky offset-top="200"><view>塞下秋来风景异，衡阳雁去无留意</view></u-sticky>
	 */
  interface UStickyState {
    fixed: boolean;
    height: number | string;
    stickyTop: number;
    elClass: string;
    left: number;
    width: number | string;
  }
  interface UStickyProps {
    // 吸顶容器到顶部某个距离的时候,是否为px,默认为rpx;
    isUnitPx?: boolean;
    // 吸顶容器到顶部某个距离的时候，进行吸顶，在H5平台，NavigationBar为44px
    offsetTop?: number | string;
    //列表中的索引值
    index?: number | string;
    // 是否开启吸顶功能
    enable?: boolean;
    // h5顶部导航栏的高度
    h5NavHeight?: number | string;
    // 吸顶区域的背景颜色
    bgColor?: string;
    // z-index值
    zIndex?: number | string;
  }

  const props = withDefaults(defineProps<UStickyProps>(),{
    // 吸顶容器到顶部某个距离的时候,是否为px,默认为rpx;
    isUnitPx: false,
    // 吸顶容器到顶部某个距离的时候，进行吸顶，在H5平台，NavigationBar为44px
    offsetTop: 0,
    //列表中的索引值
    index: '',
    // 是否开启吸顶功能
    enable: true,
    // h5顶部导航栏的高度
    h5NavHeight: 44,
    // 吸顶区域的背景颜色
    bgColor: '#ffffff',
    // z-index值
    zIndex: ''
  });

  const emit = defineEmits<{
    (e: 'fixed', index: number | string): void;
    (e: 'unfixed', index: number | string): void;
  }>();

  const { guid, Z_INDEX_CONFIG, getRect } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const contentObserver = ref<UniApp.IntersectionObserver | null>(null);

  const state = reactive<UStickyState>({
    fixed: false,
    height: 'auto',
    stickyTop: 0,
    elClass: guid(),
    left: 0,
    width: 'auto',
  });

  const uZIndex = computed(() => {
    return props.zIndex ? props.zIndex :  Z_INDEX_CONFIG.sticky;
  });

  const disconnectObserver = () => {
    const observer = contentObserver.value;
    observer && observer.disconnect();
  };

  const setFixed = (top: number) => {
    const _fixed = top < state.stickyTop;
    if (_fixed) emit('fixed', props.index);
    else if(state.fixed) emit('unfixed', props.index);
    state.fixed = _fixed;
  };

  const observeContent = () => {
    disconnectObserver();
    const intersectionObserver = uni.createIntersectionObserver(instance?.proxy, {
      thresholds: [0.95, 0.98, 1]
    });
    intersectionObserver.relativeToViewport({
      top: -state.stickyTop
    });
    intersectionObserver.observe(`.${state.elClass}`, (res: any) => {
      if (!props.enable) return;
      setFixed(res.boundingClientRect.top);
    });
    contentObserver.value = intersectionObserver;
  };

  const initObserver = () => {
    if (!props.enable) return;
    const currOffsetTop = props.isUnitPx ? props.offsetTop : uni.upx2px(props.offsetTop);
    // #ifdef H5
    state.stickyTop = props.offsetTop != 0 ? currOffsetTop + props.h5NavHeight : props.h5NavHeight;
    // #endif
    // #ifndef H5
    state.stickyTop = props.offsetTop != 0 ? currOffsetTop : 0;
    // #endif

    disconnectObserver();
    getRect(`.${state.elClass}`).then((res: any) => {
      state.height = res.height;
      state.left = res.left;
      state.width = res.width;
      nextTick(() => {
        observeContent();
      });
    });
  };

  watch(() => props.offsetTop, () => {
    initObserver();
  });

  watch(() => props.enable, (newValue, oldValue) => {
    if (newValue == false) {
      state.fixed = false;
      disconnectObserver();
    } else {
      initObserver();
    }
  });

  onMounted(() => {
    initObserver();
  });

  onBeforeUnmount(() => {
    disconnectObserver();
  });

  defineExpose({
    ...toRefs(state),
    uZIndex,
    initObserver,
    observeContent,
    setFixed,
    disconnectObserver,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-sticky {
		z-index: 9999999999;
	}
</style>
