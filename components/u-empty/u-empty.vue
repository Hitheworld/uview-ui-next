<template>
	<view class="u-empty" v-if="props.show" :style="{
		marginTop: props.marginTop + 'rpx'
	}">
		<u-icon
			:name="props.src ? props.src : 'empty-' + props.mode"
			:custom-style="props.iconStyle"
			:label="props.text ? props.text : state.icons[props.mode]"
			label-pos="bottom"
			:label-color="props.color"
			:label-size="props.fontSize"
			:size="props.iconSize"
			:color="props.iconColor"
			margin-top="14"
		></u-icon>
		<view class="u-slot-wrap">
			<slot name="bottom"></slot>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-empty',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, reactive, toRefs, withDefaults} from "vue";
	/**
	 * empty 内容为空
	 * @description 该组件用于需要加载内容，但是加载的第一页数据就为空，提示一个"没有内容"的场景， 我们精心挑选了十几个场景的图标，方便您使用。
	 * @tutorial https://www.uviewui.com/components/empty.html
	 * @property {String} color 文字颜色（默认#c0c4cc）
	 * @property {String} text 文字提示（默认“无内容”）
	 * @property {String} src 自定义图标路径，如定义，mode参数会失效
	 * @property {String Number} font-size 提示文字的大小，单位rpx（默认28）
	 * @property {String} mode 内置的图标，见官网说明（默认data）
	 * @property {String Number} img-width 图标的宽度，单位rpx（默认240）
	 * @property {String} img-height 图标的高度，单位rpx（默认auto）
	 * @property {String Number} margin-top 组件距离上一个元素之间的距离（默认0）
	 * @property {Boolean} show 是否显示组件（默认true）
	 * @event {Function} click 点击组件时触发
	 * @event {Function} close 点击关闭按钮时触发
	 * @example <u-empty text="所谓伊人，在水一方" mode="list"></u-empty>
	 */
  interface UEmptyProps {
    // 图标路径
    src?: string;
    // 提示文字
    text?: string;
    // 文字颜色
    color?: string;
    // 图标的颜色
    iconColor?: string;
    // 图标的大小
    iconSize?: number | string;
    // 文字大小，单位rpx
    fontSize?: number | string;
    // 选择预置的图标类型
    mode?: string;
    //  图标宽度，单位rpx
    imgWidth?: number | string;
    // 图标高度，单位rpx
    imgHeight?: number | string;
    // 是否显示组件
    show?: boolean;
    // 组件距离上一个元素之间的距离
    marginTop?: number | string;
    iconStyle?: CSSProperties;
  }

  const props = withDefaults(defineProps<UEmptyProps>(),  {
    // 图标路径
    src: '',
    // 提示文字
    text: '',
    // 文字颜色
    color: '#c0c4cc',
    // 图标的颜色
    iconColor: '#c0c4cc',
    // 图标的大小
    iconSize: 120,
    // 文字大小，单位rpx
    fontSize: 26,
    // 选择预置的图标类型
    mode: 'data',
    //  图标宽度，单位rpx
    imgWidth: 120,
    // 图标高度，单位rpx
    imgHeight: 'auto',
    // 是否显示组件
    show: true,
    // 组件距离上一个元素之间的距离
    marginTop: 0,
    iconStyle: () => {
      return {}
    },
  });

  const state = reactive({
    icons: {
      car: '购物车为空',
      page: '页面不存在',
      search: '没有搜索结果',
      address: '没有收货地址',
      wifi: '没有WiFi',
      order: '订单为空',
      coupon: '没有优惠券',
      favor: '暂无收藏',
      permission: '无权限',
      history: '无历史记录',
      news: '无新闻列表',
      message: '消息列表为空',
      list: '列表为空',
      data: '数据为空'
    },
    // icons: [{
    // 	icon: 'car',
    // 	text: '购物车为空'
    // },{
    // 	icon: 'page',
    // 	text: '页面不存在'
    // },{
    // 	icon: 'search',
    // 	text: '没有搜索结果'
    // },{
    // 	icon: 'address',
    // 	text: '没有收货地址'
    // },{
    // 	icon: 'wifi',
    // 	text: '没有WiFi'
    // },{
    // 	icon: 'order',
    // 	text: '订单为空'
    // },{
    // 	icon: 'coupon',
    // 	text: '没有优惠券'
    // },{
    // 	icon: 'favor',
    // 	text: '暂无收藏'
    // },{
    // 	icon: 'permission',
    // 	text: '无权限'
    // },{
    // 	icon: 'history',
    // 	text: '无历史记录'
    // },{
    // 	icon: 'news',
    // 	text: '无新闻列表'
    // },{
    // 	icon: 'message',
    // 	text: '消息列表为空'
    // },{
    // 	icon: 'list',
    // 	text: '列表为空'
    // },{
    // 	icon: 'data',
    // 	text: '数据为空'
    // }],
  });
  defineExpose({
    ...toRefs(state),
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-empty {
		@include vue-flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.u-image {
		margin-bottom: 20rpx;
	}

	.u-slot-wrap {
		@include vue-flex;
		justify-content: center;
		align-items: center;
		margin-top: 20rpx;
	}
</style>
