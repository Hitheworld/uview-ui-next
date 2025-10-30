import mitt from "mitt";
// 引入关于是否mixin集成小程序分享的配置
// 全局挂载引入http相关请求拦截插件
import http from './libs/request';

function wranning(str: string) {
	// 开发环境进行信息输出,主要是一些报错信息
	// 这个环境的来由是在程序编写时候,点击hx编辑器运行调试代码的时候,详见:
	// 	https://uniapp.dcloud.io/frame?id=%e5%bc%80%e5%8f%91%e7%8e%af%e5%a2%83%e5%92%8c%e7%94%9f%e4%ba%a7%e7%8e%af%e5%a2%83
	// @ts-ignore
	if (import.meta.env.NODE_ENV === 'development') {
		console.warn(str)
	}
}

// post类型对象参数转为get类型url参数
import queryParams from './libs/function/queryParams';
// 路由封装
import route from './libs/function/route';
// 时间格式化
import timeFormat from './libs/function/timeFormat';
// 时间戳格式化,返回多久之前
import timeFrom from './libs/function/timeFrom';
// 颜色渐变相关,colorGradient-颜色渐变,hexToRgb-十六进制颜色转rgb颜色,rgbToHex-rgb转十六进制
import colorGradient from './libs/function/colorGradient';
// 生成全局唯一guid字符串
import guid from './libs/function/guid';
// 主题相关颜色,info|success|warning|primary|default|error,此颜色已在uview.scss中定义,但是为js中也能使用,故也定义一份
import color from './libs/function/color';
// 根据type获取图标名称
import type2icon from './libs/function/type2icon';
// 打乱数组的顺序
import randomArray from './libs/function/randomArray';
// 对象和数组的深度克隆
import deepClone from './libs/function/deepClone';
// 对象深度拷贝
import deepMerge from './libs/function/deepMerge';
// 添加单位
import addUnit from './libs/function/addUnit';

// 规则检验
import test from './libs/function/test';
// 随机数
import random from './libs/function/random';
// 去除空格
import trim from './libs/function/trim';
// toast提示，对uni.showToast的封装
import toast from './libs/function/toast';
// 获取父组件参数
import getParent from './libs/function/getParent';
// 获取整个父组件
import $parent from './libs/function/$parent';
// 获取sys()和os()工具方法
// 获取设备信息，挂载到$u的sys()(system的缩写)属性中，
// 同时把安卓和ios平台的名称"ios"和"android"挂到$u.os()中，方便取用
import {sys, os} from './libs/function/sys';
// 防抖方法
import debounce from './libs/function/debounce';
// 节流方法
import throttle from './libs/function/throttle';

// 配置信息
import config from './libs/config/config';
// 各个需要fixed的地方的z-index配置文件
import zIndex from './libs/config/zIndex';

const $u = {
	queryParams: queryParams,
	route: route,
	timeFormat: timeFormat,
	date: timeFormat, // 另名date
	timeFrom,
	colorGradient: colorGradient.colorGradient,
	colorToRgba: colorGradient.colorToRgba,
	guid,
	color,
	sys,
	os,
	type2icon,
	randomArray,
	wranning,
	// @ts-ignore
	get: http.get,
	// @ts-ignore
	post: http.post,
	// @ts-ignore
	put: http.put,
	// @ts-ignore
	'delete': http.delete,
	hexToRgb: colorGradient.hexToRgb,
	rgbToHex: colorGradient.rgbToHex,
	test,
	random,
	deepClone,
	deepMerge,
	getParent,
	$parent,
	addUnit,
	trim,
	type: ['primary', 'success', 'error', 'warning', 'info'],
	http,
	toast,
	config, // uView配置信息相关，比如版本号
	zIndex,
	debounce,
	throttle,
	mpShare: {},
};

// $u挂载到uni对象上
try {
	// @ts-ignore
	uni.$u = $u;
} catch (e) {
	console.warn(e);
}

export default {
	install: (app: any, options: any) => {
		// app.mixin(mixin);
		if (app.config.globalProperties.openShare) {
			const $mpShare = $u.mpShare;
			app.mixin({
				onLoad() {
					$u.mpShare = {
						title: '', // 默认为小程序名称
						path: '', // 默认为当前页面路径
						imageUrl: '' // 默认为当前页面的截图
					}
				},
				onShareAppMessage() {
					return $mpShare;
				},
				onShareTimeline() {
					return $mpShare;
				},
			});
		}

		// 时间格式化，同时两个名称，date和timeFormat
		app.config.globalProperties.$filters = {
			timeFormat(timestamp: number, format: string)  {
				return timeFormat(timestamp, format);
			},
			date(timestamp: number, format: string)  {
				return timeFormat(timestamp, format);
			},
			// 将多久以前的方法，注入到全局属性
			timeFrom(timestamp: number, format: string | false)  {
				return timeFrom(timestamp, format);
			}
		}
		app.config.globalProperties.$u = $u;
		app.config.globalProperties.emitter = mitt();
		app.provide('uView', options);

		return app;
	}
};
