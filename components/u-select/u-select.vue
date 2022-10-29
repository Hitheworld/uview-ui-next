<template>
	<view class="u-select">
		<!--
		 <view
        class="u-select__action"
        :class="{
          'u-select--border': props.border
        }"
        @tap.stop="selectHandler"
    >
      <view
          class="u-select__action__icon"
          :class="{
            'u-select__action__icon--reverse': props.modelValue == true
          }"
      >
        <u-icon name="arrow-down-fill" size="26" color="#c0c4cc"></u-icon>
      </view>
    </view>
		 -->
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
			<view class="u-select">
				<view class="u-select__header" @touchmove.stop.prevent="">
					<view
						class="u-select__header__cancel u-select__header__btn"
						:style="{ color: props.cancelColor }"
						hover-class="u-hover-class"
						:hover-stay-time="150"
						@tap="getResult('cancel')"
					>
						{{ props.cancelText }}
					</view>
					<view class="u-select__header__title">
						{{ props.title }}
					</view>
					<view
						class="u-select__header__confirm u-select__header__btn"
						:style="{ color: state.moving ? props.cancelColor : props.confirmColor }"
						hover-class="u-hover-class"
						:hover-stay-time="150"
						@touchmove.stop=""
						@tap.stop="getResult('confirm')"
					>
						{{ props.confirmText }}
					</view>
				</view>
				<view class="u-select__body">
					<picker-view
              @change="columnChange"
              class="u-select__body__picker-view"
              :value="state.defaultSelector"
              @pickstart="pickstart"
              @pickend="pickend"
          >
						<picker-view-column
                v-for="(item, index) in state.columnData"
                :key="index"
            >
							<view
                  class="u-select__body__picker-view__item"
                  v-for="(item1, index1) in item"
                  :key="index1"
              >
								<view class="u-line-1">
                  {{ item1[props.labelName] }}
                </view>
							</view>
						</picker-view-column>
					</picker-view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-select',
  }
</script>

