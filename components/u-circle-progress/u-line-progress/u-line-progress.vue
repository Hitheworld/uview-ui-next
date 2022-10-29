<template>
	<view
    class="u-progress"
    :style="{
      borderRadius: props.round ? '100rpx' : 0,
      height: props.height + 'rpx',
      backgroundColor: props.inactiveColor
    }"
  >
		<view
      :class="[
        props.type ? `u-type-${props.type}-bg` : '',
        props.striped ? 'u-striped' : '',
        props.striped && props.stripedActive ? 'u-striped-active' : ''
      ]"
      class="u-active"
      :style="[progressStyle]"
    >
			<slot v-if="defaultSlot" />
			<block v-else-if="props.showPercent">
				{{ props.percent + '%' }}
			</block>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-line-progress',
  }
</script>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';
	/**
	 * lineProgress 线型进度条
	 * @description 展示操作或任务的当前进度，比如上传文件，是一个线形的进度条。
	 * @tutorial https://www.uviewui.com/components/lineProgress.html
	 * @property {String Number} percent 进度条百分比值，为数值类型，0-100
	 * @property {Boolean} round 进度条两端是否为半圆（默认true）
	 * @property {String} type 如设置，active-color值将会失效
	 * @property {String} active-color 进度条激活部分的颜色（默认#19be6b）
	 * @property {String} inactive-color 进度条的底色（默认#ececec）
	 * @property {Boolean} show-percent 是否在进度条内部显示当前的百分比值数值（默认true）
	 * @property {String Number} height 进度条的高度，单位rpx（默认28）
	 * @property {Boolean} striped 是否显示进度条激活部分的条纹（默认false）
	 * @property {Boolean} striped-active 条纹是否具有动态效果（默认false）
	 * @example <u-line-progress :percent="70" :show-percent="true"></u-line-progress>
	 */
  interface ULineProgressProps {
    // 两端是否显示半圆形
    round?: boolean;
    // 主题颜色
    type?: 'success' | 'primary' | 'error' | 'info' | 'warning' | '';
    // 激活部分的颜色
    activeColor?: string;
    inactiveColor?: string;
    // 进度百分比，数值
    percent: number;
    // 是否在进度条内部显示百分比的值
    showPercent?: boolean;
    // 进度条的高度，单位rpx
    height?: number | string;
    // 是否显示条纹
    striped?: boolean;
    // 条纹是否显示活动状态
    stripedActive?: boolean;
  }

  const defaultSlot = !!useSlots().default;

  const props = withDefaults(defineProps<ULineProgressProps>(),  {
    // 两端是否显示半圆形
    round: true,
    // 主题颜色
    type: '',
    // 激活部分的颜色
    activeColor: '#19be6b',
    inactiveColor: '#ececec',
    // 进度百分比，数值
    percent: 0,
    // 是否在进度条内部显示百分比的值
    showPercent: true,
    // 进度条的高度，单位rpx
    height: 28,
    // 是否显示条纹
    striped: false,
    // 条纹是否显示活动状态
    stripedActive: false,
  });

  const progressStyle = computed(() => {
    let style: any = {};
    style.width = props.percent + '%';
    if(props.activeColor) style.backgroundColor = props.activeColor;
    return style;
  });

  defineExpose({
    progressStyle,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-progress {
		overflow: hidden;
		height: 15px;
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		align-items: center;
		width: 100%;
		border-radius: 100rpx;
	}

	.u-active {
		width: 0;
		height: 100%;
		align-items: center;
		@include vue-flex;
		justify-items: flex-end;
		justify-content: space-around;
		font-size: 20rpx;
		color: #ffffff;
		transition: all 0.4s ease;
	}

	.u-striped {
		background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
		background-size: 39px 39px;
	}

	.u-striped-active {
		animation: progress-stripes 2s linear infinite;
	}

	@keyframes progress-stripes {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: 39px 0;
		}
	}
</style>
