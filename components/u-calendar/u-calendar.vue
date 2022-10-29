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
      :border-radius="props.borderRadius"
      :closeable="props.closeable"
  >
		<view class="u-calendar">
			<view class="u-calendar__header">
				<view
            class="u-calendar__header__text"
            v-if="!tooltipSlot"
        >
					{{ props.toolTip }}
				</view>
				<slot v-else name="tooltip" />
			</view>
			<view class="u-calendar__action u-flex u-row-center">
				<view class="u-calendar__action__icon">
					<u-icon
              v-if="props.changeYear"
              name="arrow-left-double"
              :color="props.yearArrowColor"
              @click="changeYearHandler(0)"
          />
				</view>
				<view class="u-calendar__action__icon">
					<u-icon
              v-if="props.changeMonth"
              name="arrow-left"
              :color="props.monthArrowColor"
              @click="changeMonthHandler(0)"
          />
				</view>
				<view class="u-calendar__action__text">
          {{ state.showTitle }}
        </view>
				<view class="u-calendar__action__icon">
					<u-icon
              v-if="props.changeMonth"
              name="arrow-right"
              :color="props.monthArrowColor"
              @click="changeMonthHandler(1)"
          />
				</view>
				<view class="u-calendar__action__icon">
					<u-icon
              v-if="props.changeYear"
              name="arrow-right-double"
              :color="props.yearArrowColor"
              @click="changeYearHandler(1)"
          />
				</view>
			</view>
			<view class="u-calendar__week-day">
				<view
            class="u-calendar__week-day__text"
            v-for="(item, index) in state.weekDayZh"
            :key="index"
        >
          {{item}}
        </view>
			</view>
			<view class="u-calendar__content">
				<!-- 前置空白部分 -->
				<block
            v-for="(item, index) in state.weekdayArr"
            :key="index"
        >
					<view class="u-calendar__content__item"></view>
				</block>
				<view
            class="u-calendar__content__item"
            :class="{
              'u-hover-class':openDisAbled(state.year, state.month,index+1),
              'u-calendar__content--start-date': (
                  props.mode == 'range' && state.startDate==`${state.year}-${state.month}-${index+1}`) ||
                  props.mode== 'date',
              'u-calendar__content--end-date':(
                  props.mode== 'range' && state.endDate==`${state.year}-${state.month}-${index+1}`
                  ) ||
                  props.mode == 'date'
            }"
            :style="{
              backgroundColor: getColor(index,1)
            }"
            v-for="(item, index) in state.daysArr"
            :key="index"
            @tap="dateClick(index)"
        >
					<view
              class="u-calendar__content__item__inner"
              :style="{color: getColor(index,2)}"
          >
						<view>{{ index + 1 }}</view>
					</view>
					<view
              class="u-calendar__content__item__tips"
              :style="{color: props.activeColor}"
              v-if="props.mode == 'range' &&
                state.startDate ==`${state.year}-${state.month}-${index+1}` &&
                state.startDate != state.endDate"
          >
            {{ props.startText }}
          </view>
					<view
              class="u-calendar__content__item__tips"
              :style="{color: props.activeColor}"
              v-if="props.mode== 'range' && state.endDate==`${state.year}-${state.month}-${index+1}`"
          >
            {{ props.endText }}
          </view>
				</view>
				<view class="u-calendar__content__bg-month">
          {{ state.month }}
        </view>
			</view>
			<view class="u-calendar__bottom">
				<view class="u-calendar__bottom__choose">
					<text>
            {{ props.mode == 'date' ? state.activeDate : state.startDate }}
          </text>
					<text v-if="state.endDate">至{{ state.endDate }}</text>
				</view>
				<view class="u-calendar__bottom__btn">
					<u-button
              :type="props.btnType"
              shape="circle"
              size="default"
              @click="btnFix(false)"
          >
            确定
          </u-button>
				</view>
			</view>
		</view>
	</u-popup>
</template>

<script lang="ts">
  export default {
    name: 'u-calendar',
  }
</script>

