import { ComponentInternalInstance, ComponentPublicInstance, ref } from 'vue';
import { getCurrentInstance } from 'vue'
import addUnit from "../function/addUnit";
import trim from "../function/trim";
import toast from "../function/toast";
import guid from '../function/guid';
import randomArray from '../function/randomArray';
import deepClone from '../function/deepClone';
import type2icon from '../function/type2icon';
import queryParams from "../function/queryParams";
import deepMerge from "../function/deepMerge";
import test from "../function/test";
import color from "../function/color";
import random from "../function/random";
// 路由封装
import route from '../function/route';
import { os, sys } from "../function/sys";
import zIndex from '../config/zIndex';
import config from '../config/config';

export function useComposable() {
  const instance: ComponentInternalInstance | null = getCurrentInstance();
  const emitter = instance?.appContext.config.globalProperties.emitter;


  let parentComp = instance?.parent;
  function $parent(name: string | undefined = undefined): ComponentInternalInstance | null {
    // 通过while历遍，这里主要是为了H5需要多层解析的问题
    while (parentComp) {
      // 父组件
      if (parentComp?.type?.name && parentComp?.type?.name !== name) {
        // 如果组件的name不相等，继续上一级寻找
        parentComp = parentComp.parent;
      } else {
        return parentComp;
      }
    }
    return null;
  }

  // 查询节点信息
  // 目前此方法在支付宝小程序中无法获取组件跟接点的尺寸，为支付宝的bug(2020-07-21)
  // 解决办法为在组件根部再套一个没有任何作用的view元素
  const getRect = (selector: string, all: boolean = false): Promise<any> => {
    return new Promise(resolve => {
      uni.createSelectorQuery().
      in(instance?.proxy)[all ? 'selectAll' : 'select'](selector)
        .boundingClientRect(rect => {
          if (all && Array.isArray(rect) && rect.length) {
            resolve(rect)
          }
          if (!all && rect) {
            resolve(rect)
          }
        }).exec()
    });
  };

  const parent = ref<ComponentInternalInstance | null>(null);

  const getParentData = (parentName = '', state: any) => {
    // 避免在created中去定义parent变量
    // @ts-ignore
    if(!parent.value) parent.value = null;
    // 这里的本质原理是，通过获取父组件实例(也即u-radio-group的this)
    // 将父组件this中对应的参数，赋值给本组件(u-radio的this)的parentData对象中对应的属性
    // 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
    // @ts-ignore
    parent.value = $parent(parentName);
    // @ts-ignore
    if(parent.value) {
      // 历遍parentData中的属性，将parent中的同名属性赋值给parentData
      // @ts-ignore
      Object.keys(state.parentData).map(key => {
        // @ts-ignore
        state.parentData[key] = parent.value?.exposeProxy[key];
      });
    }
  };

  // 阻止事件冒泡
  const preventEvent = (e: any) => {
    e && e.stopPropagation && e.stopPropagation()
  }

  /**
   * 派发 (向上查找) (一个)
   * @param componentName // 需要找的组件的名称
   * @param eventName // 事件名称
   * @param params // 需要传递的参数
   */
  function dispatch(componentName: string, eventName:string, params: any) {
    // $parent 找到最近的父节点 $root 根节点
    // @ts-ignore
    let parentAndRootEl: ComponentPublicInstance | null = instance?.proxy?.$parent ||
        instance?.proxy?.$root;
    // 获取当前组件实例的name
    let name = parentAndRootEl?.$options?.name;
    // 如果当前有节点 && 当前没名称 且 当前名称等于需要传进来的名称的时候就去查找当前的节点
    // 循环出当前名称的一样的组件实例
    while (parentAndRootEl && (!name||name!==componentName)) {
      parentAndRootEl = parentAndRootEl?.$parent;
      if (parentAndRootEl) {
        name = parentAndRootEl.$options.name;
      }
    }
    // 有节点表示当前找到了name一样的实例
    if (parentAndRootEl) {
      emitter.emit(eventName, [eventName].concat(params));
      // @ts-ignore
      // parentAndRootEl.$emit.apply(parentAndRootEl, [eventName].concat(params));
    }
  }

  /**
   * 递归使用 call 方式this指向
   * @param componentName // 需要找的组件的名称
   * @param eventName // 事件名称
   * @param params // 需要传递的参数
   */
  function _toBroadcast(componentName: string, eventName: string, params: string) {
    // 循环子节点找到名称一样的子节点 否则 递归 当前子节点
    // @ts-ignore
    this.$children.map((child)=>{
      if (componentName===child.$options.name) {
        emitter.emit(eventName, [eventName].concat(params));
        // child.$emit.apply(child,[eventName].concat(params))
      }else {
        // @ts-ignore
        _toBroadcast.apply(child, [componentName, eventName].concat(params))
      }
    })
  }

  /**
   * 广播 (向下查找) (广播多个)
   * @param componentName // 需要找的组件的名称
   * @param eventName // 事件名称
   * @param params // 需要传递的参数
   */
  function broadcast(componentName: string, eventName: string, params: any) {
    _toBroadcast.call(instance?.proxy, componentName, eventName, params);
  }

  return {
    os,
    sys,
    color,
    guid,
    toast,
    randomArray,
    deepClone,
    type2icon,
    queryParams,
    deepMerge,
    test,
    random,
    route,
    Z_INDEX_CONFIG: zIndex,
    CONFIG: config,
    toastUtil: toast,
    addUnit,
    trimUtil: trim,
    $parentUtil: $parent,
    getRect,
    parent,
    getParentData,
    preventEvent,
    dispatch,
    broadcast,
  }
}