<template>
	<view class="">
		<movable-area
        class="u-swipe-action"
        :style="{ backgroundColor: props.bgColor }"
    >
			<movable-view
				class="u-swipe-view"
				@change="change"
				@touchend="touchend"
				@touchstart="touchstart"
				direction="horizontal"
        :animation="props.animation"
				:disabled="props.disabled"
				:x="state.moveX"
				:style="{
					width: movableViewWidth ? movableViewWidth : '100%'
				}"
			>
				<view
					class="u-swipe-content"
					@tap.stop="contentClick"
				>
					<slot></slot>
				</view>
				<view
            class="u-swipe-del"
            v-if="state.showBtn" @tap.stop="btnClick(ind)"
            :style="[btnStyle(item.style)]"
            v-for="(item, ind) in props.options"
            :key="ind"
        >
					<view class="u-btn-text">
            {{ item.text }}
          </view>
				</view>
			</movable-view>
		</movable-area>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-swipe-action',
  }
</script>

<script setup lang="ts">
import {
  computed,
  reactive,
  toRefs,
  watch,
  onMounted,
  nextTick,
  withDefaults, CSSProperties
} from 'vue'
  import { useComposable } from '../../libs/hooks';
  /**
   * swipeAction 左滑单元格
   * @description 该组件一般用于左滑唤出操作菜单的场景，用的最多的是左滑删除操作。
   * @tutorial https://www.uviewui.com/components/swipeAction.html
   * @property {String} bg-color 整个组件背景颜色（默认#ffffff）
   * @property {Array} options 数组形式，可以配置背景颜色和文字
   * @property {String Number} index 标识符，点击时候用于区分点击了哪一个，用v-for循环时的index即可
   * @property {String Number} btn-width 按钮宽度，单位rpx（默认180）
   * @property {Boolean} disabled 是否禁止某个swipeAction滑动（默认false）
   * @property {Boolean} show 打开或者关闭某个组件（默认false）
   * @event {Function} click 点击组件时触发
   * @event {Function} close 组件触发关闭状态时
   * @event {Function} content-click 点击内容时触发
   * @event {Function} open 组件触发打开状态时
   * @example <u-swipe-action btn-text="收藏">...</u-swipe-action>
   */
  interface USwipeActionState {
    moveX: number; // movable-view元素在x轴上需要移动的目标移动距离，用于展开或收起滑动的按钮
    scrollX: number; // movable-view移动过程中产生的change事件中的x轴移动值
    status: boolean | 'close'; // 滑动的状态，表示当前是展开还是关闭按钮的状态
    movableAreaWidth: number; // 滑动区域
    elId: number | string; // id，用于通知另外组件关闭时的识别
    showBtn: boolean; // 刚开始渲染视图时不显示右边的按钮，避免视图闪动
  }
  interface OptionItem {
    style?: CSSProperties;
    text: string;
  }
  interface USwipeActionProps {
    // index值，用于得知点击删除的是哪个按钮
    index?: number | string;
    // 滑动按钮的宽度，单位为rpx
    btnWidth?: number | string;
    // 是否使用动画
    animation?: boolean;
    // 是否禁止某个action滑动
    disabled?: boolean;
    // 打开或者关闭组件
    show: boolean;
    // 组件背景颜色
    bgColor?: string;
    // 是否使手机发生短促震动，目前只在iOS的微信小程序有效(2020-05-06)
    vibrateShort?: boolean;
    // 按钮操作参数
    options: OptionItem[];
  }

  const props = withDefaults(defineProps<USwipeActionProps>(),{
    // index值，用于得知点击删除的是哪个按钮
    index: '',
    // 滑动按钮的宽度，单位为rpx
    btnWidth: 180,
    // 是否使用动画
    animation: false,
    // 是否禁止某个action滑动
    disabled: false,
    // 打开或者关闭组件
    show: false,
    // 组件背景颜色
    bgColor: '#ffffff',
    // 是否使手机发生短促震动，目前只在iOS的微信小程序有效(2020-05-06)
    vibrateShort: false,
    // 按钮操作参数
    options: () => [],
  });

  const emit = defineEmits<{
    (e: 'click', ind: number | string, index: string | number): void;
    (e: 'content-click', index: number | string): void;
    (e: 'open', index: number | string): void;
    (e: 'close', index: number | string): void;
  }>();

  const { guid, getRect } = useComposable();

  const state = reactive<USwipeActionState>({
    moveX: 0, // movable-view元素在x轴上需要移动的目标移动距离，用于展开或收起滑动的按钮
    scrollX: 0, // movable-view移动过程中产生的change事件中的x轴移动值
    status: false, // 滑动的状态，表示当前是展开还是关闭按钮的状态
    movableAreaWidth: 0, // 滑动区域
    elId: guid(), // id，用于通知另外组件关闭时的识别
    showBtn: false, // 刚开始渲染视图时不显示右边的按钮，避免视图闪动
  });

  const allBtnWidth = computed(() => {
    return uni.upx2px(Number(props.btnWidth)) * props.options.length;
  });

  const movableViewWidth = computed(() => {
    return state.movableAreaWidth + allBtnWidth.value + 'px';
  });

  const innerBtnWidth = computed(() => {
    return uni.upx2px(Number(props.btnWidth));
  });

  const btnStyle = computed(() => {
    return (style: any) => {
      let css = {};
      style.width = props.btnWidth + 'rpx';
      return style;
    };
  });

  // 点击按钮
  const btnClick = (index: number) => {
    state.status = false;
    // props.index为点击的几个组件，index为点击某个组件的第几个按钮(options数组的索引)
    emit('click', props.index, index);
  };

  // movable-view元素移动事件
  const change = (e: any) => {
    state.scrollX = e.detail.x;
  };

  // 关闭按钮状态
  const close = () => {
    state.moveX = 0;
    state.status = false;
  };

  // 打开按钮的状态
  const open = () => {
    if (props.disabled) return;
    state.moveX = -allBtnWidth.value;
    state.status = true;
  };

  const emitOpenEvent = () => {
    emit('open', props.index);
  };

  const emitCloseEvent = () => {
    emit('close', props.index);
  };

  // 用户手指离开movable-view元素，停止触摸
  const touchend = () => {
    state.moveX = state.scrollX;
    // 停止触摸时候，判断当前是展开还是关闭状态
    // 关闭状态
    // 这一步很重要，需要先给state.moveX一个变化的随机值，否则因为前后设置的为同一个值
    // props单向数据流的原因，导致movable-view元素不会发生变化，切记，详见文档：
    // https://uniapp.dcloud.io/use?id=%e5%b8%b8%e8%a7%81%e9%97%ae%e9%a2%98
    nextTick(function() {
      if (state.status == false) {
        // 关闭状态左滑，产生的x轴位移为负值，也就是说滑动的距离大于按钮的四分之一宽度，自动展开按钮
        if (state.scrollX <= -allBtnWidth.value / 4) {
          state.moveX = -allBtnWidth.value; // 按钮宽度的负值，即为展开状态movable-view元素左滑的距离
          state.status = true; // 标志当前为展开状态
          emitOpenEvent();
          // 产生震动效果
          if (props.vibrateShort) uni.vibrateShort({});
        } else {
          state.moveX = 0; // 如果距离没有按钮宽度的四分之一，自动收起
          state.status = false;
          emitCloseEvent();
        }
      } else {
        // 如果在打开的状态下，右滑动的距离X轴偏移超过按钮的四分之一(负值反过来的四分之三)，自动收起按钮
        if (state.scrollX > (-allBtnWidth.value * 3) / 4) {
          state.moveX = 0;
          nextTick(() => {
            state.moveX = 101;
          });
          state.status = false;
          emitCloseEvent();
        } else {
          state.moveX = -allBtnWidth.value;
          state.status = true;
          emitOpenEvent();
        }
      }
    });
  };

  // 开始触摸
  const touchstart = () => {};

  const getActionRect = () => {
    getRect('.u-swipe-action').then((res: any) => {
      state.movableAreaWidth = res.width;
      // 等视图更新完后，再显示右边的可滑动按钮，防止这些按钮会"闪一下"
      nextTick(() => {
        state.showBtn = true;
      })
    });
  };

  // 点击内容触发事件
  const contentClick = () => {
    // 点击内容时，如果当前为打开状态，收起组件
    if (state.status == true) {
      state.status = 'close';
      state.moveX = 0;
    }
    emit('content-click', props.index);
  };

  onMounted(() => {
    getActionRect();
  });

  watch(() => props.show, (nVal, oVal) => {
    if (nVal) {
      open();
    } else {
      close();
    }
  },{ immediate:true });

  defineExpose({
    ...toRefs(state),
    movableViewWidth,
    innerBtnWidth,
    btnStyle,
    btnClick,
    change,
    close,
    open,
    touchend,
    touchstart,
    contentClick,
  });
</script>

<style scoped lang="scss">
@import "../../libs/css/style.components.scss";
	
.u-swipe-action {
	width: auto;
	height: initial;
	position: relative;
	overflow: hidden;
}

.u-swipe-view {
	@include vue-flex;
	height: initial;
	position: relative;
	/* 这一句很关键，覆盖默认的绝对定位 */
}

.u-swipe-content {
	flex: 1;
  overflow: hidden;
}

.u-swipe-del {
	position: relative;
	font-size: 30rpx;
	color: #ffffff;
}

.u-btn-text {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
