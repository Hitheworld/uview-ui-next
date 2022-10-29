<template>
	<view>
		<u-popup
      :zoom="props.zoom"
      mode="center"
      :popup="false"
      :z-index="uZIndex"
      v-model="props.modelValue"
      :length="props.width"
      :mask-close-able="props.maskCloseAble"
      :border-radius="props.borderRadius"
      @close="popupClose"
      :negative-top="props.negativeTop"
    >
			<view class="u-model">
				<view
          v-if="props.showTitle"
          class="u-model__title u-line-1"
          :style="[props.titleStyle]"
        >
          {{ props.title }}
        </view>
				<view class="u-model__content">
					<view
            :style="[props.contentStyle]"
            v-if="defaultSlot"
          >
						<slot />
					</view>
					<view
            v-else
            class="u-model__content__message"
            :style="[props.contentStyle]"
          >
            {{ props.content }}
          </view>
				</view>
				<view
          class="u-model__footer u-border-top"
          v-if="props.showCancelButton || props.showConfirmButton"
        >
					<view
            v-if="props.showCancelButton"
            :hover-stay-time="100"
            hover-class="u-model__btn--hover"
            class="u-model__footer__button"
            :style="[cancelBtnStyle]"
            @tap="cancel"
          >
						{{ props.cancelText }}
					</view>
					<view
            v-if="props.showConfirmButton || confirmButtonSlot"
            :hover-stay-time="100"
            :hover-class="props.asyncClose ? 'none' : 'u-model__btn--hover'"
            class="u-model__footer__button hairline-left"
            :style="[confirmBtnStyle]"
            @tap="confirm"
          >
						<slot
              v-if="confirmButtonSlot"
              name="confirm-button"
            ></slot>
						<block v-else>
							<u-loading
                mode="circle"
                :color="props.confirmColor"
                v-if="state.loading"
              ></u-loading>
							<block v-else>
								{{ props.confirmText }}
							</block>
						</block>
					</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-modal',
  }
</script>

