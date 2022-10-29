<template>
	<u-popup
      :maskCloseAble="props.maskCloseAble"
      mode="bottom"
      :popup="false"
      v-model="props.modelValue"
      length="auto"
      :safeAreaInsetBottom="props.safeAreaInsetBottom"
      @close="close"
      :z-index="uZIndex"
  >
		<view class="u-datetime-picker">
			<view
          class="u-picker-header"
          @touchmove.stop.prevent=""
      >
				<view
            class="u-btn-picker u-btn-picker--tips"
            :style="{ color: props.cancelColor }"
            hover-class="u-opacity"
            :hover-stay-time="150"
            @tap="getResult('cancel')"
				>
          {{ props.cancelText }}
        </view>
				<view class="u-picker__title">
          {{ props.title }}
        </view>
				<view
					class="u-btn-picker u-btn-picker--primary"
					:style="{ color: state.moving ? props.cancelColor : props.confirmColor }"
					hover-class="u-opacity"
					:hover-stay-time="150"
					@touchmove.stop=""
					@tap.stop="getResult('confirm')"
				>
					{{ props.confirmText }}
				</view>
			</view>
			<view class="u-picker-body">
				<picker-view
            v-if="props.mode == 'region'"
            :value="state.valueArr"
            @change="change"
            class="u-picker-view"
            @pickstart="pickstart"
            @pickend="pickend"
        >
					<picker-view-column v-if="!state.reset && props.params.province">
						<view
                class="u-column-item"
                v-for="(item, index) in state.provinces"
                :key="index"
            >
							<view class="u-line-1">
                {{ item.label }}
              </view>
						</view>
					</picker-view-column>
					<picker-view-column
              v-if="!state.reset && props.params.city"
          >
						<view
                class="u-column-item"
                v-for="(item, index) in state.citys"
                :key="index"
            >
							<view class="u-line-1">{{ item.label }}</view>
						</view>
					</picker-view-column>
					<picker-view-column
              v-if="!state.reset && props.params.area"
          >
						<view
                class="u-column-item"
                v-for="(item, index) in state.areas"
                :key="index"
            >
							<view class="u-line-1">
                {{ item.label }}
              </view>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view
            v-else-if="props.mode == 'time'"
            :value="state.valueArr"
            @change="change"
            class="u-picker-view"
            @pickstart="pickstart"
            @pickend="pickend"
        >
					<picker-view-column v-if="!state.reset && props.params.year">
						<view
                class="u-column-item"
                v-for="(item, index) in state.years"
                :key="index"
            >
							{{ item }}
							<text class="u-text" v-if="props.showTimeTag">年</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!state.reset && props.params.month">
						<view
                class="u-column-item"
                v-for="(item, index) in state.months"
                :key="index"
            >
							{{ formatNumber(item) }}
							<text class="u-text" v-if="props.showTimeTag">月</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!state.reset && props.params.day">
						<view
                class="u-column-item"
                v-for="(item, index) in state.days"
                :key="index"
            >
							{{ formatNumber(item) }}
							<text class="u-text" v-if="props.showTimeTag">日</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!state.reset && props.params.hour">
						<view
                class="u-column-item"
                v-for="(item, index) in state.hours"
                :key="index"
            >
							{{ formatNumber(item) }}
							<text class="u-text" v-if="props.showTimeTag">时</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!state.reset && props.params.minute">
						<view
                class="u-column-item"
                v-for="(item, index) in state.minutes"
                :key="index"
            >
							{{ formatNumber(item) }}
							<text class="u-text" v-if="props.showTimeTag">分</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!state.reset && props.params.second">
						<view
                class="u-column-item"
                v-for="(item, index) in state.seconds"
                :key="index"
            >
							{{ formatNumber(item) }}
							<text class="u-text" v-if="props.showTimeTag">秒</text>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view
            v-else-if="props.mode == 'selector'"
            :value="state.valueArr"
            @change="change"
            class="u-picker-view"
            @pickstart="pickstart"
            @pickend="pickend"
        >
					<picker-view-column v-if="!state.reset">
						<view
                class="u-column-item"
                v-for="(item, index) in props.range"
                :key="index"
            >
							<view class="u-line-1">
                {{ getItemValue(item, 'selector') }}
              </view>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view
            v-else-if="props.mode == 'multiSelector'"
            :value="state.valueArr"
            @change="change"
            class="u-picker-view"
            @pickstart="pickstart"
            @pickend="pickend"
        >
					<picker-view-column
              v-if="!state.reset"
              v-for="(item, index) in props.range"
              :key="index"
          >
						<view
                class="u-column-item"
                v-for="(item1, index1) in item"
                :key="index1"
            >
							<view class="u-line-1">
                {{ getItemValue(item1, 'multiSelector') }}
              </view>
						</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</u-popup>
