<template>
	<view
      @tap="backToTop"
      class="u-back-top"
      :class="['u-back-top--mode--' + props.mode]"
      :style="[
          {
            bottom: props.bottom + 'rpx',
            right: props.right + 'rpx',
            borderRadius: props.mode == 'circle' ? '10000rpx' : '8rpx',
            zIndex: state.uZIndex,
            opacity: state.opacity
          }, props.customStyle
      ]"
  >
		<view
        class="u-back-top__content"
        v-if="!defaultSlot"
    >
			<u-icon
          @click="backToTop"
          :name="props.icon"
          :custom-style="props.iconStyle"
      />
			<view class="u-back-top__content__tips">
				{{ props.tips }}
			</view>
		</view>
		<slot v-else />
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-back-top',
  }
</script>

<script setup lang="ts">
  import {
    CSSProperties,
    computed, reactive,
    toRefs,
    watch,
    useSlots
  } from 'vue'

  interface UBackTopState {
    // 不透明度，为了让组件有一个显示和隐藏的过渡动画
    opacity: number;
    // 组件的z-index值，隐藏时设置为-1，就会看不到
    uZIndex: number;
  }
  interface UBackTopProps {
    // 返回顶部的形状，circle-圆形，square-方形
    mode?: string;
    // 自定义图标
    icon?: string;
    // 提示文字
    tips?: string;
    // 返回顶部滚动时间
    duration?: string | number;
    // 滚动距离
    scrollTop?: string | number;
    // 距离顶部多少距离显示，单位rpx
    top?: string | number;
    // 返回顶部按钮到底部的距离，单位rpx
    bottom?: string | number;
    // 返回顶部按钮到右边的距离，单位rpx
    right?:string | number;
    // 层级
    zIndex?: string | number;
    // 图标的样式，对象形式
    iconStyle?: CSSProperties | null;
    // 整个组件的样式
    customStyle?: CSSProperties | null,
  }

  const defaultSlot = useSlots().default;

  const props = withDefaults(defineProps<UBackTopProps>(), {
    // 返回顶部的形状，circle-圆形，square-方形
    mode: 'circle',
    // 自定义图标
    icon: 'arrow-upward',
    // 提示文字
    tips: '',
    // 返回顶部滚动时间
    duration: 100,
    // 滚动距离
    scrollTop: 0,
    // 距离顶部多少距离显示，单位rpx
    top: 400,
    // 返回顶部按钮到底部的距离，单位rpx
    bottom: 200,
    // 返回顶部按钮到右边的距离，单位rpx
    right: 40,
    // 层级
    zIndex: '9',
    // 图标的样式，对象形式
    iconStyle: () => {
      return {
        color: '#909399',
        fontSize: '38rpx'
      }
    },
    // 整个组件的样式
    customStyle: () => {
      return {}
    },
  });

  const state = reactive<UBackTopState>({
    // 不透明度，为了让组件有一个显示和隐藏的过渡动画
    opacity: 0,
    // 组件的z-index值，隐藏时设置为-1，就会看不到
    uZIndex: -1,
  });

  const showBackTop = computed(() => {
    // 由于scrollTop为页面的滚动距离，默认为px单位，这里将用于传入的top(rpx)值
    // 转为px用于比较，如果滚动条到顶的距离大于设定的距离，就显示返回顶部的按钮
    return Number(props.scrollTop) > uni.upx2px(Number(props.top));
  });

  watch(() => showBackTop, (newValue, oldValue) => {
    // 当组件的显示与隐藏状态发生跳变时，修改组件的层级和不透明度
    // 让组件有显示和消失的动画效果，如果用v-if控制组件状态，将无设置动画效果
    if(newValue) {
      state.uZIndex = Number(props.zIndex);
      state.opacity = 1;
    } else {
      state.uZIndex = -1;
      state.opacity = 0;
    }
  });

  const backToTop = () => {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: Number(props.duration),
    });
  };

  // 当组件的显示与隐藏状态发生跳变时，修改组件的层级和不透明度
  // 让组件有显示和消失的动画效果，如果用v-if控制组件状态，将无设置动画效果
  watch(() => showBackTop.value, (nVal) =>　{
    if(nVal) {
      state.uZIndex = Number(props.zIndex);
      state.opacity = 1;
    } else {
      state.uZIndex = -1;
      state.opacity = 0;
    }
  });

  defineExpose({
    ...toRefs(state),
    showBackTop,
    backToTop,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-back-top {
		width: 80rpx;
		height: 80rpx;
		position: fixed;
		z-index: 9;
		@include vue-flex;
		flex-direction: column;
		justify-content: center;
		background-color: #E1E1E1;
		color: $u-content-color;
		align-items: center;
		transition: opacity 0.4s;
		
		&__content {
			@include vue-flex;
			flex-direction: column;
			align-items: center;
			
			&__tips {
				font-size: 24rpx;
				transform: scale(0.8);
				line-height: 1;
			}
		}
	}
</style>
