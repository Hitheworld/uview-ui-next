<template>
	<button
		id="u-wave-btn"
		class="u-btn u-line-1 u-fix-ios-appearance"
		:class="[
			'u-size-' + props.size,
			props.plain ? 'u-btn--' + props.type + '--plain' : '',
			props.loading ? 'u-loading' : '',
			props.shape == 'circle' ? 'u-round-circle' : '',
			props.hairLine ? showHairLineBorder : 'u-btn--bold-border',
			'u-btn--' + props.type,
			props.disabled ? `u-btn--${props.type}--disabled` : '',
		]"
		:hover-start-time="Number(props.hoverStartTime)"
		:hover-stay-time="Number(props.hoverStayTime)"
		:disabled="props.disabled"
		:form-type="props.formType"
		:open-type="props.openType"
		:app-parameter="props.appParameter"
		:hover-stop-propagation="props.hoverStopPropagation"
		:send-message-title="props.sendMessageTitle"
		send-message-path="sendMessagePath"
		:lang="props.lang"
		:data-name="props.dataName"
		:session-from="props.sessionFrom"
		:send-message-img="props.sendMessageImg"
		:show-message-card="props.showMessageCard"
		@getphonenumber="getphonenumber"
		@getuserinfo="getuserinfo"
		@error="error"
		@opensetting="opensetting"
		@launchapp="launchapp"
		:style="[props.customStyle, {
			overflow: props.ripple ? 'hidden' : 'visible'
		}]"
		@tap.stop="click($event)"
		:hover-class="getHoverClass"
		:loading="props.loading"
	>
		<slot></slot>
		<view
			v-if="ripple"
			class="u-wave-ripple"
			:class="[state.waveActive ? 'u-wave-active' : '']"
			:style="{
				top: state.rippleTop + 'px',
				left: state.rippleLeft + 'px',
				width: state.fields.targetWidth + 'px',
				height: state.fields.targetWidth + 'px',
				'background-color': props.rippleBgColor || 'rgba(0, 0, 0, 0.15)'
			}"
		></view>
	</button>
</template>

<script lang="ts">
  export default {
    name: 'u-button',
  }
</script>

