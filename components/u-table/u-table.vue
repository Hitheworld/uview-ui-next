<template>
	<view class="u-table" :style="[tableStyle]">
		<slot />
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-table',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, computed, withDefaults } from "vue";
	/**
	 * table 表格
	 * @description 表格组件一般用于展示大量结构化数据的场景
	 * @tutorial https://www.uviewui.com/components/table.html
	 * @property {String} border-color 表格边框的颜色（默认#e4e7ed）
	 * @property {String} bg-color 表格的背景颜色（默认#ffffff）
	 * @property {String} align 单元格的内容对齐方式，作用类似css的text-align（默认center）
	 * @property {String} padding 单元格的内边距，同css的padding写法（默认10rpx 0）
	 * @property {String Number} font-size 单元格字体大小，单位rpx（默认28）
	 * @property {String} color 单元格字体颜色（默认#606266）
	 * @property {Object} th-style th单元格的样式，对象形式(将th所需参数放在table组件，是为了避免每一个th组件要写一遍）
	 * @event {Function} click 点击组件时触发
	 * @event {Function} close 点击关闭按钮时触发
	 * @example <u-table></u-table>
	 */
  interface UTableProps {
    borderColor?: string;
    align?: string;
    // td的内边距
    padding?: string;
    // 字体大小
    fontSize?: number | string;
    // 字体颜色
    color?: string;
    // th的自定义样式
    thStyle?: CSSProperties;
    // table的背景颜色
    bgColor?: string;
  }

  const props = withDefaults(defineProps<UTableProps>(),{
    borderColor: '#e4e7ed',
    align: 'center',
    // td的内边距
    padding: '10rpx 6rpx',
    // 字体大小
    fontSize: 28,
    // 字体颜色
    color: '#606266',
    // th的自定义样式
    thStyle: () => {
      return {}
    },
    // table的背景颜色
    bgColor: '#ffffff',
  });

  const tableStyle = computed(() => {
    let style: CSSProperties = {};
    style.borderLeft = `solid 1px ${props.borderColor}`;
    style.borderTop = `solid 1px ${props.borderColor}`;
    style.backgroundColor = props.bgColor;
    return style;
  });

  defineExpose({
    tableStyle,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-table {
		width: 100%;
		box-sizing: border-box;
	}
</style>
