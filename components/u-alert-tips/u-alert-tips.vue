<template>
	<view
      class="u-alert-tips"
      v-if="props.show"
      :class="[
          !props.show ? 'u-close-alert-tips': '',
          props.type ? 'u-alert-tips--bg--' + props.type + '-light' : '',
          props.type ? 'u-alert-tips--border--' + props.type + '-disabled' : '',
	    ]"
      :style="{
        backgroundColor: props.bgColor,
        borderColor: props.borderColor
      }"
  >
		<view class="u-icon-wrap">
			<u-icon
          v-if="props.showIcon"
          :name="uIcon"
          :size="props.description ? 40 : 32"
          class="u-icon"
          :color="uIconType"
          :custom-style="props.iconStyle"
      />
		</view>
		<view
        class="u-alert-content"
        @tap.stop="click"
    >
			<view
          class="u-alert-title"
          :style="[uTitleStyle]"
      >
				{{ props.title }}
			</view>
			<view
          v-if="props.description"
          class="u-alert-desc"
          :style="[props.descStyle]"
      >
				{{ props.description }}
			</view>
		</view>
		<view class="u-icon-wrap">
			<u-icon
          @click="close"
          v-if="props.closeAble && !props.closeText"
          hoverClass="u-type-error-hover-color"
          name="close"
          color="#c0c4cc"
          :size="22"
          class="u-close-icon"
          :style="{
				    top: props.description ? '18rpx' : '24rpx'
          }"
      />
		</view>
		<text
        v-if="props.closeAble && props.closeText"
        class="u-close-text"
        :style="{
			    top: props.description ? '18rpx' : '24rpx'
		    }"
    >
      {{ props.closeText }}
    </text>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-alert-tips',
  }
</script>

<script setup lang="ts">
  import { CSSProperties } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * alertTips 警告提示
	 * @description 警告提示，展现需要关注的信息
	 * @tutorial https://uviewui.com/components/alertTips.html
	 * @property {String} title 显示的标题文字
	 * @property {String} description 辅助性文字，颜色比title浅一点，字号也小一点，可选
	 * @property {String} type 关闭按钮(默认为叉号icon图标)
	 * @property {String} icon 图标名称
	 * @property {Object} icon-style 图标的样式，对象形式
	 * @property {Object} title-style 标题的样式，对象形式
	 * @property {Object} desc-style 描述的样式，对象形式
	 * @property {String} close-able 用文字替代关闭图标，close-able为true时有效
	 * @property {Boolean} show-icon 是否显示左边的辅助图标
	 * @property {Boolean} show 显示或隐藏组件
	 * @event {Function} click 点击组件时触发
	 * @event {Function} close 点击关闭按钮时触发
	 */
  interface AlertTipsProps {
    // 显示文字
    title: string;
    // 主题，success/warning/info/error
    type?: 'success' | 'warning' | 'info' | 'error';
    // 辅助性文字
    description: string;
    // 是否可关闭
    closeAble?: boolean;
    // 关闭按钮自定义文本
    closeText?: string;
    // 是否显示图标
    showIcon?: boolean;
    // 文字颜色，如果定义了color值，icon会失效
    color?: string;
    // 背景颜色
    bgColor?: string;
    // 边框颜色
    borderColor?: string;
    // 是否显示
    show?: boolean;
    // 左边显示的icon
    icon?: string;
    // icon的样式
    iconStyle?: CSSProperties | null;
    // 标题的样式
    titleStyle?: CSSProperties | null;
    // 描述文字的样式
    descStyle?: CSSProperties | null;
  }

  const props = withDefaults(defineProps<AlertTipsProps>(),  {
    // 显示文字
    title: '',
    // 主题，success/warning/info/error
    type: 'warning',
    // 辅助性文字
    description: '',
    // 是否可关闭
    closeAble: false,
    // 关闭按钮自定义文本
    closeText: '',
    // 是否显示图标
    showIcon: false,
    // 文字颜色，如果定义了color值，icon会失效
    color: '',
    // 背景颜色
    bgColor: '',
    // 边框颜色
    borderColor: '',
    // 是否显示
    show: true,
    // 左边显示的icon
    icon: '',
    // icon的样式
    iconStyle: null,
    // 标题的样式
    titleStyle: null,
    // 描述文字的样式
    descStyle: null,
  });

  const emit = defineEmits<{
    (e: 'click'): void;
    (e: 'close'): void;
  }>();

  const { deepMerge, type2icon } = useComposable();

  const uTitleStyle = (() => {
    let style: CSSProperties = {};
    // 如果有描述文字的话，标题进行加粗
    style.fontWeight = props.description ? 500 : 'normal';
    // 将用户传入样式对象和style合并，传入的优先级比style高，同属性会被覆盖
    return deepMerge(style, props.titleStyle);
  });

  const uIcon = (() => {
    // 如果有设置icon名称就使用，否则根据type主题，推定一个默认的图标
    return props.icon ? props.icon : type2icon(props.type);
  });

  const uIconType = (() => {
    // 如果有设置图标的样式，优先使用，没有的话，则用type的样式
    return (props.iconStyle && Object.keys(props.iconStyle).length) ? '' : props.type;
  });

  // 点击内容
  const click = () => {
    emit('click');
  };

  // 点击关闭按钮
  const close = () => {
    emit('close');
  };

  defineExpose({
    uTitleStyle,
    uIcon,
    uIconType,
    click,
    close,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-alert-tips {
		@include vue-flex;
		align-items: center;
		padding: 16rpx 30rpx;
		border-radius: 8rpx;
		position: relative;
		transition: all 0.3s linear;
		border: 1px solid #fff;

		&--bg--primary-light {
			background-color: $u-type-primary-light;
		}

		&--bg--info-light {
			background-color: $u-type-info-light;
		}

		&--bg--success-light {
			background-color: $u-type-success-light;
		}

		&--bg--warning-light {
			background-color: $u-type-warning-light;
		}

		&--bg--error-light {
			background-color: $u-type-error-light;
		}

		&--border--primary-disabled {
			border-color: $u-type-primary-disabled;
		}

		&--border--success-disabled {
			border-color: $u-type-success-disabled;
		}

		&--border--error-disabled {
			border-color: $u-type-error-disabled;
		}

		&--border--warning-disabled {
			border-color: $u-type-warning-disabled;
		}

		&--border--info-disabled {
			border-color: $u-type-info-disabled;
		}
	}

	.u-close-alert-tips {
		opacity: 0;
		visibility: hidden;
	}

	.u-icon {
		margin-right: 16rpx;
	}

	.u-alert-title {
		font-size: 28rpx;
		color: $u-main-color;
	}

	.u-alert-desc {
		font-size: 26rpx;
		text-align: left;
		color: $u-content-color;
	}

	.u-close-icon {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
	}

	.u-close-hover {
		color: red;
	}

	.u-close-text {
		font-size: 24rpx;
		color: $u-tips-color;
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		line-height: 1;
	}
</style>
