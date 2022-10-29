<template>
	<view
      class="u-radio"
      :style="[radioStyle]"
  >
		<view
        class="u-radio__icon-wrap"
        @tap="toggle"
        :class="[iconClass]"
        :style="[iconStyle]"
    >
			<u-icon
				class="u-radio__icon-wrap__icon"
        name="checkbox-mark"
        :size="elIconSize"
				:color="iconColor"
      />
		</view>
		<view
        class="u-radio__label"
        @tap="onClickLabel"
        :style="{
          fontSize: addUnit(props.labelSize)
        }"
    >
			<slot />
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-radio',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, CSSProperties, getCurrentInstance, ref, computed, reactive, toRefs, withDefaults} from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * radio 单选框
	 * @description 单选框用于有一个选择，用户只能选择其中一个的场景。搭配u-radio-group使用
	 * @tutorial https://www.uviewui.com/components/radio.html
	 * @property {String Number} icon-size 图标大小，单位rpx（默认24）
	 * @property {String Number} label-size label字体大小，单位rpx（默认28）
	 * @property {String Number} name radio组件的标示符
	 * @property {String} shape 形状，见上方说明（默认circle）
	 * @property {Boolean} disabled 是否禁用（默认false）
	 * @property {Boolean} label-disabled 点击文本是否可以操作radio（默认true）
	 * @property {String} active-color 选中时的颜色，如设置parent的active-color将失效
	 * @event {Function} change 某个radio状态发生变化时触发(选中状态)
	 * @example <u-radio :label-disabled="false">门掩黄昏，无计留春住</u-radio>
	 */
  interface IParentDataProps {
    iconSize: number | null;
    labelDisabled: number | null;
    disabled: number | null;
    shape: number | null;
    activeColor: number | null;
    size: number | null;
    width: number | null;
    height: number | null;
    modelValue: number | null;
    wrap: number | null;
  }
  interface URadioState {
    parentData: IParentDataProps | any;
  }
  interface URadioProps {
    // radio的名称
    name: number | string;
    // 形状，square为方形，circle为原型
    shape?: 'square' | 'circle';
    // 是否禁用
    disabled?: string | boolean;
    // 是否禁止点击提示语选中复选框
    labelDisabled?: string | boolean;
    // 选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值
    activeColor?: string;
    // 图标的大小，单位rpx
    iconSize?: number | string;
    // label的字体大小，rpx单位
    labelSize?: number | string;
    size?: number | string;
  }

  const props = withDefaults(defineProps<URadioProps>(),{
    // radio的名称
    name: '',
    // 形状，square为方形，circle为原型
    shape: '',
    // 是否禁用
    disabled: '',
    // 是否禁止点击提示语选中复选框
    labelDisabled: '',
    // 选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值
    activeColor: '',
    // 图标的大小，单位rpx
    iconSize: '',
    // label的字体大小，rpx单位
    labelSize: '',
    size: '',
  });

  const emit = defineEmits<{
    (e: 'change', name: number | string): void;
  }>();

  const { addUnit, getParentData, parent } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<URadioState>({
    // 父组件的默认值，因为头条小程序不支持在computed中使用$parent.shape的形式
    // 故只能使用如此方法
    parentData: {
      iconSize: null,
      labelDisabled: null,
      disabled: null,
      shape: null,
      activeColor: null,
      size: null,
      width: null,
      height: null,
      modelValue: null,
      wrap: null,
    }
  });

  // 是否禁用，如果父组件u-raios-group禁用的话，将会忽略子组件的配置
  const elDisabled = computed(() => {
    return props.disabled !== '' ? props.disabled : state.parentData.disabled !== null ? state.parentData.disabled : false;
  });

  // 是否禁用label点击
  const elLabelDisabled = computed(() => {
    return props.labelDisabled !== '' ? props.labelDisabled : state.parentData.labelDisabled !== null ? state.parentData.labelDisabled : false;
  });

  // 组件尺寸，对应size的值，默认值为34rpx
  const elSize = computed(() => {
    return props.size ? props.size : (state.parentData.size ? state.parentData.size : 34);
  });

  // 组件的勾选图标的尺寸，默认20
  const elIconSize = computed(() => {
    return props.iconSize ? props.iconSize : (state.parentData.iconSize ? state.parentData.iconSize : 20);
  });

  // 组件选中激活时的颜色
  const elActiveColor = computed(() => {
    return props.activeColor ? props.activeColor : (state.parentData.activeColor ? state.parentData.activeColor : 'primary');
  });

  // 组件的形状
  const elShape = computed(() => {
    return props.shape ? props.shape : (state.parentData.shape ? state.parentData.shape : 'circle');
  });

  // 设置radio的状态，要求radio的name等于parent的value时才为选中状态
  const iconStyle = computed(() => {
    let style: CSSProperties = {};
    if (elActiveColor.value && state.parentData.modelValue == props.name && !elDisabled.value) {
      style.borderColor = elActiveColor.value;
      style.backgroundColor = elActiveColor.value;
    }
    style.width = addUnit(elSize.value);
    style.height = addUnit(elSize.value);
    return style;
  });

  const iconColor = computed(() => {
    return props.name ==  state.parentData.modelValue ? '#ffffff' : 'transparent';
  });

  const iconClass = computed(() => {
    let classes = [];
    classes.push('u-radio__icon-wrap--' + elShape.value);
    if (props.name == state.parentData.modelValue) classes.push('u-radio__icon-wrap--checked');
    if (elDisabled.value) classes.push('u-radio__icon-wrap--disabled');
    if (props.name == state.parentData.modelValue && elDisabled.value) classes.push(
        'u-radio__icon-wrap--disabled--checked');
    // 支付宝小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
    return classes.join(' ');
  });

  const radioStyle = computed(() => {
    let style: CSSProperties = {};
    if (state.parentData.width) {
      style.width = addUnit(state.parentData.width);
      // #ifdef MP
      // 各家小程序因为它们特殊的编译结构，使用float布局
      style.float = 'left';
      // #endif
      // #ifndef MP
      // H5和APP使用flex布局
      style.flex = `0 0 ${addUnit(state.parentData.width)}`;
      // #endif
    }
    if (state.parentData.wrap) {
      style.width = '100%';
      // #ifndef MP
      // H5和APP使用flex布局，将宽度设置100%，即可自动换行
      style.flex = '0 0 100%';
      // #endif
    }
    return style;
  });

  const updateParentData = () => {
    getParentData('u-radio-group', state);
  };

  const emitEvent = () => {
    // u-radio的name不等于父组件的v-model的值时(意味着未选中)，才发出事件，避免多次点击触发事件
    if(state.parentData.modelValue != props.name) emit('change', props.name);
  };

  // 改变组件选中状态
  // 这里的改变的依据是，更改本组件的parentData.modelValue值为本组件的name值，同时通过父组件遍历所有u-radio实例
  // 将本组件外的其他u-radio的parentData.modelValue都设置为空(由computed计算后，都被取消选中状态)，因而只剩下一个为选中状态
  const setRadioCheckedStatus = () => {
    emitEvent();
    if(parent.value) {
      parent.value?.exposeProxy?.setValue(props.name);
      state.parentData.modelValue = props.name;
    }
  };

  const onClickLabel = () => {
    if (!elLabelDisabled.value && !elDisabled.value) {
      setRadioCheckedStatus();
    }
  };

  const toggle = () => {
    if (!elDisabled.value) {
      setRadioCheckedStatus();
    }
  };

  // 支付宝小程序不支持provide/inject，所以使用这个方法获取整个父组件，在created定义，避免循环引用
  updateParentData();
  parent.value?.exposeProxy?.children?.push(instance);

  defineExpose({
    ...toRefs(state),
    elDisabled,
    elLabelDisabled,
    elSize,
    elIconSize,
    elActiveColor,
    elShape,
    iconStyle,
    iconColor,
    iconClass,
    radioStyle,
    updateParentData,
    onClickLabel,
    toggle,
    emitEvent,
    setRadioCheckedStatus,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-radio {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		align-items: center;
		overflow: hidden;
		user-select: none;
		line-height: 1.8;

		&__icon-wrap {
			color: $u-content-color;
			@include vue-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 42rpx;
			height: 42rpx;
			color: transparent;
			text-align: center;
			transition-property: color, border-color, background-color;
			font-size: 20px;
			border: 1px solid #c8c9cc;
			transition-duration: 0.2s;

			/* #ifdef MP-TOUTIAO */
			// 头条小程序兼容性问题，需要设置行高为0，否则图标偏下
			&__icon {
				line-height: 0;
			}
			/* #endif */

			&--circle {
				border-radius: 100%;
			}

			&--square {
				border-radius: 3px;
			}

			&--checked {
				color: #fff;
				background-color: #2979ff;
				border-color: #2979ff;
			}

			&--disabled {
				background-color: #ebedf0;
				border-color: #c8c9cc;
			}

			&--disabled--checked {
				color: #c8c9cc !important;
			}
		}

		&__label {
			word-wrap: break-word;
			margin-left: 10rpx;
			margin-right: 24rpx;
			color: $u-content-color;
			font-size: 30rpx;

			&--disabled {
				color: #c8c9cc;
			}
		}
	}
</style>
