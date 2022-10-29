<template>
  <view>
    <view
        v-if="!props.isCss"
        class="u-circle-progress"
        :style="{
          width: state.widthPx + 'px',
          height: state.widthPx + 'px',
          backgroundColor: props.bgColor
        }"
    >
      <!-- 支付宝小程序不支持canvas-id属性，必须用id属性 -->
      <canvas
          class="u-canvas-bg"
          :canvas-id="state.elBgId"
          :id="state.elBgId"
          :style="{
				width: state.widthPx + 'px',
				height: state.widthPx + 'px'
			}"
      ></canvas>
      <canvas
          class="u-canvas"
          :canvas-id="state.elId"
          :id="state.elId"
          :style="{
				width: state.widthPx + 'px',
				height: state.widthPx + 'px'
			}"
      ></canvas>
      <slot></slot>
    </view>

    <div v-if="props.isCss" class="container">
      <div class="left">
        <div class="left-circle" :style="{ transform: state.leftTransform }"></div>
      </div>
      <div class="right">
        <div class="right-circle" :style="{ transform: state.rightTransform }"></div>
      </div>
      <div class="cover">
        <slot></slot>
      </div>
    </div>
  </view>
</template>

<script lang="ts">
export default {
  name: 'u-circle-progress',
}
</script>

<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance, computed, reactive, toRefs, watch, onMounted, onUnmounted } from "vue";
import { useComposable } from '../../libs/hooks';
import CanvasContext = UniApp.CanvasContext;
/**
 * circleProgress 环形进度条
 * @description 展示操作或任务的当前进度，比如上传文件，是一个圆形的进度条。注意：此组件的percent值只能动态增加，不能动态减少。
 * @tutorial https://www.uviewui.com/components/circleProgress.html
 * @property {String Number} percent 圆环进度百分比值，为数值类型，0-100
 * @property {String} inactive-color 圆环的底色，默认为灰色(该值无法动态变更)（默认#ececec）
 * @property {String} active-color 圆环激活部分的颜色(该值无法动态变更)（默认#19be6b）
 * @property {String Number} width 整个圆环组件的宽度，高度默认等于宽度值，单位rpx（默认200）
 * @property {String Number} border-width 圆环的边框宽度，单位rpx（默认14）
 * @property {String Number} duration 整个圆环执行一圈的时间，单位ms（默认呢1500）
 * @property {String} type 如设置，active-color值将会失效
 * @property {String} bg-color 整个组件背景颜色，默认为白色
 * @example <u-circle-progress active-color="#2979ff" :percent="80"></u-circle-progress>
 */
interface UCircleProgressProps {
  // 是否采用css作为圆形进度条
  isCss: boolean;
  // 圆环进度百分比值
  // 限制值在0到100之间
  percent: number;
  // 底部圆环的颜色（灰色的圆环）
  inactiveColor?: string;
  // 圆环激活部分的颜色
  activeColor?: string;
  // 圆环线条的宽度，单位rpx
  borderWidth?: number | string;
  // 整个圆形的宽度，单位rpx
  width?: number | string;
  // 整个圆环执行一圈的时间，单位ms
  duration?: number | string;
  // 主题类型
  type?: 'success' | 'primary' | 'error' | 'info' | 'warning' | '';
  // 整个圆环进度区域的背景色
  bgColor?: string;
}
interface UCircleProgressState {
  elBgId: string; // 非微信端的时候，需用动态的id，否则一个页面多个圆形进度条组件数据会混乱
  elId: string;
  widthPx: number; // 转成px后的整个组件的背景宽度
  borderWidthPx: number; // 转成px后的圆环的宽度
  startAngle:number; // canvas画圆的起始角度，默认为3点钟方向，定位到12点钟方向
  progressContext: CanvasContext | null; // 活动圆的canvas上下文
  newPercent: number; // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
  oldPercent: number; // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
  leftTransform: string; // 使用css作为圆形进度条-左旋转角度
  rightTransform: string; // 使用css作为圆形进度条-右旋转角度
  cssTime: number | null; // 使用css作为圆形进度条-定时器
}

const props = withDefaults(defineProps<UCircleProgressProps>(),  {
  // 是否采用css作为圆形进度条
  isCss: true,
  // 圆环进度百分比值
  percent: 0,
  // 底部圆环的颜色（灰色的圆环）
  inactiveColor: '#ececec',
  // 圆环激活部分的颜色
  activeColor: '#19be6b',
  // 圆环线条的宽度，单位rpx
  borderWidth: 14,
  // 整个圆形的宽度，单位rpx
  width: 200,
  // 整个圆环执行一圈的时间，单位ms
  duration: 1500,
  // 主题类型
  type: '',
  // 整个圆环进度区域的背景色
  bgColor: '#ffffff',
});

const { guid, color } = useComposable();

