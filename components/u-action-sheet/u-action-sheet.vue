<template>
  <u-popup
      mode="bottom"
      :border-radius="props.borderRadius"
      :popup="false"
      v-model="props.modelValue"
      :maskCloseAble="props.maskCloseAble"
      length="auto"
      :safeAreaInsetBottom="props.safeAreaInsetBottom"
      @close="popupClose"
      :z-index="uZIndex"
  >
    <view
        class="u-tips u-border-bottom"
        v-if="props.tips.text"
        :style="[tipsStyle]"
    >
      {{ props.tips.text }}
    </view>
    <block
        v-for="(item, index) in props.list"
        :key="index"
    >
      <view
          @touchmove.stop.prevent
          @tap="itemClick(index)"
          :style="[itemStyle(index)]"
          class="u-action-sheet-item u-line-1"
          :class="[index < props.list.length - 1 ? 'u-border-bottom' : '']"
          :hover-stay-time="150"
      >
        <text>{{item.text}}</text>
        <text class="u-action-sheet-item__subtext u-line-1" v-if="item.subText">
          {{ item.subText }}
        </text>
      </view>
    </block>
    <view class="u-gab" v-if="props.cancelBtn">
    </view>
    <view
        @touchmove.stop.prevent
        class="u-actionsheet-cancel u-action-sheet-item"
        hover-class="u-hover-class"
        :hover-stay-time="150"
        v-if="props.cancelBtn"
        @tap="close"
    >
      {{ props.cancelText }}
    </view>
  </u-popup>
</template>

<script lang="ts">
  export default {
    name: 'u-action-sheet',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, computed } from "vue";
  import { useComposable } from '../../libs/hooks';
  /**
   * actionSheet 操作菜单
   * @description 本组件用于从底部弹出一个操作菜单，供用户选择并返回结果。本组件功能类似于uni的uni.showActionSheetAPI，配置更加灵活，所有平台都表现一致。
   * @tutorial https://www.uviewui.com/components/actionSheet.html
   * @property {Array<Object>} list 按钮的文字数组，见官方文档示例
   * @property {Object} tips 顶部的提示文字，见官方文档示例
   * @property {String} cancel-text 取消按钮的提示文字
   * @property {Boolean} cancel-btn 是否显示底部的取消按钮（默认true）
   * @property {Number String} border-radius 弹出部分顶部左右的圆角值，单位rpx（默认0）
   * @property {Boolean} mask-close-able 点击遮罩是否可以关闭（默认true）
   * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配（默认false）
   * @property {Number String} z-index z-index值（默认1075）
   * @property {String} cancel-text 取消按钮的提示文字
   * @event {Function} click 点击ActionSheet列表项时触发
   * @event {Function} close 点击取消按钮时触发
   * @example <u-action-sheet :list="list" @click="click" v-model="show"></u-action-sheet>
   */
  interface ListItem {
    text?: string;
    subText?: string;
    color?: string;
    fontSize?: string | number;
    disabled?: boolean;
  }
  interface Tips {
    text?: string;
    color?: string;
    fontSize?: string | number;
  }
  interface UActionSheetProps {
    // 点击遮罩是否可以关闭actionsheet
    maskCloseAble?: boolean;
    // 按钮的文字数组，可以自定义颜色和字体大小，字体单位为rpx
    list: ListItem[];
    // 顶部的提示文字
    tips?: Tips;
    // 底部的取消按钮
    cancelBtn?: boolean;
    // 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距
    safeAreaInsetBottom?: boolean;
    // 通过双向绑定控制组件的弹出与收起
    modelValue?: boolean;
    // 弹出的顶部圆角值
    borderRadius?: string | number;
    // 弹出的z-index值
    zIndex?: string | number;
    // 取消按钮的文字提示
    cancelText?: string;
  }

  const props = withDefaults(defineProps<UActionSheetProps>() ,{
    // 点击遮罩是否可以关闭actionsheet
    maskCloseAble: true,
    // 按钮的文字数组，可以自定义颜色和字体大小，字体单位为rpx
    list: () => [],
    // 顶部的提示文字
    tips: () => {
      return {
          text: '',
          color: '',
          fontSize: '26',
      }
    },
    // 底部的取消按钮
    cancelBtn: true,
    // 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距
    safeAreaInsetBottom: false,
    // 通过双向绑定控制组件的弹出与收起
    modelValue: false,
    // 弹出的顶部圆角值
    borderRadius: 0,
    // 弹出的z-index值
    zIndex: 0,
    // 取消按钮的文字提示
    cancelText: '取消'
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: boolean): void;
    (e: 'click', index: number): void;
    (e: 'close'): void;
  }>();

  const { Z_INDEX_CONFIG } = useComposable();

  // 顶部提示的样式
  const tipsStyle = computed(() => {
    let style: CSSProperties = {};
    if (props.tips?.color) style.color = props.tips.color;
    if (props.tips?.fontSize) style.fontSize = props.tips.fontSize + 'rpx';
    return style;
  });

  // 操作项目的样式
  const itemStyle = computed(() => {
    return (index: number) => {
      let style: CSSProperties = {};
      if (props.list?.[index].color) style.color = props.list[index].color;
      if (props.list?.[index].fontSize) style.fontSize = props.list[index].fontSize + 'rpx';
      // 选项被禁用的样式
      if (props.list?.[index].disabled) style.color = '#c0c4cc';
      return style;
    }
  });

  const uZIndex = computed(() => {
    // 如果用户有传递z-index值，优先使用
    return props.zIndex ? props.zIndex : Z_INDEX_CONFIG.popup;
  });

  // 弹窗关闭
  const popupClose = () => {
    emit('update:modelValue', false);
  };

  // 点击取消按钮
  const close = () => {
    // 发送input事件，并不会作用于父组件，而是要设置组件内部通过props传递的value参数
    // 这是一个vue发送事件的特殊用法
    popupClose();
    emit('close');
  };

  // 点击某一个item
  const itemClick = (index: number) => {
    // disabled的项禁止点击
    if(props.list?.[index].disabled) return;
    emit('click', index);
    emit('update:modelValue', false);
  };

  defineExpose({
    tipsStyle,
    itemStyle,
    uZIndex,
    close,
    itemClick,
    popupClose,
  });
</script>

<style lang="scss" scoped>
@import "../../libs/css/style.components.scss";

.u-tips {
  font-size: 26rpx;
  text-align: center;
  padding: 34rpx 0;
  line-height: 1;
  color: $u-tips-color;
}

.u-action-sheet-item {
  @include vue-flex;;
  line-height: 1;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  padding: 34rpx 0;
  flex-direction: column;
}

.u-action-sheet-item__subtext {
  font-size: 24rpx;
  color: $u-tips-color;
  margin-top: 20rpx;
}

.u-gab {
  height: 12rpx;
  background-color: rgb(234, 234, 236);
}

.u-actionsheet-cancel {
  color: $u-main-color;
}
</style>
