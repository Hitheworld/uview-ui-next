<template>
	<view
      class="u-search"
      @tap="clickHandler"
      :style="{
        margin: props.margin,
      }"
  >
		<view
			class="u-content"
			:style="{
				backgroundColor: props.bgColor,
				borderRadius: props.shape == 'round' ? '100rpx' : '10rpx',
				border: borderStyle,
				height: props.height + 'rpx'
			}"
		>
			<view class="u-icon-wrap">
				<u-icon
            class="u-clear-icon"
            :size="30"
            :name="props.searchIcon"
            :color="props.searchIconColor ? props.searchIconColor : props.color"
        ></u-icon>
			</view>
			<input
				confirm-type="search"
				@blur="blur"
				:value="props.modelValue"
				@confirm="search"
				@input="inputChange"
				:disabled="props.disabled"
				@focus="getFocus"
				:focus="props.focus"
				:maxlength="props.maxlength"
				placeholder-class="u-placeholder-class"
				:placeholder="props.placeholder"
				:placeholder-style="`color: ${props.placeholderColor}`"
				class="u-input"
				type="text"
				:style="[{
					textAlign: props.inputAlign,
					color: props.color,
					backgroundColor: props.bgColor,
				}, props.inputStyle]"
			/>
			<view
          class="u-close-wrap"
          v-if="state.keyword && props.clearabled && state.focused"
          @tap="clear"
      >
				<u-icon
            class="u-clear-icon"
            name="close-circle-fill"
            size="34"
            color="#c0c4cc"
        ></u-icon>
			</view>
		</view>
		<view
        :style="[props.actionStyle]"
        class="u-action"
        :class="[showActionBtn || state.show ? 'u-action-active' : '']"
        @tap.stop.prevent="custom"
		>
      {{ props.actionText }}
    </view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-search',
  }
</script>

