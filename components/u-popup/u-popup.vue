<template>
	<view
      v-if="state.visibleSync"
      :style="[props.customStyle,
       {
        zIndex: uZindex - 1
      }]"
      class="u-drawer"
      hover-stop-propagation
  >
		<u-mask
        :duration="props.duration"
        :custom-style="props.maskCustomStyle"
        :maskClickAble="props.maskCloseAble"
        :z-index="uZindex - 2"
        :show="state.showDrawer && props.mask"
        @click="maskClick"
    ></u-mask>
		<view
			class="u-drawer-content"
			@tap="modeCenterClose(props.mode)"
			:class="[
				props.safeAreaInsetBottom ? 'safe-area-inset-bottom' : '',
				'u-drawer-' + props.mode,
				state.showDrawer ? 'u-drawer-content-visible' : '',
				props.zoom && props.mode == 'center' ? 'u-animation-zoom' : ''
			]"
			@touchmove.stop.prevent
			@tap.stop.prevent
			:style="[style]"
		>
			<template v-if="props.isScroll">
				<view
            class="u-mode-center-box"
            @tap.stop.prevent
            @touchmove.stop.prevent
            v-if="props.mode == 'center'"
            :style="[centerStyle]"
        >
					<u-icon
						@click="close"
						v-if="props.closeable"
						class="u-close"
						:class="['u-close--' + props.closeIconPos]"
						:name="props.closeIcon"
						:color="props.closeIconColor"
						:size="props.closeIconSize"
					></u-icon>
					<scroll-view class="u-drawer__scroll-view" scroll-y="true">
						<slot />
					</scroll-view>
				</view>
				<scroll-view class="u-drawer__scroll-view" scroll-y="true" v-else>
					<slot />
				</scroll-view>
			</template>
			<template v-else>
				<view
            class="u-mode-center-box"
            @tap.stop.prevent
            @touchmove.stop.prevent
            v-if="props.mode == 'center'"
            :style="[centerStyle]"
        >
					<u-icon
						@click="close"
						v-if="props.closeable"
						class="u-close"
						:class="['u-close--' + props.closeIconPos]"
						:name="props.closeIcon"
						:color="props.closeIconColor"
						:size="props.closeIconSize"
					></u-icon>
					<view class="u-drawer__scroll-view">
						<slot />
					</view>
				</view>
				<view class="u-drawer__scroll-view" v-else>
					<slot />
				</view>
			</template>

			<view
          @tap="close"
          class="u-close"
          :class="['u-close--' + props.closeIconPos]"
      >
				<u-icon
					v-if="props.mode != 'center' && props.closeable"
					:name="props.closeIcon"
					:color="props.closeIconColor"
					:size="props.closeIconSize"
				></u-icon>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-popup',
  }
</script>

