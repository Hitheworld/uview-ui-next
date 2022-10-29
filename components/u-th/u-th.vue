<template>
	<view class="u-th" :style="[thStyle]">
		<slot></slot>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-th',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, ref, onMounted, withDefaults } from "vue";
  import { useComposable } from '../../libs/hooks';

	/**
	 * th th单元格
	 * @description 表格组件一般用于展示大量结构化数据的场景（搭配u-table使用）
	 * @tutorial https://www.uviewui.com/components/table.html#td-props
	 * @property {String Number} width 标题单元格宽度百分比或者具体带单位的值，如30%，200rpx等，一般使用百分比，单元格宽度默认为均分tr的长度
	 * @example 暂无示例
	 */
  interface UThProps {
    // 宽度，百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比
    width?: number | string;
  }

  const props = withDefaults(defineProps<UThProps>(),{
    // 宽度，百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比
    width: '',
  });

  const { $parentUtil, parent } = useComposable();

  const thStyle = ref({});

  onMounted(() => {
    parent.value = $parentUtil('u-table');
    if (parent.value) {
      // 将父组件的相关参数，合并到本组件
      let style: CSSProperties = {};
      if (props.width) style.flex = `0 0 ${props.width}`;
      style.textAlign = parent.value?.props?.align || 'center';
      style.padding = parent.value?.props?.padding;
      style.borderBottom = `solid 1px ${parent.value?.props?.borderColor}`;
      style.borderRight = `solid 1px ${parent.value?.props?.borderColor}`;
      Object.assign(style, parent.value.props.style);
      thStyle.value = style;
    }
  });

  defineExpose({
    thStyle,
    parent,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-th {
		@include vue-flex;
		flex-direction: column;
		flex: 1;
		justify-content: center;
		font-size: 28rpx;
		color: $u-main-color;
		font-weight: bold;
		background-color: rgb(245, 246, 248);
	}
</style>
