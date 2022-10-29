<template>
	<view class="u-td" :style="[tdStyle]">
		<slot></slot>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-td',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, ref, onMounted, withDefaults} from "vue";
  import { useComposable } from '../../libs/hooks';

	/**
	 * td td单元格
	 * @description 表格组件一般用于展示大量结构化数据的场景（搭配u-table使用）
	 * @tutorial https://www.uviewui.com/components/table.html#td-props
	 * @property {String Number} width 单元格宽度百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比，单元格宽度默认为均分tr的长度（默认auto）
	 * @example <u-td>二年级</u-td>
	 */
  interface UTdProps {
    // 宽度，百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比
    width?: number | string;
  }
  const props = withDefaults(defineProps<UTdProps>(),{
    // 宽度，百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比
    width: 'auto',
  });

  const { $parentUtil } = useComposable();

  const tdStyle = ref({});
  const parent = ref<any | boolean>(false);

  onMounted(() => {
    parent.value = $parentUtil('u-table');
    if (parent.value) {
      // 将父组件的相关参数，合并到本组件
      let style: CSSProperties = {};
      if (props.width != "auto") style.flex = `0 0 ${props.width}`;
      style.textAlign = parent.value.props.align;
      style.fontSize = parent.value.props.fontSize + 'rpx';
      style.padding = parent.value.props.padding;
      style.borderBottom = `solid 1px ${parent.value.props.borderColor}`;
      style.borderRight = `solid 1px ${parent.value.props.borderColor}`;
      style.color = parent.value.props.color;
      tdStyle.value = style;
    }
  });

  defineExpose({
    tdStyle,
    parent,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-td {
		@include vue-flex;
		flex-direction: column;
		flex: 1;
		justify-content: center;
		font-size: 28rpx;
		color: $u-content-color;
		align-self: stretch;
		box-sizing: border-box;
		height: 100%;
	}
</style>
