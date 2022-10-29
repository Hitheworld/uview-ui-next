<template>
	<view class="">
		<view
        class="u-content"
        :class="[state.elId]"
        :style="{
          height: state.isLongContent && !showMore ? props.showHeight + 'rpx' : 'auto',
          textIndent: props.textIndent
        }"
    >
			<slot></slot>
		</view>
		<view
        @tap="toggleReadMore"
        v-if="state.isLongContent"
        class="u-content__showmore-wrap"
        :class="{ 'u-content__show-more': state.showMore }"
        :style="[innerShadowStyle]">
			<text
          class="u-content__showmore-wrap__readmore-btn"
          :style="{
            fontSize: props.fontSize + 'rpx',
            color: props.color
          }"
      >
				{{ state.showMore ? props.openText : props.closeText }}
			</text>
			<view class="u-content__showmore-wrap__readmore-btn__icon u-flex">
				<u-icon
            :color="props.color"
            :size="props.fontSize"
            :name="state.showMore ? 'arrow-up' : 'arrow-down'"
        ></u-icon>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-read-more',
  }
</script>

<script setup lang="ts">
import {
  ComponentInternalInstance,
  getCurrentInstance,
  reactive,
  toRefs,
  computed,
  watch,
  nextTick,
  onMounted,
  withDefaults, CSSProperties
} from "vue";
import { useComposable } from '../../libs/hooks';
	/**
	 * readMore 阅读更多
	 * @description 该组件一般用于内容较长，预先收起一部分，点击展开全部内容的场景。
	 * @tutorial https://www.uviewui.com/components/readMore.html
	 * @property {String Number} show-height 内容超出此高度才会显示展开全文按钮，单位rpx（默认400）
	 * @property {Boolean} toggle 展开后是否显示收起按钮（默认false）
	 * @property {String} close-text 关闭时的提示文字（默认“展开阅读全文”）
	 * @property {String Number} font-size 提示文字的大小，单位rpx（默认28）
	 * @property {String} text-indent 段落首行缩进的字符个数（默认2em）
	 * @property {String} open-text 展开时的提示文字（默认“收起”）
	 * @property {String} color 提示文字的颜色（默认#2979ff）
	 * @example <u-read-more><rich-text :nodes="content"></rich-text></u-read-more>
	 */
  interface UReadMoreState {
    isLongContent: boolean; // 是否需要隐藏一部分内容
    showMore: boolean; // 当前隐藏与显示的状态，true-显示，false-收起
    elId: string; // 生成唯一class
  }
  interface UReadMoreProps {
    // 默认的显示占位高度，单位为rpx
    showHeight?: number | string;
    // 展开后是否显示"收起"按钮
    toggle?: boolean;
    // 关闭时的提示文字
    closeText?: string;
    // 展开时的提示文字
    openText?: string;
    // 提示的文字颜色
    color?: string;
    // 提示文字的大小
    fontSize?: number | string;
    // 是否显示阴影
    shadowStyle?: CSSProperties;
    // 段落首行缩进的字符个数
    textIndent?: string;
    // open和close事件时，将此参数返回在回调参数中
    index?: number | string;
  }

  const props = withDefaults(defineProps<UReadMoreProps>(),{
    // 默认的显示占位高度，单位为rpx
    showHeight: 400,
    // 展开后是否显示"收起"按钮
    toggle: false,
    // 关闭时的提示文字
    closeText: '展开阅读全文',
    // 展开时的提示文字
    openText: '收起',
    // 提示的文字颜色
    color: '#2979ff',
    // 提示文字的大小
    fontSize: 28,
    // 是否显示阴影
    shadowStyle: () => {
      return {
        backgroundImage: "linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, #fff 80%)",
        paddingTop: "300rpx",
        marginTop: "-300rpx"
      }
    },
    // 段落首行缩进的字符个数
    textIndent: '2em',
    // open和close事件时，将此参数返回在回调参数中
    index: '',
  });

  const emit = defineEmits<{
    (e: 'open', index: number | string): void;
    (e: 'close', index: number | string): void;
  }>();

  const { guid, getRect } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UReadMoreState>({
    isLongContent: false, // 是否需要隐藏一部分内容
    showMore: false, // 当前隐藏与显示的状态，true-显示，false-收起
    elId: guid(), // 生成唯一class
  });

  const paramsChange = computed(() => {
    return `${props.toggle}-${props.showHeight}`;
  });

  // 展开后无需阴影，收起时才需要阴影样式
  const innerShadowStyle = computed(() => {
    if (state.showMore) return {};
    else return props.shadowStyle
  });

  const init = () => {
    getRect('.' + state.elId).then((res: any) => {
      // 判断高度，如果真实内容高度大于占位高度，则显示收起与展开的控制按钮
      if (res.height > uni.upx2px(Number(props.showHeight))) {
        state.isLongContent = true;
        state.showMore = false;
      }
    })
  };

  // 展开或者收起
  const toggleReadMore = () => {
    state.showMore = !state.showMore;
    // 如果toggle为false，隐藏"收起"部分的内容
    if (props.toggle == false) state.isLongContent = false;
    // 发出打开或者收齐的事件
    emit(state.showMore ? 'open' : 'close', props.index);
  };

  watch(() => paramsChange.value, () => {
    init();
  });

  onMounted(() => {
    nextTick(() => {
      init();
    });
  });

  defineExpose({
    ...toRefs(state),
    paramsChange,
    innerShadowStyle,
    init,
    toggleReadMore,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-content {
		font-size: 30rpx;
		color: $u-content-color;
		line-height: 1.8;
		text-align: left;
		overflow: hidden;

		&__show-more {
			padding-top: 0;
			background: none;
			margin-top: 20rpx;
		}

		&__showmore-wrap {
			position: relative;
			width: 100%;
			padding-bottom: 26rpx;
			@include vue-flex;
			align-items: center;
			justify-content: center;

			&__readmore-btn {
				@include vue-flex;
				align-items: center;
				justify-content: center;
				line-height: 1;

				&__icon {
					margin-left: 14rpx;
				}
			}
		}
	}
</style>
