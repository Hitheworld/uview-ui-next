<template>
	<view
      class="u-field"
      :class="{
        'u-border-top': props.borderTop,
        'u-border-bottom': props.borderBottom
      }"
  >
		<view
        class="u-field-inner"
        :class="[
            props.type == 'textarea' ? 'u-textarea-inner' : '',
            'u-label-postion-' + props.labelPosition
        ]"
    >
			<view
          class="u-label"
          :class="[props.required ? 'u-required' : '']"
          :style="{
            justifyContent: justifyContent,
            flex: props.labelPosition == 'left' ? `0 0 ${props.labelWidth}rpx` : '1'
          }"
      >
				<view
            class="u-icon-wrap"
            v-if="props.icon"
        >
					<u-icon
              size="32"
              :custom-style="props.iconStyle"
              :name="props.icon"
              :color="props.iconColor"
              class="u-icon"
          ></u-icon>
				</view>
				<slot name="icon"></slot>
				<text
            class="u-label-text"
            :class="[slotsIcon || props.icon ? 'u-label-left-gap' : '']"
        >
          {{ props.label }}
        </text>
			</view>
			<view class="fild-body">
				<view
            class="u-flex-1 u-flex"
            :style="[inputWrapStyle]"
        >
					<textarea
              v-if="props.type == 'textarea'"
              class="u-flex-1 u-textarea-class"
              :style="[props.fieldStyle]"
              :value="props.modelValue"
              :placeholder="props.placeholder"
              :placeholderStyle="props.placeholderStyle"
              :disabled="props.disabled"
              :maxlength="inputMaxlength"
              :focus="props.focus"
              :autoHeight="props.autoHeight"
              :fixed="props.fixed"
              @input="onInput"
              @blur="onBlur"
              @focus="onFocus"
              @confirm="onConfirm"
              @tap="fieldClick"
          />
					<input
						v-else
						:style="[props.fieldStyle]"
						:type="props.type"
						class="u-flex-1 u-field__input-wrap"
						:value="props.modelValue"
						:password="props.password || props.type === 'password'"
						:placeholder="props.placeholder"
						:placeholderStyle="props.placeholderStyle"
						:disabled="props.disabled"
						:maxlength="inputMaxlength"
						:focus="props.focus"
						:confirmType="props.confirmType"
						@focus="onFocus"
						@blur="onBlur"
						@input="onInput"
						@confirm="onConfirm"
						@tap="fieldClick"
					/>
				</view>
				<u-icon
            :size="props.clearSize"
            v-if="props.clearable && props.modelValue != '' && state.focused"
            name="close-circle-fill"
            color="#c0c4cc"
            class="u-clear-icon"
            @click="onClear"
        />
				<view class="u-button-wrap">
          <slot name="right" />
        </view>
				<u-icon
            v-if="props.rightIcon"
            @click="rightIconClick"
            :name="props.rightIcon"
            color="#c0c4cc"
            :style="[rightIconStyle]"
            size="26"
            class="u-arror-right"
        />
			</view>
		</view>
		<view
        v-if="props.errorMessage !== false && props.errorMessage != ''"
        class="u-error-message"
        :style="{
          paddingLeft: props.labelWidth + 'rpx'
        }"
    >
      {{ props.errorMessage }}
    </view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-field',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, CSSProperties, getCurrentInstance, computed, reactive, toRefs, withDefaults, useSlots } from "vue";
  import { useComposable } from '../../libs/hooks';

	/**
	 * field 输入框
	 * @description 借助此组件，可以实现表单的输入， 有"text"和"textarea"类型的，此外，借助uView的picker和actionSheet组件可以快速实现上拉菜单，时间，地区选择等， 为表单解决方案的利器。
	 * @tutorial https://www.uviewui.com/components/field.html
	 * @property {String} type 输入框的类型（默认text）
	 * @property {String} icon label左边的图标，限uView的图标名称
	 * @property {Object} icon-style 左边图标的样式，对象形式
	 * @property {Boolean} right-icon 输入框右边的图标名称，限uView的图标名称（默认false）
	 * @property {Boolean} required 是否必填，左边您显示红色"*"号（默认false）
	 * @property {String} label 输入框左边的文字提示
	 * @property {Boolean} password 是否密码输入方式(用点替换文字)，type为text时有效（默认false）
	 * @property {Boolean} clearable 是否显示右侧清空内容的图标控件(输入框有内容，且获得焦点时才显示)，点击可清空输入框内容（默认true）
	 * @property {Number String} label-width label的宽度，单位rpx（默认130）
	 * @property {String} label-align label的文字对齐方式（默认left）
	 * @property {Object} field-style 自定义输入框的样式，对象形式
	 * @property {Number | String} clear-size 清除图标的大小，单位rpx（默认30）
	 * @property {String} input-align 输入框内容对齐方式（默认left）
	 * @property {Boolean} border-bottom 是否显示field的下边框（默认true）
	 * @property {Boolean} border-top 是否显示field的上边框（默认false）
	 * @property {String} icon-color 左边通过icon配置的图标的颜色（默认#606266）
	 * @property {Boolean} auto-height 是否自动增高输入区域，type为textarea时有效（默认true）
	 * @property {String Boolean} error-message 显示的错误提示内容，如果为空字符串或者false，则不显示错误信息
	 * @property {String} placeholder 输入框的提示文字
	 * @property {String} placeholder-style placeholder的样式(内联样式，字符串)，如"color: #ddd"
	 * @property {Boolean} focus 是否自动获得焦点（默认false）
	 * @property {Boolean} fixed 如果type为textarea，且在一个"position:fixed"的区域，需要指明为true（默认false）
	 * @property {Boolean} disabled 是否不可输入（默认false）
	 * @property {Number String} maxlength 最大输入长度，设置为 -1 的时候不限制最大长度（默认140）
	 * @property {String} confirm-type 设置键盘右下角按钮的文字，仅在type="text"时生效（默认done）
	 * @event {Function} input 输入框内容发生变化时触发
	 * @event {Function} focus 输入框获得焦点时触发
	 * @event {Function} blur 输入框失去焦点时触发
	 * @event {Function} confirm 点击完成按钮时触发
	 * @event {Function} right-icon-click 通过right-icon生成的图标被点击时触发
	 * @event {Function} click 输入框被点击或者通过right-icon生成的图标被点击时触发，这样设计是考虑到传递右边的图标，一般都为需要弹出"picker"等操作时的场景，点击倒三角图标，理应发出此事件，见上方说明
	 * @example <u-field v-model="mobile" label="手机号" required :error-message="errorMessage"></u-field>
	 */
  interface UFieldState {
    focused: boolean;
    itemIndex: number;
  }
  interface UFieldProps {
    icon?: string;
    rightIcon?: string;
    arrowDirection?: 'top' | 'bottom' | 'right';
    required?: boolean;
    label?: string;
    password?: boolean;
    clearable?: boolean;
    // 左边标题的宽度单位rpx
    labelWidth?: number | string;
    // 对齐方式，left|center|right
    labelAlign?: 'left' | 'center' | 'right';
    inputAlign?: 'left' | 'center' | 'right';
    iconColor?: string;
    autoHeight?: boolean;
    errorMessage?: string | boolean;
    placeholder?: string;
    placeholderStyle?: string;
    focus?: boolean;
    fixed?: boolean;
    modelValue: number | string;
    type?: string;
    disabled?: boolean;
    maxlength?: number | string;
    confirmType?: string;
    // lable的位置，可选为 left-左边，top-上边
    labelPosition?: 'left' | 'top';
    // 输入框的自定义样式
    fieldStyle?: CSSProperties,
    // 清除按钮的大小
    clearSize?: number | string;
    // lable左边的图标样式，对象形式
    iconStyle?: CSSProperties;
    // 是否显示上边框
    borderTop?: boolean;
    // 是否显示下边框
    borderBottom?: boolean;
    // 是否自动去除两端的空格
    trim?: boolean;
}

  const slotsIcon = !!useSlots().icon;

  const props = withDefaults(defineProps<UFieldProps>(),  {
    icon: '',
    rightIcon: '',
    // arrowDirection: 'right',
    required: false,
    label: '',
    password: false,
    clearable: true,
    // 左边标题的宽度单位rpx
    labelWidth: 130,
    // 对齐方式，left|center|right
    labelAlign: 'left',
    inputAlign: 'left',
    iconColor: '#606266',
    autoHeight: true,
    errorMessage: '',
    placeholder: '',
    placeholderStyle: '',
    focus: false,
    fixed: false,
    modelValue: 0,
    type: 'text',
    disabled: false,
    maxlength: 140,
    confirmType: 'done',
    // lable的位置，可选为 left-左边，top-上边
    labelPosition: 'left',
    // 输入框的自定义样式
    fieldStyle: {},
    // 清除按钮的大小
    clearSize: 30,
    // lable左边的图标样式，对象形式
    iconStyle: () => {
      return {}
    },
    // 是否显示上边框
    borderTop: false,
    // 是否显示下边框
    borderBottom: true,
    // 是否自动去除两端的空格
    trim: true,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'focus', event: FocusEvent): void;
    (e: 'blur', event: Event): void;
    (e: 'confirm', value: string): void;
    (e: 'right-icon-click'): void;
    (e: 'click'): void;
  }>();

  const { guid, addUnit, $parentUtil, trimUtil, getRect } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UFieldState>({
    focused: false,
    itemIndex: 0,
  });

  const inputWrapStyle = computed(() => {
    let style: CSSProperties = {};
    style.textAlign = props.inputAlign;
    // 判断lable的位置，如果是left的话，让input左边两边有间隙
    if(props.labelPosition == 'left') {
      style.margin = `0 8rpx`;
    } else {
      // 如果lable是top的，input的左边就没必要有间隙了
      style.marginRight = `8rpx`;
    }
    return style;
  });

  const rightIconStyle = computed(() => {
    let style: CSSProperties = {};
    if (props.arrowDirection == 'top') style.transform = 'roate(-90deg)';
    if (props.arrowDirection == 'bottom') style.transform = 'roate(90deg)';
    else style.transform = 'roate(0deg)';
    return style;
  });

  const labelStyle = computed(() => {
    let style: CSSProperties = {};
    if(props.labelAlign == 'left') style.justifyContent = 'flext-start';
    if(props.labelAlign == 'center') style.justifyContent = 'center';
    if(props.labelAlign == 'right') style.justifyContent = 'flext-end';
    return style;
  });

  // uni不支持在computed中写style.justifyContent = 'center'的形式，故用此方法
  const justifyContent = computed(() => {
    if(props.labelAlign == 'left') return 'flex-start';
    if(props.labelAlign == 'center') return 'center';
    if(props.labelAlign == 'right') return 'flex-end';
  });

  // 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，给用户可以传入字符串数值
  const inputMaxlength = computed(() => {
    return Number(props.maxlength)
  });

  // label的位置
  const fieldInnerStyle = computed(() => {
    let style: CSSProperties = {};
    if(props.labelPosition == 'left') {
      style.flexDirection = 'row';
    } else {
      style.flexDirection = 'column';
    }

    return style;
  });

  const onInput = (event: any) => {
    let value = event.detail.value;
    // 判断是否去除空格
    if(props.trim) value = trimUtil(value);
    emit('update:modelValue', value);
  };

  const onFocus = (event: any) => {
    state.focused = true;
    emit('focus', event);
  };

  const onBlur = (event: any) => {
    // 最开始使用的是监听图标@touchstart事件，自从hx2.8.4后，此方法在微信小程序出错
    // 这里改为监听点击事件，手点击清除图标时，同时也发生了@blur事件，导致图标消失而无法点击，这里做一个延时
    setTimeout(() => {
      state.focused = false;
    }, 100);
    emit('blur', event);
  };

  const onConfirm = (e: any) => {
    emit('confirm', e.detail.value);
  };

  const onClear = (event: any) => {
    emit('update:modelValue', '');
  };

  const rightIconClick = () => {
    emit('right-icon-click');
    emit('click');
  };

  const fieldClick = () => {
    emit('click');
  };


  defineExpose({
    ...toRefs(state),
    inputWrapStyle,
    rightIconStyle,
    labelStyle,
    justifyContent,
    inputMaxlength,
    fieldInnerStyle,
    onInput,
    onFocus,
    onBlur,
    onConfirm,
    onClear,
    rightIconClick,
    fieldClick,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-field {
		font-size: 28rpx;
		padding: 20rpx 28rpx;
		text-align: left;
		position: relative;
		color: $u-main-color;
	}

	.u-field-inner {
		@include vue-flex;
		align-items: center;
	}

	.u-textarea-inner {
		align-items: flex-start;
	}

	.u-textarea-class {
		min-height: 96rpx;
		width: auto;
		font-size: 28rpx;
	}

	.fild-body {
		@include vue-flex;
		flex: 1;
		align-items: center;
	}

	.u-arror-right {
		margin-left: 8rpx;
	}

	.u-label-text {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
	}

	.u-label-left-gap {
		margin-left: 6rpx;
	}

	.u-label-postion-top {
		flex-direction: column;
		align-items: flex-start;
	}

	.u-label {
		width: 130rpx;
		flex: 1 1 130rpx;
		text-align: left;
		position: relative;
		@include vue-flex;
		align-items: center;
	}

	.u-required::before {
		content: '*';
		position: absolute;
		left: -16rpx;
		font-size: 14px;
		color: $u-type-error;
		height: 9px;
		line-height: 1;
	}

	.u-field__input-wrap {
		position: relative;
		overflow: hidden;
		font-size: 28rpx;
		height: 48rpx;
		flex: 1;
		width: auto;
	}

	.u-clear-icon {
		@include vue-flex;
		align-items: center;
	}

	.u-error-message {
		color: $u-type-error;
		font-size: 26rpx;
		text-align: left;
	}

	.placeholder-style {
		color: rgb(150, 151, 153);
	}

	.u-input-class {
		font-size: 28rpx;
	}

	.u-button-wrap {
		margin-left: 8rpx;
	}
</style>
