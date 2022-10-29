<template>
	<view
      class="u-row"
      :style="{
        alignItems: uAlignItem,
        justifyContent: uJustify
      }"
      @tap="click"
	>
		<slot />
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-row',
  }
</script>

<script setup lang="ts">
import { computed, withDefaults } from "vue";
	/**
	 * row 行布局
	 * @description 通过基础的 12 分栏，迅速简便地创建布局。
	 * @tutorial https://www.uviewui.com/components/layout.html#row-props
	 * @property {String Number} gutter 栅格间隔，左右各为此值的一半，单位rpx（默认0）
	 * @property {String} justify 水平排列方式(微信小程序暂不支持)默认（start(或flex-start)）
	 * @property {String} align 垂直排列方式（默认center）
	 * @example <u-row gutter="16"></u-row>
	 */
  interface URowProps {
    // 给col添加间距，左右边距各占一半
    gutter?: number | string;
    // 水平排列方式，可选值为`start`(或`flex-start`)、`end`(或`flex-end`)、`center`、`around`(或`space-around`)、`between`(或`space-between`)
    justify?: 'start' | 'end' | 'center' | 'around' | 'between';
    // 垂直对齐方式，可选值为top、center、bottom
    align?: 'top' | 'center' | 'bottom';
    // 是否阻止事件传播
    stop?: boolean;
  }

  const props = withDefaults(defineProps<URowProps>(),{
    // 给col添加间距，左右边距各占一半
    gutter: 20,
    // 水平排列方式，可选值为`start`(或`flex-start`)、`end`(或`flex-end`)、`center`、`around`(或`space-around`)、`between`(或`space-between`)
    justify: 'start',
    // 垂直对齐方式，可选值为top、center、bottom
    align: 'center',
    // 是否阻止事件传播
    stop: true,
  });

  const emit = defineEmits<{
    (e: 'click'): void;
  }>();

  const uJustify = computed(() =>　{
    if (props.justify == 'end' || props.justify == 'start') return 'flex-' + props.justify;
    else if (props.justify == 'around' || props.justify == 'between') return 'space-' + props.justify;
    else return props.justify;
  });

  const uAlignItem = computed(() =>　{
    if (props.align == 'top') return 'flex-start';
    if (props.align == 'bottom') return 'flex-end';
    else return props.align;
  });

  const click = (e: any) => {
    emit('click');
  };

  defineExpose({
    uJustify,
    uAlignItem,
    click,
  });
</script>

<style lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-row {
		// 由于微信小程序编译后奇怪的页面结构，只能使用float布局实现，flex无法实现
		/* #ifndef MP-WEIXIN || MP-QQ || MP-TOUTIAO */
		@include vue-flex;
		/* #endif */
		flex-wrap: wrap;
	}

	.u-row:after {
		/* #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO */
		display: table;
		clear: both;
		content: "";
		/* #endif */
	}
</style>