const instance: ComponentInternalInstance | null = getCurrentInstance();

const state = reactive<UCircleProgressState>({
  // #ifdef MP-WEIXIN
  elBgId: 'uCircleProgressBgId', // 微信小程序中不能使用guid()形式动态生成id值，否则会报错
  elId: 'uCircleProgressElId',
  // #endif
  // #ifndef MP-WEIXIN
  elBgId: guid(), // 非微信端的时候，需用动态的id，否则一个页面多个圆形进度条组件数据会混乱
  elId: guid(),
  // #endif
  widthPx: props.width ? uni.upx2px(Number(props.width)) : 0, // 转成px后的整个组件的背景宽度
  borderWidthPx: props.borderWidth ? uni.upx2px(Number(props.borderWidth)) : 0, // 转成px后的圆环的宽度
  startAngle: -Math.PI / 2, // canvas画圆的起始角度，默认为3点钟方向，定位到12点钟方向
  progressContext: null, // 活动圆的canvas上下文
  newPercent: 0, // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
  oldPercent: 0, // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用

  leftTransform: 'rotate(-135deg)', // 使用css作为圆形进度条-左旋转角度
  rightTransform: 'rotate(-135deg)', // 使用css作为圆形进度条-右旋转角度
  cssTime: null, // 使用css作为圆形进度条-定时器
});

// 赋值，用于加载后第一个画圆使用
state.newPercent = props.percent;
state.oldPercent = 0;

// 有type主题时，优先起作用
const circleColor = computed(() => {
  if (['success', 'error', 'info', 'primary', 'warning'].indexOf(props.type) >= 0) return color[props.type];
  else return props.activeColor;
});

const drawCircleByProgress = (progress: number) => {
  // 第一次操作进度环时将上下文保存到了this.data中，直接使用即可
  let ctx: CanvasContext | null = state.progressContext;
  if (!ctx) {
    ctx = uni.createCanvasContext(state.elId, instance?.proxy);
    state.progressContext = ctx;
  }
  // 表示进度的两端为圆形
  ctx.setLineCap('round');
  // 设置线条的宽度和颜色
  ctx.setLineWidth(state.borderWidthPx);
  ctx.setStrokeStyle(circleColor.value);
  // 将总过渡时间除以100，得出每修改百分之一进度所需的时间
  let time = Math.floor(Number(props.duration) / 100);
  // 结束角的计算依据为：将2π分为100份，乘以当前的进度值，得出终止点的弧度值，加起始角，为整个圆从默认的
  // 3点钟方向开始画图，转为更好理解的12点钟方向开始作图，这需要起始角和终止角同时加上state.startAngle值
  let endAngle = ((2 * Math.PI) / 100) * progress + state.startAngle;
  ctx.beginPath();
  // 半径为整个canvas宽度的一半
  let radius = state.widthPx / 2;
  ctx.arc(radius, radius, radius - state.borderWidthPx, state.startAngle, endAngle, false);
  ctx.stroke();
  ctx.draw();
  // 如果变更后新值大于旧值，意味着增大了百分比
  if (state.newPercent > state.oldPercent) {
    // 每次递增百分之一
    progress++;
    // 如果新增后的值，大于需要设置的值百分比值，停止继续增加
    if (progress > state.newPercent) return;
  } else {
    // 同理于上面
    progress--;
    if (progress < state.newPercent) return;
  }
  setTimeout(() => {
    // 定时器，每次操作间隔为time值，为了让进度条有动画效果
    drawCircleByProgress(progress);
  }, time);
};

const drawProgressBg = () => {
  let ctx: CanvasContext = uni.createCanvasContext(state.elBgId, instance?.proxy);
  ctx.setLineWidth(state.borderWidthPx); // 设置圆环宽度
  ctx.setStrokeStyle(props.inactiveColor); // 线条颜色
  ctx.beginPath(); // 开始描绘路径
  // 设置一个原点(110,110)，半径为100的圆的路径到当前路径
  let radius = state.widthPx / 2;
  ctx.arc(radius, radius, radius - state.borderWidthPx, 0, 2 * Math.PI, false);
  ctx.stroke(); // 对路径进行描绘
  ctx.draw();
};

watch(() => props.percent, (newValue: number, oldValue: number) => {
  if (!props.isCss) {
    if (newValue > 100) newValue = 100;
    if (newValue < 0) oldValue = 0;
    // 此值其实等于this.percent，命名一个新
    state.newPercent = newValue;
    state.oldPercent = oldValue;
    setTimeout(() => {
      // 无论是百分比值增加还是减少，需要操作还是原来的旧的百分比值
      // 将此值减少或者新增到新的百分比值
      drawCircleByProgress(oldValue);
    }, 50);
  }
});