<script setup lang="ts">
  import {
    CSSProperties,
    reactive,
    toRefs,
    computed,
    watch,
    nextTick,
    onMounted,
    withDefaults
  } from "vue";
  import { useComposable } from '../../libs/hooks';

  /**
   * popup 弹窗
   * @description 弹出层容器，用于展示弹窗、信息提示等内容，支持上、下、左、右和中部弹出。组件只提供容器，内部内容由用户自定义
   * @tutorial https://www.uviewui.com/components/popup.html
   * @property {String} mode 弹出方向（默认left）
   * @property {Boolean} mask 是否显示遮罩（默认true）
   * @property {Stringr | Number} length mode=left | 见官网说明（默认auto）
   * @property {Boolean} zoom 是否开启缩放动画，只在mode为center时有效（默认true）
   * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配（默认false）
   * @property {Boolean} mask-close-able 点击遮罩是否可以关闭弹出层（默认true）
   * @property {Object} custom-style 用户自定义样式
   * @property {Stringr | Number} negative-top 中部弹出时，往上偏移的值
   * @property {Numberr | String} border-radius 弹窗圆角值（默认0）
   * @property {Numberr | String} z-index 弹出内容的z-index值（默认1075）
   * @property {Boolean} closeable 是否显示关闭图标（默认false）
   * @property {String} close-icon 关闭图标的名称，只能uView的内置图标
   * @property {String} close-icon-pos 自定义关闭图标位置（默认top-right）
   * @property {String} close-icon-color 关闭图标的颜色（默认#909399）
   * @property {Number | String} close-icon-size 关闭图标的大小，单位rpx（默认30）
   * @event {Function} open 弹出层打开
   * @event {Function} close 弹出层收起
   * @example <u-popup v-model="show"><view>出淤泥而不染，濯清涟而不妖</view></u-popup>
   */
  interface UPopupState {
    visibleSync: boolean;
    showDrawer: boolean;
    timer: number | null;
    closeFromInner: boolean; // value的值改变，是发生在内部还是外部
  }
  interface UPopupProps {
    /**
     * 显示状态
     */
    show?: boolean;
    isScroll?: boolean;
    /**
     * 弹出方向，left|right|top|bottom|center
     */
    mode?: 'left'|'right'|'top'|'bottom'|'center';
    /**
     * 是否显示遮罩
     */
    mask?: boolean;
    // 抽屉的宽度(mode=left|right)，或者高度(mode=top|bottom)，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度
    length?: number | string;
    // 是否开启缩放动画，只在mode=center时有效
    zoom?: boolean;
    // 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距
    safeAreaInsetBottom?: boolean;
    // 是否可以通过点击遮罩进行关闭
    maskCloseAble?: boolean;
    // 用户自定义样式
    customStyle?: CSSProperties;
    modelValue: boolean;
    // 此为内部参数，不在文档对外使用，为了解决Picker和keyboard等融合了弹窗的组件
    // 对v-model双向绑定多层调用造成报错不能修改props值的问题
    popup?: boolean;
    // 显示显示弹窗的圆角，单位rpx
    borderRadius?: number | string;
    zIndex?: number | string;
    // 是否显示关闭图标
    closeable?: boolean;
    // 关闭图标的名称，只能uView的内置图标
    closeIcon?: string;
    // 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角
    closeIconPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    // 关闭图标的颜色
    closeIconColor?: string;
    // 关闭图标的大小，单位rpx
    closeIconSize?: number | string;
    // 宽度，只对左，右，中部弹出时起作用，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度，优先级高于length参数
    width?: string;
    // 高度，只对上，下，中部弹出时起作用，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度，优先级高于length参数
    height?: string;
    // 给一个负的margin-top，往上偏移，避免和键盘重合的情况，仅在mode=center时有效
    negativeTop?: number | string;
    // 遮罩的样式，一般用于修改遮罩的透明度
    maskCustomStyle?: CSSProperties;
    // 遮罩打开或收起的动画过渡时间，单位ms
    duration?: number | string;
  }

  const props = withDefaults(defineProps<UPopupProps>(),{
    /**
     * 显示状态
     */
    show: false,
    isScroll: false,
    /**
     * 弹出方向，left|right|top|bottom|center
     */
    mode: 'left',
    /**
     * 是否显示遮罩
     */
    mask: true,
    // 抽屉的宽度(mode=left|right)，或者高度(mode=top|bottom)，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度
    length: 'auto',
    // 是否开启缩放动画，只在mode=center时有效
    zoom: true,
    // 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距
    safeAreaInsetBottom: false,
    // 是否可以通过点击遮罩进行关闭
    maskCloseAble: true,
    // 用户自定义样式
    customStyle: {},
    modelValue: false,
    // 此为内部参数，不在文档对外使用，为了解决Picker和keyboard等融合了弹窗的组件
    // 对v-model双向绑定多层调用造成报错不能修改props值的问题
    popup: true,
    // 显示显示弹窗的圆角，单位rpx
    borderRadius: 0,
    zIndex: '',
    // 是否显示关闭图标
    closeable: false,
    // 关闭图标的名称，只能uView的内置图标
    closeIcon: 'close',
    // 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角
    closeIconPos: 'top-right',
    // 关闭图标的颜色
    closeIconColor: '#909399',
    // 关闭图标的大小，单位rpx
    closeIconSize: '30',
    // 宽度，只对左，右，中部弹出时起作用，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度，优先级高于length参数
    width: '',
    // 高度，只对上，下，中部弹出时起作用，单位rpx，或者"auto"
    // 或者百分比"50%"，表示由内容撑开高度或者宽度，优先级高于length参数
    height: '',
    // 给一个负的margin-top，往上偏移，避免和键盘重合的情况，仅在mode=center时有效
    negativeTop: 0,
    // 遮罩的样式，一般用于修改遮罩的透明度
    maskCustomStyle: () => {
      return {}
    },
    // 遮罩打开或收起的动画过渡时间，单位ms
    duration: 250,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', bool: boolean): void;
    (e: 'open'): void;
    (e: 'close'): void;
  }>();

  const { addUnit, Z_INDEX_CONFIG } = useComposable();

  const state = reactive<UPopupState>({
    visibleSync: false,
    showDrawer: false,
    timer: null,
    closeFromInner: false, // value的值改变，是发生在内部还是外部
  });

  // 判断传入的值，是否带有单位，如果没有，就默认用rpx单位
  const getUnitValue = (val: string) => {
    if(/(%|px|rpx|auto)$/.test(val)) return val;
    else return val + 'rpx'
  };

  // 计算整理后的z-index值
  const uZindex = computed(() => {
    return props.zIndex ? Number(props.zIndex) : Z_INDEX_CONFIG.popup;
  });

  // 根据mode的位置，设定其弹窗的宽度(mode = left|right)，或者高度(mode = top|bottom)
  const style = computed(() => {
    let style: CSSProperties = {};
    // 如果是左边或者上边弹出时，需要给translate设置为负值，用于隐藏
    if (props.mode == 'left' || props.mode == 'right') {
      style = {
        width: props.width ? getUnitValue(props.width) : getUnitValue(props.length),
        height: '100%',
        transform: `translate3D(${props.mode == 'left' ? '-100%' : '100%'},0px,0px)`
      };
    } else if (props.mode == 'top' || props.mode == 'bottom') {
      style = {
        width: '100%',
        height: props.height ? getUnitValue(props.height) : getUnitValue(props.length),
        transform: `translate3D(0px,${props.mode == 'top' ? '-100%' : '100%'},0px)`
      };
    }
    style.zIndex = uZindex.value;
    // 如果用户设置了borderRadius值，添加弹窗的圆角
    if (props.borderRadius) {
      switch (props.mode) {
        case 'left':
          style.borderRadius = `0 ${props.borderRadius}rpx ${props.borderRadius}rpx 0`;
          break;
        case 'top':
          style.borderRadius = `0 0 ${props.borderRadius}rpx ${props.borderRadius}rpx`;
          break;
        case 'right':
          style.borderRadius = `${props.borderRadius}rpx 0 0 ${props.borderRadius}rpx`;
          break;
        case 'bottom':
          style.borderRadius = `${props.borderRadius}rpx ${props.borderRadius}rpx 0 0`;
          break;
        default:
      }
      // 不加可能圆角无效
      style.overflow = 'hidden';
    }
    if(props.duration) style.transition = `all ${props.duration / 1000}s linear`;
    return style;
  });

  // 中部弹窗的特有样式
  const centerStyle = computed(() => {
    let style: CSSProperties = {};
    style.width = props.width ? getUnitValue(props.width) : getUnitValue(props.length);
    // 中部弹出的模式，如果没有设置高度，就用auto值，由内容撑开高度
    style.height = props.height ? getUnitValue(props.height) : 'auto';
    style.zIndex = uZindex.value;
    style.marginTop = `-${addUnit(props.negativeTop)}`;
    if (props.borderRadius) {
      style.borderRadius = `${props.borderRadius}rpx`;
      // 不加可能圆角无效
      style.overflow = 'hidden';
    }
    return style;
  });

  // 此处的原理是，关闭时先通过动画隐藏弹窗和遮罩，再移除整个组件
  // 打开时，先渲染组件，延时一定时间再让遮罩和弹窗的动画起作用
  const change = (param1: 'showDrawer' | 'visibleSync', param2: 'showDrawer' | 'visibleSync', bool: boolean) => {
    // 如果state.popup为false，意味着为picker，actionsheet等组件调用了popup组件
    if (props.popup == true) {
      emit('update:modelValue', bool);
    }
    state[param1] = bool;
    if(bool) {
      // #ifdef H5 || MP
      state.timer = setTimeout(() => {
        state[param2] = bool;
        emit(bool ? 'open' : 'close');
      }, 50);
      // #endif
      // #ifndef H5 || MP
      nextTick(() => {
        state[param2] = bool;
        emit(bool ? 'open' : 'close');
      })
      // #endif
    } else {
      state.timer = setTimeout(() => {
        state[param2] = bool;
        emit(bool ? 'open' : 'close');
      }, Number(props.duration));
    }
  };

  const close = () => {
    // 标记关闭是内部发生的，否则修改了value值，导致watch中对value检测，导致再执行一遍close
    // 造成@close事件触发两次
    state.closeFromInner = true;
    change('showDrawer', 'visibleSync', false);
  };

  // 遮罩被点击
  const maskClick = () => {
    close();
  };

  // 中部弹出时，需要.u-drawer-content将居中内容，此元素会铺满屏幕，点击需要关闭弹窗
  // 让其只在mode=center时起作用
  const modeCenterClose = (mode: string) => {
    if (mode != 'center' || !props.maskCloseAble) return;
    close();
  };

  const open = () => {
    change('visibleSync', 'showDrawer', true);
  };

  watch(() => props.modelValue, (newValue, oldValue) => {
    if (newValue) {
      open();
    } else if(!state.closeFromInner) {
      close();
    }
    state.closeFromInner = false;
  });

  onMounted(() => {
    // 组件渲染完成时，检查value是否为true，如果是，弹出popup
    props.modelValue && open();
  });

  defineExpose({
    ...toRefs(state),
    style,
    centerStyle,
    uZindex,
    getUnitValue,
    maskClick,
    close,
    modeCenterClose,
    open,
    change,
  });
</script>

<style scoped lang="scss">
  @import "../../libs/css/style.components.scss";

  .u-drawer {
    /* #ifndef APP-NVUE */
    display: block;
    /* #endif */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }

  .u-drawer-content {
    /* #ifndef APP-NVUE */
    display: block;
    /* #endif */
    position: absolute;
    z-index: 1003;
    transition: all 0.25s linear;
  }

  .u-drawer__scroll-view {
    width: 100%;
    height: 100%;
  }

  .u-drawer-left {
    top: 0;
    bottom: 0;
    left: 0;
    background-color: #ffffff;
  }

  .u-drawer-right {
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #ffffff;
  }

  .u-drawer-top {
    top: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
  }

  .u-drawer-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
  }

  .u-drawer-center {
    @include vue-flex;
    flex-direction: column;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    justify-content: center;
    align-items: center;
    opacity: 0;
    z-index: 99999;
  }

  .u-mode-center-box {
    min-width: 100rpx;
    min-height: 100rpx;
    /* #ifndef APP-NVUE */
    display: block;
    /* #endif */
    position: relative;
    background-color: #ffffff;
  }

  .u-drawer-content-visible.u-drawer-center {
    transform: scale(1);
    opacity: 1;
  }

  .u-animation-zoom {
    transform: scale(1.15);
  }

  .u-drawer-content-visible {
    transform: translate3D(0px, 0px, 0px) !important;
  }

  .u-close {
    position: absolute;
    z-index: 3;
  }

  .u-close--top-left {
    top: 30rpx;
    left: 30rpx;
  }

  .u-close--top-right {
    top: 30rpx;
    right: 30rpx;
  }

  .u-close--bottom-left {
    bottom: 30rpx;
    left: 30rpx;
  }

  .u-close--bottom-right {
    right: 30rpx;
    bottom: 30rpx;
  }
</style>
