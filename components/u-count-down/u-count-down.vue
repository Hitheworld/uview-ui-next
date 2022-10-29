<template>
	<view class="u-countdown">
		<view
        class="u-countdown-item"
        :style="[itemStyle]"
        v-if="props.showDays && (props.hideZeroDay || (!props.hideZeroDay && state.d != '00'))"
    >
			<view
          class="u-countdown-time"
          :style="[letterStyle]"
      >
				{{ state.d }}
			</view>
		</view>
		<view
			class="u-countdown-colon"
			:style="{
        fontSize: props.separatorSize + 'rpx',
        color: props.separatorColor,
        paddingBottom: props.separator == 'colon' ? '4rpx' : 0
      }"
			v-if="props.showDays && (props.hideZeroDay || (!props.hideZeroDay && state.d != '00'))"
		>
			{{ props.separator == 'colon' ? ':' : '天' }}
		</view>
		<view
        class="u-countdown-item"
        :style="[itemStyle]"
        v-if="props.showHours"
    >
			<view
          class="u-countdown-time"
          :style="{ fontSize: props.fontSize + 'rpx', color: props.color}"
      >
				{{ state.h }}
			</view>
		</view>
		<view
			class="u-countdown-colon"
			:style="{
        fontSize: props.separatorSize + 'rpx',
        color: props.separatorColor,
        paddingBottom: props.separator == 'colon' ? '4rpx' : 0
      }"
			v-if="props.showHours"
		>
			{{ props.separator == 'colon' ? ':' : '时' }}
		</view>
		<view
        class="u-countdown-item"
        :style="[itemStyle]"
        v-if="props.showMinutes"
    >
			<view
          class="u-countdown-time"
          :style="{
            fontSize: props.fontSize + 'rpx',
            color: props.color
          }"
      >
				{{ state.i }}
			</view>
		</view>
		<view
			class="u-countdown-colon"
			:style="{
        fontSize: props.separatorSize + 'rpx',
        color: props.separatorColor,
        paddingBottom: props.separator == 'colon' ? '4rpx' : 0
      }"
			v-if="props.showMinutes"
		>
			{{ props.separator == 'colon' ? ':' : '分' }}
		</view>
		<view
        class="u-countdown-item"
        :style="[itemStyle]"
        v-if="props.showSeconds"
    >
			<view
          class="u-countdown-time"
          :style="{
            fontSize: props.fontSize + 'rpx', color: props.color
          }"
      >
				{{ state.s }}
			</view>
		</view>
		<view
			class="u-countdown-colon"
			:style="{
        fontSize: props.separatorSize + 'rpx',
        color: props.separatorColor,
        paddingBottom: props.separator == 'colon' ? '4rpx' : 0
      }"
			v-if="props.showSeconds && props.separator == 'zh'"
		>
			秒
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-count-down',
  }
</script>