<script setup lang="ts">
  import { computed, reactive, toRefs, watch, useSlots } from 'vue';
  import { useComposable } from '../../libs/hooks';
	/**
	 * calendar 日历
	 * @description 此组件用于单个选择日期，范围选择日期等，日历被包裹在底部弹起的容器中。
	 * @tutorial http://uviewui.com/components/calendar.html
	 * @property {String} mode 选择日期的模式，date-为单个日期，range-为选择日期范围
	 * @property {Boolean} v-model 布尔值变量，用于控制日历的弹出与收起
	 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配(默认false)
	 * @property {Boolean} change-year 是否显示顶部的切换年份方向的按钮(默认true)
	 * @property {Boolean} change-month 是否显示顶部的切换月份方向的按钮(默认true)
	 * @property {String Number} max-year 可切换的最大年份(默认2050)
	 * @property {String Number} min-year 可切换的最小年份(默认1950)
	 * @property {String Number} min-date 最小可选日期(默认1950-01-01)
	 * @property {String Number} max-date 最大可选日期(默认当前日期)
	 * @property {String Number} 弹窗顶部左右两边的圆角值，单位rpx(默认20)
	 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭日历(默认true)
	 * @property {String} month-arrow-color 月份切换按钮箭头颜色(默认#606266)
	 * @property {String} year-arrow-color 年份切换按钮箭头颜色(默认#909399)
	 * @property {String} color 日期字体的默认颜色(默认#303133)
	 * @property {String} active-bg-color 起始/结束日期按钮的背景色(默认#2979ff)
	 * @property {String Number} z-index 弹出时的z-index值(默认10075)
	 * @property {String} active-color 起始/结束日期按钮的字体颜色(默认#ffffff)
	 * @property {String} range-bg-color 起始/结束日期之间的区域的背景颜色(默认rgba(41,121,255,0.13))
	 * @property {String} range-color 选择范围内字体颜色(默认#2979ff)
	 * @property {String} start-text 起始日期底部的提示文字(默认 '开始')
	 * @property {String} end-text 结束日期底部的提示文字(默认 '结束')
	 * @property {String} btn-type 底部确定按钮的主题(默认 'primary')
	 * @property {String} toolTip 顶部提示文字，如设置名为tooltip的slot，此参数将失效(默认 '选择日期')
	 * @property {Boolean} closeable 是否显示右上角的关闭图标(默认true)
	 * @example <u-calendar v-model="show" :mode="mode"></u-calendar>
	 */
  interface IDateProps { year: number | string; month: number | string; day: number | string; }
  interface UCalendarState {
    // 星期几,值为1-7
    weekday: number;
    weekdayArr: any[];
    // 当前月有多少天
    days: number;
    daysArr: any[];
    showTitle: string;
    year: number;
    month: number;
    day: number;
    startYear: number;
    startMonth: number;
    startDay: number;
    endYear: number;
    endMonth: number;
    endDay: number;
    today: string;
    activeDate: string;
    startDate: string;
    endDate: string;
    isStart: boolean;
    min: IDateProps | null;
    max: IDateProps | null;
    weekDayZh: string[]; // '日', '一', '二', '三', '四', '五', '六'[]
  }
  interface UCalendarChangeRangeProps {
    startYear: string;
    startMonth: string;
    startDay: string;
    startDate: string;
    startWeek: string;
    endYear: string;
    endMonth: string;
    endDay: string;
    endDate: string;
    endWeek: string;
  }
  interface UCalendarChangeDateProps {
    year: string;
    month: string;
    day: string;
    days: string;
    result: string;
    week: string;
    isToday: boolean;
  }
  type UCalendarChangeProps = UCalendarChangeRangeProps | UCalendarChangeDateProps;
  interface UCalendarProps {
    safeAreaInsetBottom?: boolean;
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble?: boolean;
    // 通过双向绑定控制组件的弹出与收起
    modelValue: boolean;
    // 弹出的z-index值
    zIndex?: string | number;
    // 是否允许切换年份
    changeYear?: boolean;
    // 是否允许切换月份
    changeMonth?: boolean;
    // date-单个日期选择，range-开始日期+结束日期选择
    mode?: 'date' | 'range';
    // 可切换的最大年份
    maxYear?: number | string;
    // 可切换的最小年份
    minYear?: number | string;
    // 最小可选日期(不在范围内日期禁用不可选)
    minDate?: number | string;
    /**
     * 最大可选日期
     * 默认最大值为今天，之后的日期不可选
     * 2030-12-31
     * */
    maxDate?: number | string;
    // 弹窗顶部左右两边的圆角值
    borderRadius?: number | string;
    // 月份切换按钮箭头颜色
    monthArrowColor?: string;
    // 年份切换按钮箭头颜色
    yearArrowColor?: string;
    // 默认日期字体颜色
    color?: string;
    // 选中|起始结束日期背景色
    activeBgColor?: string;
    // 选中|起始结束日期字体颜色
    activeColor?: string;
    // 范围内日期背景色
    rangeBgColor?: string;
    // 范围内日期字体颜色
    rangeColor?: string;
    // mode=range时生效，起始日期自定义文案
    startText?: string;
    // mode=range时生效，结束日期自定义文案
    endText?: string;
    //按钮样式类型
    btnType?: string;
    // 当前选中日期带选中效果
    isActiveCurrent?: boolean;
    // 切换年月是否触发事件 mode=date时生效
    isChange?: boolean;
    // 是否显示右上角的关闭图标
    closeable?: boolean;
    // 顶部的提示文字
    toolTip?: string;
  }

  const tooltipSlot = useSlots().tooltip;

  const props = withDefaults(defineProps<UCalendarProps>(),  {
    safeAreaInsetBottom: false,
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble: true,
    // 通过双向绑定控制组件的弹出与收起
    modelValue: false,
    // 弹出的z-index值
    zIndex: 0,
    // 是否允许切换年份
    changeYear: true,
    // 是否允许切换月份
    changeMonth: true,
    // date-单个日期选择，range-开始日期+结束日期选择
    mode: 'date',
    // 可切换的最大年份
    maxYear: 2050,
    // 可切换的最小年份
    minYear: 1950,
    // 最小可选日期(不在范围内日期禁用不可选)
    minDate: '1950-01-01',
    /**
     * 最大可选日期
     * 默认最大值为今天，之后的日期不可选
     * 2030-12-31
     * */
    maxDate: '',
    // 弹窗顶部左右两边的圆角值
    borderRadius: 20,
    // 月份切换按钮箭头颜色
    monthArrowColor: '#606266',
    // 年份切换按钮箭头颜色
    yearArrowColor: '#909399',
    // 默认日期字体颜色
    color: '#303133',
    // 选中|起始结束日期背景色
    activeBgColor: '#2979ff',
    // 选中|起始结束日期字体颜色
    activeColor: '#ffffff',
    // 范围内日期背景色
    rangeBgColor: 'rgba(41,121,255,0.13)',
    // 范围内日期字体颜色
    rangeColor: '#2979ff',
    // mode=range时生效，起始日期自定义文案
    startText: '开始',
    // mode=range时生效，结束日期自定义文案
    endText: '结束',
    //按钮样式类型
    btnType: 'primary',
    // 当前选中日期带选中效果
    isActiveCurrent: true,
    // 切换年月是否触发事件 mode=date时生效
    isChange: false,
    // 是否显示右上角的关闭图标
    closeable: true,
    // 顶部的提示文字
    toolTip: '选择日期',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', show: boolean): void;
    (e: 'change', result: UCalendarChangeProps): void;
  }>();

  const { Z_INDEX_CONFIG } = useComposable();

  const state = reactive<UCalendarState>({
    // 星期几,值为1-7
    weekday: 1,
    weekdayArr:[],
    // 当前月有多少天
    days: 0,
    daysArr:[],
    showTitle: '',
    year: 2020,
    month: 0,
    day: 0,
    startYear: 0,
    startMonth: 0,
    startDay: 0,
    endYear: 0,
    endMonth: 0,
    endDay: 0,
    today: '',
    activeDate: '',
    startDate: '',
    endDate: '',
    isStart: true,
    min: null,
    max: null,
    weekDayZh: ['日', '一', '二', '三', '四', '五', '六'],
  });

  const dataChange = computed(() => {
    return `${props.mode}-${props.minDate}-${props.maxDate}`;
  });

  const uZIndex = computed(() => {
    // 如果用户有传递z-index值，优先使用
    return props.zIndex ? props.zIndex : Z_INDEX_CONFIG.popup;
  });

  watch(() => dataChange, (newValue, oldValue) => {
    init();
  });

  const getColor = (index: number, type: number) => {
    let color = type == 1 ? '' : props.color;
    let day = index + 1;
    let date = `${state.year}-${state.month}-${day}`;
    let timestamp = new Date(date.replace(/\-/g, '/')).getTime();
    let start = state.startDate.replace(/\-/g, '/');
    let end = state.endDate.replace(/\-/g, '/');
    if ((props.isActiveCurrent && state.activeDate == date) || state.startDate == date || state.endDate == date) {
      color = type == 1 ? props.activeBgColor : props.activeColor;
    } else if (state.endDate && timestamp > new Date(start).getTime() && timestamp < new Date(end).getTime()) {
      color = type == 1 ? props.rangeBgColor : props.rangeColor;
    }
    return color;
  };

  // 一个月有多少天
  const getMonthDay = (year: number, month: number) => {
    const days = new Date(year, month, 0).getDate();
    return days;
  };

  const generateArray = (start: number, end: number) => {
    return Array.from(new Array(end + 1).keys()).slice(start);
  };

  const getWeekday = (year: number, month: number) => {
    let date = new Date(`${year}/${month}/01 00:00:00`);
    return date.getDay();
  };

  const close = () => {
    // 修改通过v-model绑定的父组件变量的值为false，从而隐藏日历弹窗
    emit('update:modelValue', false);
  };

  const formatNum = (num: number) => {
    return num < 10 ? '0' + num : num + '';
  };

  const getWeekText = (date: string) => {
    const newDate = new Date(`${date.replace(/\-/g, '/')} 00:00:00`);
    let week = newDate.getDay();
    return '星期' + ['日', '一', '二', '三', '四', '五', '六'][week];
  };

  const btnFix = (show: boolean) => {
    if (!show) {
      close();
    }
    if (props.mode == 'date') {
      let arr = state.activeDate.split('-')
      let year = props.isChange ? state.year : Number(arr[0]);
      let month = props.isChange ? state.month : Number(arr[1]);
      let day = props.isChange ? state.day : Number(arr[2]);
      //当前月有多少天
      let days = getMonthDay(year, month);
      let result = `${year}-${formatNum(month)}-${formatNum(day)}`;
      let weekText = getWeekText(result);
      let isToday = false;
      if (`${year}-${month}-${day}` == state.today) {
        //今天
        isToday = true;
      }
      emit('change', {
        year: year,
        month: month,
        day: day,
        days: days,
        result: result,
        week: weekText,
        isToday: isToday,
        // switch: show //是否是切换年月操作
      });
    } else {
      if (!state.startDate || !state.endDate) return;
      let startMonth = formatNum(state.startMonth);
      let startDay = formatNum(state.startDay);
      let startDate = `${state.startYear}-${startMonth}-${startDay}`;
      let startWeek = getWeekText(startDate)

      let endMonth = formatNum(state.endMonth);
      let endDay = formatNum(state.endDay);
      let endDate = `${state.endYear}-${endMonth}-${endDay}`;
      let endWeek = getWeekText(endDate);
      emit('change', {
        startYear: state.startYear,
        startMonth: state.startMonth,
        startDay: state.startDay,
        startDate: startDate,
        startWeek: startWeek,
        endYear: state.endYear,
        endMonth: state.endMonth,
        endDay: state.endDay,
        endDate: endDate,
        endWeek: endWeek,
      });
    }
  };

  const changeData = () => {
    state.days = getMonthDay(state.year, state.month);
    state.daysArr = generateArray(1, state.days);
    state.weekday = getWeekday(state.year, state.month);
    state.weekdayArr = generateArray(1, state.weekday);
    state.showTitle = `${state.year}年${state.month}月`;
    if (props.isChange && props.mode == 'date') {
      btnFix(true);
    }
  };

  //日期处理
  const initDate = (date: string) => {
    let fdate: string[] = date.split('-');
    return {
      year: Number(fdate[0] || 1920),
      month: Number(fdate[1] || 1),
      day: Number(fdate[2] || 1),
    }
  };

  const init = () => {
    let now = new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth() + 1;
    state.day = now.getDate();
    state.today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    state.activeDate = state.today;
    state.min = initDate(props.minDate);
    state.max = initDate(props.maxDate || state.today);
    state.startDate = "";
    state.startYear = 0;
    state.startMonth = 0;
    state.startDay = 0;
    state.endYear = 0;
    state.endMonth = 0;
    state.endDay = 0;
    state.endDate = "";
    state.isStart = true;
    changeData();
  };

  const openDisAbled = (year: number, month: number, day: number) => {
    let bool = true;
    let date = `${year}/${month}/${day}`;
    // let today = state.today.replace(/\-/g, '/');
    let min = `${state.min?.year}/${state.min?.month}/${state.min?.day}`;
    let max = `${state.max?.year}/${state.max?.month}/${state.max?.day}`;
    let timestamp = new Date(date).getTime();
    if (timestamp >= new Date(min).getTime() && timestamp <= new Date(max).getTime()) {
      bool = false;
    }
    return bool;
  };

  const checkRange = (year: number) => {
    let overstep = false;
    if (year < props.minYear || year > props.maxYear) {
      uni.showToast({
        title: "日期超出范围啦~",
        icon: 'none'
      });
      overstep = true;
    }
    return overstep;
  };

  const changeMonthHandler = (isAdd: boolean) => {
    if (isAdd) {
      let month = state.month + 1;
      let year = month > 12 ? state.year + 1 : state.year;
      if (!checkRange(year)) {
        state.month = month > 12 ? 1 : month;
        state.year = year;
        changeData();
      }
    } else {
      let month = state.month - 1;
      let year = month < 1 ? state.year - 1 : state.year;
      if (!checkRange(year)) {
        state.month = month < 1 ? 12 : month;
        state.year = year;
        changeData();
      }
    }
  };

  const changeYearHandler = (isAdd: boolean) => {
    let year = isAdd ? state.year + 1 : state.year - 1;
    if (!checkRange(year)) {
      state.year = year;
      changeData();
    }
  };

  const dateClick = (day: number) => {
    day += 1;
    if (!openDisAbled(state.year, state.month, day)) {
      state.day = day;
      let date = `${state.year}-${state.month}-${day}`;
      if (props.mode == 'date') {
        state.activeDate = date;
      } else {
        let compare = new Date(date.replace(/\-/g, '/')).getTime() < new Date(state.startDate.replace(/\-/g, '/')).getTime();
        if (state.isStart || compare) {
          state.startDate = date;
          state.startYear = state.year;
          state.startMonth = state.month;
          state.startDay = state.day;
          state.endYear = 0;
          state.endMonth = 0;
          state.endDay = 0;
          state.endDate = "";
          state.activeDate = "";
          state.isStart = false;
        } else {
          state.endDate = date;
          state.endYear = state.year;
          state.endMonth = state.month;
          state.endDay = state.day;
          state.isStart = true;
        }
      }
    }
  };

  init();

  defineExpose({
    ...toRefs(state),
    dataChange,
    uZIndex,
    getColor,
    close,
    btnFix,
    init,
    openDisAbled,
    changeMonthHandler,
    changeYearHandler,
    dateClick,
  });
</script>

<style scoped lang="scss">
	@import "../../libs/css/style.components.scss";

	.u-calendar {
		color: $u-content-color;

		&__header {
			width: 100%;
			box-sizing: border-box;
			font-size: 30rpx;
			background-color: #fff;
			color: $u-main-color;

			&__text {
				margin-top: 30rpx;
				padding: 0 60rpx;
				@include vue-flex;
				justify-content: center;
				align-items: center;
			}
		}

		&__action {
			padding: 40rpx 0 40rpx 0;

			&__icon {
				margin: 0 16rpx;
			}

			&__text {
				padding: 0 16rpx;
				color: $u-main-color;
				font-size: 32rpx;
				line-height: 32rpx;
				font-weight: bold;
			}
		}

		&__week-day {
			@include vue-flex;
			align-items: center;
			justify-content: center;
			padding: 6px 0;
			overflow: hidden;

			&__text {
				flex: 1;
				text-align: center;
			}
		}

		&__content {
			width: 100%;
			@include vue-flex;
			flex-wrap: wrap;
			padding: 6px 0;
			box-sizing: border-box;
			background-color: #fff;
			position: relative;

			&--end-date {
				border-top-right-radius: 8rpx;
				border-bottom-right-radius: 8rpx;
			}

			&--start-date {
				border-top-left-radius: 8rpx;
				border-bottom-left-radius: 8rpx;
			}

			&__item {
				width: 14.2857%;
				@include vue-flex;
				align-items: center;
				justify-content: center;
				padding: 6px 0;
				overflow: hidden;
				position: relative;
				z-index: 2;

				&__inner {
					height: 84rpx;
					@include vue-flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					font-size: 32rpx;
					position: relative;
					border-radius: 50%;

					&__desc {
						width: 100%;
						font-size: 24rpx;
						line-height: 24rpx;
						transform: scale(0.75);
						transform-origin: center center;
						position: absolute;
						left: 0;
						text-align: center;
						bottom: 2rpx;
					}
				}

				&__tips {
					width: 100%;
					font-size: 24rpx;
					line-height: 24rpx;
					position: absolute;
					left: 0;
					transform: scale(0.8);
					transform-origin: center center;
					text-align: center;
					bottom: 8rpx;
					z-index: 2;
				}
			}

			&__bg-month {
				position: absolute;
				font-size: 130px;
				line-height: 130px;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				color: #e4e7ed;
				z-index: 1;
			}
		}

		&__bottom {
			width: 100%;
			@include vue-flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			background-color: #fff;
			padding: 0 40rpx 30rpx;
			box-sizing: border-box;
			font-size: 24rpx;
			color: $u-tips-color;

			&__choose {
				height: 50rpx;
			}

			&__btn {
				width: 100%;
			}
		}
	}
</style>
