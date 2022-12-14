<template>
	<view
      class="u-toast"
      :class="[
          state.isShow ? 'u-show' : '',
          'u-type-' + state.tmpConfig.type,
          'u-position-' + state.tmpConfig.position
          ]"
      :style="{
        zIndex: uZIndex
      }"
  >
		<view class="u-icon-wrap">
			<u-icon
          v-if="state.tmpConfig.icon"
          class="u-icon"
          :name="iconName"
          :size="30"
          :color="state.tmpConfig.type"
      ></u-icon>
		</view>
		<text class="u-text">
      {{ state.tmpConfig.title }}
    </text>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-toast',
  }
</script>

<script setup lang="ts">
  import { reactive, toRefs, computed, withDefaults } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * toast 消息提示
	 * @description 此组件表现形式类似uni的uni.showToastAPI，但也有不同的地方。
	 * @tutorial https://www.uviewui.com/components/toast.html
	 * @property {String} z-index toast展示时的z-index值
	 * @event {Function} show 显示toast，如需一进入页面就显示toast，请在onReady生命周期调用
	 * @example <u-toast ref="uToast" />
	 */
  interface UToastTmpConfig {
    title: string | null;
    type: string | null;
    icon: string | boolean | null;
    position: string | null;
    url: string | null;
    params: any | null;
    isTab: boolean | null;
    back: boolean | null;
    duration: number | null;
    callback: Function | null;
  }
  interface UToastState {
    isShow: boolean;
    timer: number | null; // 定时器
    config: UToastTmpConfig;
    tmpConfig: UToastTmpConfig;
  }
  interface UToastProps {
    // z-index值
    zIndex?: number | string;
  }
  const props = withDefaults(defineProps<UToastProps>(),{});

  const { type2icon, queryParams, deepMerge, route, Z_INDEX_CONFIG } = useComposable();

  const state = reactive<UToastState>({
    isShow: false,
    timer: null, // 定时器
    config: () => {
      return {
        params: {}, // URL跳转的参数，对象
        title: '', // 显示文本
        type: '', // 主题类型，primary，success，error，warning，black
        duration: 2000, // 显示的时间，毫秒
        isTab: false, // 是否跳转tab页面
        url: '', // toast消失后是否跳转页面，有则跳转，优先级高于back参数
        icon: true, // 显示的图标
        position: 'center', // toast出现的位置
        callback: null, // 执行完后的回调函数
        back: false, // 结束toast是否自动返回上一页
      }
    },
    // 将用户配置和内置配置合并后的临时配置变量
    tmpConfig: () => {
      return {
        title: '',
        type: '',
        icon: '',
        position: '',
        url: '',
        params: '',
        isTab: false,
        back: false,
        duration: 0,
        callback: null,
      }
    },
  });

  const iconName = computed(() => {
    // 只有不为none，并且type为error|warning|succes|info时候，才显示图标
    if (state.tmpConfig.type) {
      if (['error', 'warning', 'success', 'info'].indexOf(state.tmpConfig.type) >= 0 && state.tmpConfig.icon) {
        let icon = type2icon(state.tmpConfig.type);
        return icon;
      }
    }
  });

  const uZIndex = computed(() => {
    // 显示toast时候，如果用户有传递z-index值，有限使用
    return state.isShow ? (props.zIndex ? props.zIndex : Z_INDEX_CONFIG.toast) : '999999';
  });

  // 倒计时结束之后，进行的一些操作
  const timeEnd = () => {
    // 如果带有url值，根据isTab为true或者false进行跳转
    if (state.tmpConfig.url) {
      // 如果url没有"/"开头，添加上，因为uni的路由跳转需要"/"开头
      if (state.tmpConfig.url[0] != '/') state.tmpConfig.url = '/' + state.tmpConfig.url;
      // 判断是否有传递显式的参数
      if (Object.keys(state.tmpConfig.params).length) {
        // 判断用户传递的url中，是否带有参数
        // 使用正则匹配，主要依据是判断是否有"/","?","="等，如“/page/index/index?name=mary"
        // 如果有params参数，转换后无需带上"?"
        let query = '';
        if (/.*\/.*\?.*=.*/.test(state.tmpConfig.url)) {
          // object对象转为get类型的参数
          query = queryParams(state.tmpConfig.params, false);
          state.tmpConfig.url = state.tmpConfig.url + "&" + query;
        } else {
          query = queryParams(state.tmpConfig.params);
          state.tmpConfig.url += query;
        }
      }
      // 如果是跳转tab页面，就使用uni.switchTab
      if (state.tmpConfig.isTab) {
        uni.switchTab({
          url: state.tmpConfig.url
        });
      } else {
        uni.navigateTo({
          url: state.tmpConfig.url
        });
      }
    } else if(state.tmpConfig.back) {
      // 回退到上一页
      route({
        type: 'back'
      });
    }
  };

  // 显示toast组件，由父组件通过this.$refs.xxx.show(options)形式调用
  const show = (options: any) => {
    // 不降结果合并到this.config变量，避免多次条用u-toast，前后的配置造成混论
    state.tmpConfig = deepMerge(state.config, options);
    if (state.timer) {
      // 清除定时器
      clearTimeout(state.timer);
      state.timer = null;
    }
    state.isShow = true;
    state.timer = setTimeout(() => {
      // 倒计时结束，清除定时器，隐藏toast组件
      state.isShow = false;
      clearTimeout(Number(state.timer));
      state.timer = null;
      // 判断是否存在callback方法，如果存在就执行
      typeof(state.tmpConfig.callback) === 'function' && state.tmpConfig.callback();
      timeEnd();
    }, Number(state.tmpConfig.duration));
  };

  // 隐藏toast组件，由父组件通过this.$refs.xxx.hide()形式调用
  const hide = () => {
    state.isShow = false;
    if (state.timer) {
      // 清除定时器
      clearTimeout(state.timer);
      state.timer = null;
    }
  };

  defineExpose({
    ...toRefs(state),
    iconName,
    uZIndex,
    show,
    hide,
    timeEnd,
  });
