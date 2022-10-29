<template>
	<view
		class="u-card"
		@tap.stop="click"
		:class="{
      'u-border': props.border,
      'u-card-full': props.full,
      'u-card--border': props.borderRadius > 0
    }"
		:style="{
			borderRadius: props.borderRadius + 'rpx',
			margin: props.margin,
			boxShadow: props.boxShadow
		}"
	>
		<view
			v-if="props.showHead"
			class="u-card__head"
			:style="[{padding: props.padding + 'rpx'}, props.headStyle]"
			:class="{
				'u-border-bottom': props.headBorderBottom
			}"
			@tap="headClick"
		>
			<view
          v-if="!headSlot"
          class="u-flex u-row-between"
      >
				<view
            class="u-card__head--left u-flex u-line-1"
            v-if="props.title"
        >
					<image
						:src="props.thumb"
						class="u-card__head--left__thumb"
						mode="aspectfull"
						v-if="props.thumb"
						:style="{ 
							height: props.thumbWidth + 'rpx',
							width: props.thumbWidth + 'rpx',
							borderRadius: props.thumbCircle ? '100rpx' : '6rpx'
						}"
					/>
					<text
						class="u-card__head--left__title u-line-1"
						:style="{
							fontSize: props.titleSize + 'rpx',
							color: props.titleColor
						}"
					>
						{{ props.title }}
					</text>
				</view>
				<view
            class="u-card__head--right u-line-1"
            v-if="props.subTitle"
        >
					<text
						class="u-card__head__title__text"
						:style="{
							fontSize: props.subTitleSize + 'rpx',
							color: props.subTitleColor
						}"
					>
						{{ props.subTitle }}
					</text>
				</view>
			</view>
			<slot name="head" v-else />
		</view>
		<view
        @tap="bodyClick"
        class="u-card__body"
        :style="[{ padding: props.padding + 'rpx'}, props.bodyStyle]"
    >
      <slot name="body" />
    </view>
		<view
			v-if="props.showFoot"
			class="u-card__foot"
			 @tap="footClick"
			:style="[
          {
            padding: footSlot ? props.padding + 'rpx' : 0
          }, props.footStyle
      ]"
			:class="{
				'u-border-top': props.footBorderTop
			}"
		>
			<slot name="foot" />
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-card',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, useSlots } from 'vue'
  /**
   * card 卡片
   * @description 卡片组件一般用于多个列表条目，且风格统一的场景
   * @tutorial https://www.uviewui.com/components/card.html
   * @property {Boolean} full 卡片与屏幕两侧是否留空隙（默认false）
   * @property {String} title 头部左边的标题
   * @property {String} title-color 标题颜色（默认#303133）
   * @property {String | Number} title-size 标题字体大小，单位rpx（默认30）
   * @property {String} sub-title 头部右边的副标题
   * @property {String} sub-title-color 副标题颜色（默认#909399）
   * @property {String | Number} sub-title-size 副标题字体大小（默认26）
   * @property {Boolean} border 是否显示边框（默认true）
   * @property {String | Number} index 用于标识点击了第几个卡片
   * @property {String} box-shadow 卡片外围阴影，字符串形式（默认none）
   * @property {String} margin 卡片与屏幕两边和上下元素的间距，需带单位，如"30rpx 20rpx"（默认30rpx）
   * @property {String | Number} border-radius 卡片整体的圆角值，单位rpx（默认16）
   * @property {Object} head-style 头部自定义样式，对象形式
   * @property {Object} body-style 中部自定义样式，对象形式
   * @property {Object} foot-style 底部自定义样式，对象形式
   * @property {Boolean} head-border-bottom 是否显示头部的下边框（默认true）
   * @property {Boolean} foot-border-top 是否显示底部的上边框（默认true）
   * @property {Boolean} show-head 是否显示头部（默认true）
   * @property {Boolean} show-head 是否显示尾部（默认true）
   * @property {String} thumb 缩略图路径，如设置将显示在标题的左边，不建议使用相对路径
   * @property {String | Number} thumb-width 缩略图的宽度，高等于宽，单位rpx（默认60）
   * @property {Boolean} thumb-circle 缩略图是否为圆形（默认false）
   * @event {Function} click 整个卡片任意位置被点击时触发
   * @event {Function} head-click 卡片头部被点击时触发
   * @event {Function} body-click 卡片主体部分被点击时触发
   * @event {Function} foot-click 卡片底部部分被点击时触发
   * @example <u-card padding="30" title="card"></u-card>
   */
  type IndexType = number | string | object;
  interface UCardProps {
    // 与屏幕两侧是否留空隙
    full?: boolean;
    // 标题
    title?: string;
    // 标题颜色
    titleColor?: string;
    // 标题字体大小，单位rpx
    titleSize?: number | string;
    // 副标题
    subTitle?: string;
    // 副标题颜色
    subTitleColor?: string;
    // 副标题字体大小，单位rpx
    subTitleSize?: number | string;
    // 是否显示外部边框，只对full=false时有效(卡片与边框有空隙时)
    border?: boolean;
    // 用于标识点击了第几个
    index: IndexType;
    // 用于隔开上下左右的边距，带单位的写法，如："30rpx 30rpx"，"20rpx 20rpx 30rpx 30rpx"
    margin?: string;
    // card卡片的圆角
    borderRadius?: number | string;
    // 头部自定义样式，对象形式
    headStyle?: CSSProperties;
    // 主体自定义样式，对象形式
    bodyStyle?: CSSProperties;
    // 底部自定义样式，对象形式
    footStyle?: CSSProperties;
    // 头部是否下边框
    headBorderBottom?: boolean;
    // 底部是否有上边框
    footBorderTop?: boolean;
    // 标题左边的缩略图
    thumb?: string;
    // 缩略图宽高，单位rpx
    thumbWidth?: number | string;
    // 缩略图是否为圆形
    thumbCircle?: boolean;
    // 给head，body，foot的内边距
    padding?: number | string;
    // 是否显示头部
    showHead?: boolean;
    // 是否显示尾部
    showFoot?: boolean;
    // 卡片外围阴影，字符串形式
    boxShadow?: string;
  }

  const headSlot = useSlots().head;
  const footSlot = useSlots().foot;

  const props = withDefaults(defineProps<UCardProps>(), {
    // 与屏幕两侧是否留空隙
    full: false,
    // 标题
    title: '',
    // 标题颜色
    titleColor: '#303133',
    // 标题字体大小，单位rpx
    titleSize: '30',
    // 副标题
    subTitle: '',
    // 副标题颜色
    subTitleColor: '#909399',
    // 副标题字体大小，单位rpx
    subTitleSize: '26',
    // 是否显示外部边框，只对full=false时有效(卡片与边框有空隙时)
    border: true,
    // 用于标识点击了第几个
    index: '',
    // 用于隔开上下左右的边距，带单位的写法，如："30rpx 30rpx"，"20rpx 20rpx 30rpx 30rpx"
    margin: '30rpx',
    // card卡片的圆角
    borderRadius: '16',
    // 头部自定义样式，对象形式
    headStyle: () => {
      return {}
    },
    // 主体自定义样式，对象形式
    bodyStyle: () => {
      return {}
    },
    // 底部自定义样式，对象形式
    footStyle: () => {
      return {}
    },
    // 头部是否下边框
    headBorderBottom: true,
    // 底部是否有上边框
    footBorderTop: true,
    // 标题左边的缩略图
    thumb: '',
    // 缩略图宽高，单位rpx
    thumbWidth: '60',
    // 缩略图是否为圆形
    thumbCircle: false,
    // 给head，body，foot的内边距
    padding: '30',
    // 是否显示头部
    showHead: true,
    // 是否显示尾部
    showFoot: true,
    // 卡片外围阴影，字符串形式
    boxShadow: 'none',
  });

  const emit = defineEmits<{
    (e: 'click', index: IndexType): void;
    (e: 'head-click', index: IndexType): void;
    (e: 'body-click', index: IndexType): void;
    (e: 'foot-click', index: IndexType): void;
  }>();

  const click = () => {
    emit('click', props.index);
  };

  const headClick = () => {
    emit('head-click', props.index);
  };

  const bodyClick = () => {
    emit('body-click', props.index);
  };

  const footClick = () => {
    emit('foot-click', props.index);
  }

  defineExpose({
    click,
    headClick,
    bodyClick,
    footClick,
  });
</script>

<style lang="scss" scoped>
@import "../../libs/css/style.components.scss";
	
.u-card {
	position: relative;
	overflow: hidden;
	font-size: 28rpx;
	background-color: #ffffff;
	box-sizing: border-box;
	
	&-full {
		// 如果是与屏幕之间不留空隙，应该设置左右边距为0
		margin-left: 0 !important;
		margin-right: 0 !important;
		width: 100%;
	}
	
	&--border:after {
		border-radius: 16rpx;
	}

	&__head {
		&--left {
			color: $u-main-color;
			
			&__thumb {
				margin-right: 16rpx;
			}
			
			&__title {
				max-width: 400rpx;
			}
		}

		&--right {
			color: $u-tips-color;
			margin-left: 6rpx;
		}
	}

	&__body {
		color: $u-content-color;
	}

	&__foot {
		color: $u-tips-color;
	}
}
</style>
