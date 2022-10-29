<template>
	<view
      class="u-notice-bar-wrap"
      v-if="isShow"
      :style="{
        borderRadius: props.borderRadius + 'rpx',
      }"
  >
		<block v-if="props.mode == 'horizontal' && props.isCircular">
			<u-row-notice
				:type="props.type"
				:color="props.color"
				:bgColor="props.bgColor"
				:list="props.list"
				:volumeIcon="props.volumeIcon"
				:moreIcon="props.moreIcon"
				:volumeSize="props.volumeSize"
				:closeIcon="props.closeIcon"
				:mode="props.mode"
				:fontSize="props.fontSize"
				:speed="props.speed"
				:playState="props.playState"
				:padding="props.padding"
				@getMore="getMore"
				@close="close"
				@click="click"
			></u-row-notice>
		</block>
		<block v-if="props.mode == 'vertical' || (props.mode == 'horizontal' && !props.isCircular)">
			<u-column-notice
				:type="props.type"
				:color="props.color"
				:bgColor="props.bgColor"
				:list="props.list"
				:volumeIcon="props.volumeIcon"
				:moreIcon="props.moreIcon"
				:closeIcon="props.closeIcon"
				:mode="props.mode"
				:volumeSize="props.volumeSize"
				:disable-touch="props.disableTouch"
				:fontSize="props.fontSize"
				:duration="props.duration"
				:playState="props.playState"
				:padding="props.padding"
				@getMore="getMore"
				@close="close"
				@click="click"
				@end="end"
			></u-column-notice>
		</block>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-notice-bar',
  }
</script>