<script setup lang="ts">
  import { CSSProperties, getCurrentInstance, computed, reactive, toRefs, nextTick } from "vue";
  import { ComponentInternalInstance } from "@vue/runtime-core";
  import throttle from "../../libs/function/throttle";
  /**
   * button 按钮
   * @description Button 按钮
   * @tutorial https://www.uviewui.com/components/button.html
   * @property {String} size 按钮的大小
   * @property {Boolean} ripple 是否开启点击水波纹效果
   * @property {String} ripple-bg-color 水波纹的背景色，ripple为true时有效
   * @property {String} type 按钮的样式类型
   * @property {Boolean} plain 按钮是否镂空，背景色透明
   * @property {Boolean} disabled 是否禁用
   * @property {Boolean} hair-line 是否显示按钮的细边框(默认true)
   * @property {Boolean} shape 按钮外观形状，见文档说明
   * @property {Boolean} loading 按钮名称前是否带 loading 图标(App-nvue 平台，在 ios 上为雪花，Android上为圆圈)
   * @property {String} form-type 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
   * @property {String} open-type 开放能力
   * @property {String} data-name 额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取
   * @property {String} hover-class 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果(App-nvue 平台暂不支持)
   * @property {Number} hover-start-time 按住后多久出现点击态，单位毫秒
   * @property {Number} hover-stay-time 手指松开后点击态保留时间，单位毫秒
   * @property {Object} custom-style 对按钮的自定义样式，对象形式，见文档说明
   * @event {Function} click 按钮点击
   * @event {Function} getphonenumber open-type="getPhoneNumber"时有效
   * @event {Function} getuserinfo 用户点击该按钮时，会返回获取到的用户信息，从返回参数的detail中获取到的值同uni.getUserInfo
   * @event {Function} error 当使用开放能力时，发生错误的回调
   * @event {Function} opensetting 在打开授权设置页并关闭后回调
   * @event {Function} launchapp 打开 APP 成功的回调
   * @example <u-button>月落</u-button>
   */
  interface UButtonStateFields {
    targetWidth: number;
  }
  interface UButtonState {
    rippleTop: number; // 水波纹的起点Y坐标到按钮上边界的距离
    rippleLeft: number; // 水波纹起点X坐标到按钮左边界的距离
    // 波纹按钮节点信息
    fields: UButtonStateFields;
    // 激活水波纹
    waveActive: boolean;
  }
  interface UButtonProps {
    // 是否细边框
    hairLine?: boolean;
    // 按钮的预置样式，default，primary，error，warning，success
    type?: 'default'| 'primary' | 'error' | 'warning' | 'success';
    // 按钮尺寸，default，medium，mini
    size?: 'default' | 'medium' | 'mini';
    // 按钮形状，circle（两边为半圆），square（带圆角）
    shape?: 'circle' | 'square';
    // 按钮是否镂空
    plain?: boolean;
    // 是否禁止状态
    disabled?: boolean;
    // 是否加载中
    loading?: boolean;
    // 开放能力，具体请看uniapp稳定关于button组件部分说明
    // https://uniapp.dcloud.io/component/button
    openType?: string;
    // 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
    // 取值为submit（提交表单），reset（重置表单）
    formType?: string;
    // 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效
    // 只微信小程序、QQ小程序有效
    appParameter?: string;
    // 指定是否阻止本节点的祖先节点出现点击态，微信小程序有效
    hoverStopPropagation?: boolean;
    // 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文。只微信小程序有效
    lang?: string;
    // 会话来源，open-type="contact"时有效。只微信小程序有效
    sessionFrom?: string;
    // 会话内消息卡片标题，open-type="contact"时有效
    // 默认当前标题，只微信小程序有效
    sendMessageTitle?: string;
    // 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效
    // 默认当前分享路径，只微信小程序有效
    sendMessagePath?: string;
    // 会话内消息卡片图片，open-type="contact"时有效
    // 默认当前页面截图，只微信小程序有效
    sendMessageImg?: string;
    // 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，
    // 用户点击后可以快速发送小程序消息，open-type="contact"时有效
    showMessageCard?: boolean;
    // 手指按（触摸）按钮时按钮时的背景颜色
    hoverBgColor?: string;
    // 水波纹的背景颜色
    rippleBgColor?: string;
    // 是否开启水波纹效果
    ripple?: boolean;
    // 按下的类名
    hoverClass?: string;
    // 自定义样式，对象形式
    customStyle?: CSSProperties;
    // 额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取
    dataName?: string;
    // 节流，一定时间内只能触发一次
    throttleTime?: string | number;
    // 按住后多久出现点击态，单位毫秒
    hoverStartTime?:  string | number;
    // 手指松开后点击态保留时间，单位毫秒
    hoverStayTime?:  string | number;
  }

  const props = withDefaults(defineProps<UButtonProps>(), {
    // 是否细边框
    hairLine: true,
    // 按钮的预置样式，default，primary，error，warning，success
    type: 'default',
    // 按钮尺寸，default，medium，mini
    size: 'default',
    // 按钮形状，circle（两边为半圆），square（带圆角）
    shape: 'square',
    // 按钮是否镂空
    plain: false,
    // 是否禁止状态
    disabled: false,
    // 是否加载中
    loading: false,
    // 开放能力，具体请看uniapp稳定关于button组件部分说明
    // https://uniapp.dcloud.io/component/button
    openType: '',
    // 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
    // 取值为submit（提交表单），reset（重置表单）
    formType: '',
    // 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效
    // 只微信小程序、QQ小程序有效
    appParameter: '',
    // 指定是否阻止本节点的祖先节点出现点击态，微信小程序有效
    hoverStopPropagation: false,
    // 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文。只微信小程序有效
    lang: 'en',
    // 会话来源，open-type="contact"时有效。只微信小程序有效
    sessionFrom: '',
    // 会话内消息卡片标题，open-type="contact"时有效
    // 默认当前标题，只微信小程序有效
    sendMessageTitle: '',
    // 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效
    // 默认当前分享路径，只微信小程序有效
    sendMessagePath: '',
    // 会话内消息卡片图片，open-type="contact"时有效
    // 默认当前页面截图，只微信小程序有效
    sendMessageImg: '',
    // 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，
    // 用户点击后可以快速发送小程序消息，open-type="contact"时有效
    showMessageCard: false,
    // 手指按（触摸）按钮时按钮时的背景颜色
    hoverBgColor: '',
    // 水波纹的背景颜色
    rippleBgColor: '',
    // 是否开启水波纹效果
    ripple: false,
    // 按下的类名
    hoverClass: '',
    // 自定义样式，对象形式
    customStyle: () => {
      return {}
    },
    // 额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取
    dataName: '',
    // 节流，一定时间内只能触发一次
    throttleTime: 1000,
    // 按住后多久出现点击态，单位毫秒
    hoverStartTime: 20,
    // 手指松开后点击态保留时间，单位毫秒
    hoverStayTime: 150,
  });

  const emit = defineEmits<{
    (e: 'click', event: Event): void;
    (e: 'getphonenumber', result: unknown): void;
    (e: 'getuserinfo', result: unknown): void;
    (e: 'error', result: unknown): void;
    (e: 'opensetting', result: unknown): void;
    (e: 'launchapp', result: unknown): void;
  }>();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UButtonState>({
    rippleTop: 0, // 水波纹的起点Y坐标到按钮上边界的距离
    rippleLeft: 0, // 水波纹起点X坐标到按钮左边界的距离
    // 波纹按钮节点信息
    fields: {
      targetWidth: 0,
    },
    // 激活水波纹
    waveActive: false,
  });

  // 当没有传bgColor变量时，按钮按下去的颜色类名
  const getHoverClass = computed(() => {
    // 如果开启水波纹效果，则不启用hover-class效果
    if (props.loading || props.disabled || props.ripple || props.hoverClass) return '';
    let hoverClass = '';
    hoverClass = props.plain ? 'u-' + props.type + '-plain-hover' : 'u-' + props.type + '-hover';
    return hoverClass;
  });

  // 在'primary', 'success', 'error', 'warning'类型下，不显示边框，否则会造成四角有毛刺现象
  const showHairLineBorder = computed(() => {
    if (['primary', 'success', 'error', 'warning'].indexOf(props.type) >= 0 && !props.plain) {
      return '';
    } else {
      return 'u-hairline-border';
    }
  });

  // 获取节点信息
  const getElQuery = () => {
    return new Promise(resolve => {
      let queryInfo: any = '';
      // 获取元素节点信息，请查看uniapp相关文档
      // https://uniapp.dcloud.io/api/ui/nodes-info?id=nodesrefboundingclientrect
      queryInfo = uni.createSelectorQuery().in(instance?.proxy);
      //#ifdef MP-ALIPAY
      queryInfo = uni.createSelectorQuery();
      //#endif
      queryInfo.select('.u-btn').boundingClientRect();
      queryInfo.exec((data: any) => {
        resolve(data);
      });
    });
  };

  // 查询按钮的节点信息
  const getWaveQuery = (e: any) => {
    getElQuery().then((res: any) => {
      // 查询返回的是一个数组节点
      let data = res?.[0];
      // 查询不到节点信息，不操作
      if (!data.width || !data.width) return;
      // 水波纹的最终形态是一个正方形(通过border-radius让其变为一个圆形)，这里要保证正方形的边长等于按钮的最长边
      // 最终的方形（变换后的圆形）才能覆盖整个按钮
      data.targetWidth = data.height > data.width ? data.height : data.width;
      if (!data.targetWidth) return;
      state.fields = data;
      let touchesX: number = 0,
          touchesY: number = 0;
      // #ifdef MP-BAIDU
      touchesX = e.changedTouches[0].clientX;
      touchesY = e.changedTouches[0].clientY;
      // #endif
      // #ifdef MP-ALIPAY
      touchesX = e.detail.clientX;
      touchesY = e.detail.clientY;
      // #endif
      // #ifndef MP-BAIDU || MP-ALIPAY
      touchesX = e.touches[0].clientX;
      touchesY = e.touches[0].clientY;
      // #endif
      // 获取触摸点相对于按钮上边和左边的x和y坐标，原理是通过屏幕的触摸点（touchesY），减去按钮的上边界data.top
      // 但是由于`transform-origin`默认是center，所以这里再减去半径才是水波纹view应该的位置
      // 总的来说，就是把水波纹的矩形（变换后的圆形）的中心点，移动到我们的触摸点位置
      state.rippleTop = touchesY - data.top - data.targetWidth / 2;
      state.rippleLeft = touchesX - data.left - data.targetWidth / 2;
      nextTick(() => {
        state.waveActive = true;
      });
    });
  };

  // 按钮点击
  const click = (e: any) => {
    // 进行节流控制，props.throttle毫秒内，只在开始处执行
    const _throttleTime = props.throttleTime ? Number(props.throttleTime) : 0;
    throttle(() => {
      // 如果按钮时disabled和loading状态，不触发水波纹效果
      if (props.loading === true || props.disabled === true) return;
      // 是否开启水波纹效果
      if (props.ripple) {
        // 每次点击时，移除上一次的类，再次添加，才能触发动画效果
        state.waveActive = false;
        nextTick(function() {
          getWaveQuery(e);
        });
      }
      emit('click', e);
    }, _throttleTime);
  };

  // 下面为对接uniapp官方按钮开放能力事件回调的对接
  const getphonenumber = (res: any) => {
    emit('getphonenumber', res);
  };

  const getuserinfo = (res: any) => {
    emit('getuserinfo', res);
  };

  const error = (res: any) => {
    emit('error', res);
  };

  const opensetting = (res: any) => {
    emit('opensetting', res);
  };

  const launchapp = (res: any) => {
    emit('launchapp', res);
  };

  defineExpose({
    ...toRefs(state),
    getHoverClass,
    showHairLineBorder,
    click,
    getphonenumber,
    getuserinfo,
    error,
    opensetting,
    launchapp,
  });
