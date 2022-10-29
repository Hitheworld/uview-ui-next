<template>
	<view
      class="u-slider"
      @tap="onClick"
      :class="[props.disabled ? 'u-slider--disabled' : '']"
      :style="{
        backgroundColor: props.inactiveColor
      }"
  >
		<view
			class="u-slider__gap"
			:style="[
				state.barStyle,
				{
					height: props.height + 'rpx',
					backgroundColor: props.activeColor
				}
			]"
		>
			<view
          class="u-slider__button-wrap"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
      >
				<slot v-if="defaultSlot"/>
				<view
            v-else class="u-slider__button"
            :style="[props.blockStyle, {
              height: props.blockWidth + 'rpx',
              width: props.blockWidth + 'rpx',
              backgroundColor: props.blockColor
            }]"
        ></view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-slider',
  }
</script>

<script setup lang="ts">
  import {
    CSSProperties,
    reactive,
    toRefs,
    watch,
    onMounted,
    withDefaults, useSlots
  } from 'vue';
  import { useComposable } from '../../libs/hooks';
  /**
   * slider 滑块选择器
   * @tutorial https://uviewui.com/components/slider.html
   * @property {Number | String} value 滑块默认值（默认0）
   * @property {Number | String} min 最小值（默认0）
   * @property {Number | String} max 最大值（默认100）
   * @property {Number | String} step 步长（默认1）
   * @property {Number | String} blockWidth 滑块宽度，高等于宽（30）
   * @property {Number | String} height 滑块条高度，单位rpx（默认6）
   * @property {String} inactiveColor 底部条背景颜色（默认#c0c4cc）
   * @property {String} activeColor 底部选择部分的背景颜色（默认#2979ff）
   * @property {String} blockColor 滑块颜色（默认#ffffff）
   * @property {Object} blockStyle 给滑块自定义样式，对象形式
   * @property {Boolean} disabled 是否禁用滑块(默认为false)
   * @event {Function} start 滑动触发
   * @event {Function} moving 正在滑动中
   * @event {Function} end 滑动结束
   * @example <u-slider v-model="value" />
   */
  interface USliderState {
    startX: number;
    status: 'start' | 'moving' | 'end';
    newValue: number;
    distanceX: number;
    startValue: number;
    barStyle: CSSProperties;
    sliderRect: {
      left: number;
      width: number;
    };
  }
  interface USliderProps {
    // 当前进度百分比值，范围0-100
    modelValue: number | string;
    // 是否禁用滑块
    disabled?: boolean;
    // 滑块宽度，高等于宽，单位rpx
    blockWidth?: number | string;
    // 最小值
    min?: number | string;
    // 最大值
    max?: number | string;
    // 步进值
    step?: number | string;
    // 滑块条高度，单位rpx
    height?: number | string;
    // 进度条的激活部分颜色
    activeColor?: string;
    // 进度条的背景颜色
    inactiveColor?: string;
    // 滑块的背景颜色
    blockColor?: string;
    // 用户对滑块的自定义颜色
    blockStyle?: CSSProperties;
  }

  const defaultSlot = !!useSlots().default;

  const props = withDefaults(defineProps<USliderProps >(),{
    // 当前进度百分比值，范围0-100
    modelValue: 0,
    // 是否禁用滑块
    disabled: false,
    // 滑块宽度，高等于宽，单位rpx
    blockWidth: 30,
    // 最小值
    min: 0,
    // 最大值
    max: 100,
    // 步进值
    step: 1,
    // 滑块条高度，单位rpx
    height: 6,
    // 进度条的激活部分颜色
    activeColor: '#2979ff',
    // 进度条的背景颜色
    inactiveColor: '#c0c4cc',
    // 滑块的背景颜色
    blockColor: '#ffffff',
    // 用户对滑块的自定义颜色
    blockStyle: () => {
      return {}
    },
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', width: number): void;
    (e: 'start'): void;
    (e: 'end'): void;
    (e: 'moving'): void;
  }>();

  const { getRect } = useComposable();

  const state = reactive<USliderState>({
    startX: 0,
    status: 'end',
    newValue: 0,
    distanceX: 0,
    startValue: 0,
    barStyle: {},
    sliderRect: {
      left: 0,
      width: 0
    },
  });

  const format = (value: number) => {
    // 将小数变成整数，为了减少对视图的更新，造成视图层与逻辑层的阻塞
    return Math.round(Math.max(Number(props.min), Math.min(value, Number(props.max))) / Number(props.step)) * Number(props.step);
  };

  const onTouchStart = (event: any) => {
    if (props.disabled) return;
    state.startX = 0;
    // 触摸点集
    let touches = event.touches[0];
    // 触摸点到屏幕左边的距离
    state.startX = touches.clientX;
    // 此处的props.modelValue虽为props值，但是通过context.emit('update:modelValue')进行了修改
    state.startValue = format(Number(props.modelValue));
    // 标示当前的状态为开始触摸滑动
    state.status = 'start';
  };

  const onTouchMove = (event: any) => {
    if (props.disabled) return;
    // 连续触摸的过程会一直触发本方法，但只有手指触发且移动了才被认为是拖动了，才发出事件
    // 触摸后第一次移动已经将status设置为moving状态，故触摸第二次移动不会触发本事件
    if (state.status == 'start') emit('start');
    let touches = event.touches[0];
    // 滑块的左边不一定跟屏幕左边接壤，所以需要减去最外层父元素的左边值
    state.distanceX = touches.clientX - state.sliderRect.left;
    // 获得移动距离对整个滑块的百分比值，此为带有多位小数的值，不能用此更新视图
    // 否则造成通信阻塞，需要每改变一个step值时修改一次视图
    state.newValue = (state.distanceX / state.sliderRect.width) * 100;
    state.status = 'moving';
    // 发出moving事件
    emit('moving');
    updateValue(state.newValue, true);
  };

  const onTouchEnd = () => {
    if (props.disabled) return;
    if (state.status === 'moving') {
      updateValue(state.newValue, false);
      emit('end');
    }
    state.status = 'end';
  };

  const updateValue = (value: number, drag: boolean) => {
    // 去掉小数部分，同时也是对step步进的处理
    const width = format(value);
    // 不允许滑动的值超过max最大值，百分比也不能超过100
    if(width > Number(props.max) || width > 100) return;
    // 设置移动的百分比值
    let barStyle: CSSProperties = {
      width: width + '%'
    };
    // 移动期间无需过渡动画
    if (drag == true) {
      barStyle.transition = 'none';
    } else {
      // 非移动期间，删掉对过渡为空的声明，让css中的声明起效
      delete barStyle.transition;
    }
    // 修改value值
    emit('update:modelValue', width);
    state.barStyle = barStyle;
  };


  const onClick = (event: any) => {
    if (props.disabled) return;
    // 直接点击滑块的情况，计算方式与onTouchMove方法相同
    const value = ((event.detail.x - state.sliderRect.left) / state.sliderRect.width) * 100;
    updateValue(value, false);
  };

  // 只有在非滑动状态时，才可以通过value更新滑块值，这里监听，是为了让用户触发
  watch(() => props.modelValue, (newValue, oldValue) => {
    if(state.status == 'end') updateValue(Number(props.modelValue), false);
  });

  updateValue(Number(props.modelValue), false);

  onMounted(() => {
    // 获取滑块条的尺寸信息
    getRect('.u-slider').then((rect: any) => {
      state.sliderRect = rect;
    });
  });

  defineExpose({
    ...toRefs(state),
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    updateValue,
    format,
    onClick,
  });
</script>

<style lang="scss" scoped>
  @import "../../libs/css/style.components.scss";

  .u-slider {
    position: relative;
    border-radius: 999px;
    border-radius: 999px;
    background-color: #ebedf0;
  }

  .u-slider:before {
    position: absolute;
    right: 0;
    left: 0;
    content: '';
    top: -8px;
    bottom: -8px;
    z-index: -1;
  }

  .u-slider__gap {
    position: relative;
    border-radius: inherit;
    transition: width 0.2s;
    transition: width 0.2s;
    background-color: #1989fa;
  }

  .u-slider__button {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    background-color: #fff;
    cursor: pointer;
  }

  .u-slider__button-wrap {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate3d(50%, -50%, 0);
  }

  .u-slider--disabled {
    opacity: 0.5;
  }
</style>