</script>

<style lang="scss" scoped>
	@import "../../libs/css/style.components.scss";
	
	.u-toast {
		position: fixed;
		z-index: -1;
		transition: opacity 0.3s;
		text-align: center;
		color: #fff;
		border-radius: 8rpx;
		background: #585858;
		@include vue-flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		opacity: 0;
		pointer-events: none;
		padding: 18rpx 40rpx;
	}

	.u-toast.u-show {
		opacity: 1;
	}

	.u-icon {
		margin-right: 10rpx;
		@include vue-flex;
		align-items: center;
		line-height: normal;
	}

	.u-position-center {
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		/* #ifndef APP-NVUE */
		max-width: 70%;
		/* #endif */
	}

	.u-position-top {
		left: 50%;
		top: 20%;
		transform: translate(-50%,-50%);
	}

	.u-position-bottom {
		left: 50%;
		bottom: 20%;
		transform: translate(-50%,-50%);
	}

	.u-type-primary {
		color: $u-type-primary;
		background-color: $u-type-primary-light;
		border: 1px solid rgb(215, 234, 254);
	}

	.u-type-success {
		color: $u-type-success;
		background-color: $u-type-success-light;
		border: 1px solid #BEF5C8;
	}

	.u-type-error {
		color: $u-type-error;
		background-color: $u-type-error-light;
		border: 1px solid #fde2e2;
	}

	.u-type-warning {
		color: $u-type-warning;
		background-color: $u-type-warning-light;
		border: 1px solid #faecd8;
	}

	.u-type-info {
		color: $u-type-info;
		background-color: $u-type-info-light;
		border: 1px solid #ebeef5;
	}

	.u-type-default {
		color: #fff;
		background-color: #585858;
	}
</style>
