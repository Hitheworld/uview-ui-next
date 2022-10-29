<p align="center">
    <img alt="logo" src="https://uviewui.com/common/logo.png" width="120" height="120" style="margin-bottom: 10px;">
</p>
<h3 align="center" style="margin: 30px 0 30px;font-weight: bold;font-size:40px;">uView</h3>
<h3 align="center">多平台快速开发的UI框架</h3>

## 说明

- uView UI，是[uni-app](https://uniapp.dcloud.io/)生态优秀的UI框架，全面的组件和便捷的工具会让您信手拈来，如鱼得水.

## 特性

- 兼容安卓，iOS，微信小程序，H5，QQ小程序，百度小程序，支付宝小程序，头条小程序
- 60+精选组件，功能丰富，多端兼容，让您快速集成，开箱即用
- 众多贴心的JS利器，让您飞镖在手，召之即来，百步穿杨
- 众多的常用页面和布局，让您专注逻辑，事半功倍
- 详尽的文档支持，现代化的演示效果
- 按需引入，精简打包体积

## 升级说明

- 该UI库改造自 uview-ui@1.8.4 版本，全面支持vue3。
- vue3版本,从 uview-ui 更名为: uview-ui-next。

## 组件更新说明
- u-upload上传组件新增“fileSizeExceededTip”提示语属性;
- u-sticky 吸顶  offsetTop 默认单位是rpx, 新增属于“isUnitPx”boolean类型，true表示单位是px，否则为rpx;
- u-circle-progress 圆形进度条新增css作为进度条（当u-circle-progress组件 is-css为false时，采用canvas, 否则使用css样式作为进度条），以解决canvas在原生小程序中层级过高无法覆盖的问题;
- u-line-progress 组件，新增“text-padding(值为number)”和“text-align（值有'left' | 'center' | 'right' | null）”,不写“text-align”保持原有样式，“text-align”属性针对进度条的文字显示位置进行优化;
- u-avatar-cropper 组件更新,头像裁剪;
- 废除 u-parse组件，并不再支持vue3版本 , 请改用v-html;


## 安装

1、安装 uview-ui-next 库
```bash
# yarn 方式安装
yarn add uview-ui-next
```
2、安装 mitt 依赖
```bash
# yarn 方式安装
yarn add mitt
```


## 快速上手

1. `main.ts`引入uView库
```js
// main.ts
import uView from 'uview-ui-next';
app.use(uView);
```

2. `App.vue`引入基础样式(注意style标签需声明scss属性支持)
```css
/* App.vue */
<style lang="scss">
    @import "uview-ui-next/index.scss";
</style>
```

3. `uni.scss`引入全局scss变量文件
```css
/* uni.scss */
@import "uview-ui-next/theme.scss";
```

4. `pages.json`配置easycom规则(按需引入)

```js
// pages.json
{
	"easycom": {
        "autoscan": true,
        "custom": {
            // npm安装的方式不需要前面的"@/"，下载安装的方式需要"@/"
            // npm安装方式
            "^u-(.*)": "uview-ui-next/components/u-$1/u-$1.vue"
            // 下载安装方式
            // "^u-(.*)": "uview-ui-next/components/u-$1/u-$1.vue"
        }     
    },
	// 此为本身已有的内容
	"pages": [
		// ......
	]
}
```
```text
easycom 规则引入 特殊说明:
  - u-form 需要单独引入才生效;
  - u-waterfall 需要单独引入才能生效;
  - 其它如果通过 easycom 规则引入如未生效，需要单独引入，可能原因是由于被uni-app官方占用。
```
 ```vue
<template>
    <UForm :model="state.form" :ref="(el) => uForm = el">
        <u-form-item label="姓名" prop="name">
          <u-input v-model="state.form.name" />
        </u-form-item>
    </UForm>
    <u-button @click="submit">提交</u-button>
<template/>
```
```ts
<script setup lang="ts">
  import { ref, reactive } from "vue";
  import UForm from "uview-ui-next/components/u-form/u-form.vue";
  const uForm = ref(null);
  const state = reactive({
    form: {
      name: '',
      intro: '',
    },
    rules: {
      name: [
        {
          required: true,
          message: '请输入姓名',
          // 可以单个或者同时写两个触发验证方式
          trigger: ['change', 'blur'],
        }
      ],
    }
  });
  const submit = () => {
    uForm.value?.validate((valid: boolean) => {
      if (valid) {
        console.log('验证通过');
      } else {
        console.log('验证失败');
      }
    });
  }
</script>
```

5. `main.ts`配置全局分享

```ts
// main.ts
app.config.globalProperties.openShare = true;
```
```vue
<!-- 个性化配置分享 -->
<!-- my.vue-->
<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
const instance: ComponentInternalInstance | null = getCurrentInstance();
const $u = instance?.appContext.config.globalProperties.$u;
onLoad(() => {
  $u.mpShare.title = "多平台快速开发的UI框架！"
  $u.mpShare.path = "/pages/home/index"
  $u.mpShare.imageUrl = "https://uviewui.com/common/logo.png"
});
</script>
```


请通过[快速上手](https://uviewui.com/components/quickstart.html)了解更详细的内容 

## 使用方法
配置easycom规则后，自动按需引入，无需`import`组件，直接引用即可。

```html
<template>
	<u-button>按钮</u-button>
</template>
```

请通过[快速上手](https://uviewui.com/components/quickstart.html)了解更详细的内容 

## 链接

- [官方文档](https://uviewui.com/)
- [更新日志](https://uviewui.com/components/changelog.html)
- [升级指南](https://uviewui.com/components/changelog.html)
- [关于我们](https://uviewui.com/cooperation/about.html)

## 预览

您可以通过**微信**扫码，查看最佳的演示效果。
<br>
<br>
<img src="https://uviewui.com/common/weixin_mini_qrcode.png" width="220" height="220" >

<!-- ## 捐赠uView的研发

uView文档和源码全部开源免费，如果您认为uView帮到了您的开发工作，您可以捐赠uView的研发工作，捐赠无门槛，哪怕是一杯可乐也好(相信这比打赏主播更有意义)。

<img src="https://uviewui.com/common/wechat.png" width="220" >
<img style="margin-left: 100px;" src="https://uviewui.com/common/alipay.png" width="220" >
 -->

## 版权信息

uView遵循[MIT](https://en.wikipedia.org/wiki/MIT_License)开源协议，意味着您无需支付任何费用，也无需授权，即可将uView应用到您的产品中。
