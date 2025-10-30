import { defineComponent, getCurrentInstance, computed } from "vue";
import type { ComponentInternalInstance } from "vue";

export default defineComponent({
  setup(props, context) {
    const instance: ComponentInternalInstance | null = getCurrentInstance();

    const children: any[] = [];
    /**
     * 派发 (向上查找) (一个)
     * @param componentName // 需要找的组件的名称
     * @param eventName // 事件名称
     * @param params // 需要传递的参数
     */
    const dispatch = (componentName: string, eventName: string, params: any) => {
      let parent: any = instance?.parent || instance?.root;// $parent 找到最近的父节点 $root 根节点
      let name = parent?.type.name; // 获取当前组件实例的name
      // 如果当前有节点 && 当前没名称 且 当前名称等于需要传进来的名称的时候就去查找当前的节点
      // 循环出当前名称的一样的组件实例
      while (parent && (!name||name!==componentName)) {
        parent = parent?.parent;
        if (parent) {
          name = parent?.type.name;
        }
      }
      // 有节点表示当前找到了name一样的实例
      if (parent) {
        parent.emit(eventName, params);
      }
    };

    /**
     * 广播 (向下查找) (广播多个)
     * @param componentName // 需要找的组件的名称
     * @param eventName // 事件名称
     * @param params // 需要传递的参数
     */
    const broadcast = (componentName: string, eventName: string, params: any) => {
      // 循环子节点找到名称一样的子节点 否则 递归 当前子节点
      children?.map((child: any) => {
        if (componentName === child?.type.name) {
          child.emit(eventName, params);
        } else {
          broadcast(componentName, eventName, params);
        }
      });
    };

    return {
      dispatch,
      broadcast,
    }
  },
})