<template>
	<view
		class="u-count-num"
		:style="{
			fontSize: props.fontSize + 'rpx',
			fontWeight: props.bold ? 'bold' : 'normal',
			color: props.color
		}"
	>
		{{ state.displayValue }}
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-count-to',
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

  /**
   * countTo 数字滚动
   * @description 该组件一般用于需要滚动数字到某一个值的场景，目标要求是一个递增的值。
   * @tutorial https://www.uviewui.com/components/countTo.html
   * @property {String Number} start-val 开始值
   * @property {String Number} end-val 结束值
   * @property {String Number} duration 滚动过程所需的时间，单位ms（默认2000）
   * @property {Boolean} autoplay 是否自动开始滚动（默认true）
   * @property {String Number} decimals 要显示的小数位数，见官网说明（默认0）
   * @property {Boolean} use-easing 滚动结束时，是否缓动结尾，见官网说明（默认true）
   * @property {String} separator 千位分隔符，见官网说明
   * @property {String} color 字体颜色（默认#303133）
   * @property {String Number} font-size 字体大小，单位rpx（默认50）
   * @property {Boolean} bold 字体是否加粗（默认false）
   * @event {Function} end 数值滚动到目标值时触发
   * @example <u-count-to ref="uCountTo" :end-val="endVal" :autoplay="autoplay"></u-count-to>
   */
  interface UCountToState {
    localStartVal: number | string | null;
    displayValue: string;
    printVal: number | string | null;
    paused: boolean; // 是否暂停
    localDuration: number | string | null;
    startTime: number | null; // 开始的时间
    timestamp: number | null; // 时间戳
    remaining: number | null; // 停留的时间
    rAF: number | null;
    lastTime: number; // 上一次的时间
  }
  interface UCountToProps {
    // 开始的数值，默认从0增长到某一个数
    startVal: number | string;
    // 要滚动的目标数值，必须
    endVal: number | string;
    // 滚动到目标数值的动画持续时间，单位为毫秒（ms）
    duration?: number | string;
    // 设置数值后是否自动开始滚动
    autoplay?: boolean;
    // 要显示的小数位数
    decimals?: number | string;
    // 是否在即将到达目标数值的时候，使用缓慢滚动的效果
    useEasing?: boolean;
    // 十进制分割
    decimal?: number | string;
    // 字体颜色
    color?: string;
    // 字体大小
    fontSize?: number | string;
    // 是否加粗字体
    bold?: boolean;
    // 千位分隔符，类似金额的分割(￥23,321.05中的",")
    separator?: string;
  }

  const props = withDefaults(defineProps<UCountToProps>(),  {
    // 开始的数值，默认从0增长到某一个数
    startVal: 0,
    // 要滚动的目标数值，必须
    endVal: 0,
    // 滚动到目标数值的动画持续时间，单位为毫秒（ms）
    duration: 2000,
    // 设置数值后是否自动开始滚动
    autoplay: true,
    // 要显示的小数位数
    decimals: 0,
    // 是否在即将到达目标数值的时候，使用缓慢滚动的效果
    useEasing: true,
    // 十进制分割
    decimal: '',
    // 字体颜色
    color: '#303133',
    // 字体大小
    fontSize: 50,
    // 是否加粗字体
    bold: false,
    // 千位分隔符，类似金额的分割(￥23,321.05中的",")
    separator: '',
  });

  const emit = defineEmits<{
    (e: 'end'): void;
  }>();

  // 判断是否数字
  const isNumber = (val: string) => {
    return !isNaN(parseFloat(val));
  };

  const formatNumber = (num: number | string) => {
    // 将num转为Number类型，因为其值可能为字符串数值，调用toFixed会报错
    num = Number(num);
    num = num.toFixed(Number(props.decimals));
    num += '';
    const x = num.split('.');
    let x1 = x[0];
    const x2 = x.length > 1 ? props.decimal + x[1] : '';
    const rgx = /(\d+)(\d{3})/;
    if (props.separator && !isNumber(props.separator)) {
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + props.separator + '$2');
      }
    }
    return x1 + x2;
  };

  const state = reactive<UCountToState>({
    localStartVal: props.startVal,
    displayValue: formatNumber(props.startVal),
    printVal: null,
    paused: false, // 是否暂停
    localDuration: Number(props.duration),
    startTime: null, // 开始的时间
    timestamp: null, // 时间戳
    remaining: null, // 停留的时间
    rAF: null,
    lastTime: 0 // 上一次的时间
  });

  const countDown = computed(() => {
    return props.startVal > props.endVal;
  });

  const easingFn = (t: number, b: number, c: number, d: number) => {
    return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
  };

  const requestAnimationFrame = (callback: (time: number) => void) => {
    const currTime = new Date().getTime();
    // 为了使setTimteout的尽可能的接近每秒60帧的效果
    const timeToCall = Math.max(0, 16 - (currTime - state.lastTime));
    const id = setTimeout(() => {
      callback(currTime + timeToCall);
    }, timeToCall);
    state.lastTime = currTime + timeToCall;
    return id;
  };

  const cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };

  const count = (timestamp: number) => {
    if (!state.startTime) state.startTime = timestamp;
    state.timestamp = timestamp;
    const progress = timestamp - state.startTime;
    state.remaining = Number(state.localDuration || 0) - progress;
    if (props.useEasing) {
      if (countDown.value) {
        state.printVal = Number(state.localStartVal || 0) - easingFn(progress, 0, Number(state.localStartVal || 0) - Number(props.endVal || 0), (state.localDuration || 0));
      } else {
        state.printVal = easingFn(progress, Number(state.localStartVal || 0), Number(props.endVal || 0) - Number(state.localStartVal || 0), (state.localDuration || 0));
      }
    } else {
      if (countDown.value) {
        state.printVal = Number(state.localStartVal || 0) - (Number(state.localStartVal || 0) - Number(props.endVal || 0)) * (progress / (state.localDuration || 0));
      } else {
        state.printVal = Number(state.localStartVal || 0) + Number(Number(props.endVal) - Number(state.localStartVal || 0)) * (progress / (state.localDuration || 0));
      }
    }
    if (countDown.value) {
      state.printVal = state.printVal < props.endVal ? props.endVal : state.printVal;
    } else {
      state.printVal = state.printVal > props.endVal ? props.endVal : state.printVal;
    }
    state.displayValue = formatNumber(state.printVal || 0);
    if (progress < Number(state.localDuration || 0)) {
      state.rAF = requestAnimationFrame(count);
    } else {
      emit('end');
    }
  };

  // 开始滚动数字
  const start = () => {
    state.localStartVal = props.startVal;
    state.startTime = null;
    state.localDuration = props.duration;
    state.paused = false;
    state.rAF = requestAnimationFrame(count);
  };

  // 暂停
  const stop = () => {
    state.rAF && cancelAnimationFrame(state.rAF);
  };

  // 重新开始(暂停的情况下)
  const resume = () => {
    state.startTime = null;
    state.localDuration = state.remaining;
    state.localStartVal = state.printVal;
    requestAnimationFrame(count);
  };

  // 暂定状态，重新再开始滚动；或者滚动状态下，暂停
  const reStart = () => {
    if (state.paused) {
      resume();
      state.paused = false;
    } else {
      stop();
      state.paused = true;
    }
  };

  // 重置
  const reset = () => {
    state.startTime = null;
    state.rAF && cancelAnimationFrame(state.rAF);
    state.displayValue = formatNumber(props.startVal);
  };

  const destroyed = () => {
    state.rAF && cancelAnimationFrame(state.rAF);
  };


  watch(() => props.startVal, (newValue, oldValue) => {
    props.autoplay && start();
  });

  watch(() => props.endVal, (newValue, oldValue) => {
    props.autoplay && start();
  });

  onMounted(() => {
    props.autoplay && start();
  });

  defineExpose({
    ...toRefs(state),
    countDown,
    easingFn,
    requestAnimationFrame,
    cancelAnimationFrame,
    start,
    reStart,
    stop,
    resume,
    reset,
    count,
    isNumber,
    formatNumber,
    destroyed,
  });
</script>

<style lang="scss" scoped>
  @import "../../libs/css/style.components.scss";

  .u-count-num {
    /* #ifndef APP-NVUE */
    display: inline-flex;
    /* #endif */
    text-align: center;
  }
</style>