<script setup lang="ts">
  import { reactive, toRefs, computed, watch, withDefaults} from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * select 列选择器
	 * @description 此选择器用于单列，多列，多列联动的选择场景。(从1.3.0版本起，不建议使用Picker组件的单列和多列模式，Select组件是专门为列选择而构造的组件，更简单易用。)
	 * @tutorial http://uviewui.com/components/select.html
	 * @property {String} mode 模式选择，"single-column"-单列模式，"mutil-column"-多列模式，"mutil-column-auto"-多列联动模式
	 * @property {Array} list 列数据，数组形式，见官网说明
	 * @property {Boolean} v-model 布尔值变量，用于控制选择器的弹出与收起
	 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配(默认false)
	 * @property {String} cancel-color 取消按钮的颜色（默认#606266）
	 * @property {String} confirm-color 确认按钮的颜色(默认#2979ff)
	 * @property {String} confirm-text 确认按钮的文字
	 * @property {String} cancel-text 取消按钮的文字
	 * @property {String} default-value 提供的默认选中的下标，见官网说明
	 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭Picker(默认true)
	 * @property {String Number} z-index 弹出时的z-index值(默认10075)
	 * @property {String} value-name 自定义list数据的value属性名 1.3.6
	 * @property {String} label-name 自定义list数据的label属性名 1.3.6
	 * @property {String} child-name 自定义list数据的children属性名，只对多列联动模式有效 1.3.7
	 * @event {Function} confirm 点击确定按钮，返回当前选择的值
	 * @example <u-select v-model="show" :list="list"></u-select>
	 */
  interface ISelectValue {
    value: string | null;
    label: string | null;
    extra?: string;
  }
	interface USelectState {
    // 用于列改变时，保存当前的索引，下一次变化时比较得出是哪一列发生了变化
    defaultSelector: string[] | number[];
    // picker-view的数据
    columnData: any[];
    // 每次队列发生变化时，保存选择的结果
    selectValue: ISelectValue[];
    // 上一次列变化时的index
    lastSelectIndex: number[];
    // 列数
    columnNum: number;
    // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
    moving: boolean;
  }
  interface ISelectValueLabel {
    value: string | null;
    label: string | null;
  }
  interface USelectProps {
    // 列数据
    list: ISelectValueLabel[];
    // 是否显示边框
    border?: boolean;
    // 通过双向绑定控制组件的弹出与收起
    modelValue: boolean;
    // "取消"按钮的颜色
    cancelColor?: string;
    // "确定"按钮的颜色
    confirmColor?: string;
    // 弹出的z-index值
    zIndex?: number | string;
    safeAreaInsetBottom?: boolean;
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble?: boolean;
    // 提供的默认选中的下标
    defaultValue?: number[];
    // 模式选择，single-column-单列，mutil-column-多列，mutil-column-auto-多列联动
    mode?: 'single-column' | 'mutil-column' | 'mutil-column-auto';
    // 自定义value属性名
    valueName?: string;
    // 自定义label属性名
    labelName?: string;
    // 自定义多列联动模式的children属性名
    childName?: string;
    // 顶部标题
    title?: string;
    // 取消按钮的文字
    cancelText?: string;
    // 确认按钮的文字
    confirmText?: string;
  }

  const props = withDefaults(defineProps<USelectProps>(),{
    // 列数据
    list: () => [],
    // 是否显示边框
    border: true,
    // 通过双向绑定控制组件的弹出与收起
    modelValue: false,
    // "取消"按钮的颜色
    cancelColor: '#606266',
    // "确定"按钮的颜色
    confirmColor: '#2979ff',
    // 弹出的z-index值
    zIndex: 0,
    safeAreaInsetBottom: false,
    // 是否允许通过点击遮罩关闭Picker
    maskCloseAble: true,
    // 提供的默认选中的下标
    defaultValue: () => [0],
    // 模式选择，single-column-单列，mutil-column-多列，mutil-column-auto-多列联动
    mode: 'single-column',
    // 自定义value属性名
    valueName: 'value',
    // 自定义label属性名
    labelName: 'label',
    // 自定义多列联动模式的children属性名
    childName: 'children',
    // 顶部标题
    title: '',
    // 取消按钮的文字
    cancelText: '取消',
    // 确认按钮的文字
    confirmText: '确认',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', isShow: boolean): void;
    (e: 'cancel', selectValue: string): void;
    (e: 'confirm', selectValue: string): void;
    (e: 'click'): void;
  }>();

  const { Z_INDEX_CONFIG, deepClone } = useComposable();

  const state = reactive<USelectState>({
    // 用于列改变时，保存当前的索引，下一次变化时比较得出是哪一列发生了变化
    defaultSelector: [0],
    // picker-view的数据
    columnData: [],
    // 每次队列发生变化时，保存选择的结果
    selectValue: [],
    // 上一次列变化时的index
    lastSelectIndex: [],
    // 列数
    columnNum: 0,
    // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
    moving: false,
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

  // 获取默认选中列下标
  const setDefaultSelector = () => {
    // 如果没有传入默认选中的值，生成长度为columnNum，用0填充的数组
    state.defaultSelector = props.defaultValue?.length == state.columnNum ? props.defaultValue : Array(state.columnNum).fill(0);
    state.lastSelectIndex = deepClone(state.defaultSelector);
  };

  // 计算列数
  const setColumnNum = () => {
    // 单列的列数为1
    if(props.mode == 'single-column') state.columnNum = 1;
    // 多列时，props.list数组长度就是列数
    else if(props.mode == 'mutil-column') state.columnNum = props.list.length;
    // 多列联动时，通过历遍props.list的第一个元素，得出有多少列
    else if(props.mode == 'mutil-column-auto') {
      let num = 1;
      let column = props.list || [];
      if (props.childName) {
        // 只要有元素并且第一个元素有children属性，继续历遍
        while(column?.[0]?.[props.childName]) {
          column = column?.[0] ? column?.[0]?.[props.childName] : {};
          num ++;
        }
      }
      state.columnNum = num;
    }
  };

  // 获取需要展示在picker中的列数据
  const setColumnData = () => {
    let data = [];
    state.selectValue = [];
    if(props.mode == 'mutil-column-auto') {
      // 获得所有数据中的第一个元素
      let column = props.list[state.defaultSelector.length ? state.defaultSelector[0] : 0];
      // 通过循环所有的列数，再根据设定列的数组，得出当前需要渲染的整个列数组
      for (let i = 0; i < state.columnNum; i++) {
        // 第一列默认为整个list数组
        if (i == 0) {
          data[i] = props.list;
          column = column[props.childName];
        } else {
          // 大于第一列时，判断是否有默认选中的，如果没有就用该列的第一项
          data[i] = column;
          column = column[state.defaultSelector[i]][props.childName];
        }
      }
    } else if(props.mode == 'single-column') {
      data[0] = props.list;
    } else {
      data = props.list;
    }
    state.columnData = data;
  };

  // 获取默认选中的值，如果没有设置defaultValue，就默认选中每列的第一个
  const setSelectValue = () => {
    let tmp: any | null = null;
    for(let i = 0; i < state.columnNum; i++) {
      tmp = state.columnData[i][state.defaultSelector[i]];
      let data: ISelectValue = {
        value: tmp ? tmp[props.valueName] : null,
        label: tmp ? tmp[props.labelName] : null
      };
      // 判断是否存在额外的参数，如果存在，就返回
      if(tmp && tmp.extra) data.extra = tmp.extra;
      state.selectValue.push(data)
    }
  };

  // 列选项
  const columnChange = (e: any) => {
    let index: number | null = null;
    let columnIndex = e.detail.value;
    // 由于后面是需要push进数组的，所以需要先清空数组
    state.selectValue = [];
    if(props.mode == 'mutil-column-auto') {
      // 对比前后两个数组，寻找变更的是哪一列，如果某一个元素不同，即可判定该列发生了变化
      state.lastSelectIndex.map((val, idx: number) => {
        if (val != columnIndex[idx]) index = idx;
      });
      state.defaultSelector = columnIndex;
      for (let i = (index || 0) + 1; i < state.columnNum; i++) {
        // 当前变化列的下一列的数据，需要获取上一列的数据，同时需要指定是上一列的第几个的children，再往后的
        // 默认是队列的第一个为默认选项
        state.columnData[i] = state.columnData[i - 1][i - 1 == index ? columnIndex[(index || 0)] : 0][props.childName];
        // 改变的列之后的所有列，默认选中第一个
        state.defaultSelector[i] = 0;
      }
      // 在历遍的过程中，可能由于上一步修改state.columnData，导致产生连锁反应，程序触发columnChange，会有多次调用
      // 只有在最后一次数据稳定后的结果是正确的，此前的历遍中，可能会产生undefined，故需要判断
      columnIndex.map((item: any, index: number) => {
        let data = state.columnData[index][columnIndex[index]];
        let tmp: ISelectValue = {
          value: data ? data[props.valueName] : null,
          label: data ? data[props.labelName] : null,
        };
        // 判断是否有需要额外携带的参数
        if(data && data.extra !== undefined) tmp.extra = data.extra;
        state.selectValue.push(tmp);

      })
      // 保存这一次的结果，用于下次列发生变化时作比较
      state.lastSelectIndex = columnIndex;
    } else if(props.mode == 'single-column') {
      let data = state.columnData[0][columnIndex[0]];
      // 初始默认选中值
      let tmp: ISelectValue = {
        value: data ? data[props.valueName] : null,
        label: data ? data[props.labelName] : null,
      };
      // 判断是否有需要额外携带的参数
      if(data && data.extra !== undefined) tmp.extra = data.extra;
      state.selectValue.push(tmp);
    } else if(props.mode == 'mutil-column') {
      // 初始默认选中值
      columnIndex.map((item: any, index: number) => {
        let data = state.columnData[index][columnIndex[index]];
        // 初始默认选中值
        let tmp: ISelectValue = {
          value: data ? data[props.valueName] : null,
          label: data ? data[props.labelName] : null,
        };
        // 判断是否有需要额外携带的参数
        if(data && data.extra !== undefined) tmp.extra = data.extra;
        state.selectValue.push(tmp);
      });
    }
  };

  const close = () => {
    emit('update:modelValue', false);
  };

  // 点击确定或者取消
  const getResult = (event: "cancel" | "confirm") => {
    // #ifdef MP-WEIXIN
    if (state.moving) return;
    // #endif
    if (event) emit(event, state.selectValue);
    close();
  };

  const selectHandler = () => {
    emit('click');
  };

  const init = () => {
    setColumnNum();
    setDefaultSelector();
    setColumnData();
    setSelectValue();
  };

  // 在select弹起的时候，重新初始化所有数据
  watch(() => props.modelValue, (newValeu, oldValue) => {
    if(newValeu) setTimeout(() => init(), 10);
  }, {
    immediate: true,
  });

  defineExpose({
    ...toRefs(state),
    uZIndex,
    pickstart,
    pickend,
    init,
    setDefaultSelector,
    setColumnNum,
    setColumnData,
    setSelectValue,
    columnChange,
    close,
    getResult,
    selectHandler,
  });
</script>

<style scoped lang="scss">
  @import "../../libs/css/style.components.scss";

  .u-select {

    &__action {
      position: relative;
      line-height: $u-form-item-height;
      height: $u-form-item-height;

      &__icon {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transition: transform .4s;
        transform: translateY(-50%);
        z-index: 1;

        &--reverse {
          transform: rotate(-180deg) translateY(50%);
        }
      }
    }

    &__hader {
      &__title {
        color: $u-content-color;
      }
    }

    &--border {
      border-radius: 6rpx;
      border-radius: 4px;
      border: 1px solid $u-form-item-border-color;
    }

    &__header {
      @include vue-flex;
      align-items: center;
      justify-content: space-between;
      height: 80rpx;
      padding: 0 40rpx;
    }

    &__body {
      width: 100%;
      height: 500rpx;
      overflow: hidden;
      background-color: #fff;

      &__picker-view {
        height: 100%;
        box-sizing: border-box;

        &__item {
          @include vue-flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          color: $u-main-color;
          padding: 0 8rpx;
        }
      }
    }
  }
</style>
