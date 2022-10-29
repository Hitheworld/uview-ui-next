<template>
	<view
      class="u-checkbox"
      :style="[checkboxStyle]"
  >
		<view
        class="u-checkbox__icon-wrap"
        @tap="toggle"
        :class="[iconClass]"
        :style="[iconStyle]"
    >
			<u-icon
          class="u-checkbox__icon-wrap__icon"
          name="checkbox-mark"
          :size="checkboxIconSize"
          :color="iconColor"
      />
		</view>
		<view
        class="u-checkbox__label"
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
    name: 'u-checkbox',
  }
</script>

<script setup lang="ts">
	import { ComponentInternalInstance, withDefaults, CSSProperties, getCurrentInstance, computed, reactive, toRefs, ref } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * checkbox 复选框
	 * @description 该组件需要搭配checkboxGroup组件使用，以便用户进行操作时，获得当前复选框组的选中情况。
	 * @tutorial https://www.uviewui.com/components/checkbox.html
	 * @property {String Number} icon-size 图标大小，单位rpx（默认20）
	 * @property {String Number} label-size label字体大小，单位rpx（默认28）
	 * @property {String Number} name checkbox组件的标示符
	 * @property {String} shape 形状，见官网说明（默认circle）
	 * @property {Boolean} disabled 是否禁用
	 * @property {Boolean} label-disabled 是否禁止点击文本操作checkbox
	 * @property {String} active-color 选中时的颜色，如设置CheckboxGroup的active-color将失效
	 * @event {Function} change 某个checkbox状态发生变化时触发，回调为一个对象
	 * @example <u-checkbox v-model="checked" :disabled="false">天涯</u-checkbox>
	 */
  interface UCheckboxChangeProps {
    value: boolean;
    name: string | number;
  }
  interface UCheckboxProps {
    // checkbox的名称
    name?: string | number;
    // 形状，square为方形，circle为原型
    shape?: 'square' | 'circle';
    // 是否为选中状态
    modelValue: boolean;
    // 是否禁用
    disabled?: boolean;
    // 是否禁止点击提示语选中复选框
    labelDisabled?: boolean;
    // 选中状态下的颜色，如设置此值，将会覆盖checkboxGroup的activeColor值
    activeColor?: string;
    // 图标的大小，单位rpx
    iconSize?: string | number;
    // label的字体大小，rpx单位
    labelSize?: string | number;
    // 组件的整体大小
    size?: string | number;
  }

  const props = withDefaults(defineProps<UCheckboxProps>(),  {
    // checkbox的名称
    name: '',
    // 形状，square为方形，circle为原型
    shape: 'square',
    // 是否为选中状态
    modelValue: false,
    // 是否禁用
    disabled: false,
    // 是否禁止点击提示语选中复选框
    labelDisabled: false,
    // 选中状态下的颜色，如设置此值，将会覆盖checkboxGroup的activeColor值
    activeColor: '',
    // 图标的大小，单位rpx
    iconSize: '',
    // label的字体大小，rpx单位
    labelSize: '',
    // 组件的整体大小
    size: '',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: boolean): void;
    (e: 'change', obj: UCheckboxChangeProps): void;
  }>();

  const { $parentUtil, addUnit, toast, parent } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  // 支付宝小程序不支持provide/inject，所以使用这个方法获取整个父组件，在created定义，避免循环应用
  // 如果存在u-checkbox-group，将本组件的this塞进父组件的children中
  parent.value = $parentUtil("u-checkbox-group");
  parent.value?.exposeProxy?.children.push(instance);

  const state = reactive({
    parentDisabled: false,
    newParams: {},
  });

  // 是否禁用，如果父组件u-checkbox-group禁用的话，将会忽略子组件的配置
  const isDisabled = computed(() => {
    return props.disabled !== false ? props.disabled : parent.value ? parent.value?.props?.disabled : false;
  });

  // 是否禁用label点击
  const isLabelDisabled = computed(() => {
    return props.labelDisabled !== false ? props.labelDisabled : parent.value ? parent.value?.props?.labelDisabled : false;
  });

  // 组件尺寸，对应size的值，默认值为34rpx
  const checkboxSize = computed(() => {
    return props.size ? props.size : (parent.value ? parent.value?.props?.size : 34);
  });

  // 组件的勾选图标的尺寸，默认20
  const checkboxIconSize = computed(() => {
    return props.iconSize ? props.iconSize : (parent.value ? parent.value?.props?.iconSize : 20);
  });

  // 组件选中激活时的颜色
  const elActiveColor = computed(() => {
    return props.activeColor ? props.activeColor : (parent.value ? parent.value?.props?.activeColor : 'primary');
  });

  // 组件的形状
  const elShape = computed(() => {
    return props.shape ? props.shape : (parent.value ? parent.value?.props?.shape : 'square');
  });

  const iconStyle = computed(() => {
    let style: CSSProperties = {};
    // 既要判断是否手动禁用，还要判断用户v-model绑定的值，如果绑定为false，那么也无法选中
    if (elActiveColor.value && props.modelValue && !isDisabled.value) {
      style.borderColor = elActiveColor.value;
      style.backgroundColor = elActiveColor.value;
    }
    style.width = addUnit(Number(checkboxSize.value));
    style.height = addUnit(Number(checkboxSize.value));
    return style;
  });

  // checkbox内部的勾选图标，如果选中状态，为白色，否则为透明色即可
  const iconColor = computed(() => {
    return props.modelValue ? '#ffffff' : 'transparent';
  });

  const iconClass = computed(() => {
    let classes: string[] = [];
    classes.push('u-checkbox__icon-wrap--' + elShape.value);
    if (props.modelValue == true) classes.push('u-checkbox__icon-wrap--checked');
    if (isDisabled.value) classes.push('u-checkbox__icon-wrap--disabled');
    if (props.modelValue && isDisabled.value) classes.push('u-checkbox__icon-wrap--disabled--checked');
    // 支付宝小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
    return classes.join(' ');
  });

  const checkboxStyle = computed(() => {
    let style: CSSProperties = {};
    if(parent.value && parent.value.props.width) {
      style.width = Number(parent.value?.props?.width);
      // #ifdef MP
      // 各家小程序因为它们特殊的编译结构，使用float布局
      style.float = 'left';
      // #endif
      // #ifndef MP
      // H5和APP使用flex布局
      style.flex = `0 0 ${parent.value.props.width}`;
      // #endif
    }
    if(parent.value && parent.value.props.wrap) {
      style.width = '100%';
      // #ifndef MP
      // H5和APP使用flex布局，将宽度设置100%，即可自动换行
      style.flex = '0 0 100%';
      // #endif
    }
    return style;
  });

  const emitEvent = () => {
    emit('change', {
      value: !props.modelValue,
      name: props.name,
    });
    // 执行父组件u-checkbox-group的事件方法
    // 等待下一个周期再执行，因为context.emit('input')作用于父组件，再反馈到子组件内部，需要时间
    setTimeout(() => {
      if(parent.value && parent.value?.exposeProxy?.emitEvent) parent.value?.exposeProxy?.emitEvent();
    }, 80);
  };


  // 设置input的值，这里通过input事件，设置通过v-model绑定的组件的值
  const setValue = () => {
    // 判断是否超过了可选的最大数量
    let checkedNum = 0;
    if(parent.value && parent.value?.exposeProxy?.children) {
      // 只要父组件的某一个子元素的value为true，就加1(已有的选中数量)
      parent.value?.exposeProxy?.children?.map((val: any) => {
        if (val.value) checkedNum++;
      });
    }
    // 如果原来为选中状态，那么可以取消
    if (props.modelValue) {
      emitEvent();
      emit('update:modelValue', !props.modelValue);
    } else {
      // 如果超出最多可选项，提示
      if(parent.value && checkedNum >= Number(parent.value?.props?.max)) {
        return toast(`最多可选${parent.value?.props?.max}项`);
      }
      // 如果原来为未选中状态，需要选中的数量少于父组件中设置的max值，才可以选中
      emitEvent();
      emit('update:modelValue', !props.modelValue);
    }
  };

  const onClickLabel = () => {
    if (!isLabelDisabled.value && !isDisabled.value) {
      setValue();
    }
  };

  const toggle = () => {
    if (!isDisabled.value) {
      setValue();
    }
  };

  defineExpose({
    ...toRefs(state),
    checkboxIconSize,
    iconStyle,
    iconColor,
    iconClass,
    checkboxStyle,
    onClickLabel,
    toggle,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-checkbox {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		align-items: center;
		overflow: hidden;
		user-select: none;
		line-height: 1.8;

		&__icon-wrap {
			color: $u-content-color;
			flex: none;
			display: -webkit-flex;
			@include vue-flex;
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
				border-radius: 6rpx;
			}

			&--checked {
				color: #fff;
				background-color: $u-type-primary;
				border-color: $u-type-primary;
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
