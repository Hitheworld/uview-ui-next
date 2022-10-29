<template>
	<view
      class="u-subsection"
      :style="[subsectionStyle]"
  >
		<view
        class="u-item u-line-1"
        :style="[itemStyle(index)]"
        @tap="click(index)"
        :class="[noBorderRight(index), 'u-item-' + index]"
        v-for="(item, index) in state.listInfo"
        :key="index"
    >
			<view
          :style="[textStyle(index)]"
          class="u-item-text u-line-1"
      >
        {{ item.name }}
      </view>
		</view>
		<view
        class="u-item-bg"
        :style="[itemBarStyle]"
    ></view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-subsection',
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
    onMounted,
    withDefaults
  } from "vue";
	/**
	 * subsection 分段器
	 * @description 该分段器一般用于用户从几个选项中选择某一个的场景
	 * @tutorial https://www.uviewui.com/components/subsection.html
	 * @property {Array} list 选项的数组，形式见上方"基本使用"
	 * @property {String Number} current 初始化时默认选中的选项索引值（默认0）
	 * @property {String} active-color 激活时的颜色，mode为subsection时固定为白色（默认#303133）
	 * @property {String} inactive-color 未激活时字体的颜色，mode为subsection时无效（默认#606266）
	 * @property {String} mode 模式选择，见官网"模式选择"说明（默认button）
	 * @property {String Number} font-size 字体大小，单位rpx（默认28）
	 * @property {String Number} height 组件高度，单位rpx（默认70）
	 * @property {Boolean} animation 是否开启动画效果，见上方说明（默认true）
	 * @property {Boolean} bold 激活选项的字体是否加粗（默认true）
	 * @property {String} bg-color 组件背景颜色，mode为button时有效（默认#eeeeef）
	 * @property {String} button-color 按钮背景颜色，mode为button时有效（默认#ffffff）
	 * @event {Function} change 分段器选项发生改变时触发
	 * @example <u-subsection active-color="#ff9900"></u-subsection>
	 */
  interface IListInfoProps {
    name: string;
    width: number;
  }
  interface IItemBgStyleProps {
    width: number | string;
    left: number | string;
    backgroundColor: string;
    height: string | number;
    transition: string;
    borderRadius?: number | string;
  }
  interface USubsectionState {
    listInfo: IListInfoProps[];
    itemBgStyle: IItemBgStyleProps;
    currentIndex: number | string;
    buttonPadding: number; // mode = button 时，组件的内边距
    borderRadius: number; // 圆角值
    firstTimeVibrateShort: boolean; // 组件初始化时，会触发current变化，此时不应震动
  }
  interface SubsectionItem {
    name: string;
  }
  interface USubsectionProps {
    // tab的数据
    list: SubsectionItem[];
    // 当前活动的tab的index
    current: number | string;
    // 激活的颜色
    activeColor?: string;
    // 未激活的颜色
    inactiveColor?: string;
    // 模式选择，mode=button为按钮形式，mode=subsection时为分段模式
    mode?: 'button' | 'subsection';
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 是否开启动画效果
    animation?: boolean;
    // 组件的高度，单位rpx
    height?: number | string;
    // 激活tab的字体是否加粗
    bold?: boolean;
    // mode=button时，组件背景颜色
    bgColor?: string;
    // mode = button时，滑块背景颜色
    buttonColor?: string;
    // 在切换分段器的时候，是否让设备震一下
    vibrateShort?: boolean;
  }

  const props = withDefaults(defineProps<USubsectionProps>(),{
    // tab的数据
    list: () => [],
    // 当前活动的tab的index
    current: 0,
    // 激活的颜色
    activeColor: '#303133',
    // 未激活的颜色
    inactiveColor: '#606266',
    // 模式选择，mode=button为按钮形式，mode=subsection时为分段模式
    mode: 'button',
    // 字体大小，单位rpx
    fontSize: 28,
    // 是否开启动画效果
    animation: true,
    // 组件的高度，单位rpx
    height: 70,
    // 激活tab的字体是否加粗
    bold: true,
    // mode=button时，组件背景颜色
    bgColor: '#eeeeef',
    // mode = button时，滑块背景颜色
    buttonColor: '#ffffff',
    // 在切换分段器的时候，是否让设备震一下
    vibrateShort: false,
  });

  const emit = defineEmits<{
    (e: 'change', index: number): void;
  }>();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<USubsectionState>({
    listInfo: [],
    itemBgStyle: {
      width: 0,
      left: 0,
      backgroundColor: '#ffffff',
      height: '100%',
      transition: ''
    },
    currentIndex: props.current,
    buttonPadding: 3, // mode = button 时，组件的内边距
    borderRadius: 5, // 圆角值
    firstTimeVibrateShort: true // 组件初始化时，会触发current变化，此时不应震动
  });

  // 设置mode=subsection时，滑块特有的样式
  const noBorderRight = computed(() => {
    return (index: number) => {
      if (props.mode != 'subsection') return;
      let classs = '';
      // 不显示右边的边框
      if (index < props.list.length - 1) classs += ' u-none-border-right';
      // 显示整个组件的左右边圆角
      if (index == 0) classs += ' u-item-first';
      if (index == props.list.length - 1) classs += ' u-item-last';
      return classs;
    };
  });

  // 文字的样式
  const textStyle = computed(() => {
    return (index: number) => {
      let style: CSSProperties = {};
      // 设置字体颜色
      if (props.mode == 'subsection') {
        if (index == state.currentIndex) {
          style.color = '#ffffff';
        } else {
          style.color = props.activeColor;
        }
      } else {
        if (index == state.currentIndex) {
          style.color = props.activeColor;
        } else {
          style.color = props.inactiveColor;
        }
      }
      // 字体加粗
      if (index == state.currentIndex && props.bold) style.fontWeight = 'bold';
      // 文字大小
      style.fontSize = props.fontSize + 'rpx';
      return style;
    };
  });

  // 每个分段器item的样式
  const itemStyle = computed(() => {
    return (index: number) => {
      let style: CSSProperties = {};
      if (props.mode == 'subsection') {
        // 设置border的样式
        style.borderColor = props.activeColor;
        style.borderWidth = '1px';
        style.borderStyle = 'solid';
      }
      return style;
    };
  });

  // mode=button时，外层view的样式
  const subsectionStyle = computed(() => {
    let style: CSSProperties = {};
    style.height = uni.upx2px(Number(props.height)) + 'px';
    if (props.mode == 'button') {
      style.backgroundColor = props.bgColor;
      style.padding = `${state.buttonPadding}px`;
      style.borderRadius = `${state.borderRadius}px`;
    }
    return style;
  });

  // 滑块的样式
  const itemBarStyle = computed(() => {
    let style: CSSProperties = {};
    style.backgroundColor = props.activeColor;
    style.zIndex = 1;
    if (props.mode == 'button') {
      style.backgroundColor = props.buttonColor;
      style.borderRadius = `${state.borderRadius}px`;
      style.bottom = `${state.buttonPadding}px`;
      style.height = uni.upx2px(Number(props.height)) - state.buttonPadding * 2 + 'px';
      style.zIndex = 0;
    }
    return Object.assign(state.itemBgStyle, style);
  });

  const init = () => {
    // 将list的数据，传入listInfo数组，因为不能修改props传递的list值
    // 可以接受直接数组形式，或者数组元素为对象的形式，如：['简介', '评论'],或者[{name: '简介'}, {name: '评论'}]
    state.listInfo = props.list.map((val: any, index: number) => {
      if (typeof val != 'object') {
        let obj = {
          width: 0,
          name: val
        };
        return obj;
      } else {
        val.width = 0;
        return val;
      }
    });
  };

  const itemBgLeft = () => {
    // 根据是否开启动画效果，
    if (props.animation) {
      state.itemBgStyle.transition = 'all 0.35s';
    } else {
      state.itemBgStyle.transition = 'all 0s';
    }
    let left = 0;
    // 计算当前活跃item到组件左边的距离
    state.listInfo.map((val, index) => {
      if (index < state.currentIndex) left += val.width;
    });
    // 根据mode不同模式，计算滑块需要移动的距离
    if (props.mode == 'subsection') {
      state.itemBgStyle.left = left + 'px';
    } else if (props.mode == 'button') {
      state.itemBgStyle.left = left + state.buttonPadding + 'px';
    }
  };

  // 改变滑块的样式
  const changeSectionStatus = (nVal: number) => {
    if (props.mode == 'subsection') {
      // 根据滑块在最左边和最右边时，显示左边和右边的圆角
      if (nVal == props.list.length - 1) {
        state.itemBgStyle.borderRadius = `0 ${state.buttonPadding}px ${state.buttonPadding}px 0`;
      }
      if (nVal == 0) {
        state.itemBgStyle.borderRadius = `${state.buttonPadding}px 0 0 ${state.buttonPadding}px`;
      }
      if (nVal > 0 && nVal < props.list.length - 1) {
        state.itemBgStyle.borderRadius = '0';
      }
    }
    // 更新滑块的位置
    setTimeout(() => {
      itemBgLeft();
    }, 10);
    if (props.vibrateShort && !state.firstTimeVibrateShort) {
      // 使手机产生短促震动，微信小程序有效，APP(HX 2.6.8)和H5无效
      // #ifndef H5
      uni.vibrateShort({});
      // #endif
    }
    // 第一次过后，设置firstTimeVibrateShort为false，让其下一次可以震动(如果允许震动的话)
    state.firstTimeVibrateShort = false;
  };

  const click = (index: number) => {
    // 不允许点击当前激活选项
    if (index == state.currentIndex) return;
    state.currentIndex = index;
    changeSectionStatus(index);
    emit('change', Number(index));
  };

  // 获取各个tab的节点信息
  const getTabsInfo = () => {
    let view = uni.createSelectorQuery().in(instance?.proxy);
    for (let i = 0; i < props.list.length; i++) {
      view.select('.u-item-' + i).boundingClientRect(() => {});
    }
    view.exec((res: any) => {
      if (!res.length) {
        setTimeout(() => {
          getTabsInfo();
          return;
        }, 10);
      }
      // 将分段器每个item的宽度，放入listInfo数组
      res.map((val: any, index: number) => {
        state.listInfo[index].width = val.width;
      });
      // 初始化滑块的宽度
      if (props.mode == 'subsection') {
        state.itemBgStyle.width = state.listInfo[0].width + 'px';
      } else if (props.mode == 'button') {
        state.itemBgStyle.width = state.listInfo[0].width + 'px';
      }
      // 初始化滑块的位置
      itemBgLeft();
    });
  };

  init();

  watch(() => props.current, (newValue, oldValue) => {
    state.currentIndex = newValue;
    changeSectionStatus(Number(newValue));
  }, {
    immediate: true,
  });

  watch(() => props.list, (newValue, oldValue) => {
    init();
  });

  onMounted(() => {
    setTimeout(() => {
      getTabsInfo();
    }, 10);
  });

  defineExpose({
    ...toRefs(state),
    noBorderRight,
    textStyle,
    itemStyle,
    subsectionStyle,
    itemBarStyle,
    itemBgLeft,
    changeSectionStatus,
    click,
    getTabsInfo,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-subsection {
		@include vue-flex;
		align-items: center;
		overflow: hidden;
		position: relative;
	}

	.u-item {
		flex: 1;
		text-align: center;
		font-size: 26rpx;
		height: 100%;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		color: $u-main-color;
		padding: 0 6rpx;
	}

	.u-item-bg {
		background-color: $u-type-primary;
		position: absolute;
		z-index: -1;
	}

	.u-none-border-right {
		border-right: none !important;
	}

	.u-item-first {
		border-top-left-radius: 8rpx;
		border-bottom-left-radius: 8rpx;
	}

	.u-item-last {
		border-top-right-radius: 8rpx;
		border-bottom-right-radius: 8rpx;
	}

	.u-item-text {
		transition: all 0.35s;
		color: $u-main-color;
		@include vue-flex;
		align-items: center;
		position: relative;
		z-index: 3;
	}
</style>
