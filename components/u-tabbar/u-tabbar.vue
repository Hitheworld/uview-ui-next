<template>
	<view
      v-if="props.show"
      class="u-tabbar"
      @touchmove.stop.prevent="() => {}"
  >
		<view
        class="u-tabbar__content safe-area-inset-bottom"
        :style="{
          height: addUnit(props.height),
          backgroundColor: props.bgColor,
        }"
        :class="{
          'u-border-top': props.borderTop
        }"
    >
			<view
          class="u-tabbar__content__item"
          v-for="(item, index) in props.list"
          :key="index"
          :class="{
            'u-tabbar__content__circle': props.midButton && item.midButton
          }"
          @tap.stop="clickHandler(index)"
          :style="{
            backgroundColor: item.activeColor || props.bgColor
          }"
      >
				<view
            :class="[
              props.midButton && item.midButton ?
                'u-tabbar__content__circle__button' :
                'u-tabbar__content__item__button'
            ]"
        >
					<u-icon
						:size="props.midButton && item.midButton ? props.midButtonSize : (item.iconSize || props.iconSize)"
						:name="elIconPath(index)"
						img-mode="scaleToFill"
						:color="elColor(index)"
						:custom-prefix="item.customIcon ? 'custom-icon' : 'uicon'"
					></u-icon>
					<u-badge
              :count="item.count"
              :is-dot="item.isDot"
              v-if="item.count || item.isDot"
              :offset="[-2, getOffsetRight(item.count, item.isDot)]"
					></u-badge>
				</view>
				<view
            class="u-tabbar__content__item__text"
            :style="{
              color: elColor(index)
            }"
        >
					<text class="u-line-1">
            {{ item.text }}
          </text>
				</view>
			</view>
			<view
          v-if="props.midButton"
          class="u-tabbar__content__circle__border"
          :class="{
            'u-border': props.borderTop,
          }"
          :style="{
            backgroundColor: props.bgColor,
            left: state.midButtonLeft
          }"
      >
			</view>
		</view>
		<!-- 这里加上一个48rpx的高度,是为了增高有凸起按钮时的防塌陷高度(也即按钮凸出来部分的高度) -->
		<view
        class="u-fixed-placeholder safe-area-inset-bottom"
        :style="{
          height: `calc(${addUnit(props.height)} + ${props.midButton ? 48 : 0}rpx)`,
        }"
    ></view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-tabbar',
  }
</script>