<script setup lang="ts">
  import {
    CSSProperties,
    computed,
    reactive,
    toRefs,
    watch,
    onMounted,
    onBeforeUnmount,
    withDefaults
  } from 'vue';
  /**
   * countDown 倒计时
   * @description 该组件一般使用于某个活动的截止时间上，通过数字的变化，给用户明确的时间感受，提示用户进行某一个行为操作。
   * @tutorial https://www.uviewui.com/components/countDown.html
   * @property {String Number} timestamp 倒计时，单位为秒
   * @property {Boolean} autoplay 是否自动开始倒计时，如果为false，需手动调用开始方法。见官网说明（默认true）
   * @property {String} separator 分隔符，colon为英文冒号，zh为中文（默认colon）
   * @property {String Number} separator-size 分隔符的字体大小，单位rpx（默认30）
   * @property {String} separator-color 分隔符的颜色（默认#303133）
   * @property {String Number} font-size 倒计时字体大小，单位rpx（默认30）
   * @property {Boolean} show-border 是否显示倒计时数字的边框（默认false）
   * @property {Boolean} hide-zero-day 当"天"的部分为0时，隐藏该字段 （默认true）
   * @property {String} border-color 数字边框的颜色（默认#303133）
   * @property {String} bg-color 倒计时数字的背景颜色（默认#ffffff）
   * @property {String} color 倒计时数字的颜色（默认#303133）
   * @property {String} height 数字高度值(宽度等同此值)，设置边框时看情况是否需要设置此值，单位rpx（默认auto）
   * @property {Boolean} show-days 是否显示倒计时的"天"部分（默认true）
   * @property {Boolean} show-hours 是否显示倒计时的"时"部分（默认true）
   * @property {Boolean} show-minutes 是否显示倒计时的"分"部分（默认true）
   * @property {Boolean} show-seconds 是否显示倒计时的"秒"部分（默认true）
   * @event {Function} end 倒计时结束
   * @event {Function} change 每秒触发一次，回调为当前剩余的倒计秒数
   * @example <u-count-down ref="uCountDown" :timestamp="86400" :autoplay="false"></u-count-down>
   */
  interface UCountDownState {
    d: string | number; // 天的默认值
    h: string | number; // 小时的默认值
    i: string | number; // 分钟的默认值
    s: string | number; // 秒的默认值
    timer: number | null; // 定时器
    seconds: number; // 记录不停倒计过程中变化的秒数
  }
  interface UCountDownProps {
    // 倒计时的时间，秒为单位
    timestamp: number | string;
    // 是否自动开始倒计时
    autoplay?: boolean;
    // 用英文冒号(colon)或者中文(zh)当做分隔符，false的时候为中文，如："11:22"或"11时22秒"
    separator?: string;
    // 分隔符的大小，单位rpx
    separatorSize?: number | string;
    // 分隔符颜色
    separatorColor?: string;
    // 字体颜色
    color?: string;
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 背景颜色
    bgColor?: string;
    // 数字框高度，单位rpx
    height?: number | string;
    // 是否显示数字框
    showBorder?: boolean;
    // 边框颜色
    borderColor?: string;
    // 是否显示秒
    showSeconds?: boolean;
    // 是否显示分钟
    showMinutes?: boolean;
    // 是否显示小时
    showHours?: boolean;
    // 是否显示“天”
    showDays?: boolean;
    // 当"天"的部分为0时，不显示
    hideZeroDay?: boolean;
  }

  const props = withDefaults(defineProps<UCountDownProps>(),  {
    // 倒计时的时间，秒为单位
    timestamp: 0,
    // 是否自动开始倒计时
    autoplay: true,
    // 用英文冒号(colon)或者中文(zh)当做分隔符，false的时候为中文，如："11:22"或"11时22秒"
    separator: 'colon',
    // 分隔符的大小，单位rpx
    separatorSize: 30,
    // 分隔符颜色
    separatorColor: "#303133",
    // 字体颜色
    color: '#303133',
    // 字体大小，单位rpx
    fontSize: 30,
    // 背景颜色
    bgColor: '#fff',
    // 数字框高度，单位rpx
    height: 'auto',
    // 是否显示数字框
    showBorder: false,
    // 边框颜色
    borderColor: '#303133',
    // 是否显示秒
    showSeconds: true,
    // 是否显示分钟
    showMinutes: true,
    // 是否显示小时
    showHours: true,
    // 是否显示“天”
    showDays: true,
    // 当"天"的部分为0时，不显示
    hideZeroDay: false,
  });

  const emit = defineEmits<{
    (e: 'change', seconds: number): void;
    (e: 'end', obj: object): void;
  }>();

  const state = reactive<UCountDownState>({
    d: '00', // 天的默认值
    h: '00', // 小时的默认值
    i: '00', // 分钟的默认值
    s: '00', // 秒的默认值
    timer: null ,// 定时器
    seconds: 0, // 记录不停倒计过程中变化的秒数
  });

  // 倒计时item的样式，item为分别的时分秒部分的数字
  const itemStyle = computed(() => {
    let style: CSSProperties = {};
    if(props.height) {
      style.height = props.height + 'rpx';
      style.width = props.height + 'rpx';
    }
    if(props.showBorder) {
      style.borderStyle = 'solid';
      style.borderColor = props.borderColor;
      style.borderWidth = '1px';
    }
    if(props.bgColor) {
      style.backgroundColor = props.bgColor;
    }
    return style;
  });

  // 倒计时数字的样式
  const letterStyle = computed(() => {
    let style: CSSProperties = {};
    if(props.fontSize) style.fontSize = props.fontSize +  'rpx';
    if(props.color) style.color = props.color;
    return style;
  });

  // 停止倒计时
  const end = () => {
    clearTimer();
    emit('end', {});
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    // 小于等于0的话，结束倒计时
    seconds <= 0 && end();
    let [day, hour, minute, second]: number[] | string[] = [0, 0, 0, 0];
    day = Math.floor(seconds / (60 * 60 * 24));
    // 判断是否显示“天”参数，如果不显示，将天部分的值，加入到小时中
    // hour为给后面计算秒和分等用的(基于显示天的前提下计算)
    hour = Math.floor(seconds / (60 * 60)) - day * 24;
    // showHour为需要显示的小时
    let showHour = null;
    if(props.showDays) {
      showHour = hour;
    } else {
      // 如果不显示天数，将“天”部分的时间折算到小时中去
      showHour = Math.floor(seconds / (60 * 60));
    }
    minute = Math.floor(seconds / 60) - hour * 60 - day * 24 * 60;
    second = Math.floor(seconds) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60;
    // 如果小于10，在前面补上一个"0"
    showHour = showHour < 10 ? '0' + showHour : showHour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;
    day = day < 10 ? '0' + day : day;
    state.d = day;
    state.h = showHour;
    state.i = minute;
    state.s = second;
  };

  // 清除定时器
  const clearTimer = () => {
    if(state.timer) {
      // 清除定时器
      clearInterval(state.timer);
      state.timer = null;
    }
  };

  // 倒计时
  const start = () => {
    // 避免可能出现的倒计时重叠情况
    clearTimer();
    if (props.timestamp <= 0) return;
    state.seconds = Number(props.timestamp);
    formatTime(state.seconds);
    state.timer = setInterval(() => {
      state.seconds--;
      // 发出change事件
      emit('change', state.seconds);
      if (state.seconds < 0) {
        return end();
      }
      formatTime(state.seconds);
    }, 1000);
  };

  // 监听时间戳的变化
  watch(() => props.timestamp, (newValue, oldValue) => {
    // 如果倒计时间发生变化，清除定时器，重新开始倒计时
    clearTimer();
    start();
  });

  onMounted(() => {
    // 如果自动倒计时
    props.autoplay && props.timestamp && start();
  });

  onBeforeUnmount(() => {
    state.timer &&　clearInterval(state.timer);
    state.timer = null;
  });

  defineExpose({
    ...toRefs(state),
    itemStyle,
    letterStyle,
    start,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-countdown {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		align-items: center;
	}

	.u-countdown-item {
		@include vue-flex;
		align-items: center;
		justify-content: center;
		padding: 2rpx;
		border-radius: 6rpx;
		white-space: nowrap;
		transform: translateZ(0);
	}

	.u-countdown-time {
		margin: 0;
		padding: 0;
		line-height: 1;
	}

	.u-countdown-colon {
		@include vue-flex;
		justify-content: center;
		padding: 0 5rpx;
		line-height: 1;
		align-items: center;
		padding-bottom: 4rpx;
	}

	.u-countdown-scale {
		transform: scale(0.9);
		transform-origin: center center;
	}
</style>
