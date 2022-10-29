<template>
  <view class="">
    <view
        class="u-steps"
        :style="{
				flexDirection: props.direction
			}"
    >
      <view
          class="u-steps__item"
          :class="['u-steps__item--' + props.direction]"
          v-for="(item, index) in props.list"
          :key="index"
      >
        <view
            class="u-steps__item__num"
            v-if="props.mode == 'number'"
            :style="{
						backgroundColor: props.current < index ? 'transparent' : props.activeColor,
						borderColor: props.current < index ? props.unActiveColor : props.activeColor
					}"
        >
          <text
              v-if="props.current < index"
              :style="{
                color: props.current < index ? props.unActiveColor : props.activeColor,
              }"
          >
            {{ index + 1 }}
          </text>
          <u-icon
              v-if="props.mode == 'number' && props.current >= index"
              :size="defaultIconSize / 2"
              color="#ffffff"
              :name="item.icon || props.icon"
          ></u-icon>
        </view>
        <view
            class="u-steps__item__dot"
            v-if="props.mode == 'dot' && !item.icon"
            :style="{
              backgroundColor: index <= props.current ? props.activeColor : props.unActiveColor
            }"
        ></view>
        <view v-else-if="props.mode == 'dot' && item.icon" class="u-steps__item__dot">
          <u-icon :size="defaultIconSize" color="#ffffff" :name="item.icon || props.icon"></u-icon>
        </view>
        <view
            class="u-line-1"
            :style="{
              color: index <= props.current ? props.activeColor : props.unActiveColor,
            }"
            :class="['u-steps__item__text--' + props.direction]"
        >
          <view class="u-steps__item__text--name u-line-1">{{ item.name }}</view>
          <view v-if="item.desc" class="u-steps__item__text--desc u-line-1">{{ item.desc }}</view>
        </view>
        <view
            class="u-steps__item__line"
            :class="['u-steps__item__line--' + props.mode]"
            v-if="index < props.list.length - 1"
        >
          <u-line
              :direction="props.direction"
              length="100%"
              :hair-line="false"
              :color="props.unActiveColor"
          ></u-line>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
  export default {
    name: 'u-steps',
  }
</script>

<script setup lang="ts">
  import { withDefaults, ref } from "vue";
  import { useComposable } from '../../libs/hooks';
  /**
   * steps 步骤条
   * @description 该组件一般用于完成一个任务要分几个步骤，标识目前处于第几步的场景。
   * @tutorial https://www.uviewui.com/components/steps.html
   * @property {String} mode 设置模式（默认dot）
   * @property {Array} list 数轴条数据，数组。具体见上方示例
   * @property {String} type type主题（默认primary）
   * @property {String} direction row-横向，column-竖向（默认row）
   * @property {Number String} current 设置当前处于第几步
   * @property {String} active-color 已完成步骤的激活颜色，如设置，type值会失效
   * @property {String} un-active-color 未激活的颜色，用于表示未完成步骤的颜色（默认#606266）
   * @example <u-steps :list="numList" active-color="#fa3534"></u-steps>
   */
  interface StepItem {
    name: string;
    icon?: string;
    desc?: string;
  }
  interface UStepsProps {
    // 步骤条的类型，dot|number
    mode?: 'dot'|'number';
    // 步骤条的数据
    list: StepItem[];
    // 主题类型, primary|success|info|warning|error
    type?: 'primary'|'success'|'info'|'warning'|'error';
    // 当前哪一步是激活的
    current: number | string;
    // 激活步骤的颜色
    activeColor?: string;
    // 未激活的颜色
    unActiveColor?: string;
    // 自定义图标
    icon?: string;
    // 自定义图标大小
    size?: number | string;
    // step的排列方向，row-横向，column-竖向
    direction?: 'row' | 'column';
  }

  const props = withDefaults(defineProps<UStepsProps>(),{
    // 步骤条的类型，dot|number
    mode: 'dot',
    // 步骤条的数据
    list: () => [],
    // 主题类型, primary|success|info|warning|error
    type: 'primary',
    // 当前哪一步是激活的
    current: 0,
    // 激活步骤的颜色
    activeColor: '#2979ff',
    // 未激活的颜色
    unActiveColor: '#909399',
    // 自定义图标
    icon: 'checkmark',
    // 自定义图标大小
    size: 0,
    // step的排列方向，row-横向，column-竖向
    direction: 'row',
  });

  const defaultSize = props.mode === 'dot' ? 22 : 44;
  const { addUnit } = useComposable();

  const defaultIconSize = ref(props.size || defaultSize);

  const dynamicCss = {
    size: addUnit(props.size || defaultSize),
    top: addUnit((props.size || defaultSize) + 10),
  }
</script>

<style lang="scss" scoped>
  @import '../../libs/css/style.components.scss';

  $u-steps-item-number-width: v-bind('dynamicCss.size');
  $u-steps-item-dot-width: v-bind('dynamicCss.size');

  .u-steps {
    @include vue-flex;

    .u-steps__item {
      flex: 1;
      text-align: center;
      position: relative;
      min-width: 100rpx;
      font-size: 26rpx;
      color: #8799a3;
      @include vue-flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;

      &--row {
        @include vue-flex;
        flex-direction: column;
        .u-steps__item__dot {
          position: absolute;
          top: 0;
        }

        .u-steps__item__line {
          position: absolute;
          z-index: 0;

          &--dot {
            top: calc(#{$u-steps-item-dot-width} / 2);
            left: calc(50% + (#{$u-steps-item-dot-width} / 2));
            width: calc(100% - #{$u-steps-item-dot-width});
          }

          &--number {
            top: calc(#{$u-steps-item-number-width} / 2);
            left: calc(50% + (#{$u-steps-item-number-width} / 2));
            width: calc(100% - #{$u-steps-item-number-width});
          }
        }
      }

      &--column {
        @include vue-flex;
        flex-direction: row;
        justify-content: flex-start;
        min-height: 120rpx;

        .u-steps__item__line {
          position: absolute;
          z-index: 0;

          &--dot {
            left: calc(#{$u-steps-item-dot-width} / 2);
            top: calc(50% + (#{$u-steps-item-dot-width} / 2));
            height: calc(100% - #{$u-steps-item-dot-width});
          }

          &--number {
            left: calc(#{$u-steps-item-number-width} / 2);
            top: calc(50% + (#{$u-steps-item-number-width} / 2));
            height: calc(100% - #{$u-steps-item-number-width});
          }
        }
      }

      &__num {
        position: relative;
        @include vue-flex;
        align-items: center;
        justify-content: center;
        width: $u-steps-item-number-width;
        height: $u-steps-item-number-width;
        border: 1px solid #8799a3;
        border-radius: 50%;
        overflow: hidden;
      }

      &__dot {
        width: $u-steps-item-dot-width;
        height: $u-steps-item-dot-width;
        @include vue-flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        z-index: 1;
      }

      &__text--row {
        position: absolute;
        top: v-bind('dynamicCss.top');
        margin-bottom: 20rpx;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .u-steps__item__num {
          position: absolute;
          top: 0;
        }
      }

      &__text--column {
        flex: 1;
        margin-left: 14rpx;
        .u-steps__item__text--name {
          text-align: left;
        }
        .u-steps__item__text--desc {
          text-align: left;
        }
      }

      &__text--name {
        text-align: center;
        width: 100%;
      }
      &__text--desc {
        text-align: center;
        width: 100%;
      }
    }
  }
</style>
