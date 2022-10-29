<template>
	<view class="u-form"><slot /></view>
</template>

<script lang="ts">
  export default {
    name: 'u-form',
  }
</script>

<script setup lang="ts">
  import { ComponentInternalInstance, CSSProperties, getCurrentInstance, ref, provide, withDefaults } from "vue";
  import { useComposable } from '../../libs/hooks';
	/**
	 * form 表单
	 * @description 此组件一般用于表单场景，可以配置Input输入框，Select弹出框，进行表单验证等。
	 * @tutorial http://uviewui.com/components/form.html
	 * @property {Object} model 表单数据对象
	 * @property {Boolean} border-bottom 是否显示表单域的下划线边框
	 * @property {String} label-position 表单域提示文字的位置，left-左侧，top-上方
	 * @property {String Number} label-width 提示文字的宽度，单位rpx（默认90）
	 * @property {Object} label-style lable的样式，对象形式
	 * @property {String} label-align lable的对齐方式
	 * @property {Object} rules 通过ref设置，见官网说明
	 * @property {Array} error-type 错误的提示方式，数组形式，见上方说明(默认['message'])
	 * @example <u-form :model="form" ref="uForm"></u-form>
	 */
  type AsyncValidator = (rule: RegExp, value: string, callback: (msg?: Error) => void) => void;
  type Validator = (rule: RegExp, value: string, callback: () => void) => boolean;
  interface RuleItem {
    trigger: 'change' | 'blur';
    type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email' | 'any';
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    len?: number;
    enum?: any[];
    whitespace?: boolean;
    transform?: (value: any) => any;
    message: string;
    validator?: Validator;
    asyncValidator?: AsyncValidator;
  }
  interface Rules {
    [key: string]: RuleItem;
  }
  type ICallback = (valid: any) => void;
  interface UFormProps {
    // 当前form的需要验证字段的集合
    model: any;
    // 验证规则
    // rules: object | function | any[];
    // 有错误时的提示方式，message-提示信息，border-如果input设置了边框，变成呈红色，
    // border-bottom-下边框呈现红色，none-无提示
    errorType?: ('message' | 'toast' | 'none')[];
    // 是否显示表单域的下划线边框
    borderBottom?: boolean;
    // label的位置，left-左边，top-上边
    labelPosition?: 'top' | 'left';
    // label的宽度，单位rpx
    labelWidth?: number | string;
    // lable字体的对齐方式
    labelAlign?: 'left' | 'center' | 'right';
    // lable的样式，对象形式
    labelStyle?: CSSProperties;
  }

  const props = withDefaults(defineProps<UFormProps>(),  {
    // 当前form的需要验证字段的集合
    model: () => {
      return {}
    },
    // 验证规则
    // rules: {},
    // 有错误时的提示方式，message-提示信息，border-如果input设置了边框，变成呈红色，
    // border-bottom-下边框呈现红色，none-无提示
    errorType: ['message', 'toast'],
    // 是否显示表单域的下划线边框
    borderBottom: true,
    // label的位置，left-左边，top-上边
    labelPosition: 'left',
    // label的宽度，单位rpx
    labelWidth: 90,
    // lable字体的对齐方式
    labelAlign: 'left',
    // lable的样式，对象形式
    labelStyle: () => {
      return {}
    },
  });

  const { toastUtil } = useComposable();

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  // 存储当前form下的所有u-form-item的实例
  // 不能定义在data中，否则微信小程序会造成循环引用而报错
  const fields: ComponentInternalInstance[] = [];

  const rules = ref<Rules>({});

  const setRules = (ruleObject: Rules) => {
    rules.value = ruleObject;
  };

  // 清空所有u-form-item组件的内容，本质上是调用了u-form-item组件中的resetField()方法
  const resetFields = () => {
    fields?.map(field => {
      field?.exposeProxy?.resetField();
    });
  };

  // 校验全部数据
  const validate = (callback: ICallback) => {
    return new Promise(resolve => {
      // 对所有的u-form-item进行校验
      let valid = true; // 默认通过
      let count = 0; // 用于标记是否检查完毕
      let errorArr: string[] = []; // 存放错误信息
      fields?.map(field => {
        // 调用每一个u-form-item实例的validation的校验方法
        field?.exposeProxy?.validation('', (error: string) => {
          // 如果任意一个u-form-item校验不通过，就意味着整个表单不通过
          if (error) {
            valid = false;
            errorArr.push(error);
          }
          // 当历遍了所有的u-form-item时，调用promise的then方法
          if (++count === fields?.length) {
            resolve(valid); // 进入promise的then方法
            // 判断是否设置了toast的提示方式，只提示最前面的表单域的第一个错误信息
            if(props.errorType?.indexOf('none') === -1 && props.errorType?.indexOf('toast') >= 0 && errorArr.length) {
              toastUtil(errorArr[0]);
            }
            // 调用回调方法
            if (typeof callback == 'function') callback(valid);
          }
        });
      });
    });
  };

  provide<ComponentInternalInstance | null>('uForm', instance);

  defineExpose({
    fields,
    rules,
    setRules,
    resetFields,
    validate,
  });
</script>

<style scoped lang="scss">
  @import "../../libs/css/style.components.scss";
</style>
