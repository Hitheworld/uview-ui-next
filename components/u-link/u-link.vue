<template>
	<text
    class="u-link"
    @tap.stop="openLink"
    :style="{
      color: props.color,
      fontSize: props.fontSize + 'rpx',
      borderBottom: props.underLine ? `1px solid ${props.lineColor ? props.lineColor : props.color}` : 'none',
      paddingBottom: props.underLine ? '0rpx' : '0'
    }"
  >
		<slot></slot>
	</text>
</template>

<script lang="ts">
  export default {
    name: 'u-link',
  }
</script>

<script setup lang="ts">
  import { nextTick, withDefaults } from 'vue';
  import { useComposable } from '../../libs/hooks';

	/**
	 * link 超链接
	 * @description 该组件为超链接组件，在不同平台有不同表现形式：在APP平台会通过plus环境打开内置浏览器，在小程序中把链接复制到粘贴板，同时提示信息，在H5中通过window.open打开链接。
	 * @tutorial https://www.uviewui.com/components/link.html
	 * @property {String} color 文字颜色（默认#606266）
	 * @property {String Number} font-size 字体大小，单位rpx（默认28）
	 * @property {Boolean} under-line 是否显示下划线（默认false）
	 * @property {String} href 跳转的链接，要带上http(s)
	 * @property {String} line-color 下划线颜色，默认同color参数颜色 
	 * @property {String} mp-tips 各个小程序平台把链接复制到粘贴板后的提示语（默认“链接已复制，请在浏览器打开”）
	 * @example <u-link href="http://www.uviewui.com">蜀道难，难于上青天</u-link>
	 */
  interface ULinkProps {
    // 文字颜色
    color?: string;
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 是否显示下划线
    underLine?: boolean;
    // 要跳转的链接
    href: string;
    // 小程序中复制到粘贴板的提示语
    mpTips?: string;
    // 下划线颜色
    lineColor?: string;
  }

  const props = withDefaults(defineProps<ULinkProps>(),{
    // 文字颜色
    color: '#2979ff',
    // 字体大小，单位rpx
    fontSize: 28,
    // 是否显示下划线
    underLine: false,
    // 要跳转的链接
    href: '',
    // 小程序中复制到粘贴板的提示语
    mpTips: '链接已复制，请在浏览器打开',
    // 下划线颜色
    lineColor: ''
  });

  const { toast } = useComposable();

  const openLink = () => {
    // #ifdef APP-PLUS
    plus.runtime.openURL(props.href)
    // #endif
    // #ifdef H5
    window.open(props.href)
    // #endif
    // #ifdef MP
    uni.setClipboardData({
      data: props.href,
      success: () => {
        uni.hideToast();
        nextTick(() => {
          toast(props.mpTips);
        });
      }
    });
    // #endif
  };

  defineExpose({
    openLink,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-link {
		line-height: 1;
	}
</style>
