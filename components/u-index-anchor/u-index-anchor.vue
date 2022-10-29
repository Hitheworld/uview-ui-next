<template>
	<!-- 支付宝小程序使用getRect()获取组件的根元素尺寸，所以在外面套一个"壳" -->
	<view>
		<view
      class="u-index-anchor-wrapper"
      :id="guid()"
      :style="[state.wrapperStyle]"
    >
			<view
        class="u-index-anchor"
        :class="[state.active ? 'u-index-anchor--active' : '']"
        :style="[customAnchorStyle]"
      >
				<slot v-if="props.useSlot" />
				<block v-else>
					<text>
            {{ props.index }}
          </text>
				</block>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-index-anchor',
  }
</script>

<script setup lang="ts">
  import {
    ComponentInternalInstance,
    getCurrentInstance,
    ref,
    reactive,
    toRefs,
    computed,
    onMounted,
    CSSProperties,
    withDefaults
  } from 'vue';
  import { useComposable } from '../../libs/hooks';
	/**
	 * indexAnchor 索引列表锚点
	 * @description 通过折叠面板收纳内容区域,搭配<u-index-anchor>使用
	 * @tutorial https://www.uviewui.com/components/indexList.html#indexanchor-props
	 * @property {Boolean} use-slot 是否使用自定义内容的插槽（默认false）
	 * @property {String Number} index 索引字符，如果定义了use-slot，此参数自动失效
	 * @property {Object} custStyle 自定义样式，对象形式，如"{color: 'red'}"
	 * @event {Function} default 锚点位置显示内容，默认为索引字符
	 * @example <u-index-anchor :index="item" />
	 */
  interface UIndexAnchorState {
    active: boolean;
    wrapperStyle: CSSProperties;
    anchorStyle: CSSProperties;
  }
  interface UIndexAnchorProps {
    useSlot?: boolean;
    index: string;
    customStyle?: CSSProperties;
  }

  const props = withDefaults(defineProps<UIndexAnchorProps>(), {
    useSlot: false,
    index: '',
    customStyle: () => {
      return {}
    }
  });

  const { guid, $parentUtil } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const parent: any | boolean = ref(false);

  const state = reactive<UIndexAnchorState>({
    active: false,
    wrapperStyle: {},
    anchorStyle: {},
  });

  const customAnchorStyle = computed(() => {
    return Object.assign(state.anchorStyle, props.customStyle);
  });

  onMounted(() => {
    parent.value = $parentUtil('u-index-list');
    if(parent.value) {
      parent.value.children.push(instance?.proxy);
      parent.value.updateData();
    }
  });

  defineExpose({
    ...toRefs(state),
    customAnchorStyle,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-index-anchor {
		box-sizing: border-box;
		padding: 14rpx 24rpx;
		color: #606266;
		width: 100%;
		font-weight: 500;
		font-size: 28rpx;
		line-height: 1.2;
		background-color: rgb(245, 245, 245);
	}

	.u-index-anchor--active {
		right: 0;
		left: 0;
		color: #2979ff;
		background-color: #fff;
	}
</style>
