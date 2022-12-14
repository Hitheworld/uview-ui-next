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
   * popup ??????
   * @description ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
   * @tutorial https://www.uviewui.com/components/popup.html
   * @property {String} mode ?????????????????????left???
   * @property {Boolean} mask ???????????????????????????true???
   * @property {Stringr | Number} length mode=left | ????????????????????????auto???
   * @property {Boolean} zoom ?????????????????????????????????mode???center??????????????????true???
   * @property {Boolean} safe-area-inset-bottom ??????????????????????????????????????????false???
   * @property {Boolean} mask-close-able ????????????????????????????????????????????????true???
   * @property {Object} custom-style ?????????????????????
   * @property {Stringr | Number} negative-top ????????????????????????????????????
   * @property {Numberr | String} border-radius ????????????????????????0???
   * @property {Numberr | String} z-index ???????????????z-index????????????1075???
   * @property {Boolean} closeable ?????????????????????????????????false???
   * @property {String} close-icon ??????????????????????????????uView???????????????
   * @property {String} close-icon-pos ????????????????????????????????????top-right???
   * @property {String} close-icon-color ??????????????????????????????#909399???
   * @property {Number | String} close-icon-size ??????????????????????????????rpx?????????30???
   * @event {Function} open ???????????????
   * @event {Function} close ???????????????
   * @example <u-popup v-model="show"><view>???????????????????????????????????????</view></u-popup>
   */
  interface UPopupState {
    visibleSync: boolean;
    showDrawer: boolean;
    timer: number | null;
    closeFromInner: boolean; // value?????????????????????????????????????????????
  }
  interface UPopupProps {
    /**
     * ????????????
     */
    show?: boolean;
    isScroll?: boolean;
    /**
     * ???????????????left|right|top|bottom|center
     */
    mode?: 'left'|'right'|'top'|'bottom'|'center';
    /**
     * ??????????????????
     */
    mask?: boolean;
    // ???????????????(mode=left|right)???????????????(mode=top|bottom)?????????rpx?????????"auto"
    // ???????????????"50%"??????????????????????????????????????????
    length?: number | string;
    // ?????????????????????????????????mode=center?????????
    zoom?: boolean;
    // ?????????????????????????????????????????????????????????iPhoneX????????????????????????????????????
    safeAreaInsetBottom?: boolean;
    // ??????????????????????????????????????????
    maskCloseAble?: boolean;
    // ?????????????????????
    customStyle?: CSSProperties;
    modelValue: boolean;
    // ????????????????????????????????????????????????????????????Picker???keyboard???????????????????????????
    // ???v-model????????????????????????????????????????????????props????????????
    popup?: boolean;
    // ????????????????????????????????????rpx
    borderRadius?: number | string;
    zIndex?: number | string;
    // ????????????????????????
    closeable?: boolean;
    // ??????????????????????????????uView???????????????
    closeIcon?: string;
    // ??????????????????????????????top-left???????????????top-right???????????????bottom-left???????????????bottom-right????????????
    closeIconPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    // ?????????????????????
    closeIconColor?: string;
    // ??????????????????????????????rpx
    closeIconSize?: number | string;
    // ????????????????????????????????????????????????????????????rpx?????????"auto"
    // ???????????????"50%"????????????????????????????????????????????????????????????length??????
    width?: string;
    // ????????????????????????????????????????????????????????????rpx?????????"auto"
    // ???????????????"50%"????????????????????????????????????????????????????????????length??????
    height?: string;
    // ???????????????margin-top?????????????????????????????????????????????????????????mode=center?????????
    negativeTop?: number | string;
    // ??????????????????????????????????????????????????????
    maskCustomStyle?: CSSProperties;
    // ???????????????????????????????????????????????????ms
    duration?: number | string;
  }

  const props = withDefaults(defineProps<UPopupProps>(),{
    /**
     * ????????????
     */
    show: false,
    isScroll: false,
    /**
     * ???????????????left|right|top|bottom|center
     */
    mode: 'left',
    /**
     * ??????????????????
     */
    mask: true,
    // ???????????????(mode=left|right)???????????????(mode=top|bottom)?????????rpx?????????"auto"
    // ???????????????"50%"??????????????????????????????????????????
    length: 'auto',
    // ?????????????????????????????????mode=center?????????
    zoom: true,
    // ?????????????????????????????????????????????????????????iPhoneX????????????????????????????????????
    safeAreaInsetBottom: false,
    // ??????????????????????????????????????????
    maskCloseAble: true,
    // ?????????????????????
    customStyle: {},
    modelValue: false,
    // ????????????????????????????????????????????????????????????Picker???keyboard???????????????????????????
    // ???v-model????????????????????????????????????????????????props????????????
    popup: true,
    // ????????????????????????????????????rpx
    borderRadius: 0,
    zIndex: '',
    // ????????????????????????
    closeable: false,
    // ??????????????????????????????uView???????????????
    closeIcon: 'close',
    // ??????????????????????????????top-left???????????????top-right???????????????bottom-left???????????????bottom-right????????????
    closeIconPos: 'top-right',
    // ?????????????????????
    closeIconColor: '#909399',
    // ??????????????????????????????rpx
    closeIconSize: '30',
    // ????????????????????????????????????????????????????????????rpx?????????"auto"
    // ???????????????"50%"????????????????????????????????????????????????????????????length??????
    width: '',
    // ????????????????????????????????????????????????????????????rpx?????????"auto"
    // ???????????????"50%"????????????????????????????????????????????????????????????length??????
    height: '',
    // ???????????????margin-top?????????????????????????????????????????????????????????mode=center?????????
    negativeTop: 0,
    // ??????????????????????????????????????????????????????
    maskCustomStyle: () => {
      return {}
    },
    // ???????????????????????????????????????????????????ms
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
    closeFromInner: false, // value?????????????????????????????????????????????
  });

  // ?????????????????????????????????????????????????????????????????????rpx??????
  const getUnitValue = (val: string) => {
    if(/(%|px|rpx|auto)$/.test(val)) return val;
    else return val + 'rpx'
  };

  // ??????????????????z-index???
  const uZindex = computed(() => {
    return props.zIndex ? Number(props.zIndex) : Z_INDEX_CONFIG.popup;
  });

  // ??????mode????????????????????????????????????(mode = left|right)???????????????(mode = top|bottom)
  const style = computed(() => {
    let style: CSSProperties = {};
    // ????????????????????????????????????????????????translate??????????????????????????????
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
    // ?????????????????????borderRadius???????????????????????????
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
      // ????????????????????????
      style.overflow = 'hidden';
    }
    if(props.duration) style.transition = `all ${props.duration / 1000}s linear`;
    return style;
  });

  // ???????????????????????????
  const centerStyle = computed(() => {
    let style: CSSProperties = {};
    style.width = props.width ? getUnitValue(props.width) : getUnitValue(props.length);
    // ?????????????????????????????????????????????????????????auto???????????????????????????
    style.height = props.height ? getUnitValue(props.height) : 'auto';
    style.zIndex = uZindex.value;
    style.marginTop = `-${addUnit(props.negativeTop)}`;
    if (props.borderRadius) {
      style.borderRadius = `${props.borderRadius}rpx`;
      // ????????????????????????
      style.overflow = 'hidden';
    }
    return style;
  });

  // ??????????????????????????????????????????????????????????????????????????????????????????
  // ???????????????????????????????????????????????????????????????????????????????????????
  const change = (param1: 'showDrawer' | 'visibleSync', param2: 'showDrawer' | 'visibleSync', bool: boolean) => {
    // ??????state.popup???false???????????????picker???actionsheet??????????????????popup??????
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
    // ????????????????????????????????????????????????value????????????watch??????value??????????????????????????????close
    // ??????@close??????????????????
    state.closeFromInner = true;
    change('showDrawer', 'visibleSync', false);
  };

  // ???????????????
  const maskClick = () => {
    close();
  };

  // ????????????????????????.u-drawer-content?????????????????????????????????????????????????????????????????????
  // ????????????mode=center????????????
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
    // ??????????????????????????????value?????????true?????????????????????popup
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