<script setup lang="ts">
  import {
    computed,
    withDefaults
  } from "vue";

  /**
   * noticeBar 滚动通知
   * @description 该组件用于滚动通告场景，有多种模式可供选择
   * @tutorial https://www.uviewui.com/components/noticeBar.html
   * @property {Array} list 滚动内容，数组形式，见上方说明
   * @property {String} type 显示的主题（默认warning）
   * @property {Boolean} volume-icon 是否显示小喇叭图标（默认true）
   * @property {Boolean} more-icon 是否显示右边的向右箭头（默认false）
   * @property {Boolean} close-icon 是否显示关闭图标（默认false）
   * @property {Boolean} autoplay 是否自动播放（默认true）
   * @property {String} color 文字颜色
   * @property {String Number} bg-color 背景颜色
   * @property {String} mode 滚动模式（默认horizontal）
   * @property {Boolean} show 是否显示（默认true）
   * @property {String Number} font-size 字体大小，单位rpx（默认28）
   * @property {String Number} volume-size 左边喇叭的大小（默认34）
   * @property {String Number} duration 滚动周期时长，只对步进模式有效，横向衔接模式无效，单位ms（默认2000）
   * @property {String Number} speed 水平滚动时的滚动速度，即每秒移动多少距离，只对水平衔接方式有效，单位rpx（默认160）
   * @property {String Number} font-size 字体大小，单位rpx（默认28）
   * @property {Boolean} is-circular mode为horizontal时，指明是否水平衔接滚动（默认true）
   * @property {String} play-state 播放状态，play - 播放，paused - 暂停（默认play）
   * @property {String Nubmer} border-radius 通知栏圆角（默认为0）
   * @property {String Nubmer} padding 内边距，字符串，与普通的内边距css写法一直（默认"18rpx 24rpx"）
   * @property {Boolean} no-list-hidden 列表为空时，是否显示组件（默认false）
   * @property {Boolean} disable-touch 是否禁止通过手动滑动切换通知，只有mode = vertical，或者mode = horizontal且is-circular = false时有效（默认true）
   * @event {Function} click 点击通告文字触发，只有mode = vertical，或者mode = horizontal且is-circular = false时有效
   * @event {Function} close 点击右侧关闭图标触发
   * @event {Function} getMore 点击右侧向右图标触发
   * @event {Function} end 列表的消息每次被播放一个周期时触发，只有mode = vertical，或者mode = horizontal且is-circular = false时有效
   * @example <u-notice-bar :more-icon="true" :list="list"></u-notice-bar>
   */
  interface UNoticeBarProps  {
    // 显示的内容，数组
    list: string[];
    // 显示的主题，success|error|primary|info|warning
    type?: 'success'|'error'|'primary'|'info'|'warning';
    // 是否显示左侧的音量图标
    volumeIcon?: boolean;
    // 音量喇叭的大小
    volumeSize?: number | string;
    // 是否显示右侧的右箭头图标
    moreIcon?: boolean;
    // 是否显示右侧的关闭图标
    closeIcon?: boolean;
    // 是否自动播放
    autoplay?: boolean;
    // 文字颜色，各图标也会使用文字颜色
    color?: string;
    // 背景颜色
    bgColor?: string;
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode?: 'horizontal' | 'vertical';
    // 是否显示
    show?: boolean;
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 滚动一个周期的时间长，单位ms
    duration?: number | string;
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed?: number | string;
    // 水平滚动时，是否采用衔接形式滚动
    // 水平衔接模式，采用的是swiper组件，水平滚动
    isCircular?: boolean;
    // 播放状态，play-播放，paused-暂停
    playState?: string;
    // 是否禁止用手滑动切换
    // 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
    disableTouch?: boolean;
    // 滚动通知设置圆角
    borderRadius?: number | string;
    // 通知的边距
    padding?: number | string;
    // list列表为空时，是否显示组件
    noListHidden?: boolean;
  }

  const props = withDefaults(defineProps<UNoticeBarProps>(),{
    // 显示的内容，数组
    list: [],
    // 显示的主题，success|error|primary|info|warning
    type: 'warning',
    // 是否显示左侧的音量图标
    volumeIcon: true,
    // 音量喇叭的大小
    volumeSize: 34,
    // 是否显示右侧的右箭头图标
    moreIcon: false,
    // 是否显示右侧的关闭图标
    closeIcon: false,
    // 是否自动播放
    autoplay: true,
    // 文字颜色，各图标也会使用文字颜色
    color: '',
    // 背景颜色
    bgColor: '',
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode: 'horizontal',
    // 是否显示
    show: true,
    // 字体大小，单位rpx
    fontSize: 28,
    // 滚动一个周期的时间长，单位ms
    duration: 2000,
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed: 160,
    // 水平滚动时，是否采用衔接形式滚动
    // 水平衔接模式，采用的是swiper组件，水平滚动
    isCircular: true,
    // 播放状态，play-播放，paused-暂停
    playState: 'play',
    // 是否禁止用手滑动切换
    // 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
    disableTouch: true,
    // 滚动通知设置圆角
    borderRadius: 0,
    // 通知的边距
    padding: '18rpx 24rpx',
    // list列表为空时，是否显示组件
    noListHidden: true,
  });

  const emit = defineEmits<{
    (e: 'click', index: string | number): void;
    (e: 'close'): void;
    (e: 'getMore'): void;
    (e: 'end'): void;
  }>();

  // 如果设置show为false，或者设置了noListHidden为true，且list长度又为零的话，隐藏组件
  const isShow = computed(() => {
    if(props.show == false || (props.noListHidden == true && props.list.length == 0)) return false;
    else return true;
  });

  // 点击通告栏
  const click = (index: string | number) => {
    emit('click', index);
  };

  // 点击关闭按钮
  const close = () => {
    emit('close');
  };

  // 点击更多箭头按钮
  const getMore = () => {
    emit('getMore');
  };

  // 滚动一个周期结束，只对垂直，或者水平步进形式有效
  const end = () => {
    emit('end');
  };

  defineExpose({
    isShow,
    click,
    close,
    getMore,
    end,
  });
</script>

<style lang="scss" scoped>
  @import "../../libs/css/style.components.scss";

  .u-notice-bar-wrap {
    overflow: hidden;
  }

  .u-notice-bar {
    padding: 18rpx 24rpx;
    overflow: hidden;
  }

  .u-direction-row {
    @include vue-flex;
    align-items: center;
    justify-content: space-between;
  }

  .u-left-icon {
    @include vue-flex;
    align-items: center;
  }

  .u-notice-box {
    flex: 1;
    @include vue-flex;
    overflow: hidden;
    margin-left: 12rpx;
  }

  .u-right-icon {
    margin-left: 12rpx;
    @include vue-flex;
    align-items: center;
  }

  .u-notice-content {
    line-height: 1;
    white-space: nowrap;
    font-size: 26rpx;
    animation: u-loop-animation 10s linear infinite both;
    text-align: right;
    // 这一句很重要，为了能让滚动左右连接起来
    padding-left: 100%;
  }

  @keyframes u-loop-animation {
    0% {
      transform: translate3d(0, 0, 0);
    }

    100% {
      transform: translate3d(-100%, 0, 0);
    }
  }
</style>
