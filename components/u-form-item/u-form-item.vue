<template>
  <view
      class="u-form-item"
      :class="{
        'u-border-bottom': elBorderBottom,
        'u-form-item__border-bottom--error':
          state.validateState === 'error' &&
          showError('border-bottom')
      }"
  >
    <view
        class="u-form-item__body"
        :style="{
			    flexDirection: elLabelPosition == 'left' ? 'row' : 'column'
		    }"
    >
      <!-- 微信小程序中，将一个参数设置空字符串，结果会变成字符串"true" -->
      <view
          class="u-form-item--left"
          :style="{
            width: uLabelWidth,
            flex: `0 0 ${uLabelWidth}`,
            marginBottom: elLabelPosition == 'left' ? 0 : '10rpx',
          }"
      >
        <!-- 为了块对齐 -->
        <view
            class="u-form-item--left__content"
            v-if="props.required || props.leftIcon || props.label"
        >
          <!-- nvue不支持伪元素before -->
          <text
              v-if="props.required"
              class="u-form-item--left__content--required"
          >*</text>
          <view
              class="u-form-item--left__content__icon"
              v-if="props.leftIcon"
          >
            <u-icon
                :name="props.leftIcon"
                :custom-style="props.leftIconStyle"
            ></u-icon>
          </view>
          <view
              class="u-form-item--left__content__label"
              :style="[
                  elLabelStyle, {
						        'justify-content': elLabelAlign == 'left' ?
                        'flex-start' : elLabelAlign == 'center' ?
                           'center' : 'flex-end'
					    }]">
            {{ props.label }}
          </view>
        </view>
      </view>
      <view class="u-form-item--right u-flex">
        <view class="u-form-item--right__content">
          <view class="u-form-item--right__content__slot ">
            <slot />
          </view>
          <view
              class="u-form-item--right__content__icon u-flex"
              v-if="rightSlot || props.rightIcon"
          >
            <u-icon
                :custom-style="props.rightIconStyle"
                v-if="props.rightIcon"
                :name="props.rightIcon"
            ></u-icon>
            <slot name="right" />
          </view>
        </view>
      </view>
    </view>
    <view
        class="u-form-item__message"
        v-if="state.validateState === 'error' && showError('message')"
        :style="{
          paddingLeft: elLabelPosition == 'left' ? addUnit(elLabelWidth) : '0',
        }"
    >
      {{ state.validateMessage }}
    </view>
  </view>
</template>

<script lang="ts">
  export default {
    name: 'u-form-item',
  }
</script>

