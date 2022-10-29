<template>
	<view
      v-if="show"
      class="u-badge"
      :class="[
        props.isDot ? 'u-badge-dot' : '',
        props.size == 'mini' ? 'u-badge-mini' : '',
        props.type ? 'u-badge--bg--' + props.type : ''
      ]"
      :style="[
          {
            top: props.offset[0] + 'rpx',
            right: props.offset[1] + 'rpx',
            fontSize: props.fontSize + 'rpx',
            position: props.absolute ? 'absolute' : 'static',
            color: props.color,
            backgroundColor: props.bgColor
          }, boxStyle
      ]"
	>
		{{ showText }}
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-badge',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, computed } from "vue";
	/**
	 * badge 角标
	 * @description 本组件一般用于展示头像的地方，如个人中心，或者评论列表页的用户头像展示等场所。
	 * @tutorial https://www.uviewui.com/components/badge.html
	 * @property {String Number} count 展示的数字，大于 overflowCount 时显示为 ${overflowCount}+，为0且show-zero为false时隐藏
	 * @property {Boolean} is-dot 不展示数字，只有一个小点（默认false）
	 * @property {Boolean} absolute 组件是否绝对定位，为true时，offset参数才有效（默认true）
	 * @property {String Number} overflow-count 展示封顶的数字值（默认99）
	 * @property {String} type 使用预设的背景颜色（默认error）
	 * @property {Boolean} show-zero 当数值为 0 时，是否展示 Badge（默认false）
	 * @property {String} size Badge的尺寸，设为mini会得到小一号的Badge（默认default）
	 * @property {Array} offset 设置badge的位置偏移，格式为 [x, y]，也即设置的为top和right的值，单位rpx。absolute为true时有效（默认[20, 20]）
	 * @property {String} color 字体颜色（默认#ffffff）
	 * @property {String} bgColor 背景颜色，优先级比type高，如设置，type参数会失效
	 * @property {Boolean} is-center 组件中心点是否和父组件右上角重合，优先级比offset高，如设置，offset参数会失效（默认false）
	 * @example <u-badge type="error" count="7"></u-badge>
	 */
  interface UBadgeProps {
    // primary,warning,success,error,info
    type?: 'primary' | 'warning' | 'success' | 'error' | 'info';
    // default, mini
    size?: 'default' | 'mini';
    //是否是圆点
    isDot?: boolean;
    // 显示的数值内容
    count: number | string;
    // 展示封顶的数字值
    overflowCount?: number;
    // 当数值为 0 时，是否展示 Badge
    showZero?: boolean;
    // 位置偏移
    offset?: number[] | string[];
    // 是否开启绝对定位，开启了offset才会起作用
    absolute?: boolean;
    // 字体大小
    fontSize?: string | number;
    // 字体演示
    color?: string;
    // badge的背景颜色
    bgColor?: string;
    // 是否让badge组件的中心点和父组件右上角重合，配置的话，offset将会失效
    isCenter?: boolean;
  }

  const props = withDefaults(defineProps<UBadgeProps>(), {
    // primary,warning,success,error,info
    type: 'error',
    // default, mini
    size: 'default',
    //是否是圆点
    isDot: false,
    // 显示的数值内容
    // count: null,
    // 展示封顶的数字值
    overflowCount: 99,
    // 当数值为 0 时，是否展示 Badge
    showZero: false,
    // 位置偏移
    offset: () => [20, 20],
    // 是否开启绝对定位，开启了offset才会起作用
    absolute: true,
    // 字体大小
    fontSize: '24',
    // 字体演示
    color: '#ffffff',
    // badge的背景颜色
    bgColor: '',
    // 是否让badge组件的中心点和父组件右上角重合，配置的话，offset将会失效
    isCenter: false,
  });

  // 是否将badge中心与父组件右上角重合
  const boxStyle = computed(() => {
    let style: CSSProperties = {};
    if(props.isCenter) {
      style.top = 0;
      style.right = 0;
      // Y轴-50%，意味着badge向上移动了badge自身高度一半，X轴50%，意味着向右移动了自身宽度一半
      style.transform = "translateY(-50%) translateX(50%)";
    } else {
      style.top = props.offset[0] + 'rpx';
      style.right = props.offset[1] + 'rpx';
      style.transform = "translateY(0) translateX(0)";
    }
    // 如果尺寸为mini，后接上scal()
    if(props.size == 'mini') {
      style.transform = style.transform + " scale(0.8)";
    }
    return style;
  });

  // isDot类型时，不显示文字
  const showText = computed(() => {
    if(props.isDot) return '';
    else {
      if(Number(props.count) > props.overflowCount) return `${props.overflowCount}+`;
      else return props.count;
    }
  });

  // 是否显示组件
  const show = computed(() => {
    // 如果count的值为0，并且showZero设置为false，不显示组件
    if(props.count == 0 && props.showZero == false) return false;
    else return true;
  });

  defineExpose({
    boxStyle,
    showText,
    show,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-badge {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		justify-content: center;
		align-items: center;
		line-height: 24rpx;
		padding: 4rpx 8rpx;
		border-radius: 100rpx;
		z-index: 9;

		&--bg--primary {
			background-color: $u-type-primary;
		}

		&--bg--error {
			background-color: $u-type-error;
		}

		&--bg--success {
			background-color: $u-type-success;
		}

		&--bg--info {
			background-color: $u-type-info;
		}

		&--bg--warning {
			background-color: $u-type-warning;
		}
	}

	.u-badge-dot {
		height: 16rpx;
		width: 16rpx;
		border-radius: 100rpx;
		line-height: 1;
	}

	.u-badge-mini {
		transform: scale(0.8);
		transform-origin: center center;
	}

	// .u-primary {
	// 	background: $u-type-primary;
	// 	color: #fff;
	// }

	// .u-error {
	// 	background: $u-type-error;
	// 	color: #fff;
	// }

	// .u-warning {
	// 	background: $u-type-warning;
	// 	color: #fff;
	// }

	// .u-success {
	// 	background: $u-type-success;
	// 	color: #fff;
	// }

	// .u-black {
	// 	background: #585858;
	// 	color: #fff;
	// }

	.u-info {
		background-color: $u-type-info;
		color: #fff;
	}
</style>
