<template>
	<view
      class="u-rate"
      :id="state.elId"
      @touchmove.stop.prevent="touchMove"
  >
		<view
        class="u-star-wrap"
        v-for="(item, index) in props.count"
        :key="index"
        :class="[state.elClass]"
    >
			<u-icon
				:name="state.activeIndex > index ? elActiveIcon : props.inactiveIcon"
				@click="click(index + 1, $event)"
				:color="state.activeIndex > index ? elActiveColor : props.inactiveColor"
				:custom-style="customStyle"
				:custom-prefix="props.customPrefix"
				:show-decimal-icon="props.disabled && state.activeIndex == index"
				:percent="decimal"
				:inactive-color="props.inactiveColor"
			></u-icon>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-rate',
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
   onMounted,
   withDefaults
 } from "vue";
 import { useComposable } from '../../libs/hooks';
  /**
   * rate 评分
   * @description 该组件一般用于满意度调查，星型评分的场景
   * @tutorial https://www.uviewui.com/components/rate.html
   * @property {String Number} count 最多可选的星星数量（默认5）
   * @property {String Number} current 默认选中的星星数量（默认0）
   * @property {Boolean} disabled 是否禁止用户操作（默认false）
   * @property {String Number} size 星星的大小，单位rpx（默认32）
   * @property {String} inactive-color 未选中星星的颜色（默认#b2b2b2）
   * @property {String} active-color 选中的星星颜色（默认#FA3534）
   * @property {String} active-icon 选中时的图标名，只能为uView的内置图标（默认star-fill）
   * @property {String} inactive-icon 未选中时的图标名，只能为uView的内置图标（默认star）
   * @property {String} gutter 星星之间的距离（默认10）
   * @property {String Number} min-count 最少选中星星的个数（默认0）
   * @property {Boolean} allow-half 是否允许半星选择（默认false）
   * @event {Function} change 选中的星星发生变化时触发
   * @example <u-rate :count="count" :current="2"></u-rate>
   */
  interface URateState {
    elId: string | number;
    elClass: string | number;
    starBoxLeft: number; // 评分盒子左边到屏幕左边的距离，用于滑动选择时计算距离
    // 当前激活的星星的index，如果存在value，优先使用value，因为它可以双向绑定(1.4.5新增)
    activeIndex: number;
    starWidth: number; // 每个星星的宽度
    starWidthArr: number[]; // 每个星星最右边到组件盒子最左边的距离
  }
  interface URateProps {
    // 用于v-model双向绑定选中的星星数量
    // 1.4.5版新增
    modelValue: number;
    // 要显示的星星数量
    count?: number | string;
    // 当前需要默认选中的星星(选中的个数)
    // 1.4.5后通过value双向绑定，不再建议使用此参数
    current?: number;
    // 是否不可选中
    disabled?: boolean;
    // 星星的大小，单位rpx
    size?: number | string;
    // 未选中时的颜色
    inactiveColor?: string;
    // 选中的颜色
    activeColor?: string;
    // 星星之间的间距，单位rpx
    gutter?: number | string;
    // 最少能选择的星星个数
    minCount?: number | string;
    // 是否允许半星(功能尚未实现)
    allowHalf?: boolean;
    // 选中时的图标(星星)
    activeIcon?: string;
    // 未选中时的图标(星星)
    inactiveIcon?: string;
    // 自定义扩展前缀，方便用户扩展自己的图标库
    customPrefix?: string;
    colors?: any[];
    icons?: any[];
  }

  const props = withDefaults(defineProps<URateProps>(),{
    // 用于v-model双向绑定选中的星星数量
    // 1.4.5版新增
    modelValue: -1,
    // 要显示的星星数量
    count: 5,
    // 当前需要默认选中的星星(选中的个数)
    // 1.4.5后通过value双向绑定，不再建议使用此参数
    current: 0,
    // 是否不可选中
    disabled: false,
    // 星星的大小，单位rpx
    size: 32,
    // 未选中时的颜色
    inactiveColor: '#b2b2b2',
    // 选中的颜色
    activeColor: '#FA3534',
    // 星星之间的间距，单位rpx
    gutter: 10,
    // 最少能选择的星星个数
    minCount: 0,
    // 是否允许半星(功能尚未实现)
    allowHalf: false,
    // 选中时的图标(星星)
    activeIcon: 'star-fill',
    // 未选中时的图标(星星)
    inactiveIcon: 'star',
    // 自定义扩展前缀，方便用户扩展自己的图标库
    customPrefix: 'uicon',
    colors: () => [],
    icons: () => [],
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', activeIndex: number): void;
    (e: 'change', activeIndex: number): void;
  }>();

  const { guid } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<URateState>({
    // 生成一个唯一id，否则一个页面多个评分组件，会造成冲突
    elId: guid(),
    elClass: guid(),
    starBoxLeft: 0, // 评分盒子左边到屏幕左边的距离，用于滑动选择时计算距离
    // 当前激活的星星的index，如果存在value，优先使用value，因为它可以双向绑定(1.4.5新增)
    activeIndex: props.modelValue != -1 ? props.modelValue : (props.current || 0),
    starWidth: 0, // 每个星星的宽度
    starWidthArr: [], // 每个星星最右边到组件盒子最左边的距离
  });

  const customStyle = computed(() => {
    return {
      fontSize: props.size + 'rpx',
      padding: `0 ${Number(props.gutter) / 2 + 'rpx'}`
    }
  });

  const decimal = computed(() => {
    if (props.disabled) {
      return state.activeIndex * 100 % 100;
    } else if (props.allowHalf) {
      return 50;
    }
  });

  const elActiveIcon = computed(() => {
    const len = props.icons?.length;
    // 此处规则类似于下方的elActiveColor参数，都是根据一定的规则，显示不同的图标
    // 结果可能如此：icons参数传递了3个图标，当选中两个时，用第一个图标，4个时，用第二个图标
    // 第三个时，用第三个图标作为激活的图标
    if (len && len <= Number(props.count)) {
      const step = Math.round(state.activeIndex / Math.round(Number(props.count) / len));
      if (step < 1 && props.icons) return props.icons[0];
      if (step > len && props.icons) return props.icons[len - 1];
      return props.icons && props.icons[step - 1];
    }
    return props.activeIcon;
  });

  const elActiveColor = computed(() => {
    const len = props.colors?.length
    // 如果有设置colors参数(此参数用于将图标分段，比如一共5颗星，colors传3个颜色值，那么根据一定的规则，2颗星可能为第一个颜色
    // 4颗星为第二个颜色值，5颗星为第三个颜色值)
    if (len && len <= (props.count || 0)) {
      const step = Math.round(state.activeIndex / Math.round(Number(props.count) / len));
      if (step < 1) return props.colors[0];
      if (step > len) return props.colors[len - 1];
      return props.colors[step - 1];
    }
    return props.activeColor;
  });

  const getRect = (selector: string, all: boolean = false) => {
    return new Promise(resolve => {
      uni.createSelectorQuery().
      in(instance?.proxy)[all ? 'selectAll' : 'select'](selector)
          .boundingClientRect(rect => {
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect);
            }
          })
          .exec();
    });
  };

  // 获取评分组件盒子的布局信息
  const getElRectById = async () => {
    // uView封装的获取节点的方法，详见文档
    await getRect('#' + state.elId).then((res: any) => {
      state.starBoxLeft = res.left;
    });
  };

  // 获取单个星星的尺寸
  const getElRectByClass = async () => {
    // uView封装的获取节点的方法，详见文档
    await getRect('.' + state.elClass).then((res: any) => {
      state.starWidth = res.width;
      // 把每个星星右边到组件盒子左边的距离放入数组中
      for (let i = 0; i < Number(props.count); i++) {
        state.starWidthArr[i] = (i + 1) * state.starWidth;
      }
    })
  };

  // 发出事件
  const emitEvent = () => {
    // 发出change事件
    emit('change', state.activeIndex);
    // 同时修改双向绑定的value的值
    if (props.modelValue != -1) {
      emit('update:modelValue', state.activeIndex);
    }
  };

  // 手指滑动
  const touchMove = (e: any) => {
    if (props.disabled) {
      return;
    }
    if (!e.changedTouches[0]) {
      return;
    }
    const movePageX = e.changedTouches[0].pageX;
    // 滑动点相对于评分盒子左边的距离
    const distance = movePageX - state.starBoxLeft;

    // 如果滑动到了评分盒子的左边界，就设置为0星
    if (distance <= 0) {
      state.activeIndex = 0;
    }
    // 滑动的距离，相当于多少颗星星
    let index = Math.ceil(distance / state.starWidth);
    state.activeIndex = index > Number(props.count) ? Number(props.count) : index;
    // 对最少颗星星的限制
    if (state.activeIndex < Number(props.minCount) && props.minCount) {
      state.activeIndex = Number(props.minCount);
    }
    emitEvent();
  };

  // 通过点击，直接选中
  const click = (index: number, e: any) => {
    if (props.disabled) {
      return
    }
    // 半星选择，尚未实现
    if (props.allowHalf) {
    }
    // 对第一个星星特殊处理，只有一个的时候，点击可以取消，否则无法作0星评价
    if (index == 1) {
      if (state.activeIndex == 1) {
        state.activeIndex = 0;
      } else {
        state.activeIndex = 1;
      }
    } else {
      state.activeIndex = index;
    }
    // 对最少颗星星的限制
    if (state.activeIndex < Number(props.minCount)) {
      state.activeIndex = Number(props.minCount);
    }
    emitEvent()
  };

  const showDecimalIcon = computed((index: number) => {
    return props.disabled && Number(state.activeIndex) == index;
  });

  watch(() => props.current, (newValue, oldValue) => {
    state.activeIndex = Number(newValue);
  });

  watch(() => props.modelValue, (newValue, oldValue) => {
    state.activeIndex = newValue;
  });

  onMounted(() => {
    getElRectById();
    getElRectByClass();
  });

  defineExpose({
    ...toRefs(state),
    customStyle,
    decimal,
    elActiveIcon,
    elActiveColor,
    getElRectById,
    getElRectByClass,
    touchMove,
    click,
    emitEvent,
    showDecimalIcon,
  });
</script>

<style scoped lang="scss">
  @import "../../libs/css/style.components.scss";

  .u-rate {
    display: -webkit-inline-flex;
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 0;
  }

  .u-icon {
    box-sizing: border-box;
  }
</style>