<script setup lang="ts">
  import {
    ComponentInternalInstance,
    getCurrentInstance,
    ref,
    reactive,
    toRefs,
    computed,
    watch,
    inject,
    nextTick,
    onMounted,
    onBeforeUnmount,
    CSSProperties, withDefaults, useSlots
  } from 'vue';
  // @ts-ignore
  import Schema from '../../libs/util/async-validator';
  import { useComposable } from '../../libs/hooks';

  // 去除警告信息
  Schema.warning = function() {};

  /**
   * form-item 表单item
   * @description 此组件一般用于表单场景，可以配置Input输入框，Select弹出框，进行表单验证等。
   * @tutorial http://uviewui.com/components/form.html
   * @property {String} label 左侧提示文字
   * @property {Object} prop 表单域model对象的属性名，在使用 validate、resetFields 方法的情况下，该属性是必填的
   * @property {Boolean} border-bottom 是否显示表单域的下划线边框
   * @property {String} label-position 表单域提示文字的位置，left-左侧，top-上方
   * @property {String Number} label-width 提示文字的宽度，单位rpx（默认90）
   * @property {Object} label-style lable的样式，对象形式
   * @property {String} label-align lable的对齐方式
   * @property {String} right-icon 右侧自定义字体图标(限uView内置图标)或图片地址
   * @property {String} left-icon 左侧自定义字体图标(限uView内置图标)或图片地址
   * @property {Object} left-icon-style 左侧图标的样式，对象形式
   * @property {Object} right-icon-style 右侧图标的样式，对象形式
   * @property {Boolean} required 是否显示左边的"*"号，这里仅起展示作用，如需校验必填，请通过rules配置必填规则(默认false)
   * @example <u-form-item label="姓名"><u-input v-model="form.name" /></u-form-item>
   */
  interface IParentDataProps {
    borderBottom: string | boolean;
    labelWidth: number | string;
    labelPosition: string;
    labelStyle: any;
    labelAlign: string;
  }
  interface UFormItemState {
    initialValue: string; // 存储的默认值
    // isRequired: false, // 是否必填，由于人性化考虑，必填"*"号通过props的required配置，不再通过rules的规则自动生成
    validateState: any; // 是否校验成功
    validateMessage: string; // 校验失败的提示语
    // 有错误时的提示方式，message-提示信息，border-如果input设置了边框，变成呈红色，
    errorType: string[];
    fieldValue: string; // 获取当前子组件input的输入的值
    // 父组件的参数，在computed计算中，无法得知parent发生变化，故将父组件的参数值，放到data中
    parentData: IParentDataProps | any;
  }
  interface UFormItemProps {
    // input的label提示语
    label: string;
    // 绑定的值
    prop: string;
    // 是否显示表单域的下划线边框
    borderBottom?: string | boolean;
    // label的位置，left-左边，top-上边
    labelPosition?: 'left' | 'top' | '';
    // label的宽度，单位rpx
    labelWidth?: string | number;
    // lable的样式，对象形式
    labelStyle?: CSSProperties;
    // lable字体的对齐方式
    labelAlign?: string;
    // 右侧图标
    rightIcon?: string;
    // 左侧图标
    leftIcon?: string;
    // 左侧图标的样式
    leftIconStyle?: CSSProperties;
    // 左侧图标的样式
    rightIconStyle?: CSSProperties;
    // 是否显示左边的必填星号，只作显示用，具体校验必填的逻辑，请在rules中配置
    required?: boolean;
  }

  const rightSlot = useSlots().right;

  const props = withDefaults(defineProps<UFormItemProps>(),  {
    // input的label提示语
    label: '',
    // 绑定的值
    prop: '',
    // 是否显示表单域的下划线边框
    borderBottom: '',
    // label的位置，left-左边，top-上边
    labelPosition: '',
    // label的宽度，单位rpx
    labelWidth: '',
    // lable的样式，对象形式
    labelStyle: () => {
      return {}
    },
    // lable字体的对齐方式
    labelAlign: '',
    // 右侧图标
    rightIcon: '',
    // 左侧图标
    leftIcon: '',
    // 左侧图标的样式
    leftIconStyle: () => {
      return {}
    },
    // 左侧图标的样式
    rightIconStyle: () => {
      return {}
    },
    // 是否显示左边的必填星号，只作显示用，具体校验必填的逻辑，请在rules中配置
    required: false,
  });

  const { addUnit, $parentUtil, broadcast, parent } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();
  const emitter = instance?.appContext.config.globalProperties.emitter;

  const uForm = inject<ComponentInternalInstance | null>('uForm', null);

  const state = reactive<UFormItemState>({
    initialValue: '', // 存储的默认值
    // isRequired: false, // 是否必填，由于人性化考虑，必填"*"号通过props的required配置，不再通过rules的规则自动生成
    validateState: '', // 是否校验成功
    validateMessage: '', // 校验失败的提示语
    // 有错误时的提示方式，message-提示信息，border-如果input设置了边框，变成呈红色，
    errorType: ['message'],
    fieldValue: '', // 获取当前子组件input的输入的值
    // 父组件的参数，在computed计算中，无法得知parent发生变化，故将父组件的参数值，放到data中
    parentData: {
      borderBottom: true,
      labelWidth: 90,
      labelPosition: 'left',
      labelStyle: {},
      labelAlign: 'left',
    },
  });

  // label的宽度
  const elLabelWidth = computed(() => {
    // label默认宽度为90，优先使用本组件的值，如果没有(如果设置为0，也算是配置了值，依然起效)，则用u-form的值
    return (
        props.labelWidth != 0 ||
        props.labelWidth !== null ||
        props.labelWidth !== ""
    ) ? props.labelWidth :
        (state.parentData.labelWidth ?
            state.parentData
                .labelWidth :
            90);
  });

  // 计算后的label宽度，由于需要多个判断，故放到computed中
  const uLabelWidth = computed(() => {
    // 如果用户设置label为空字符串(微信小程序空字符串最终会变成字符串的'true')，意味着要将label的位置宽度设置为auto
    return elLabelPosition.value == 'left' ?
        (
            props.label === 'true' ||
            props.label === '' ? 'auto' : addUnit(elLabelWidth.value)
        ) : '100%';
  });

  const showError = computed(() => {
    return (type: any) => {
      // 如果errorType数组中含有none，或者toast提示类型
      if (state.errorType?.indexOf('none') >= 0) return false;
      else if (state.errorType?.indexOf(type) >= 0) return true;
      else return false;
    }
  });

  // label的样式
  const elLabelStyle = computed(() => {
    return props.labelStyle && Object.keys(props.labelStyle).length ?
        props.labelStyle :
          (state.parentData.labelStyle ? state.parentData.labelStyle : {});
  });

  // label的位置，左侧或者上方
  const elLabelPosition = computed(() => {
    return props.labelPosition ? props.labelPosition :
        (state.parentData.labelPosition ? state.parentData.labelPosition : 'left');
  });

  // label的对齐方式
  const elLabelAlign = computed(() => {
    return props.labelAlign ? props.labelAlign :
        (state.parentData.labelAlign ? state.parentData.labelAlign : 'left');
  });

  // label的下划线
  const elBorderBottom = computed(() => {
    // 子组件的borderBottom默认为空字符串，如果不等于空字符串，意味着子组件设置了值，优先使用子组件的值
    return props.borderBottom !== '' ?
        props.borderBottom : state.parentData.borderBottom ?
            state.parentData.borderBottom : true;
  });

  const broadcastInputError = () => {
    // 子组件发出事件，第三个参数为true或者false，true代表有错误
    if (parent.value?.type?.name === 'u-input') {
      const isErr: boolean = state.validateState === 'error' && showError.value('border');
      emitter.emit('on-form-item-error', isErr);
    }
    broadcast(
        'u-input',
        'on-form-item-error',
        instance?.exposeProxy?.validateState === 'error' &&
        instance?.exposeProxy?.showError('border')
    );
  };

  // 判断是否需要required校验
  const setRules = () => {
    // 由于人性化考虑，必填"*"号通过props的required配置，不再通过rules的规则自动生成
    // 从父组件u-form拿到当前u-form-item需要验证 的规则
    // let rules = this.getRules();
    // if (rules.length) {
    // 	this.isRequired = rules.some(rule => {
    // 		// 如果有必填项，就返回，没有的话，就是undefined
    // 		return rule.required;
    // 	});
    // }
    // blur事件
    emitter.on('on-form-blur', onFieldBlur);
    // change事件
    emitter.on('on-form-change', onFieldChange);
  };

  // 从u-form的rules属性中，取出当前u-form-item的校验规则
  const getRules = () => {
    // 父组件的所有规则
    let rules = parent.value?.exposeProxy?.rules;
    rules = rules ? rules[props.prop] : [];
    // 保证返回的是一个数组形式
    return [].concat(rules || []);
  };

  // 过滤出符合要求的rule规则
  const getFilteredRule = (triggerType = '') => {
    let rules = getRules();
    // 整体验证表单时，triggerType为空字符串，此时返回所有规则进行验证
    if (!triggerType) return rules;
    // 历遍判断规则是否有对应的事件，比如blur，change触发等的事件
    // 使用indexOf判断，是因为某些时候设置的验证规则的trigger属性可能为多个，比如['blur','change']
    // 某些场景可能的判断规则，可能不存在trigger属性，故先判断是否存在此属性
    return rules.filter((res: any) => res.trigger && res.trigger.indexOf(triggerType) !== -1);
  };

  // 校验数据
  const validation = (trigger: any, callback = (msg?: string) => {}) => {
    // 检验之间，先获取需要校验的值
    state.fieldValue = parent.value?.exposeProxy?.model?.[props.prop];
    // blur和change是否有当前方式的校验规则
    let rules = getFilteredRule(trigger);
    // 判断是否有验证规则，如果没有规则，也调用回调方法，否则父组件u-form会因为
    // 对count变量的统计错误而无法进入上一层的回调
    if (!rules || rules.length === 0) {
      return callback('');
    }
    // 设置当前的装填，标识为校验中
    state.validateState = 'validating';
    // 调用async-validator的方法
    // @ts-ignore
    let validator = new Schema({
      [props.prop]: rules
    });
    validator.validate({
      [props.prop]: state.fieldValue
    }, {
      firstFields: true
    }, (errors: any, fields: any) => {
      // 记录状态和报错信息
      state.validateState = !errors ? 'success' : 'error';
      state.validateMessage = errors ? errors[0].message : '';
      // 调用回调方法
      callback(state.validateMessage);
    });
  };

  // blur事件时进行表单校验
  const onFieldBlur = () => {
    validation('blur');
  };

  // change事件进行表单校验
  const onFieldChange = () => {
    validation('change');
  };

  // 清空当前的u-form-item
  const resetField = () => {
    if (parent.value && parent.value?.exposeProxy) {
      parent.value.exposeProxy.model[props.prop] = state.initialValue;
    }
    // 设置为`success`状态，只是为了清空错误标记
    state.validateState = 'success';
  };

  watch(() => state.validateState, (newValue: string, oldValue: string) => {
    broadcastInputError();
  });

  // 监听u-form组件的errorType的变化
  watch(() => uForm?.exposeProxy?.errorType, (newValue: string[], oldValue: string[]) => {
    state.errorType = newValue;
    broadcastInputError();
  });

  // 组件创建完成时，将当前实例保存到u-form中
  onMounted(() => {
    // 支付宝、头条小程序不支持provide/inject，所以使用这个方法获取整个父组件，在created定义，避免循环应用
    parent.value = $parentUtil('u-form');
    if (parent.value) {
      // 历遍parentData中的属性，将parent中的同名属性赋值给parentData
      Object.keys(state.parentData).map((key: string) => {
        state.parentData[key] = parent.value?.props?.[key];
      });
      // 如果没有传入prop，或者uForm为空(如果u-form-input单独使用，就不会有uForm注入)，就不进行校验
      if (props.prop) {
        // 将本实例添加到父组件中
        parent.value?.exposeProxy?.fields.push(instance);
        state.errorType = parent.value?.props?.errorType;
        // 设置初始值
        state.initialValue = state.fieldValue;
        // 添加表单校验，这里必须要写在$nextTick中，因为u-form的rules是通过ref手动传入的
        // 不在$nextTick中的话，可能会造成执行此处代码时，父组件还没通过ref把规则给u-form，导致规则为空
        nextTick(() => {
          setRules();
        });
      }
    }
  });

  // 组件销毁前，将实例从u-form的缓存中移除
  onBeforeUnmount(() => {
    // 如果当前没有prop的话表示当前不要进行删除（因为没有注入）
    if (parent.value && props.prop) {
      parent.value?.exposeProxy?.fields.map((item: any, index: number) => {
        if (item === instance) parent.value?.exposeProxy?.fields?.splice(index, 1);
      })
    }
  });

  defineExpose({
    ...toRefs(state),
    elLabelWidth,
    uLabelWidth,
    showError,
    elLabelStyle,
    elLabelPosition,
    elLabelAlign,
    elBorderBottom,
    broadcastInputError,
    setRules,
    getRules,
    onFieldBlur,
    onFieldChange,
    getFilteredRule,
    validation,
    resetField,
  });
