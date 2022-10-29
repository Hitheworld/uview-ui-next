<template>
	<view class="u-gap" :style="[gapStyle]"></view>
</template>

<script lang="ts">
  export default {
    name: 'u-gap',
  }
</script>

<script setup lang="ts">
  import { computed, withDefaults } from "vue";

  /**
   * gap 间隔槽
   * @description 该组件一般用于内容块之间的用一个灰色块隔开的场景，方便用户风格统一，减少工作量
   * @tutorial https://www.uviewui.com/components/gap.html
   * @property {String} bg-color 背景颜色（默认#f3f4f6）
   * @property {String Number} height 分割槽高度，单位rpx（默认30）
   * @property {String Number} margin-top 与前一个组件的距离，单位rpx（默认0）
   * @property {String Number} margin-bottom 与后一个组件的距离，单位rpx（0）
   * @example <u-gap height="80" bg-color="#bbb"></u-gap>
   */
  interface UGapProps {
    bgColor?: string;
    // 高度
    height?: number | string;
    // 与上一个组件的距离
    marginTop?: number | string;
    // 与下一个组件的距离
    marginBottom?: number | string;
  }

  const props = withDefaults(defineProps<UGapProps>(),  {
    // 背景透明
    bgColor: 'transparent',
    // 高度
    height: 30,
    // 与上一个组件的距离
    marginTop: 0,
    // 与下一个组件的距离
    marginBottom: 0,
  });

  const gapStyle = computed(() => {
    return {
      backgroundColor: props.bgColor,
      height: props.height + 'rpx',
      marginTop: props.marginTop + 'rpx',
      marginBottom: props.marginBottom + 'rpx'
    };
  });

  defineExpose({
    gapStyle,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
</style>