<script setup lang="ts">
  import { toRefs, reactive, computed, watch, nextTick, CSSProperties, withDefaults } from "vue";
	/**
	 * search 搜索框
	 * @description 搜索组件，集成了常见搜索框所需功能，用户可以一键引入，开箱即用。
	 * @tutorial https://www.uviewui.com/components/search.html
	 * @property {String} shape 搜索框形状，round-圆形，square-方形（默认round）
	 * @property {String} bg-color 搜索框背景颜色（默认#f2f2f2）
	 * @property {String} border-color 边框颜色，配置了颜色，才会有边框
	 * @property {String} placeholder 占位文字内容（默认“请输入关键字”）
	 * @property {Boolean} clearabled 是否启用清除控件（默认true）
	 * @property {Boolean} focus 是否自动获得焦点（默认false）
	 * @property {Boolean} show-action 是否显示右侧控件（默认true）
	 * @property {String} action-text 右侧控件文字（默认“搜索”）
	 * @property {Object} action-style 右侧控件的样式，对象形式
	 * @property {String} input-align 输入框内容水平对齐方式（默认left）
	 * @property {Object} input-style 自定义输入框样式，对象形式
	 * @property {Boolean} disabled 是否启用输入框（默认false）
	 * @property {String} search-icon-color 搜索图标的颜色，默认同输入框字体颜色
	 * @property {String} color 输入框字体颜色（默认#606266）
	 * @property {String} placeholder-color placeholder的颜色（默认#909399）
	 * @property {String} search-icon 输入框左边的图标，可以为uView图标名称或图片路径
	 * @property {String} margin 组件与其他上下左右元素之间的距离，带单位的字符串形式，如"30rpx"
	 * @property {Boolean} animation 是否开启动画，见上方说明（默认false）
	 * @property {String} value 输入框初始值
	 * @property {String | Number} maxlength 输入框最大能输入的长度，-1为不限制长度
	 * @property {Boolean} input-style input输入框的样式，可以定义文字颜色，大小等，对象形式
	 * @property {String | Number} height 输入框高度，单位rpx（默认64）
	 * @event {Function} change 输入框内容发生变化时触发
	 * @event {Function} search 用户确定搜索时触发，用户按回车键，或者手机键盘右下角的"搜索"键时触发
	 * @event {Function} custom 用户点击右侧控件时触发
	 * @event {Function} clear 用户点击清除按钮时触发
	 * @example <u-search placeholder="日照香炉生紫烟" v-model="keyword"></u-search>
	 */
  interface USearchState {
    keyword: string;
    showClear: boolean; // 是否显示右边的清除图标
    show: boolean;
    // 标记input当前状态是否处于聚焦中，如果是，才会显示右侧的清除控件
    focused: boolean;
    // 绑定输入框的值
    // inputValue: string;
  }
  interface USearchProps {
    // 搜索框形状，round-圆形，square-方形
    shape?: string;
    // 搜索框背景色，默认值#f2f2f2
    bgColor?: string;
    // 占位提示文字
    placeholder?: string;
    // 是否启用清除控件
    clearabled?: boolean;
    // 是否自动聚焦
    focus?: boolean;
    // 是否在搜索框右侧显示取消按钮
    showAction?: boolean;
    // 右边控件的样式
    actionStyle?: CSSProperties;
    // 取消按钮文字
    actionText?: string;
    // 输入框内容对齐方式，可选值为 left|center|right
    inputAlign?: string;
    // 是否启用输入框
    disabled?: boolean;
    // 开启showAction时，是否在input获取焦点时才显示
    animation?: boolean;
    // 边框颜色，只要配置了颜色，才会有边框
    borderColor?: string;
    // 输入框的初始化内容
    modelValue: string;
    // 搜索框高度，单位rpx
    height?: number | string;
    // input输入框的样式，可以定义文字颜色，大小等，对象形式
    inputStyle?: CSSProperties;
    // 输入框最大能输入的长度，-1为不限制长度(来自uniapp文档)
    maxlength?: number | string;
    // 搜索图标的颜色，默认同输入框字体颜色
    searchIconColor?: string;
    // 输入框字体颜色
    color?: string;
    // placeholder的颜色
    placeholderColor?: string;
    // 组件与其他上下左右元素之间的距离，带单位的字符串形式，如"30rpx"、"30rpx 20rpx"等写法
    margin?: string;
    // 左边输入框的图标，可以为uView图标名称或图片路径
    searchIcon?: string;
  }

  const props = withDefaults(defineProps<USearchProps>(),{
    // 搜索框形状，round-圆形，square-方形
    shape: 'round',
    // 搜索框背景色，默认值#f2f2f2
    bgColor: '#f2f2f2',
    // 占位提示文字
    placeholder: '请输入关键字',
    // 是否启用清除控件
    clearabled: true,
    // 是否自动聚焦
    focus: false,
    // 是否在搜索框右侧显示取消按钮
    showAction: true,
    // 右边控件的样式
    actionStyle: () => {
      return {}
    },
    // 取消按钮文字
    actionText: '搜索',
    // 输入框内容对齐方式，可选值为 left|center|right
    inputAlign: 'left',
    // 是否启用输入框
    disabled: false,
    // 开启showAction时，是否在input获取焦点时才显示
    animation: false,
    // 边框颜色，只要配置了颜色，才会有边框
    borderColor: 'none',
    // 输入框的初始化内容
    modelValue: '',
    // 搜索框高度，单位rpx
    height: 64,
    // input输入框的样式，可以定义文字颜色，大小等，对象形式
    inputStyle: () => {
      return {}
    },
    // 输入框最大能输入的长度，-1为不限制长度(来自uniapp文档)
    maxlength: '-1',
    // 搜索图标的颜色，默认同输入框字体颜色
    searchIconColor: '',
    // 输入框字体颜色
    color:  '#606266',
    // placeholder的颜色
    placeholderColor: '#909399',
    // 组件与其他上下左右元素之间的距离，带单位的字符串形式，如"30rpx"、"30rpx 20rpx"等写法
    margin: '0',
    // 左边输入框的图标，可以为uView图标名称或图片路径
    searchIcon: 'search',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: string): void;
    (e: 'change', value: string): void;
    (e: 'search', value: string): void;
    (e: 'focus', keyword: string | number): void;
    (e: 'blur', keyword: string | number): void;
    (e: 'custom', keyword: string | number): void;
    (e: 'click'): void;
    (e: 'clear'): void;
  }>();

  const state = reactive<USearchState>({
    keyword: '',
    showClear: false, // 是否显示右边的清除图标
    show: false,
    // 标记input当前状态是否处于聚焦中，如果是，才会显示右侧的清除控件
    focused: props.focus || false,
    // 绑定输入框的值
    // inputValue: props.modelValue
  });

  const showActionBtn = computed(() => {
    if (!props.animation && props.showAction) return true;
    else return false;
  });

  // 样式，根据用户传入的颜色值生成，如果不传入，默认为none
  const borderStyle = computed(() => {
    if (props.borderColor) return `1px solid ${props.borderColor}`;
    else return 'none';
  });

  // 目前HX2.6.9 v-model双向绑定无效，故监听input事件获取输入框内容的变化
  const inputChange = (e: any) => {
    state.keyword = e.detail.value;
  };

  // 清空输入
  // 也可以作为用户通过this.$refs形式调用清空输入框内容
  const clear = () => {
    state.keyword = '';
    // 延后发出事件，避免在父组件监听clear事件时，value为更新前的值(不为空)
    nextTick(() => {
      emit('clear');
    })
  };

  // 确定搜索
  const search = (e: any) => {
    emit('search', e.detail.value);
    try{
      // 收起键盘
      uni.hideKeyboard();
    }catch(e){}
  };

  // 点击右边自定义按钮的事件
  const custom = () => {
    emit('custom', state.keyword);
    try{
      // 收起键盘
      uni.hideKeyboard();
    }catch(e){}
  };

  // 获取焦点
  const getFocus = () => {
    state.focused = true;
    // 开启右侧搜索按钮展开的动画效果
    if (props.animation && props.showAction) state.show = true;
    emit('focus', state.keyword);
  };

  // 失去焦点
  const blur = () => {
    // 最开始使用的是监听图标@touchstart事件，自从hx2.8.4后，此方法在微信小程序出错
    // 这里改为监听点击事件，手点击清除图标时，同时也发生了@blur事件，导致图标消失而无法点击，这里做一个延时
    setTimeout(() => {
      state.focused = false;
    }, 100);
    state.show = false;
    emit('blur', state.keyword);
  };

  // 点击搜索框，只有disabled=true时才发出事件，因为禁止了输入，意味着是想跳转真正的搜索页
  const clickHandler = () => {
    if(props.disabled) emit('click');
  };

  watch(() => state.keyword, (newValue, oldValue) => {
    // 双向绑定值，让v-model绑定的值双向变化
    emit('update:modelValue', newValue);
    // 触发change事件，事件效果和v-model双向绑定的效果一样，让用户多一个选择
    emit('change', newValue);
  });

  watch(() => props.modelValue, (newValue, oldValue) => {
    state.keyword = newValue;
  }, {
    immediate: true,
  });

  defineExpose({
    ...toRefs(state),
    showActionBtn,
    borderStyle,
    inputChange,
    clear,
    search,
    custom,
    getFocus,
    blur,
    clickHandler,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";

	.u-search {
		@include vue-flex;
		align-items: center;
		flex: 1;
	}

	.u-content {
		@include vue-flex;
		align-items: center;
		padding: 0 18rpx;
		flex: 1;
	}

	.u-clear-icon {
		@include vue-flex;
		align-items: center;
	}

	.u-input {
		flex: 1;
		font-size: 28rpx;
		line-height: 1;
		margin: 0 10rpx;
		color: $u-tips-color;
	}

	.u-close-wrap {
		width: 40rpx;
		height: 100%;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.u-placeholder-class {
		color: $u-tips-color;
	}

	.u-action {
		font-size: 28rpx;
		color: $u-main-color;
		width: 0;
		overflow: hidden;
		transition: all 0.3s;
		white-space: nowrap;
		text-align: center;
	}

	.u-action-active {
		width: 80rpx;
		margin-left: 10rpx;
	}
</style>