</script>

<style lang="scss" scoped>
  @import "../../libs/css/style.components.scss";

  .u-form-item {
    @include vue-flex;
    // align-items: flex-start;
    padding: 20rpx 0;
    font-size: 32rpx;
    color: $u-main-color;
    box-sizing: border-box;
    line-height: $u-form-item-height;
    flex-direction: column;

    &__border-bottom--error:after {
      border-color: $u-type-error;
    }

    &__body {
      @include vue-flex;
    }

    &--left {
      @include vue-flex;
      align-items: center;

      &__content {
        position: relative;
        @include vue-flex;
        align-items: center;
        padding-right: 10rpx;
        flex: 1;

        &__icon {
          margin-right: 8rpx;
        }

        &--required {
          position: absolute;
          left: -16rpx;
          vertical-align: middle;
          color: $u-type-error;
          padding-top: 6rpx;
        }

        &__label {
          @include vue-flex;
          align-items: center;
          flex: 1;
        }
      }
    }

    &--right {
      flex: 1;

      &__content {
        @include vue-flex;
        align-items: center;
        flex: 1;

        &__slot {
          flex: 1;
          /* #ifndef MP */
          @include vue-flex;
          align-items: center;
          /* #endif */
        }

        &__icon {
          margin-left: 10rpx;
          color: $u-light-color;
          font-size: 30rpx;
        }
      }
    }

    &__message {
      font-size: 24rpx;
      line-height: 24rpx;
      color: $u-type-error;
      margin-top: 12rpx;
      text-align: left;
    }
  }
</style>
