<template>
	<view
      class="u-keyboard"
      @touchmove.stop.prevent="() => {}"
  >
		<view class="u-keyboard-grids">
			<view
			    class="u-keyboard-grids-item"
          :class="[
              btnBgGray(index) ? 'u-bg-gray' : '',
              index <= 2 ? 'u-border-top' : '',
              index < 9 ? 'u-border-bottom' : '',
              (index + 1) % 3 != 0 ? 'u-border-right' : ''
          ]"
			    :style="[itemStyle(index)]"
			    v-for="(item, index) in numList"
			    :key="index"
			    :hover-class="hoverClass(index)"
			    :hover-stay-time="100"
			    @tap="keyboardClick(item)"
      >
				<view class="u-keyboard-grids-btn">
          {{ item }}
        </view>
			</view>
			<view
          class="u-keyboard-grids-item u-bg-gray"
          hover-class="u-hover-class"
          :hover-stay-time="100"
          @touchstart.stop="backspaceClick"
          @touchend="clearTimer"
      >
				<view class="u-keyboard-back u-keyboard-grids-btn">
					<u-icon name="backspace" :size="38" :bold="true"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-number-keyboard',
  }
</script>

<script setup lang="ts">
  import {
    reactive,
    toRefs,
    computed,
    withDefaults
  } from "vue";
  import { useComposable } from '../../libs/hooks';

  interface UNumberKeyboardState {
    backspace: string; // 退格键内容
    dot: string;  // 点
    timer: number | null; // 长按多次删除的事件监听
    cardX: string; // 身份证的X符号
  }
  interface UNumberKeyboardProps {
    // 键盘的类型，number-数字键盘，card-身份证键盘
    mode?: 'number' | 'card',
    // 是否显示键盘的"."符号
    dotEnabled?: boolean;
    // 是否打乱键盘按键的顺序
    random?: boolean;
  }

  const props = withDefaults(defineProps<UNumberKeyboardProps>(),{
    // 键盘的类型，number-数字键盘，card-身份证键盘
    mode: 'number',
    // 是否显示键盘的"."符号
    dotEnabled: true,
    // 是否打乱键盘按键的顺序
    random: false,
  });

  const emit = defineEmits<{
    (e: 'backspace'): void;
    (e: 'change', value: string | number): void;
  }>();

  const { randomArray } = useComposable();

  const state = reactive<UNumberKeyboardState>({
    backspace: 'backspace', // 退格键内容
    dot: '.', // 点
    timer: null, // 长按多次删除的事件监听
    cardX: 'X' // 身份证的X符号
  });

  // 键盘需要显示的内容
  const numList = computed(() => {
    let tmp = [];
    if (!props.dotEnabled && props.mode == 'number') {
      if (!props.random) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      } else {
        return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
      }
    } else if (props.dotEnabled && props.mode == 'number') {
      if (!props.random) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, state.dot, 0];
      } else {
        return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, state.dot, 0]);
      }
    } else if (props.mode == 'card') {
      if (!props.random) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, state.cardX, 0];
      } else {
        return randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, state.cardX, 0]);
      }
    }
  });

  // 按键的样式，在非乱序&&数字键盘&&不显示点按钮时，index为9时，按键占位两个空间
  const itemStyle = computed(() => {
    return (index: number) => {
      let style = {};
      if (props.mode == 'number' && !props.dotEnabled && index == 9) style.flex = '0 0 66.6666666666%';
      return style;
    };
  });

  // 是否让按键显示灰色，只在非乱序&&数字键盘&&且允许点按键的时候
  const btnBgGray = computed(() => {
    return (index: number) => {
      if (!props.random && index == 9 && (props.mode != 'number' || (props.mode == 'number' && props.dotEnabled))) return true;
      else return false;
    };
  });

  const hoverClass = computed(() => {
    return (index: number) => {
      if (!props.random && index == 9 && (props.mode == 'number' && props.dotEnabled || props.mode == 'card')) return 'u-hover-class';
      else return 'u-keyboard-hover';
    }
  });

  // 点击退格键
  const backspaceClick = () => {
    emit('backspace');
    state.timer && clearInterval(Number(state.timer)); //再次清空定时器，防止重复注册定时器
    state.timer = null;
    state.timer = setInterval(() => {
      emit('backspace');
    }, 250);
  };

  const clearTimer = () => {
    state.timer && clearInterval(Number(state.timer));
    state.timer = null;
  };

  // 获取键盘显示的内容
  const keyboardClick = (val: string | number) => {
    // 允许键盘显示点模式和触发非点按键时，将内容转为数字类型
    if (props.dotEnabled && val != state.dot && val != state.cardX) val = Number(val);
    emit('change', val);
  };

  defineExpose({
    ...toRefs(state),
    numList,
    itemStyle,
    btnBgGray,
    hoverClass,
    backspaceClick,
    clearTimer,
    keyboardClick,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-keyboard {
		position: relative;
		z-index: 1003;
	}

	.u-keyboard-grids {
		@include vue-flex;
		flex-wrap: wrap;
	}

	.u-keyboard-grids-item {
		flex: 0 0 33.3333333333%;
		text-align: center;
		font-size: 50rpx;
		color: #333;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		height: 110rpx;
		font-weight: 500;
	}

	.u-bg-gray {
		background-color: $u-border-color;
	}

	.u-keyboard-back {
		font-size: 36rpx;
	}

	.u-keyboard-hover {
		background-color: #e7e6eb;
	}
</style>