<script setup lang="ts">
  import { reactive, toRefs, computed, onMounted, withDefaults} from "vue";
  import { useComposable } from '../../libs/hooks';

  interface UTabbarState {
    midButtonLeft: string; // 由于安卓太菜了，通过css居中凸起按钮的外层元素有误差，故通过js计算将其居中
    pageUrl: string; // 当前页面URL
  }
  interface TabbarItem {
    // 非凸起按钮未激活的图标，可以是uView内置图标名或自定义扩展图标库的图标
    // 或者png图标的【绝对路径】，建议尺寸为80px * 80px
    // 如果是中间凸起的按钮，只能使用图片，且建议为120px * 120px的png图片
    iconPath: string;
    // 激活(选中)的图标，同上
    selectedIconPath: string;
    // 显示的提示文字
    text: string;
    // 红色角标显示的数字，如果需要移除角标，配置此参数为0即可
    count?: number;
    // 如果配置此值为true，那么角标将会以红点的形式显示
    isDot?: boolean;
    // 如果使用自定义扩展的图标库字体，需配置此值为true
    // 自定义字体图标库教程：https://www.uviewui.com/guide/customIcon.html
    customIcon?: boolean;
    // 如果是凸起按钮项，需配置此值为true
    midButton?: boolean;
    // 点击某一个item时，跳转的路径，此路径必须是pagees.json中tabBar字段中定义的路径
    pagePath?: string; // 1.5.6新增，路径需要以"/"开头
  }
  interface UTabbarProps {
    // 显示与否
    show?: boolean;
    // 通过v-model绑定current值
    modelValue: number | string;
    isNonNative?: boolean;
    // 整个tabbar的背景颜色
    bgColor?: string;
    // tabbar的高度，默认50px，单位任意，如果为数值，则为rpx单位
    height?: number | string;
    // 非凸起图标的大小，单位任意，数值默认rpx
    iconSize?: number | string;
    // 凸起的图标的大小，单位任意，数值默认rpx
    midButtonSize?: number | string;
    // 激活时的演示，包括字体图标，提示文字等的演示
    activeColor?: string;
    // 未激活时的颜色
    inactiveColor?: string;
    // 是否显示中部的凸起按钮
    midButton?: boolean;
    // 配置参数
    list: TabbarItem[];
    // 切换前的回调
    beforeSwitch?: Function | null;
    // 是否显示顶部的横线
    borderTop?: boolean;
    // 是否隐藏原生tabbar
    hideTabBar?: boolean;
  }

  const props = withDefaults(defineProps<UTabbarProps>(),{
    // 显示与否
    show: true,
    // 通过v-model绑定current值
    modelValue: 0,
    isNonNative: false,
    // 整个tabbar的背景颜色
    bgColor: '#ffffff',
    // tabbar的高度，默认50px，单位任意，如果为数值，则为rpx单位
    height: '50px',
    // 非凸起图标的大小，单位任意，数值默认rpx
    iconSize: 40,
    // 凸起的图标的大小，单位任意，数值默认rpx
    midButtonSize: 90,
    // 激活时的演示，包括字体图标，提示文字等的演示
    activeColor: '#303133',
    // 未激活时的颜色
    inactiveColor: '#606266',
    // 是否显示中部的凸起按钮
    midButton: false,
    // 配置参数
    list: () => [],
    // 切换前的回调
    beforeSwitch: null,
    // 是否显示顶部的横线
    borderTop: true,
    // 是否隐藏原生tabbar
    hideTabBar: true,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', index: number | string): void;
    (e: 'change', index: string | number): void;
  }>();

  const { $parentUtil, sys, addUnit } = useComposable();

  const state = reactive<UTabbarState>({
    midButtonLeft: '50%', // 由于安卓太菜了，通过css居中凸起按钮的外层元素有误差，故通过js计算将其居中
    pageUrl: '', // 当前页面URL
  });

  // 是否隐藏原生tabbar
  if(props.hideTabBar) {
    uni.hideTabBar();
  }
  // 获取引入了u-tabbar页面的路由地址，该地址没有路径前面的"/"
  let pages: Array<Page.PageInstance<any>> = getCurrentPages();
  // 页面栈中的最后一个即为项为当前页面，route属性为页面路径
  if (pages?.length) {
    state.pageUrl = pages?.[pages?.length - 1]?.route || '';
  }

  const elIconPath = computed(() => {
    return (index: number) => {
      // 历遍u-tabbar的每一项item时，判断是否传入了pagePath参数，如果传入了
      // 和data中的pageUrl参数对比，如果相等，即可判断当前的item对应当前的tabbar页面，设置高亮图标
      // 采用这个方法，可以无需使用v-model绑定的value值
      let pagePath = props.list[index].pagePath;
      // 如果定义了pagePath属性，意味着使用系统自带tabbar方案，否则使用一个页面用几个组件模拟tabbar页面的方案
      // 这两个方案对处理tabbar item的激活与否方式不一样
      if(pagePath) {
        if(pagePath == state.pageUrl || pagePath == '/' + state.pageUrl) {
          return props.list[index].selectedIconPath;
        } else {
          return props.list[index].iconPath;
        }
      } else {
        // 普通方案中，索引等于v-model值时，即为激活项
        return index == props.modelValue ? props.list[index].selectedIconPath : props.list[index].iconPath
      }
    }
  });

  const elColor = computed(() => {
    return (index: number) => {
      // 判断方法同理于elIconPath
      let pagePath = props.list[index].pagePath;
      if(pagePath) {
        if(pagePath == state.pageUrl || pagePath == '/' + state.pageUrl) return props.activeColor;
        else return props.inactiveColor;
      } else {
        return index == props.modelValue ? props.activeColor : props.inactiveColor;
      }
    }
  });

  // 切换tab
  const switchTab = (index: number) => {
    // 发出事件和修改v-model绑定的值
    emit('change', index);
    // 如果有配置pagePath属性，使用uni.switchTab进行跳转
    if(props.list?.[index]?.pagePath) {
      if (props.isNonNative) {
        uni.navigateTo({
          url: props?.list?.[index]?.pagePath || '',
        });
      } else {
        uni.switchTab({
          url: props.list[index].pagePath || '',
        });
      }
    } else {
      // 如果配置了papgePath属性，将不会双向绑定v-model传入的value值
      // 因为这个模式下，不再需要v-model绑定的value值了，而是通过getCurrentPages()适配
      emit('update:modelValue', index);
    }
  };

  const clickHandler = async (index: number) => {
    if(props.beforeSwitch && typeof(props.beforeSwitch) === 'function') {
      // 执行回调，同时传入索引当作参数
      // 在微信，支付宝等环境(H5正常)，会导致父组件定义的customBack()函数体中的this变成子组件的this
      // 通过bind()方法，绑定父组件的this，让this.customBack()的this为父组件的上下文
      // let beforeSwitch = props.beforeSwitch.bind($parentUtil('u-tabbar'))(index);
      let beforeSwitch = props.beforeSwitch($parentUtil('u-tabbar')?.proxy)(index);
      // 判断是否返回了promise
      if (!!beforeSwitch && typeof beforeSwitch.then === 'function') {
        await beforeSwitch.then((res: any) => {
          // promise返回成功，
          switchTab(index);
        }).catch((err: any) => {
          console.error(err);
        })
      } else if(beforeSwitch === true) {
        // 如果返回true
        switchTab(index);
      }
    } else {
      switchTab(index);
    }
  };

  // 计算角标的right值
  const getOffsetRight = (count: number, isDot: boolean) => {
    // 点类型，count大于9(两位数)，分别设置不同的right值，避免位置太挤
    if(isDot) {
      return -20;
    } else if(count > 9) {
      return -40;
    } else {
      return -30;
    }
  };

  // 获取凸起按钮外层元素的left值，让其水平居中
  const getMidButtonLeft = ()  => {
    let windowWidth = sys().windowWidth;
    // 由于安卓中css计算left: 50%的结果不准确，故用js计算
    state.midButtonLeft = (windowWidth / 2) + 'px';
  };

  onMounted(() => {
    props.midButton && getMidButtonLeft();
  });

  defineExpose({
    ...toRefs(state),
    elIconPath,
    elColor,
    clickHandler,
    switchTab,
    getOffsetRight,
    getMidButtonLeft,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";
	.u-fixed-placeholder {
		/* #ifndef APP-NVUE */
		box-sizing: content-box;
		/* #endif */
	}

	.u-tabbar {
		position: relative;
		z-index: 99999;
		&__content {
			@include vue-flex;
			align-items: center;
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			z-index: 998;
			/* #ifndef APP-NVUE */
			box-sizing: content-box;
			/* #endif */

			&__circle__border {
				border-radius: 100%;
				width: 110rpx;
				height: 110rpx;
				top: -48rpx;
				position: absolute;
				z-index: 4;
				background-color: #ffffff;
				// 由于安卓的无能，导致只有3个tabbar item时，此css计算方式有误差
				// 故使用js计算的形式来定位，此处不注释，是因为js计算有延后，避免出现位置闪动
				left: 50%;
				transform: translateX(-50%);

				&:after {
					border-radius: 100px;
				}
			}

			&__item {
				flex: 1;
				@include vue-flex;
				justify-content: center;
				flex-direction: column;
				align-items: center;
				position: relative;
        z-index: 9;

				&__button {
          position: relative;
				}

				&__text {
					color: $u-content-color;
					font-size: 24rpx;
					line-height: 24rpx;
					width: 100%;
					text-align: center;
				}
			}

			&__circle {
				position: relative;
				@include vue-flex;
				flex-direction: column;
				justify-content: space-between;
				z-index: 10;
				/* #ifndef APP-NVUE */
				height: calc(100% - 1px);
				/* #endif */

				&__button {
					width: 90rpx;
					height: 90rpx;
					border-radius: 100%;
					@include vue-flex;
					justify-content: center;
					align-items: center;
					position: absolute;
					background-color: #ffffff;
					top: -40rpx;
					left: 50%;
					z-index: 6;
					transform: translateX(-50%);
				}
			}
		}
	}
</style>
