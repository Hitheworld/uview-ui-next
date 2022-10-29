<template>
	<view
		class="u-notice-bar"
		:style="{
			background: computeBgColor,
			padding: props.padding
		}"
		:class="[
			props.type ? `u-type-${props.type}-light-bg` : ''
		]"
	>
		<view class="u-icon-wrap">
			<u-icon
          class="u-left-icon"
          v-if="props.volumeIcon"
          name="volume-fill"
          :size="props.volumeSize"
          :color="computeColor"
      ></u-icon>
		</view>
		<swiper
        :disable-touch="props.disableTouch"
        @change="change"
        :autoplay="props.autoplay && props.playState == 'play'"
        :vertical="vertical"
        circular
        :interval="props.duration"
        class="u-swiper"
    >
			<swiper-item
          v-for="(item, index) in props.list"
          :key="index"
          class="u-swiper-item"
      >
				<view
					class="u-news-item u-line-1"
					:style="[textStyle]"
					@tap="click(index)"
					:class="['u-type-' + props.type]"
				>
					{{ item }}
				</view>
			</swiper-item>
		</swiper>
		<view class="u-icon-wrap">
			<u-icon
          @click="getMore"
          class="u-right-icon"
          v-if="props.moreIcon"
          name="arrow-right"
          :size="26"
          :color="computeColor"
      ></u-icon>
			<u-icon
          @click="close"
          class="u-right-icon"
          v-if="props.closeIcon"
          name="close"
          :size="24"
          :color="computeColor"
      ></u-icon>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-column-notice',
  }
</script>

<script setup lang="ts">
  import { withDefaults, CSSProperties, computed } from 'vue'

  interface UColumnNoticeProps {
    // 显示的内容，数组
    list: string[];
    // 显示的主题，success|error|primary|info|warning
    type?: 'success' | 'error' | 'primary' | 'info' | 'warning' | 'none';
    // 是否显示左侧的音量图标
    volumeIcon?: boolean;
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
    // 滚动方向，row-水平滚动，column-垂直滚动
    direction?: 'row' | 'column';
    // 是否显示
    show?: boolean;
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 滚动一个周期的时间长，单位ms
    duration?: number | string;
    // 音量喇叭的大小
    volumeSize?: number | string;
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed?: number;
    // 水平滚动时，是否采用衔接形式滚动
    isCircular?: boolean;
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode?: 'horizontal' | 'vertical';
    // 播放状态，play-播放，paused-暂停
    playState?: 'play' | 'paused';
    // 是否禁止用手滑动切换
    // 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
    disableTouch?: boolean;
    // 通知的边距
    padding?: string;
  }

  const props = withDefaults(defineProps<UColumnNoticeProps>(),  {
    // 显示的内容，数组
    list: () => [],
    // 显示的主题，success|error|primary|info|warning
    type: 'warning',
    // 是否显示左侧的音量图标
    volumeIcon: true,
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
    // 滚动方向，row-水平滚动，column-垂直滚动
    direction: 'row',
    // 是否显示
    show: true,
    // 字体大小，单位rpx
    fontSize: 26,
    // 滚动一个周期的时间长，单位ms
    duration: 2000,
    // 音量喇叭的大小
    volumeSize: 34,
    // 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
    speed: 160,
    // 水平滚动时，是否采用衔接形式滚动
    isCircular: true,
    // 滚动方向，horizontal-水平滚动，vertical-垂直滚动
    mode: 'horizontal',
    // 播放状态，play-播放，paused-暂停
    playState: 'play',
    // 是否禁止用手滑动切换
    // 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
    disableTouch: true,
    // 通知的边距
    padding: '18rpx 24rpx',
  });

  const emit = defineEmits<{
    (e: 'click', index: number): void;
    (e: 'close'): void;
    (e: 'getMore'): void;
    (e: 'end'): void;
  }>();

  // 计算字体颜色，如果没有自定义的，就用uview主题颜色
  const computeColor = computed(() => {
    if (props.color) return props.color;
    // 如果是无主题，就默认使用content-color
    else if(props.type == 'none') return '#606266';
    else return props.type;
  });

  // 文字内容的样式
  const textStyle = computed(() => {
    let style: CSSProperties = {};
    if (props.color) style.color = props.color;
    else if(props.type == 'none') style.color = '#606266';
    style.fontSize = props.fontSize + 'rpx';
    return style;
  });

  // 垂直或者水平滚动
  const vertical = computed(() => {
    if(props.mode == 'horizontal') return false;
    else return true;
  });

  // 计算背景颜色
  const computeBgColor = computed(() => {
    if (props.bgColor) return props.bgColor;
    else if(props.type == 'none') return 'transparent';
  });

  // 点击通告栏
  const click = (index: number) => {
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

  const change = (e: any) => {
    let index = e.detail.current;
    if(index == props.list.length - 1) {
      emit('end');
    }
  };

  defineExpose({
    computeColor,
    textStyle,
    vertical,
    computeBgColor,
    click,
    close,
    getMore,
    change,
  });
</script>

<style lang="scss" scoped>
@import "../../libs/css/style.components.scss";

.u-notice-bar {
	width: 100%;
	@include vue-flex;
	align-items: center;
	justify-content: center;
	flex-wrap: nowrap;
	padding: 18rpx 24rpx;
	overflow: hidden;
}

.u-swiper {
	font-size: 26rpx;
	height: 32rpx;
	@include vue-flex;
	align-items: center;
	flex: 1;
	margin-left: 12rpx;
}

.u-swiper-item {
	@include vue-flex;
	align-items: center;
	overflow: hidden;
}

.u-news-item {
	overflow: hidden;
}

.u-right-icon {
	margin-left: 12rpx;
	/* #ifndef APP-NVUE */
	display: inline-flex;
	/* #endif */
	align-items: center;
}

.u-left-icon {
	/* #ifndef APP-NVUE */
	display: inline-flex;
	/* #endif */
	align-items: center;
}
</style>
