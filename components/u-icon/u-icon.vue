<template>
	<view
      :style="[props.customStyle]"
      class="u-icon"
      @tap="click"
      :class="['u-icon--' + props.labelPos]"
  >
		<image
        class="u-icon__img"
        v-if="isImg"
        :src="props.name"
        :mode="props.imgMode"
        :style="[imgStyle]"
    ></image>
		<text
        v-else
        class="u-icon__icon"
        :class="customClass"
        :style="[iconStyle]"
        :hover-class="props.hoverClass"
        @touchstart="touchstart"
    >
			<text
          v-if="props.showDecimalIcon"
          :style="[decimalIconStyle]"
          :class="decimalIconClass"
          :hover-class="props.hoverClass"
				  class="u-icon__decimal"
      >
			</text>
		</text>
		<!-- 这里进行空字符串判断，如果仅仅是v-if="label"，可能会出现传递0的时候，结果也无法显示 -->
		<text
        v-if="props.label !== ''"
        class="u-icon__label"
        :style="{
          color: props.labelColor,
          fontSize: addUnit(props.labelSize),
          marginLeft: props.labelPos == 'right' ? addUnit(props.marginLeft) : 0,
          marginTop: props.labelPos == 'bottom' ? addUnit(props.marginTop) : 0,
          marginRight: props.labelPos == 'left' ? addUnit(props.marginRight) : 0,
          marginBottom: props.labelPos == 'top' ? addUnit(props.marginBottom) : 0,
        }"
    >
      {{ props.label }}
		</text>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-icon',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, CSSProperties, getCurrentInstance, computed, withDefaults } from 'vue'
  import { useComposable } from '../../libs/hooks';
  /**
   * icon 图标
   * @description 基于字体的图标集，包含了大多数常见场景的图标。
   * @tutorial https://www.uviewui.com/components/icon.html
   * @property {String} name 图标名称，见示例图标集
   * @property {String} color 图标颜色（默认inherit）
   * @property {String | Number} size 图标字体大小，单位rpx（默认32）
   * @property {String | Number} label-size label字体大小，单位rpx（默认28）
   * @property {String} label 图标右侧的label文字（默认28）
   * @property {String} label-pos label文字相对于图标的位置，只能right或bottom（默认right）
   * @property {String} label-color label字体颜色（默认#606266）
   * @property {Object} custom-style icon的样式，对象形式
   * @property {String} custom-prefix 自定义字体图标库时，需要写上此值
   * @property {String | Number} margin-left label在右侧时与图标的距离，单位rpx（默认6）
   * @property {String | Number} margin-top label在下方时与图标的距离，单位rpx（默认6）
   * @property {String | Number} margin-bottom label在上方时与图标的距离，单位rpx（默认6）
   * @property {String | Number} margin-right label在左侧时与图标的距离，单位rpx（默认6）
   * @property {String} label-pos label相对于图标的位置，只能right或bottom（默认right）
   * @property {String} index 一个用于区分多个图标的值，点击图标时通过click事件传出
   * @property {String} hover-class 图标按下去的样式类，用法同uni的view组件的hover-class参数，详情见官网
   * @property {String} width 显示图片小图标时的宽度
   * @property {String} height 显示图片小图标时的高度
   * @property {String} top 图标在垂直方向上的定位
   * @property {String} top 图标在垂直方向上的定位
   * @property {String} top 图标在垂直方向上的定位
   * @property {Boolean} show-decimal-icon 是否为DecimalIcon
   * @property {String} inactive-color 背景颜色，可接受主题色，仅Decimal时有效
   * @property {String | Number} percent 显示的百分比，仅Decimal时有效
   * @event {Function} click 点击图标时触发
   * @example <u-icon name="photo" color="#2979ff" size="28"></u-icon>
   */
  interface UIconProps {
    // 图标类名
    name: string;
    // 图标颜色，可接受主题色
    color?: string;
    // 字体大小，单位rpx
    size?: number | string;
    // 是否显示粗体
    bold?: boolean;
    // 点击图标的时候传递事件出去的index（用于区分点击了哪一个）
    index?: number | string;
    // 触摸图标时的类名
    hoverClass?: string;
    // 自定义扩展前缀，方便用户扩展自己的图标库
    customPrefix?: string;
    // 图标右边或者下面的文字
    label?: number | string;
    // label的位置，只能右边或者下边
    labelPos?: string;
    // label的大小
    labelSize?: number | string;
    // label的颜色
    labelColor?: string;
    // label与图标的距离(横向排列)
    marginLeft?: number | string;
    // label与图标的距离(竖向排列)
    marginTop?: number | string;
    // label与图标的距离(竖向排列)
    marginRight?: number | string;
    // label与图标的距离(竖向排列)
    marginBottom?: number | string;
    // 图片的mode
    // https://uniapp.dcloud.io/component/image.html
    imgMode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top'
      | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
    // 自定义样式
    customStyle?: CSSProperties;
    // 用于显示图片小图标时，图片的宽度
    width?: number | string;
    // 用于显示图片小图标时，图片的高度
    height?: number | string;
    // 用于解决某些情况下，让图标垂直居中的用途
    top?: number | string;
    // 是否为DecimalIcon
    showDecimalIcon?: boolean;
    // 背景颜色，可接受主题色，仅Decimal时有效
    inactiveColor?: string;
    // 显示的百分比，仅Decimal时有效
    percent?: number | string;
  }

  const props = withDefaults(defineProps<UIconProps>(), {
    // 图标类名
    name: '',
    // 图标颜色，可接受主题色
    color: '',
    // 字体大小，单位rpx
    size: 'inherit',
    // 是否显示粗体
    bold: false,
    // 点击图标的时候传递事件出去的index（用于区分点击了哪一个）
    index: '',
    // 触摸图标时的类名
    hoverClass: '',
    // 自定义扩展前缀，方便用户扩展自己的图标库
    customPrefix: 'uicon',
    // 图标右边或者下面的文字
    label: '',
    // label的位置，只能右边或者下边
    labelPos: 'right',
    // label的大小
    labelSize: '28',
    // label的颜色
    labelColor: '#606266',
    // label与图标的距离(横向排列)
    marginLeft: '6',
    // label与图标的距离(竖向排列)
    marginTop: '6',
    // label与图标的距离(竖向排列)
    marginRight: '6',
    // label与图标的距离(竖向排列)
    marginBottom: '6',
    // 图片的mode
    imgMode: 'widthFix',
    // 自定义样式
    customStyle: () => {
      return {}
    },
    // 用于显示图片小图标时，图片的宽度
    width: '',
    // 用于显示图片小图标时，图片的高度
    height: '',
    // 用于解决某些情况下，让图标垂直居中的用途
    top: 0,
    // 是否为DecimalIcon
    showDecimalIcon: false,
    // 背景颜色，可接受主题色，仅Decimal时有效
    inactiveColor: '#ececec',
    // 显示的百分比，仅Decimal时有效
    percent: '50',
  });

  const emit = defineEmits<{
    (e: 'click', index: string | number | null): void;
    (e: 'touchstart', index: string | number | null): void;
  }>();

  const { guid, addUnit, getRect, CONFIG } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const customClass = computed(() => {
    let classes: string[] | string = [];
    classes.push(props.customPrefix + '-' + props.name);
    // uView的自定义图标类名为u-iconfont
    if (props.customPrefix == 'uicon') {
      classes.push('u-iconfont');
    } else {
      props.customPrefix && classes.push(props.customPrefix);
    }
    // 主题色，通过类配置
    if (props.showDecimalIcon && props.inactiveColor && CONFIG.type.includes(props.inactiveColor)) {
      classes.push('u-icon__icon--' + props.inactiveColor);
    } else if (props.color && CONFIG.type.includes(props.color)) classes.push('u-icon__icon--' + props.color);
    // 阿里，头条，百度小程序通过数组绑定类名时，无法直接使用[a, b, c]的形式，否则无法识别
    // 故需将其拆成一个字符串的形式，通过空格隔开各个类名
    //#ifdef MP-ALIPAY || MP-TOUTIAO || MP-BAIDU
    classes = classes.join(' ');
    //#endif
    return classes;
  });

  const iconStyle = computed(() => {
    let style: CSSProperties = {};
    style = {
      fontSize: props.size == 'inherit' ? 'inherit' :addUnit(props.size),
      fontWeight: props.bold ? 'bold' : 'normal',
      // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
      top: addUnit(props.top),
    };
    // 非主题色值时，才当作颜色值
    if (props.showDecimalIcon && props.inactiveColor && !CONFIG.type.includes(props.inactiveColor)) {
      style.color = props.inactiveColor
    } else if (props.color && !CONFIG.type.includes(props.color)) {
      style.color = props.color;
    }
    return style;
  });

  // 判断传入的name属性，是否图片路径，只要带有"/"均认为是图片形式
  const isImg = computed(() => {
    return props.name.indexOf('/') !== -1;
  });

  const imgStyle = computed(() => {
    let style: CSSProperties = {};
    // 如果设置width和height属性，则优先使用，否则使用size属性
    style.width = props.width ? addUnit(props.width) : addUnit(props.size);
    style.height = props.height ? addUnit(props.height) : addUnit(props.size);
    return style;
  });

  const decimalIconStyle = computed(() => {
    let style: CSSProperties = {};
    style = {
      fontSize: props.size == 'inherit' ? 'inherit' : addUnit(props.size),
      fontWeight: props.bold ? 'bold' : 'normal',
      // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
      top: addUnit(props.top),
      width: props.percent + '%',
    };
    // 非主题色值时，才当作颜色值
    if (props.color && !CONFIG.type.includes(props.color)) style.color = props.color;
    return style;
  });

  const decimalIconClass= computed(() => {
    let classes: string[] | string = []
    classes.push(props.customPrefix + '-' + props.name);
    // uView的自定义图标类名为u-iconfont
    if (props.customPrefix == 'uicon') {
      classes.push('u-iconfont');
    } else {
      props.customPrefix && classes.push(props.customPrefix);
    }
    // 主题色，通过类配置
    if (props.color && CONFIG.type.includes(props.color)) classes.push('u-icon__icon--' + props.color);
    else classes.push('u-icon__icon--primary');
    // 阿里，头条，百度小程序通过数组绑定类名时，无法直接使用[a, b, c]的形式，否则无法识别
    // 故需将其拆成一个字符串的形式，通过空格隔开各个类名
    //#ifdef MP-ALIPAY || MP-TOUTIAO || MP-BAIDU
    classes = classes.join(' ');
    //#endif
    return classes;
  });

  const click = () => {
    emit('click', props.index || null);
  };

  const touchstart = () => {
    emit('touchstart', props.index || null);
  };

  defineExpose({
    customClass,
    iconStyle,
    isImg,
    imgStyle,
    decimalIconStyle,
    decimalIconClass,
    click,
    touchstart,
  });
</script>

<style scoped lang="scss">
@import "../../libs/css/style.components.scss";
@import '../../iconfont.css';

.u-icon {
	display: inline-flex;
	align-items: center;

	&--left {
		flex-direction: row-reverse;
		align-items: center;
	}

	&--right {
		flex-direction: row;
		align-items: center;
	}

	&--top {
		flex-direction: column-reverse;
		justify-content: center;
	}

	&--bottom {
		flex-direction: column;
		justify-content: center;
	}

	&__icon {
		position: relative;

		&--primary {
			color: $u-type-primary;
		}

		&--success {
			color: $u-type-success;
		}

		&--error {
			color: $u-type-error;
		}

		&--warning {
			color: $u-type-warning;
		}

		&--info {
			color: $u-type-info;
		}
	}

	&__decimal {
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		overflow: hidden;
	}

	&__img {
		height: auto;
		will-change: transform;
	}

	&__label {
		line-height: 1;
	}
}
</style>