</script>

<style scoped lang="scss">
@import '../../libs/css/style.components.scss';
.u-btn::after {
	border: none;
}

.u-btn {
	position: relative;
	border: 0;
	//border-radius: 10rpx;
	/* #ifndef APP-NVUE */
	display: inline-flex;		
	/* #endif */
	// 避免边框某些场景可能被“裁剪”，不能设置为hidden
	overflow: visible;
	line-height: 1;
	@include vue-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0 40rpx;
	z-index: 1;
	box-sizing: border-box;
	transition: all 0.15s;
	
	&--bold-border {
		border: 1px solid #ffffff;
	}
	
	&--default {
		color: $u-content-color;
		border-color: #c0c4cc;
		background-color: #ffffff;
	}
	
	&--primary {
		color: #ffffff;
		border-color: $u-type-primary;
		background-color: $u-type-primary;
	}
	
	&--success {
		color: #ffffff;
		border-color: $u-type-success;
		background-color: $u-type-success;
	}
	
	&--error {
		color: #ffffff;
		border-color: $u-type-error;
		background-color: $u-type-error;
	}
	
	&--warning {
		color: #ffffff;
		border-color: $u-type-warning;
		background-color: $u-type-warning;
	}
	
	&--default--disabled {
		color: #ffffff;
		border-color: #e4e7ed;
		background-color: #ffffff;
	}
	
	&--primary--disabled {
		color: #ffffff!important;
		border-color: $u-type-primary-disabled!important;
		background-color: $u-type-primary-disabled!important;
	}
	
	&--success--disabled {
		color: #ffffff!important;
		border-color: $u-type-success-disabled!important;
		background-color: $u-type-success-disabled!important;
	}
	
	&--error--disabled {
		color: #ffffff!important;
		border-color: $u-type-error-disabled!important;
		background-color: $u-type-error-disabled!important;
	}
	
	&--warning--disabled {
		color: #ffffff!important;
		border-color: $u-type-warning-disabled!important;
		background-color: $u-type-warning-disabled!important;
	}
	
	&--primary--plain {
		color: $u-type-primary!important;
		border-color: $u-type-primary-disabled!important;
		background-color: $u-type-primary-light!important;
	}
	
	&--success--plain {
		color: $u-type-success!important;
		border-color: $u-type-success-disabled!important;
		background-color: $u-type-success-light!important;
	}
	
	&--error--plain {
		color: $u-type-error!important;
		border-color: $u-type-error-disabled!important;
		background-color: $u-type-error-light!important;
	}
	
	&--warning--plain {
		color: $u-type-warning!important;
		border-color: $u-type-warning-disabled!important;
		background-color: $u-type-warning-light!important;
	}
}

