<template>
	<view
      class="u-grid"
      :class="{'u-border-top u-border-left': props.border}"
      :style="[gridStyle]"
  >
    <slot />
  </view>
</template>

<script lang="ts">
  export default {
    name: 'u-grid',
  }
</script>

<script setup lang="ts">
  import {
    ComponentInternalInstance,
    CSSProperties,
    getCurrentInstance,
    reactive,
    toRefs,
    computed,
    watch,
    ref,
    withDefaults
  } from "vue";

  /**
   * grid 宫格布局
   * @description 宫格组件一般用于同时展示多个同类项目的场景，可以给宫格的项目设置徽标组件(badge)，或者图标等，也可以扩展为左右滑动的轮播形式。
   * @tutorial https://www.uviewui.com/components/grid.html
   * @property {String Number} col 宫格的列数（默认3）
   * @property {Boolean} border 是否显示宫格的边框（默认true）
   * @property {Boolean} hover-class 点击宫格的时候，是否显示按下的灰色背景（默认false）
   * @event {Function} click 点击宫格触发
   * @example <u-grid :col="3" @click="click"></u-grid>
   */
  interface UGridState {
    index: number;
  }
  interface UGridProps {
    size?: number | string;
    // 分成几列
    col?: number | string;
    // 是否显示边框
    border?: boolean;
    // 宫格对齐方式，表现为数量少的时候，靠左，居中，还是靠右
    align?: string;
    // 宫格按压时的样式类，"none"为无效果
    hoverClass?: string | 'none';
  }

  const props = withDefaults(defineProps<UGridProps>(),{
    // 分成几列
    col: 3,
    // 是否显示边框
    border: true,
    // 宫格对齐方式，表现为数量少的时候，靠左，居中，还是靠右
    align: 'left',
    // 宫格按压时的样式类，"none"为无效果
    hoverClass: 'u-hover-class',
  });

  const emit = defineEmits<{
    (e: 'click', index: string | number): void;
  }>();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  // 如果将children定义在data中，在微信小程序会造成循环引用而报错
  const children = ref<ComponentInternalInstance[]>([]);

  const state = reactive<UGridState>({
    index: 0,
  });

  // 计算父组件的值是否发生变化
  const parentData = computed(() => {
    return [props.hoverClass, props.col, props.size, props.border];
  });

  // 宫格对齐方式
  const gridStyle = computed(() => {
    let style: CSSProperties = {};
    switch(props.align) {
      case 'left':
        style.justifyContent = 'flex-start';
        break;
      case 'center':
        style.justifyContent = 'center';
        break;
      case 'right':
        style.justifyContent = 'flex-end';
        break;
      default: style.justifyContent = 'flex-start';
    }
    return style;
  });

  const click = (index: string | number) => {
    emit('click', index);
  };

  // 当父组件需要子组件需要共享的参数发生了变化，手动通知子组件
  watch(() => parentData.value, (newValue, oldValue) => {
    if(children.value?.length) {
      children.value?.map(child => {
        // 判断子组件(u-radio)如果有updateParentData方法的话，就就执行(执行的结果是子组件重新从父组件拉取了最新的值)
        typeof(child?.exposeProxy?.updateParentData) == 'function' && child?.exposeProxy?.updateParentData();
      });
    }
  });

  defineExpose({
    children,
    ...toRefs(state),
    parentData,
    gridStyle,
    click,
  });
</script>

<style scoped lang="scss">
  @import "../../libs/css/style.components.scss";

  .u-grid {
    width: 100%;
    /* #ifdef MP */
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    /* #endif */

    /* #ifndef MP */
    @include vue-flex;
    flex-wrap: wrap;
    align-items: center;
    /* #endif */
  }
</style>
