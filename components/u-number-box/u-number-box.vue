<template>
	<view class="u-numberbox">
		<view
        class="u-icon-minus"
        @touchstart.stop.prevent="btnTouchStart('minus')"
        @touchend.stop.prevent="clearTimer"
        :class="{ 'u-icon-disabled': props.disabled || state.inputVal <= props.min }"
		    :style="{
          background: props.bgColor,
          height: props.inputHeight + 'rpx',
          color: props.color
        }"
    >
			<u-icon name="minus" :size="props.size"></u-icon>
		</view>
		<input
        :disabled="props.disabledInput || props.disabled"
        :cursor-spacing="getCursorSpacing"
        :class="{ 'u-input-disabled': props.disabled }"
		    v-model="state.inputVal" class="u-number-input" @blur="onBlur" @focus="onFocus"
		    type="number"
        :style="{
          color: props.color,
          fontSize: props.size + 'rpx',
          background: props.bgColor,
          height: props.inputHeight + 'rpx',
          width: props.inputWidth + 'rpx'
        }"
    />
		<view
        class="u-icon-plus"
        @touchstart.stop.prevent="btnTouchStart('plus')"
        @touchend.stop.prevent="clearTimer"
        :class="{ 'u-icon-disabled': props.disabled || state.inputVal >= props.max }"
		    :style="{
          background: props.bgColor,
          height: props.inputHeight + 'rpx',
          color: props.color
        }"
    >
			<u-icon name="plus" :size="props.size"></u-icon>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-number-box',
  }
</script>