.u-hairline-border:after {
	content: ' ';
	position: absolute;
	pointer-events: none;
	// 设置为border-box，意味着下面的scale缩小为0.5，实际上缩小的是伪元素的内容（border-box意味着内容不含border）
	box-sizing: border-box;
	// 中心点作为变形(scale())的原点
	-webkit-transform-origin: 0 0;
	transform-origin: 0 0;
	left: 0;
	top: 0;
	width: 199.8%;
	height: 199.7%;
	-webkit-transform: scale(0.5, 0.5);
	transform: scale(0.5, 0.5);
	border: 1px solid currentColor;
	z-index: 1;
}

.u-wave-ripple {
	z-index: 0;
	position: absolute;
	border-radius: 100%;
	background-clip: padding-box;
	pointer-events: none;
	user-select: none;
	transform: scale(0);
	opacity: 1;
	transform-origin: center;
}

.u-wave-ripple.u-wave-active {
	opacity: 0;
	transform: scale(2);
	transition: opacity 1s linear, transform 0.4s linear;
}

.u-round-circle {
	border-radius: 100rpx;
}

.u-round-circle::after {
	border-radius: 100rpx;
}

.u-loading::after {
	background-color: hsla(0, 0%, 100%, 0.35);
}

.u-size-default {
	font-size: 30rpx;
	height: 80rpx;
	line-height: 80rpx;
}