// css
const setPercentValue = (value: number) => {
  if (Number.isNaN(value) || value < 0) value = 0;
  if (value > 100) value = 100;
  if(value % 1 !== 0){  //若value为小数，保留一位小数
    value = value.toFixed(1);
  }
  // cover.innerText = value + "%";

  if (value < 50) {
    // 225 至 45 满
    const deg = 225 + ((180 / 50) * value);
    state.rightTransform = `rotate(${deg}deg)`;
  } else {
    // 225 至 45 满
    const everyDegree = ((180 / 50) * value);
    const maxDeg = 225 + everyDegree;
    let deg = 0;
    if (maxDeg >= 360) {
      deg = 45 + everyDegree;
    } else {
      deg = maxDeg - 50;
    }
    state.leftTransform = `rotate(${deg}deg)`;
    state.rightTransform = `rotate(45deg)`;
  }
}

onMounted(() => {
  if (props.isCss) {
    // 将总过渡时间除以100，得出每修改百分之一进度所需的时间
    let time = Math.floor(Number(props.duration) / 100);
    let initCount = 0;
    state.cssTime = setInterval(() => {
      if (initCount < props.percent) {
        initCount++;
      } else {
        clearInterval(state.cssTime);
        state.cssTime = null;
      }
      setPercentValue(initCount)
    }, time);
  } else {
    // 在h5端，必须要做一点延时才起作用，nextTick()无效(HX2.4.7)
    setTimeout(() => {
      drawProgressBg();
      drawCircleByProgress(state.oldPercent);
    }, 50);
  }
});

onUnmounted(() => {
  clearInterval(state.cssTime);
  state.cssTime = null;
});

const dynamicCss = {
  width: state.widthPx + 'px', // 直径
  radiusWidth: (state.widthPx / 2) + 'px', // 半径
  innerRingWidth: (state.widthPx - (state.borderWidthPx * 2)) + 'px', // 内环直径
  borderWidth: state.borderWidthPx + 'px', // 边框宽度
  rightTransform: state.rightTransform, // 角度
  leftTransform: state.leftTransform, // 角度
  bgColor: props.inactiveColor,
  color: circleColor.value,
}

defineExpose({
  ...toRefs(state),
});
</script>

<style lang="scss" scoped>
@import "../../libs/css/style.components.scss";
.u-circle-progress {
  position: relative;
  /* #ifndef APP-NVUE */
  display: inline-flex;
  /* #endif */
  align-items: center;
  justify-content: center;
}

.u-canvas-bg {
  position: absolute;
}

.u-canvas {
  position: absolute;
}

// css
$cssCircleProggressWidth: v-bind('dynamicCss.width');
$cssCircleProggressRadiusWidth: v-bind('dynamicCss.radiusWidth');
$cssCircleProggressInnerRingWidth: v-bind('dynamicCss.innerRingWidth');
$cssCircleProggressBorderWidth: v-bind('dynamicCss.borderWidth');
$cssCircleProggressBgColor: v-bind('dynamicCss.bgColor');
$cssCircleProggressColor: v-bind('dynamicCss.color');
.container{
  box-sizing: content-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: $cssCircleProggressWidth;
  height: $cssCircleProggressWidth;
  border-radius: 50%;
  overflow: hidden;
}
.cover {
  box-sizing: content-box;
  position: absolute;
  width: $cssCircleProggressInnerRingWidth;
  height: $cssCircleProggressInnerRingWidth;
  border-radius: 50%;
  background: $cssCircleProggressBgColor;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.left, .right {
  box-sizing: content-box;
  width: $cssCircleProggressRadiusWidth;
  height: $cssCircleProggressWidth;
  position: relative;
  overflow: hidden;
  // background: #00a2e8;
}
/*
.left {
    border-top-left-radius: $cssCircleProggressWidth;
    border-bottom-left-radius: $cssCircleProggressWidth;
    overflow: hidden;
    margin-left: 1px;
}
.right {
    border-top-right-radius: $cssCircleProggressWidth;
    border-bottom-right-radius: $cssCircleProggressWidth;
    overflow: hidden;
    margin-right: 1px;
}
*/
.left-circle, .right-circle {
  box-sizing: content-box;
  position: absolute;
  top: 0;
  width: $cssCircleProggressInnerRingWidth;
  height: $cssCircleProggressInnerRingWidth;
  border-radius: 50%;
  border: $cssCircleProggressBorderWidth solid $cssCircleProggressBgColor;
}

.left-circle {
  left: 0.25px;
  border-bottom: $cssCircleProggressBorderWidth solid $cssCircleProggressColor;
  border-left: $cssCircleProggressBorderWidth solid $cssCircleProggressColor;
  transform: rotate(-135deg);
}

.right-circle {
  right: 0.25px;
  border-top: $cssCircleProggressBorderWidth solid $cssCircleProggressColor;
  border-right: $cssCircleProggressBorderWidth solid $cssCircleProggressColor;
  transform: rotate(-135deg);
}
</style>