<script setup lang="ts">
  import { reactive, toRefs, computed, watch, nextTick, withDefaults } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * numberBox 步进器
	 * @description 该组件一般用于商城购物选择物品数量的场景。注意：该输入框只能输入大于或等于0的整数，不支持小数输入
	 * @tutorial https://www.uviewui.com/components/numberBox.html
	 * @property {Number} value 输入框初始值（默认1）
	 * @property {String} bg-color 输入框和按钮的背景颜色（默认#F2F3F5）
	 * @property {Number} min 用户可输入的最小值（默认0）
	 * @property {Number} max 用户可输入的最大值（默认99999）
	 * @property {Number} step 步长，每次加或减的值（默认1）
	 * @property {Boolean} disabled 是否禁用操作，禁用后无法加减或手动修改输入框的值（默认false）
	 * @property {Boolean} disabled-input 是否禁止输入框手动输入值（默认false）
	 * @property {Boolean} positive-integer 是否只能输入正整数（默认true）
	 * @property {String | Number} size 输入框文字和按钮字体大小，单位rpx（默认26）
	 * @property {String} color 输入框文字和加减按钮图标的颜色（默认#323233）
	 * @property {String | Number} input-width 输入框宽度，单位rpx（默认80）
	 * @property {String | Number} input-height 输入框和按钮的高度，单位rpx（默认50）
	 * @property {String | Number} index 事件回调时用以区分当前发生变化的是哪个输入框
	 * @property {Boolean} long-press 是否开启长按连续递增或递减(默认true)
	 * @property {String | Number} press-time 开启长按触发后，每触发一次需要多久，单位ms(默认250)
	 * @property {String | Number} cursor-spacing 指定光标于键盘的距离，避免键盘遮挡输入框，单位rpx（默认200）
	 * @event {Function} change 输入框内容发生变化时触发，对象形式
	 * @event {Function} blur 输入框失去焦点时触发，对象形式
	 * @event {Function} minus 点击减少按钮时触发(按钮可点击情况下)，对象形式
	 * @event {Function} plus 点击增加按钮时触发(按钮可点击情况下)，对象形式
	 * @example <u-number-box :min="1" :max="100"></u-number-box>
	 */
  interface UNumberBoxState {
    inputVal: number; // 输入框中的值，不能直接使用props中的value，因为应该改变props的状态
    timer: number | null; // 用作长按的定时器
    changeFromInner: boolean; // 值发生变化，是来自内部还是外部
    innerChangeTimer: number | null; // 内部定时器
  }
  interface UNumberBoxProps {
    // 预显示的数字
    modelValue: number;
    // 背景颜色
    bgColor?: string;
    // 最小值
    min?: number;
    // 最大值
    max?: number;
    // 步进值，每次加或减的值
    step?: number;
    // 是否禁用加减操作
    disabled?: boolean;
    // input的字体大小，单位rpx
    size?: number | string;
    // 加减图标的颜色
    color?: string;
    // input宽度，单位rpx
    inputWidth?: number | string;
    // input高度，单位rpx
    inputHeight?: number | string;
    // index索引，用于列表中使用，让用户知道是哪个numberbox发生了变化，一般使用for循环出来的index值即可
    index?: number | string;
    // 是否禁用输入框，与disabled作用于输入框时，为OR的关系，即想要禁用输入框，又可以加减的话
    // 设置disabled为false，disabledInput为true即可
    disabledInput?: boolean;
    // 输入框于键盘之间的距离
    cursorSpacing?: number | string;
    // 是否开启长按连续递增或递减
    longPress?: boolean;
    // 开启长按触发后，每触发一次需要多久
    pressTime?: number | string;
    // 是否只能输入大于或等于0的整数(正整数)
    positiveInteger?: boolean;
  }

  const props = withDefaults(defineProps<UNumberBoxProps>(),{
    // 预显示的数字
    modelValue: 1,
    // 背景颜色
    bgColor: '#F2F3F5',
    // 最小值
    min: 0,
    // 最大值
    max: 99999,
    // 步进值，每次加或减的值
    step: 1,
    // 是否禁用加减操作
    disabled: false,
    // input的字体大小，单位rpx
    size: 26,
    // 加减图标的颜色
    color: '#323233',
    // input宽度，单位rpx
    inputWidth: 80,
    // input高度，单位rpx
    inputHeight: 50,
    // index索引，用于列表中使用，让用户知道是哪个numberbox发生了变化，一般使用for循环出来的index值即可
    index: '',
    // 是否禁用输入框，与disabled作用于输入框时，为OR的关系，即想要禁用输入框，又可以加减的话
    // 设置disabled为false，disabledInput为true即可
    disabledInput: false,
    // 输入框于键盘之间的距离
    cursorSpacing: 100,
    // 是否开启长按连续递增或递减
    longPress: true,
    // 开启长按触发后，每触发一次需要多久
    pressTime: 250,
    // 是否只能输入大于或等于0的整数(正整数)
    positiveInteger: true,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: number): void;
    (e: 'focus'): void;
    (e: 'blur', valueIndex: {
      value: number;
      index: number | string;
    }): void;
    (e: 'change', valueIndex: {
      value: number;
      index: number | string;
    }): void;
  }>();

  const { test } = useComposable();

  const state = reactive<UNumberBoxState>({
    inputVal: 1, // 输入框中的值，不能直接使用props中的value，因为应该改变props的状态
    timer: null, // 用作长按的定时器
    changeFromInner: false, // 值发生变化，是来自内部还是外部
    innerChangeTimer: null, // 内部定时器
  });

  state.inputVal = Number(props.modelValue);

  const getCursorSpacing = computed(() => {
    // 先将值转为px单位，再转为数值
    return Number(uni.upx2px(Number(props.cursorSpacing)));
  });

  // 点击退格键
  const btnTouchStart = (callback: 'minus' | 'plus') => {
    // 先执行一遍方法，否则会造成松开手时，就执行了clearTimer，导致无法实现功能
    if (callback === 'minus') {
      minus();
    }
    if (callback === 'plus') {
      plus();
    }
    // 如果没开启长按功能，直接返回
    if (!props.longPress) return;
    clearInterval(Number(state.timer)); //再次清空定时器，防止重复注册定时器
    state.timer = null;
    state.timer = setInterval(() => {
      // 执行加或减函数
      if (callback === 'minus') {
        minus();
      }
      if (callback === 'plus') {
        plus();
      }
    }, Number(props.pressTime));
  };

  const clearTimer = () => {
    nextTick(() => {
      clearInterval(Number(state.timer));
      state.timer = null;
    })
  };

  // 为了保证小数相加减出现精度溢出的问题
  const calcPlus = (num1: number, num2: number) => {
    let baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = num1.toString().split('.')[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.toString().split('.')[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    let precision = baseNum1 >= baseNum2 ? baseNum1 : baseNum2; //精度
    return ((num1 * baseNum + num2 * baseNum) / baseNum).toFixed(precision);
  };

  // 为了保证小数相加减出现精度溢出的问题
  const calcMinus = (num1: number, num2: number) => {
    let baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = num1.toString().split('.')[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.toString().split('.')[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    let precision = baseNum1 >= baseNum2 ? baseNum1 : baseNum2;
    return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision);
  };

  const computeVal = (type: 'minus' | 'plus') => {
    uni.hideKeyboard();
    if (props.disabled) return;
    let value: number | string = 0;
    // 减
    if (type === 'minus') {
      value = calcMinus(state.inputVal, props.step);
    } else if (type === 'plus') {
      value = calcPlus(state.inputVal, props.step);
    }
    // 判断是否小于最小值和大于最大值
    if (value < props.min || value > props.max) {
      return;
    }
    state.inputVal = Number(value);
    handleChange(value, type);
  };

  const minus = () => {
    computeVal('minus');
  };

  const plus = () => {
    computeVal('plus');
  };

  // 输入框获得焦点事件
  const onFocus = () => {
    emit('focus');
  };

  const handleChange = (value: number | string, type: 'blur' | 'change') => {
    if (props.disabled) return;
    // 清除定时器，避免造成混乱
    if(state.innerChangeTimer) {
      clearTimeout(state.innerChangeTimer);
      state.innerChangeTimer = null;
    }
    // 发出input事件，修改通过v-model绑定的值，达到双向绑定的效果
    state.changeFromInner = true;
    // 一定时间内，清除changeFromInner标记，否则内部值改变后
    // 外部通过程序修改value值，将会无效
    state.innerChangeTimer = setTimeout(() => {
      state.changeFromInner = false;
    }, 150);
    emit('update:modelValue', Number(value));
    emit(type, {
      // 转为Number类型
      value: Number(value),
      index: props.index
    })
  };

  // 处理用户手动输入的情况
  const onBlur = (event: any) => {
    let val = 0;
    let value = event.detail.value;
    // 如果为非0-9数字组成，或者其第一位数值为0，直接让其等于min值
    // 这里不直接判断是否正整数，是因为用户传递的props min值可能为0
    if (!/(^\d+$)/.test(value) || value[0] == 0) val = props.min;
    val = +value;
    if (val > props.max) {
      val = props.max;
    } else if (val < props.min) {
      val = props.min;
    }
    nextTick(() => {
      state.inputVal = val;
    });
    handleChange(val, 'blur');
  };

  watch(() => props.modelValue, (newValue, oldValue) => {
    // 只有value的改变是来自外部的时候，才去同步inputVal的值，否则会造成循环错误
    if(!state.changeFromInner) {
      state.inputVal = newValue;
      // 因为inputVal变化后，会触发handleChange()，在其中changeFromInner会再次被设置为true，
      // 造成外面修改值，也导致被认为是内部修改的混乱，这里进行nextTick延时，保证在运行周期的最后处
      // 将changeFromInner设置为false
      nextTick(function(){
        state.changeFromInner = false;
      });
    }
  });

  watch(() => state.inputVal, (newValue, oldValue) => {
    // 为了让用户能够删除所有输入值，重新输入内容，删除所有值后，内容为空字符串
    if (newValue == '') return;
    let value: number | string = 0;
    // 首先判断是否数值，并且在min和max之间，如果不是，使用原来值
    let tmp = test.number(String(newValue));
    if (tmp && newValue >= props.min && newValue <= props.max) value = newValue;
    else value = oldValue;
    // 判断是否只能输入大于等于0的整数
    if(props.positiveInteger) {
      // 小于0，或者带有小数点，
      if(newValue < 0 || String(newValue).indexOf('.') !== -1) {
        value = oldValue;
        // 双向绑定input的值，必须要使用$nextTick修改显示的值
        nextTick(() => {
          state.inputVal = oldValue;
        });
      }
    }
    // 发出change事件
    handleChange(value, 'change');
  });

  defineExpose({
    ...toRefs(state),
    getCursorSpacing,
    btnTouchStart,
    clearTimer,
    minus,
    plus,
    calcPlus,
    calcMinus,
    computeVal,
    onBlur,
    onFocus,
    handleChange,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-numberbox {
		display: inline-flex;
		align-items: center;
	}

	.u-number-input {
		position: relative;
		text-align: center;
		padding: 0;
		margin: 0 6rpx;
		@include vue-flex;
		align-items: center;
		justify-content: center;
	}

	.u-icon-plus,
	.u-icon-minus {
		width: 60rpx;
		@include vue-flex;
		justify-content: center;
		align-items: center;
	}

	.u-icon-plus {
		border-radius: 0 8rpx 8rpx 0;
	}

	.u-icon-minus {
		border-radius: 8rpx 0 0 8rpx;
	}

	.u-icon-disabled {
		color: #c8c9cc !important;
		background: #f7f8fa !important;
	}

	.u-input-disabled {
		color: #c8c9cc !important;
		background-color: #f2f3f5 !important;
	}
</style>