<script setup lang="ts">
  import {
    reactive,
    toRefs,
    computed,
    watch,
    CSSProperties, withDefaults, useSlots
  } from 'vue';
  import { useComposable } from '../../libs/hooks';

  /**
	 * modal 模态框
	 * @description 弹出模态框，常用于消息提示、消息确认、在当前页面内完成特定的交互操作
	 * @tutorial https://www.uviewui.com/components/modal.html
	 * @property {Boolean} value 是否显示模态框
	 * @property {String | Number} z-index 层级
	 * @property {String} title 模态框标题（默认"提示"）
	 * @property {String | Number} width 模态框宽度（默认600）
	 * @property {String} content 模态框内容（默认"内容"）
	 * @property {Boolean} show-title 是否显示标题（默认true）
	 * @property {Boolean} async-close 是否异步关闭，只对确定按钮有效（默认false）
	 * @property {Boolean} show-confirm-button 是否显示确认按钮（默认true）
	 * @property {Stringr | Number} negative-top modal往上偏移的值
	 * @property {Boolean} show-cancel-button 是否显示取消按钮（默认false）
	 * @property {Boolean} mask-close-able 是否允许点击遮罩关闭modal（默认false）
	 * @property {String} confirm-text 确认按钮的文字内容（默认"确认"）
	 * @property {String} cancel-text 取消按钮的文字内容（默认"取消"）
	 * @property {String} cancel-color 取消按钮的颜色（默认"#606266"）
	 * @property {String} confirm-color 确认按钮的文字内容（默认"#2979ff"）
	 * @property {String | Number} border-radius 模态框圆角值，单位rpx（默认16）
	 * @property {Object} title-style 自定义标题样式，对象形式
	 * @property {Object} content-style 自定义内容样式，对象形式
	 * @property {Object} cancel-style 自定义取消按钮样式，对象形式
	 * @property {Object} confirm-style 自定义确认按钮样式，对象形式
	 * @property {Boolean} zoom 是否开启缩放模式（默认true）
	 * @event {Function} confirm 确认按钮被点击
	 * @event {Function} cancel 取消按钮被点击
	 * @example <u-modal :src="title" :content="content"></u-modal>
	 */
  interface UModalState {
    loading: boolean;
  }
  interface UModalProps {
    // 是否显示Modal
    modelValue: boolean;
    // 层级z-index
    zIndex?: number | string;
    // 标题
    title?: string;
    // 弹窗宽度，可以是数值(rpx)，百分比，auto等
    width?: number | string;
    // 弹窗内容
    content: string;
    // 是否显示标题
    showTitle?: boolean;
    // 是否显示确认按钮
    showConfirmButton?: boolean;
    // 是否显示取消按钮
    showCancelButton?: boolean;
    // 确认文案
    confirmText?: string;
    // 取消文案
    cancelText?: string;
    // 确认按钮颜色
    confirmColor?: string;
    // 取消文字颜色
    cancelColor?: string;
    // 圆角值
    borderRadius?: number | string;
    // 标题的样式
    titleStyle?: CSSProperties;
    // 内容的样式
    contentStyle?: CSSProperties;
    // 取消按钮的样式
    cancelStyle?: CSSProperties;
    // 确定按钮的样式
    confirmStyle?: CSSProperties;
    // 是否开启缩放效果
    zoom?: boolean;
    // 是否异步关闭，只对确定按钮有效
    asyncClose?: boolean;
    // 是否允许点击遮罩关闭modal
    maskCloseAble?: boolean;
    // 给一个负的margin-top，往上偏移，避免和键盘重合的情况
    negativeTop?: number | string;
  }

  const defaultSlot = useSlots().default;
  const confirmButtonSlot = useSlots()['confirm-button'];

  const props = withDefaults(defineProps<UModalProps>(),{
    // 是否显示Modal
    modelValue: false,
    // 层级z-index
    zIndex: '',
    // 标题
    title: '提示',
    // 弹窗宽度，可以是数值(rpx)，百分比，auto等
    width: 600,
    // 弹窗内容
    content: '内容',
    // 是否显示标题
    showTitle: true,
    // 是否显示确认按钮
    showConfirmButton: true,
    // 是否显示取消按钮
    showCancelButton: false,
    // 确认文案
    confirmText: '确认',
    // 取消文案
    cancelText: '取消',
    // 确认按钮颜色
    confirmColor: '#2979ff',
    // 取消文字颜色
    cancelColor: '#606266',
    // 圆角值
    borderRadius: 16,
    // 标题的样式
    titleStyle: () => {
      return {}
    },
    // 内容的样式
    contentStyle: () => {
      return {}
    },
    // 取消按钮的样式
    cancelStyle: () => {
      return {}
    },
    // 确定按钮的样式
    confirmStyle: () => {
      return {}
    },
    // 是否开启缩放效果
    zoom: true,
    // 是否异步关闭，只对确定按钮有效
    asyncClose: false,
    // 是否允许点击遮罩关闭modal
    maskCloseAble: false,
    // 给一个负的margin-top，往上偏移，避免和键盘重合的情况
    negativeTop: 0,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', isShow: boolean): void;
    (e: 'confirm'): void;
    (e: 'cancel'): void;
  }>();

  const { Z_INDEX_CONFIG } = useComposable();

  const state = reactive<UModalState>({
    loading: false, // 确认按钮是否正在加载中
  });

  const cancelBtnStyle = computed(() => {
    return Object.assign({
      color: props.cancelColor
    }, props.cancelStyle);
  });

  const confirmBtnStyle = computed(() => {
    return Object.assign({
      color: props.confirmColor
    }, props.confirmStyle);
  });

  const uZIndex = computed(() => {
    return props.zIndex ? props.zIndex : Z_INDEX_CONFIG.popup;
  });

  const confirm = () => {
    // 异步关闭
    if (props.asyncClose) {
      state.loading = true;
    } else {
      emit('update:modelValue', false);
    }
    emit('confirm');
  };

  const cancel = () => {
    emit('cancel');
    emit('update:modelValue', false);
    // 目前popup弹窗关闭有一个延时操作，此处做一个延时
    // 避免确认按钮文字变成了"确定"字样，modal还没消失，造成视觉不好的效果
    setTimeout(() => {
      state.loading = false;
    }, 300);
  };

  // 点击遮罩关闭modal，设置v-model的值为false，否则无法第二次弹起modal
  const popupClose = () => {
    emit('update:modelValue', false);
  };

  // 清除加载中的状态
  const clearLoading = () => {
    state.loading = false;
  };

  // 如果是异步关闭时，外部修改v-model的值为false时，重置内部的loading状态
  // 避免下次打开的时候，状态混乱
  watch(() => props.modelValue, (newValue, oldValue) => {
    if (newValue === true) state.loading = false;
  });

  defineExpose({
    ...toRefs(state),
    cancelBtnStyle,
    confirmBtnStyle,
    uZIndex,
    confirm,
    cancel,
    popupClose,
    clearLoading,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-model {
		height: auto;
		overflow: hidden;
		font-size: 32rpx;
		background-color: #fff;

		&__btn--hover {
			background-color: rgb(230, 230, 230);
		}

		&__title {
			padding-top: 48rpx;
			font-weight: 500;
			text-align: center;
			color: $u-main-color;
		}

		&__content {
			&__message {
				padding: 48rpx;
				font-size: 30rpx;
				text-align: center;
				color: $u-content-color;
			}
		}

		&__footer {
			@include vue-flex;

			&__button {
				flex: 1;
				height: 100rpx;
				line-height: 100rpx;
				font-size: 32rpx;
				box-sizing: border-box;
				cursor: pointer;
				text-align: center;
				border-radius: 4rpx;
			}
		}
	}
</style>
