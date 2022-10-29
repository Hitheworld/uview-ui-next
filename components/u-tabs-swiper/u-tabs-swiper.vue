<template>
	<view
      class="u-tabs"
      :style="{
        zIndex: props.zIndex,
        background: props.bgColor
      }"
  >
		<scroll-view
        scroll-x
        class="u-scroll-view"
        :scroll-left="state.scrollLeft"
        scroll-with-animation
        :style="{ zIndex: props.zIndex + 1 }"
    >
			<view
          class="u-tabs-scroll-box"
          :class="{'u-tabs-scorll-flex': !props.isScroll}"
      >
				<view
            class="u-tabs-item"
            :style="[tabItemStyle(index)]"
            v-for="(item, index) in getTabs"
            :key="index"
            :class="[
                state.preId + index, { 'custom-active': index == getCurrent}
            ]"
            @tap="onEmit(index)"
        >
					<u-badge
              :count="item[props.count] || item['count'] || 0"
              :offset="props.offset"
              size="mini"
          ></u-badge>
					{{ item[name] || item['name']}}
				</view>
				<view
            v-if="props.showBar"
            class="u-scroll-bar"
            :style="[tabBarStyle]"
        ></view>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-tabs-swiper',
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
    CSSProperties, withDefaults
  } from "vue";
	import colorGradient from '../../libs/function/colorGradient';
	let color = colorGradient;
	const { windowWidth } = uni.getSystemInfoSync();
	const preId = 'UEl_';

	/**
	 * tabsSwiper 全屏选项卡
	 * @description 该组件内部实现主要依托于uniapp的scroll-view和swiper组件，主要特色是切换过程中，tabsSwiper文字的颜色可以渐变，底部滑块可以 跟随式滑动，活动tab滚动居中等。应用场景可以用于需要左右切换页面，比如商城的订单中心(待收货-待付款-待评价-已退货)等应用场景。
	 * @tutorial https://www.uviewui.com/components/tabsSwiper.html
	 * @property {Boolean} is-scroll tabs是否可以左右拖动（默认true）
	 * @property {Array} list 标签数组，元素为对象，如[{name: '推荐'}]
	 * @property {String Number} current 指定哪个tab为激活状态（默认0）
	 * @property {String Number} height 导航栏的高度，单位rpx（默认80）
	 * @property {String Number} font-size tab文字大小，单位rpx（默认30）
	 * @property {String Number} swiper-width tabs组件外部swiper的宽度，默认为屏幕宽度，单位rpx（默认750）
	 * @property {String} active-color 滑块和激活tab文字的颜色（默认#2979ff）
	 * @property {String} inactive-color tabs文字颜色（默认#303133）
	 * @property {String Number} bar-width 滑块宽度，单位rpx（默认40）
	 * @property {String Number} bar-height 滑块高度，单位rpx（默认6）
	 * @property {Object} bar-style 底部滑块的样式，对象形式
	 * @property {Object} active-item-style 活动tabs item的样式，对象形式
	 * @property {Boolean} show-bar 是否显示底部的滑块（默认true）
	 * @property {String Number} gutter 单个tab标签的左右内边距之和，单位rpx（默认40）
	 * @property {String} bg-color tabs导航栏的背景颜色（默认#ffffff）
	 * @property {String} name 组件内部读取的list参数中的属性名，见官网说明（默认name）
	 * @property {String} count 组件内部读取的list参数中的属性名（badge徽标数），同name属性的使用，见官网说明（默认count）
	 * @property {Array} offset 设置badge徽标数的位置偏移，格式为 [x, y]，也即设置的为top和right的值，单位rpx（默认[5, 20]）
	 * @property {Boolean} bold 激活选项的字体是否加粗（默认true）
	 * @event {Function} change 点击标签时触发
	 * @example <u-tabs-swiper ref="tabs" :list="list" :is-scroll="false"></u-tabs-swiper>
	 */

	interface ITabQueryInfo {

	}
	interface ITabsInfo {
    // itemColor: string | any;
		color: string | any;
		left: number;
		width: number;
	}
	interface IColorGradientArr {

	}
	interface UTabsSwiperState {
		scrollLeft: number; // 滚动scroll-view的左边滚动距离
		tabQueryInfo: ITabQueryInfo[]; // 存放对tab菜单查询后的节点信息
		windowWidth: number; // 屏幕宽度，单位为px
		//scrollBarLeft: number; // 移动bar需要通过translateX()移动的距离
		animationFinishCurrent: number;
		componentsWidth: number;
		line3AddDx: number;
		line3Dx: number;
		preId: string;
		sW: number;
		tabsInfo: ITabsInfo[];
		colorGradientArr: IColorGradientArr[];
		colorStep: number; // 两个颜色之间的渐变等分
	}
  interface TabsSwiperItem {
    name: string;
    count?: number | string;
    offset?: number[] | string[];
  }
  interface UTabsSwiperProps {
    // 导航菜单是否需要滚动，如只有2或者3个的时候，就不需要滚动了，此时使用flex平分tab的宽度
    isScroll?: boolean;
    //需循环的标签列表
    list: TabsSwiperItem[];
    // 当前活动tab的索引
    current: number | string;
    // 导航栏的高度和行高，单位rpx
    height?: number | string;
    // 字体大小，单位rpx
    fontSize?: number | string;
    // 过渡动画时长, 单位s
    // duration: number | string;
    // line3生效, 外部swiper的宽度, 单位rpx
    swiperWidth?: number | string;
    // 选中项的主题颜色
    activeColor?: string;
    // 未选中项的颜色
    inactiveColor?: string;
    // itemColor?: string;
    // 选中项的主题颜色
    activeBgColor?: string;
    // 未选中项的颜色
    inactiveBgColor?: string;
    // 菜单底部移动的bar的宽度，单位rpx
    barWidth?: number | string;
    // 移动bar的高度
    barHeight?: number | string;
    // 单个tab的左或右内边距（各占一半），单位rpx
    gutter?: number | string;
    // 如果是绝对定位，添加z-index值
    zIndex?: number | string;
    // 导航栏的背景颜色
    bgColor?: string;
    //滚动至中心目标类型
    autoCenterMode?: string;
    // 读取传入的数组对象的属性(tab名称)
    name?: string;
    // 读取传入的数组对象的属性(徽标数)
    count?: string;
    // 徽标数位置偏移
    offset?: number[];
    // 活动tab字体是否加粗
    bold?: boolean;
    // 当前活动tab item的样式
    activeItemStyle?: CSSProperties;
    // 是否显示底部的滑块
    showBar?: boolean;
    // 底部滑块的自定义样式
    barStyle?: CSSProperties;
  }
  const props = withDefaults(defineProps<UTabsSwiperProps>(),{
    // 导航菜单是否需要滚动，如只有2或者3个的时候，就不需要滚动了，此时使用flex平分tab的宽度
    isScroll: true,
    //需循环的标签列表
    list: () => [],
    // 当前活动tab的索引
    current: 0,
    // 导航栏的高度和行高，单位rpx
    height: 80,
    // 字体大小，单位rpx
    fontSize: 30,
    // 过渡动画时长, 单位s
    // duration: {
    // 	type: [Number, String],
    // 	default: 0.5
    // },
    swiperWidth: 750,
    // 选中项的主题颜色
    activeColor: '#2979ff',
    // 未选中项的颜色
    inactiveColor: '#303133',
    // itemColor: 'transparent',
    // 选中项的主题颜色
    // activeBgColor: '',
    // 未选中项的颜色
    // inactiveBgColor: '',
    // 菜单底部移动的bar的宽度，单位rpx
    barWidth: 40,
    // 移动bar的高度
    barHeight: 6,
    // 单个tab的左或右内边距（各占一半），单位rpx
    gutter: 40,
    // 如果是绝对定位，添加z-index值
    zIndex: 1,
    // 导航栏的背景颜色
    bgColor: '#ffffff',
    //滚动至中心目标类型
    autoCenterMode: 'window',
    // 读取传入的数组对象的属性(tab名称)
    name: 'name',
    // 读取传入的数组对象的属性(徽标数)
    count: 'count',
    // 徽标数位置偏移
    offset: () => [5, 20],
    // 活动tab字体是否加粗
    bold: true,
    // 当前活动tab item的样式
    activeItemStyle: () => {
      return {}
    },
    // 是否显示底部的滑块
    showBar: true,
    // 底部滑块的自定义样式
    barStyle: () => {
      return {}
    }
  });

  const emit = defineEmits<{
    (e: 'change', index: string | number): void;
  }>();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UTabsSwiperState>({
    scrollLeft: 0, // 滚动scroll-view的左边滚动距离
    tabQueryInfo: [], // 存放对tab菜单查询后的节点信息
    windowWidth: 0, // 屏幕宽度，单位为px
    //scrollBarLeft: 0, // 移动bar需要通过translateX()移动的距离
    animationFinishCurrent: Number(props.current),
    componentsWidth: 0,
    line3AddDx: 0,
    line3Dx: 0,
    preId,
    sW: 0,
    tabsInfo: [],
    colorGradientArr: [],
    colorStep: 100 // 两个颜色之间的渐变等分
  });

  // 获取当前活跃的current值
  const getCurrent = computed(() => {
    const current = Number(props.current);
    // 判断是否超出边界
    if (current > getTabs.value.length - 1) {
      return getTabs.value.length - 1;
    }
    if (current < 0) return 0;
    return current;
  });

  const getTabs = computed(() => {
    return props.list;
  });

  // 滑块需要移动的距离
  const scrollBarLeft = computed(() => {
    return Number(state.line3Dx) + Number(state.line3AddDx);
  });

  // 滑块的宽度转为px单位
  const barWidthPx = computed(() => {
    return uni.upx2px(Number(props.barWidth));
  });

  // tab的样式
  const tabItemStyle = computed(() => {
    return (index: number) => {
      let style = {
        height: props.height + 'rpx',
        lineHeight: props.height + 'rpx',
        padding: `0 ${Number(props.gutter) / 2}rpx`,
        color: state.tabsInfo.length > 0 ? (state.tabsInfo[index] ? state.tabsInfo[index].color : props.activeColor) : props.inactiveColor,
        fontSize: props.fontSize + 'rpx',
        zIndex: Number(props.zIndex) + 2,
        fontWeight: (index == getCurrent.value && props.bold) ? 'bold' : 'normal',
        // background: (state.tabsInfo.length > 0) ? (state.tabsInfo[index] ? state.tabsInfo[index].itemColor :
        //     props.activeBgColor) : props.inactiveBgColor,
      };
      if(index == getCurrent.value) {
        // 给选中的tab item添加外部自定义的样式
        style = Object.assign(style, props.activeItemStyle);
      }
      return style;
    }
  });

  // 底部滑块的样式
  const tabBarStyle = computed(() => {
    let style = {
      width: barWidthPx.value + 'px',
      height: props.barHeight + 'rpx',
      borderRadius: '100px',
      backgroundColor: props.activeColor,
      left: scrollBarLeft.value + 'px'
    };
    return Object.assign(style, props.barStyle);
  });

  // 获取各个tab的节点信息
  const getTabsInfo = () => {
    return new Promise<void>((resolve, reject) => {
      const view = uni.createSelectorQuery().in(instance?.proxy);
      for (let i = 0; i < props.list.length; i++) {
        view.select('.' + preId + i).boundingClientRect(() => {});
      }
      view.exec((res: ITabsInfo[]) => {
        const arr = [];
        for (let i = 0; i < res.length; i++) {
          // 给每个tab添加其文字颜色属性
          res[i].color = props.inactiveColor;
          // res[i].itemColor = props.inactiveBgColor;
          // 当前tab直接赋予activeColor
          if (i == getCurrent.value) {
            res[i].color = props.activeColor
            // res[i].itemColor = props.activeBgColor
          }
          arr.push(res[i]);
        }
        state.tabsInfo = arr;
        resolve();
      });
    })
  };

  // 当swiper滑动结束，计算滑块最终要停留的位置
  const countLine3Dx = () => {
    const tab = state.tabsInfo[state.animationFinishCurrent];
    // 让滑块中心点和当前tab中心重合
    if (tab) state.line3Dx = tab.left + tab.width / 2 - barWidthPx.value / 2 - state.tabsInfo[0].left;
  };

  const countPx = () => {
    // swiper宽度由rpx转为px单位，因为dx等，都是px单位
    state.sW = uni.upx2px(Number(props.swiperWidth));
  };

  const onEmit = (index: number | string) => {
    emit('change', index);
  };

  const change = () => {
    setScrollViewToCenter();
  };

  const getQuery = (cb: (res: any) => void) => {
    try {
      const view = uni.createSelectorQuery().in(instance?.proxy).select('.u-tabs');
      view.fields({
            size: true
          }, (data: any) => {
            if (data) {
              state.componentsWidth = data.width;
              if (cb && typeof cb === 'function') cb(data);
            } else {
              getQuery(cb);
            }
          }
      ).exec();
    } catch (e) {
      state.componentsWidth = windowWidth;
    }
  };

  // 把活动tab移动到屏幕中心点
  const setScrollViewToCenter = () => {
    let tab;
    tab = state.tabsInfo[state.animationFinishCurrent];
    if (tab) {
      let tabCenter = tab.left + tab.width / 2;
      let fatherWidth;
      // 活动tab移动到中心时，以屏幕还是tab组件为宽度为基准
      if (props.autoCenterMode === 'window') {
        fatherWidth = windowWidth;
      } else {
        fatherWidth = state.componentsWidth;
      }
      state.scrollLeft = tabCenter - fatherWidth / 2;
    }
  };

  const setDx = (dx: number) => {
    let nextTabIndex = dx > 0 ? state.animationFinishCurrent + 1 : state.animationFinishCurrent - 1;
    // 判断索引是否超出边界
    nextTabIndex = nextTabIndex <= 0 ? 0 : nextTabIndex;
    nextTabIndex = nextTabIndex >= props.list.length ? props.list.length - 1 : nextTabIndex;
    const tab = state.tabsInfo[nextTabIndex];
    // 当前tab中心点x轴坐标
    let nowTab = state.tabsInfo[state.animationFinishCurrent];
    let nowTabX = nowTab?.left + nowTab?.width / 2;
    // 下一个tab
    let nextTab = state.tabsInfo[nextTabIndex];
    let nextTabX = nextTab?.left + nextTab?.width / 2;
    // 两个tab之间的距离，因为下一个tab可能在当前tab的左边或者右边，取绝对值即可
    let distanceX = Math.abs(nextTabX - nowTabX);
    state.line3AddDx = (dx / state.sW) * distanceX;
    setTabColor(state.animationFinishCurrent, nextTabIndex, dx);
  };

  // 设置tab的颜色
  const setTabColor = (nowTabIndex: number, nextTabIndex: number, dx: number) => {
    let colorIndex = Math.abs(Math.ceil((dx / state.sW) * 100));
    let colorLength = state.colorGradientArr.length;
    // 处理超出索引边界的情况
    colorIndex = colorIndex >= colorLength ? colorLength - 1 : colorIndex <= 0 ? 0 : colorIndex;
    // 设置下一个tab的颜色
    if (state.tabsInfo?.length) {
      state.tabsInfo[nextTabIndex].color = state.colorGradientArr[colorIndex];
      // state.tabsInfo[nextTabIndex].itemColor = state.colorGradientArr[colorIndex];
      // 设置当前tab的颜色
      state.tabsInfo[nowTabIndex].color = state.colorGradientArr[colorLength - 1 - colorIndex];
      // state.tabsInfo[nowTabIndex].itemColor = state.colorGradientArr[colorLength - 1 - colorIndex];
    }
  };

  // swiper结束滑动
  const setFinishCurrent = (current: number) => {
    // 如果滑动的索引不一致，修改tab颜色变化，因为可能会有直接点击tab的情况
    state.tabsInfo.map((val: ITabsInfo, index: number) => {
      if (current == index) {
        val.color = props.activeColor;
        // val.itemColor = props.activeBgColor;
      } else {
        val.color = props.inactiveColor;
        // val.itemColor = props.inactiveBgColor;
      }
      return val;
    });
    state.line3AddDx = 0;
    state.animationFinishCurrent = current;
    countLine3Dx();
  };

  const init = async () => {
    countPx();
    await getTabsInfo();
    countLine3Dx();
    getQuery(() => {
      setScrollViewToCenter();
    });
    // 颜色渐变过程数组
    state.colorGradientArr = color.colorGradient(props.inactiveColor, props.activeColor, state.colorStep);
    state.colorGradientArr = color.colorGradient(props.inactiveBgColor, props.activeBgColor, state.colorStep);
  };

  watch(() => props.current, (newValue, oldValue) => {
    change();
    setFinishCurrent(Number(newValue));
  });

  watch(() => props.list, (newValue, oldValue) => {
    nextTick(() => {
      init();
    });
  });

  onMounted(() => {
    init();
  });

  defineExpose({
    ...toRefs(state),
    getCurrent,
    getTabs,
    scrollBarLeft,
    barWidthPx,
    tabItemStyle,
    tabBarStyle,
    getTabsInfo,
    countLine3Dx,
    countPx,
    onEmit,
    change,
    getQuery,
    setScrollViewToCenter,
    setDx,
    setTabColor,
    setFinishCurrent,
    init,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	view,
	scroll-view {
		box-sizing: border-box;
	}

	.u-tabs {
		width: 100%;
		transition-property: background-color, color;
	}

	/* #ifndef APP-NVUE */
	::-webkit-scrollbar,
	::-webkit-scrollbar,
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}
	/* #endif */

	/* #ifdef H5 */
	// 通过样式穿透，隐藏H5下，scroll-view下的滚动条
	scroll-view ::v-deep ::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	/* #endif */

	.u-scroll-view {
		width: 100%;
		white-space: nowrap;
		position: relative;
	}

	.u-tabs-scroll-box {
		position: relative;
	}

	.u-tabs-scorll-flex {
		@include vue-flex;
		justify-content: space-between;
	}

	.u-tabs-scorll-flex .u-tabs-item {
		flex: 1;
	}

	.u-tabs-item {
		position: relative;
		display: inline-block;
		text-align: center;
		transition-property: background-color, color, font-weight;
	}

	.content {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.boxStyle {
		pointer-events: none;
		position: absolute;
		transition-property: all;
	}

	.boxStyle2 {
		pointer-events: none;
		position: absolute;
		bottom: 0;
		transition-property: all;
		transform: translateY(-100%);
	}

	.itemBackgroundBox {
		pointer-events: none;
		position: absolute;
		top: 0;
		transition-property: left, background-color;
		@include vue-flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.itemBackground {
		height: 100%;
		width: 100%;
		transition-property: all;
	}

	.u-scroll-bar {
		position: absolute;
		bottom: 4rpx;
	}
</style>