</template>

<script lang="ts">
  export default {
    name: 'u-picker',
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
  import provinces from '../../libs/util/province';
  import citys from '../../libs/util/city';
  import areas from '../../libs/util/area';
  import { useComposable } from '../../libs/hooks';

  /**
   * picker picker弹出选择器
   * @description 此选择器有两种弹出模式：一是时间模式，可以配置年，日，月，时，分，秒参数 二是地区模式，可以配置省，市，区参数
   * @tutorial https://www.uviewui.com/components/picker.html
   * @property {Object} params 需要显示的参数，见官网说明
   * @property {String} mode 模式选择，region-地区类型，time-时间类型（默认time）
   * @property {String Number} start-year 可选的开始年份，mode=time时有效（默认1950）
   * @property {String Number} end-year 可选的结束年份，mode=time时有效（默认2050）
   * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配（默认false）
   * @property {Boolean} show-time-tag 时间模式时，是否显示后面的年月日中文提示
   * @property {String} cancel-color 取消按钮的颜色（默认#606266）
   * @property {String} confirm-color 确认按钮的颜色（默认#2979ff）
   * @property {String} default-time 默认选中的时间，mode=time时有效
   * @property {String} confirm-text 确认按钮的文字
   * @property {String} cancel-text 取消按钮的文字
   * @property {String} default-region 默认选中的地区，中文形式，mode=region时有效
   * @property {String} default-code 默认选中的地区，编号形式，mode=region时有效
   * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭Picker（默认true）
   * @property {String Number} z-index 弹出时的z-index值（默认1075）
   * @property {Array} default-selector 数组形式，其中每一项表示选择了range对应项中的第几个
   * @property {Array} range 自定义选择的数据，mode=selector或mode=multiSelector时有效
   * @property {String} range-key 当range参数的元素为对象时，指定Object中的哪个key的值作为选择器显示内容
   * @event {Function} confirm 点击确定按钮，返回当前选择的值
   * @event {Function} cancel 点击取消按钮，返回当前选择的值
   * @example <u-picker v-model="show" mode="time"></u-picker>
   */
  interface IRegionProps {
    label: string;
    value: string;
  }
  interface ITimeMode {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    hour?: number | string;
    minute?: number | string;
    second?: number | string;
    timestamp?: number | string;
  }
  interface IRegionMode {
    province?: IRegionProps;
    city?: IRegionProps;
    area?: IRegionProps;
  }
  interface IResultMode extends ITimeMode, IRegionMode {
  }
  interface UPickerState {
    years: string[] | number[];
    months: string[] | number[];
    days: string[] | number[];
    hours: string[] | number[];
    minutes: string[] | number[];
    seconds: string[] | number[];
    year: number | string;
    month: number | string;
    day: number | string;
    hour: number | string;
    minute: number | string;
    second: number | string;
    reset: boolean;
    startDate: string;
    endDate: string;
    valueArr: number[];
    provinces: IRegionProps[];
    citys: IRegionProps[];
    areas: IRegionProps[];
    province: number;
    city: number;
    area: number;
    moving: boolean; // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
  }
  interface UPickerParams {
    year?: boolean;
    month?: boolean;
    day?: boolean;
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
    province?: boolean;
    city?: boolean;
    area?: boolean;
    timestamp?: boolean;
  }
  interface RangeItem {
    id: string | number;
    [key: string]: string;
  }
  interface UPickerProps {
    // picker中需要显示的参数
    params?: UPickerParams;
    // 当mode=selector或者mode=multiSelector时，提供的数组
    range?: RangeItem[];
    // 当mode=selector或者mode=multiSelector时，提供的默认选中的下标
    defaultSelector?: number[];
    // 当 range 是一个 Array＜Object＞ 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
    rangeKey?: string;
    // 模式选择，region-地区类型，time-时间类型，selector-单列模式，multiSelector-多列模式
    mode?: 'region' | 'time' | 'selector' | 'multiSelector';
    // 年份开始时间
    startYear?: number | string;
    // 年份结束时间
    endYear?: number | string;
    // "取消"按钮的颜色
    cancelColor?: string;
    // "确定"按钮的颜色
    confirmColor?: string;
    // 默认显示的时间，2025-07-02 || 2025-07-02 13:01:00 || 2025/07/02
    defaultTime?: string;
    // 默认显示的地区，可传类似["河北省", "秦皇岛市", "北戴河区"]
    defaultRegion?: string[];
    // 时间模式时，是否显示后面的年月日中文提示
    showTimeTag?: boolean;
    // 默认显示地区的编码，defaultRegion和areaCode同时存在，areaCode优先，可传类似["13", "1303", "130304"]
    areaCode?: string[] | number[];
    safeAreaInsetBottom?: boolean;
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble?: boolean;
    // 通过双向绑定控制组件的弹出与收起
    modelValue: boolean;
    // 弹出的z-index值
    zIndex?: number | string;
    // 顶部标题
    title?: string;
    // 取消按钮的文字
    cancelText?: string;
    // 确认按钮的文字
    confirmText?:string;
  }

  const props = withDefaults(defineProps<UPickerProps>(),{
    // picker中需要显示的参数
    params: () => {
      return {
        year: true,
        month: true,
        day: true,
        hour: false,
        minute: false,
        second: false,
        province: true,
        city: true,
        area: true,
        timestamp: true,
      }
    },
    // 当mode=selector或者mode=multiSelector时，提供的数组
    range: () => [],
    // 当mode=selector或者mode=multiSelector时，提供的默认选中的下标
    defaultSelector: () => [0],
    // 当 range 是一个 Array＜Object＞ 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
    rangeKey: '',
    // 模式选择，region-地区类型，time-时间类型，selector-单列模式，multiSelector-多列模式
    mode: 'time',
    // 年份开始时间
    startYear: 1950,
    // 年份结束时间
    endYear: 2050,
    // "取消"按钮的颜色
    cancelColor: '#606266',
    // "确定"按钮的颜色
    confirmColor: '#2979ff',
    // 默认显示的时间，2025-07-02 || 2025-07-02 13:01:00 || 2025/07/02
    defaultTime: '',
    // 默认显示的地区，可传类似["河北省", "秦皇岛市", "北戴河区"]
    defaultRegion: () => [],
    // 时间模式时，是否显示后面的年月日中文提示
    showTimeTag: true,
    // 默认显示地区的编码，defaultRegion和areaCode同时存在，areaCode优先，可传类似["13", "1303", "130304"]
    areaCode: () => [],
    safeAreaInsetBottom: false,
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble: true,
    // 通过双向绑定控制组件的弹出与收起
    modelValue: false,
    // 弹出的z-index值
    zIndex: 0,
    // 顶部标题
    title: '',
    // 取消按钮的文字
    cancelText: '取消',
    // 确认按钮的文字
    confirmText: '确认',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', isShow: boolean): void;
    (e: 'columnchange', obj: {
      column: number;
      index: number;
    }): void;
    (e: 'cancel', result: any): void;
    (e: 'confirm', result: any): void;
  }>();

  const { toast ,Z_INDEX_CONFIG } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UPickerState>({
    years: [],
    months: [],
    days: [],
    hours: [],
    minutes: [],
    seconds: [],
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    reset: false,
    startDate: '',
    endDate: '',
    valueArr: [],
    provinces: provinces,
    citys: citys[0],
    areas: areas[0][0],
    province: 0,
    city: 0,
    area: 0,
    moving: false // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
  });

  const propsChange = computed(() => {
    // 引用这几个变量，是为了监听其变化
    return `${props.mode}-${props.defaultTime}-${props.startYear}-${props.endYear}-${props.defaultRegion}-${props.areaCode}`;
  });

  const regionChange = computed(() => {
    // 引用这几个变量，是为了监听其变化
    return `${state.province}-${state.city}`;
  });

  const yearAndMonth = computed(() => {
    return `${state.year}-${state.month}`;
  });

  const uZIndex = computed(() => {
    // 如果用户有传递z-index值，优先使用
    return props.zIndex ? props.zIndex : Z_INDEX_CONFIG.popup;
  });

  // 标识滑动开始，只有微信小程序才有这样的事件
  const pickstart = () => {
    // #ifdef MP-WEIXIN
    state.moving = true;
    // #endif
  };

  // 标识滑动结束
  const pickend = () => {
    // #ifdef MP-WEIXIN
    state.moving = false;
    // #endif
  };

  // 对单列和多列形式的判断是否有传入变量的情况
  const getItemValue = (item: any, mode: string) => {
    // 目前(2020-05-25)uni-app对微信小程序编译有错误，导致v-if为false中的内容也执行，错误导致
    // 单列模式或者多列模式中的getItemValue同时被执行，故在这里再加一层判断
    if (props.mode == mode) {
      if (!props.rangeKey) {
        toast("请配置[rangeKey]");
        return;
      }
      return typeof item == 'object' ? item[props.rangeKey] : item;
    }
  };

  // 小于10前面补0，用于月份，日期，时分秒等
  const formatNumber = (num: number | string) => {
    return +num < 10 ? '0' + num : String(num);
  };

  // 生成递进的数组
  const generateArray = (start: number | string, end: number | string) => {
    // 转为数值格式，否则用户给end-year等传递字符串值时，下面的end+1会导致字符串拼接，而不是相加
    start = Number(start);
    end = Number(end);
    end = end > start ? end : start;
    // 生成数组，获取其中的索引，并剪出来
    return [...Array(end + 1).keys()].slice(start);
  };

  const getIndex = (arr: any[], val: string | number) => {
    let index = arr.indexOf(val);
    // 如果index为-1(即找不到index值)，~(-1)=-(-1)-1=0，导致条件不成立
    return ~index ? index : 0;
  };

  //日期时间处理
  const initTimeValue = () => {
    // 格式化时间，在IE浏览器(uni不存在此情况)，无法识别日期间的"-"间隔符号
    let fdate = props.defaultTime?.replace(/\-/g, '/');
    fdate = fdate && fdate.indexOf('/') == -1 ? `2020/01/01 ${fdate}` : fdate;
    let time = null;
    if (fdate) time = new Date(fdate);
    else time = new Date();
    // 获取年日月时分秒
    state.year = time.getFullYear();
    state.month = Number(time.getMonth()) + 1;
    state.day = time.getDate();
    state.hour = time.getHours();
    state.minute = time.getMinutes();
    state.second = time.getSeconds();
  };

  // 设置picker的某一列值
  const setYears = () => {
    // 获取年份集合
    state.years = generateArray(props.startYear, props.endYear);
    // 设置state.valueArr某一项的值，是为了让picker预选中某一个值
    state.valueArr.splice(state.valueArr.length - 1, 1, getIndex(state.years, state.year));
  };

  const setMonths = () => {
    state.months = generateArray(1, 12);
    state.valueArr.splice(state.valueArr.length - 1, 1, getIndex(state.months, state.month));
  };

  const setDays = () => {
    let totalDays = new Date(Number(state.year), Number(state.month), 0).getDate();
    state.days = generateArray(1, totalDays);
    let index = 0;
    // 这里不能使用类似setMonths()中的state.valueArr.splice(state.valueArr.length - 1, xxx)做法
    // 因为state.month和state.year变化时，会触发watch中的setDays()，导致state.valueArr.length计算有误
    if (props.params?.year && props.params?.month) index = 2;
    else if (props.params?.month) index = 1;
    else if (props.params?.year) index = 1;
    else index = 0;
    // 当月份变化时，会导致日期的天数也会变化，如果原来选的天数大于变化后的天数，则重置为变化后的最大值
    // 比如原来选中3月31日，调整为2月后，日期变为最大29，这时如果day值继续为31显然不合理，于是将其置为29(picker-column从1开始)
    if(state.day > state.days.length) state.day = state.days.length;
    state.valueArr.splice(index, 1, getIndex(state.days, state.day));
  };

  const setHours = () => {
    state.hours = generateArray(0, 23);
    state.valueArr.splice(state.valueArr.length - 1, 1, getIndex(state.hours, state.hour));
  };

  const setMinutes = () => {
    state.minutes = generateArray(0, 59);
    state.valueArr.splice(state.valueArr.length - 1, 1, getIndex(state.minutes, state.minute));
  };

  const setSeconds = () => {
    state.seconds = generateArray(0, 59);
    state.valueArr.splice(state.valueArr.length - 1, 1, getIndex(state.seconds, state.second));
  };

  const setProvinces = () => {
    // 判断是否需要province参数
    if (!props.params?.province) return;
    let tmp: number | string = '';
    let useCode = false;
    // 如果同时配置了defaultRegion和areaCode，优先使用areaCode参数
    if (props.areaCode?.length) {
      tmp = props.areaCode?.[0];
      useCode = true;
    } else if (props.defaultRegion?.length) tmp = props.defaultRegion?.[0];
    else tmp = 0;
    // 历遍省份数组匹配
    provinces.map((v: IRegionProps, k: number) => {
      if (useCode ? v.value == tmp : v.label == tmp) {
        tmp = k;
      }
    });
    state.province = Number(tmp);
    state.provinces = provinces;
    // 设置默认省份的值
    state.valueArr.splice(0, 1, Number(state.province));
  };

  const setCitys = () => {
    if (!props.params?.city) return;
    let tmp: number | string = '';
    let useCode = false;
    if (props.areaCode?.length) {
      tmp = props.areaCode?.[1];
      useCode = true;
    } else if (props.defaultRegion?.length) tmp = props.defaultRegion?.[1];
    else tmp = 0;
    citys[state.province].map((v: IRegionProps, k: number) => {
      if (useCode ? v.value == tmp : v.label == tmp) {
        tmp = k;
      }
    });
    state.city = Number(tmp);
    state.citys = citys[state.province];
    state.valueArr.splice(1, 1, Number(state.city));
  };

  const setAreas = () => {
    if (!props.params?.area) return;
    let tmp: number | string = '';
    let useCode = false;
    if (props.areaCode?.length) {
      tmp = props.areaCode[2];
      useCode = true;
    } else if (props.defaultRegion?.length) tmp = props.defaultRegion?.[2];
    else tmp = 0;
    areas[state.province][state.city].map((v: IRegionProps, k: number) => {
      if (useCode ? v.value == tmp : v.label == tmp) {
        tmp = k;
      }
    });
    state.area = Number(tmp);
    state.areas = areas[state.province][state.city];
    state.valueArr.splice(2, 1, Number(state.area));
  };

  const close = () => {
    emit('update:modelValue', false);
  };

  // 用户更改picker的列选项
  const change = (e: any) => {
    state.valueArr = e.detail.value;
    let i = 0;
    if (props.mode == 'time') {
      // 这里使用i++，是因为state.valueArr数组的长度是不确定长度的，它根据props.params的值来配置长度
      // 进入if规则，i会加1，保证了能获取准确的值
      if (props.params?.year) state.year = state.years[state.valueArr[i++]];
      if (props.params?.month) state.month = state.months[state.valueArr[i++]];
      if (props.params?.day) state.day = state.days[state.valueArr[i++]];
      if (props.params?.hour) state.hour = state.hours[state.valueArr[i++]];
      if (props.params?.minute) state.minute = state.minutes[state.valueArr[i++]];
      if (props.params?.second) state.second = state.seconds[state.valueArr[i++]];
    } else if (props.mode == 'region') {
      if (props.params?.province) state.province = state.valueArr[i++];
      if (props.params?.city) state.city = state.valueArr[i++];
      if (props.params?.area) state.area = state.valueArr[i++];
    } else if (props.mode == 'multiSelector') {
      let index = null;
      // 对比前后两个数组，寻找变更的是哪一列，如果某一个元素不同，即可判定该列发生了变化
      props.defaultSelector?.map((val: number, idx: number) => {
        if (val != e.detail.value[idx]) index = idx;
      });
      // 为了让用户对多列变化时，对动态设置其他列的变更
      if (index != null) {
        emit('columnchange', {
          column: index,
          index: e.detail.value[index]
        });
      }
    }
  };

  // 用户点击确定按钮
  const getResult = (eventName: "cancel" | "confirm") => {
    // #ifdef MP-WEIXIN
    if (state.moving) return;
    // #endif
    let result: IResultMode | number[] = {};
    // 只返回用户在props.params中配置了为true的字段
    if (props.mode == 'time') {
      if (props.params?.year) result.year = formatNumber(state.year || 0);
      if (props.params?.month) result.month = formatNumber(state.month || 0);
      if (props.params?.day) result.day = formatNumber(state.day || 0);
      if (props.params?.hour) result.hour = formatNumber(state.hour || 0);
      if (props.params?.minute) result.minute = formatNumber(state.minute || 0);
      if (props.params?.second) result.second = formatNumber(state.second || 0);
      if (props.params?.timestamp) result.timestamp = getTimestamp();
    } else if (props.mode == 'region') {
      if (props.params?.province) result.province = provinces[state.province];
      if (props.params?.city) result.city = citys[state.province][state.city];
      if (props.params?.area) result.area = areas[state.province][state.city][state.area];
    } else if (props.mode == 'selector') {
      result = state.valueArr;
    } else if (props.mode == 'multiSelector') {
      result = state.valueArr;
    }
    if (eventName) {
      emit(eventName, result);
    }
    close();
  };

  // 获取时间戳
  const getTimestamp = () => {
    // yyyy-mm-dd为安卓写法，不支持iOS，需要使用"/"分隔，才能二者兼容
    let time = state.year + '/' + state.month + '/' + state.day + ' ' + state.hour + ':' + state.minute + ':' + state.second;
    return new Date(time).getTime() / 1000;
  };

  const init = () => {
    state.valueArr = [];
    state.reset = false;
    if (props.mode == 'time') {
      initTimeValue();
      if (props.params?.year) {
        state.valueArr.push(0);
        setYears();
      }
      if (props.params?.month) {
        state.valueArr.push(0);
        setMonths();
      }
      if (props.params?.day) {
        state.valueArr.push(0);
        setDays();
      }
      if (props.params?.hour) {
        state.valueArr.push(0);
        setHours();
      }
      if (props.params?.minute) {
        state.valueArr.push(0);
        setMinutes();
      }
      if (props.params?.second) {
        state.valueArr.push(0);
        setSeconds();
      }
    } else if (props.mode == 'region') {
      if (props.params?.province) {
        state.valueArr.push(0);
        setProvinces();
      }
      if (props.params?.city) {
        state.valueArr.push(0);
        setCitys();
      }
      if (props.params?.area) {
        state.valueArr.push(0);
        setAreas();
      }
    } else if (props.mode == 'selector') {
      state.valueArr = props.defaultSelector || [];
    } else if (props.mode == 'multiSelector') {
      state.valueArr = props.defaultSelector || [];
      // this.multiSelectorValue = props.defaultSelector;
    }
    instance?.proxy?.$forceUpdate();
  };

  watch(() => propsChange.value, (newValue, oldValue) => {
    state.reset = true;
    setTimeout(() => init(), 10);
  });

  // 如果地区发生变化，为了让picker联动起来，必须重置state.citys和state.areas
  watch(() => regionChange.value, (newValue, oldValue) => {
    state.citys = citys[state.province];
    state.areas = areas[state.province][state.city];
  });

  // watch监听月份的变化，实时变更日的天数，因为不同月份，天数不一样
  // 一个月可能有30，31天，甚至闰年2月的29天，平年2月28天
  watch(() => yearAndMonth.value, (newValue, oldValue) => {
    if (props.params?.year) setDays();
  });

  // 微信和QQ小程序由于一些奇怪的原因(故同时对所有平台均初始化一遍)，需要重新初始化才能显示正确的值
  watch(() => props.modelValue, (newValue, oldValue) => {
    if (newValue) {
      state.reset = true;
      setTimeout(() => init(), 10);
    }
  });

  onMounted(() => {
    init();
  });

  defineExpose({
    ...toRefs(state),
    propsChange,
    regionChange,
    yearAndMonth,
    uZIndex,
    pickstart,
    pickend,
    getItemValue,
    formatNumber,
    generateArray,
    getIndex,
    initTimeValue,
    init,
    setYears,
    setMonths,
    setDays,
    setHours,
    setMinutes,
    setSeconds,
    setProvinces,
    setCitys,
    setAreas,
    close,
    change,
    getResult,
    getTimestamp,
  });
</script>

<style lang="scss" scoped>
  @import '../../libs/css/style.components.scss';

  .u-datetime-picker {
    position: relative;
    z-index: 999;
  }

  .u-picker-view {
    height: 100%;
    box-sizing: border-box;
  }

  .u-picker-header {
    width: 100%;
    height: 90rpx;
    padding: 0 40rpx;
    @include vue-flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    font-size: 30rpx;
    background: #fff;
    position: relative;
  }

  .u-picker-header::after {
    content: '';
    position: absolute;
    border-bottom: 1rpx solid #eaeef1;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    bottom: 0;
    right: 0;
    left: 0;
  }

  .u-picker__title {
    color: $u-content-color;
  }

  .u-picker-body {
    width: 100%;
    height: 500rpx;
    overflow: hidden;
    background-color: #fff;
  }

  .u-column-item {
    @include vue-flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: $u-main-color;
    padding: 0 8rpx;
  }

  .u-text {
    font-size: 24rpx;
    padding-left: 8rpx;
  }

  .u-btn-picker {
    padding: 16rpx;
    box-sizing: border-box;
    text-align: center;
    text-decoration: none;
  }

  .u-opacity {
    opacity: 0.5;
  }

  .u-btn-picker--primary {
    color: $u-type-primary;
  }

  .u-btn-picker--tips {
    color: $u-tips-color;
  }
</style>