.u-size-medium {
	/* #ifndef APP-NVUE */
	display: inline-flex;		
	/* #endif */
	width: auto;
	font-size: 26rpx;
	height: 70rpx;
	line-height: 70rpx;
	padding: 0 80rpx;
}

.u-size-mini {
	/* #ifndef APP-NVUE */
	display: inline-flex;		
	/* #endif */
	width: auto;
	font-size: 22rpx;
	padding-top: 1px;
	height: 50rpx;
	line-height: 50rpx;
	padding: 0 20rpx;
}

.u-primary-plain-hover {
	color: #ffffff !important;
	background: $u-type-primary-dark !important;
}

.u-default-plain-hover {
	color: $u-type-primary-dark !important;
	background: $u-type-primary-light !important;
}

.u-success-plain-hover {
	color: #ffffff !important;
	background: $u-type-success-dark !important;
}

.u-warning-plain-hover {
	color: #ffffff !important;
	background: $u-type-warning-dark !important;
}

.u-error-plain-hover {
	color: #ffffff !important;
	background: $u-type-error-dark !important;
}

.u-info-plain-hover {
	color: #ffffff !important;
	background: $u-type-info-dark !important;
}

.u-default-hover {
	color: $u-type-primary-dark !important;
	border-color: $u-type-primary-dark !important;
	background-color: $u-type-primary-light !important;
}

.u-primary-hover {
	background: $u-type-primary-dark !important;
	color: #fff;
}

.u-success-hover {
	background: $u-type-success-dark !important;
	color: #fff;
}

.u-info-hover {
	background: $u-type-info-dark !important;
	color: #fff;
}

.u-warning-hover {
	background: $u-type-warning-dark !important;
	color: #fff;
}

.u-error-hover {
	background: $u-type-error-dark !important;
	color: #fff;
}
</style>
