<template>
	<view>
		<slot v-if="!nodes.length" />
		<!--#ifdef APP-PLUS-NVUE-->
		<web-view id="_top" ref="web" :style="'margin-top:-2px;height:'+height+'px'" @onPostMessage="_message" />
		<!--#endif-->
		<!--#ifndef APP-PLUS-NVUE-->
		<view id="_top" :style="showAm+(selectable?';user-select:text;-webkit-user-select:text':'')">
			<!--#ifdef H5 || MP-360-->
			<div :id="'rtf'+uid"></div>
			<!--#endif-->
			<!--#ifndef H5 || MP-360-->
			<trees :nodes="nodes" :lazyLoad="lazyLoad" :loading="loadingImg" />
			<!--#endif-->
		</view>
		<!--#endif-->
	</view>
</template>

<script lang="ts">
  /**
   * 推荐使用指令 v-html=""
   */
  import {
    ComponentInternalInstance,
    defineComponent,
    getCurrentInstance,
    reactive,
    toRefs,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
    ref
  } from "vue";
  let search;
	// #ifndef H5 || APP-PLUS-NVUE || MP-360
	import Trees from './libs/trees.vue';
	let cache = {},
  // #ifdef MP-WEIXIN || MP-TOUTIAO
  fs = uni.getFileSystemManager ? uni.getFileSystemManager() : null,
  // #endif
  Parser = require('./libs/MpHtmlParser');

  let dom: any;
	// 计算 cache 的 key
	function hash(str: string) {
		for (var i = str.length, val = 5381; i--;)
			val += (val << 5) + str.charCodeAt(i);
		return val;
	}
	// #endif

	// #ifdef H5 || APP-PLUS-NVUE || MP-360
  let {
		windowWidth,
		platform
	} = uni.getSystemInfoSync(),
		cfg = require('./libs/config');
	// #endif

	// #ifdef APP-PLUS-NVUE
  let weexDom = weex.requireModule('dom');
	// #endif

	/**
	 * Parser 富文本组件
	 * @tutorial https://github.com/jin-yufeng/Parser
	 * @property {String} html 富文本数据
	 * @property {Boolean} autopause 是否在播放一个视频时自动暂停其他视频
	 * @property {Boolean} autoscroll 是否自动给所有表格添加一个滚动层
	 * @property {Boolean} autosetTitle 是否自动将 title 标签中的内容设置到页面标题
	 * @property {Number} compress 压缩等级
	 * @property {String} domain 图片、视频等链接的主域名
	 * @property {Boolean} lazyLoad 是否开启图片懒加载
	 * @property {String} loadingImg 图片加载完成前的占位图
	 * @property {Boolean} selectable 是否开启长按复制
	 * @property {Object} tagStyle 标签的默认样式
	 * @property {Boolean} showWithAnimation 是否使用渐显动画
	 * @property {Boolean} useAnchor 是否使用锚点
	 * @property {Boolean} useCache 是否缓存解析结果
	 * @event {Function} parse 解析完成事件
	 * @event {Function} load dom 加载完成事件
	 * @event {Function} ready 所有图片加载完毕事件
	 * @event {Function} error 错误事件
	 * @event {Function} imgtap 图片点击事件
	 * @event {Function} linkpress 链接点击事件
	 * @author JinYufeng
	 * @version 20201029
	 * @listens MIT
	 */

	export default defineComponent({
		name: 'parser',
		props: {
			html: String,
			autopause: {
				type: Boolean,
				default: true
			},
			autoscroll: Boolean,
			autosetTitle: {
				type: Boolean,
				default: true
			},
			// #ifndef H5 || APP-PLUS-NVUE || MP-360
			compress: Number,
			loadingImg: String,
			useCache: Boolean,
			// #endif
			domain: String,
			lazyLoad: Boolean,
			selectable: Boolean,
			tagStyle: Object,
			showWithAnimation: Boolean,
			useAnchor: Boolean
		},
		emits: ["load", "ready", "parse", "imgtap" ,"error", "linkpress", "click", "tap"],
    setup(props: any, context) {
      const instance: ComponentInternalInstance | null = getCurrentInstance();
      const $u = instance?.appContext.config.globalProperties.$u;

      const search = ref();

      const document = ref();
      const _timer = ref<any | null>(null);

      const state = reactive({
        // #ifdef H5 || MP-360
        uid: this._uid,
        // #endif
        // #ifdef APP-PLUS-NVUE
        height: 1,
        // #endif
        // #ifndef APP-PLUS-NVUE
        showAm: '',
        // #endif
        nodes: []
      });

      // #ifndef H5 || APP-PLUS-NVUE || MP-360
      const trees = computed(() => Trees);
      // #endif

      // 图片数组
      this.imgList = [];
      this.imgList.each = function(f) {
        for (var i = 0, len = this.length; i < len; i++)
          this.setItem(i, f(this[i], i, this));
      };
      this.imgList.setItem = function(i, src) {
        if (i == void 0 || !src) return;
        // #ifndef MP-ALIPAY || APP-PLUS
        // 去重
        if (src.indexOf('http') == 0 && this.includes(src)) {
          let newSrc = src.split('://')[0];
          for (let j = newSrc.length, c; c = src[j]; j++) {
            if (c == '/' && src[j - 1] != '/' && src[j + 1] != '/') break;
            newSrc += Math.random() > 0.5 ? c.toUpperCase() : c;
            newSrc += src.substr(j);
          }
          return this[i] = newSrc;
        }
        // #endif
        this[i] = src;
        // 暂存 data src
        if (src.includes('data:image')) {
          let filePath: string;
          let info = src.match(/data:image\/(\S+?);(\S+?),(.+)/);
          if (!info) return;
          // #ifdef MP-WEIXIN || MP-TOUTIAO
          filePath = `${wx.env.USER_DATA_PATH}/${Date.now()}.${info[1]}`;
          fs && fs.writeFile({
            filePath,
            data: info[3],
            encoding: info[2],
            success: () => this[i] = filePath
          })
          // #endif
          // #ifdef APP-PLUS
          filePath = `_doc/parser_tmp/${Date.now()}.${info[1]}`;
          var bitmap = new plus.nativeObj.Bitmap();
          bitmap.loadBase64Data(src, () => {
            bitmap.save(filePath, {}, () => {
              bitmap.clear()
              this[i] = filePath;
            })
          })
          // #endif
        }
      };

      // 设置富文本内容
      const setContent = (html: string, append?: any) => {
        // #ifdef APP-PLUS-NVUE
        if (!html)
          return state.height = 1;
        if (append) {
          const _evalJs = `
            var b=document.createElement('div');
            b.innerHTML='${html.replace(/'/g, "\\'")}';
            document.getElementById('parser').appendChild(b)
          `;
          instance?.proxy?.$refs.web.evalJs(_evalJs);
        } else {
          html =
              '<meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{width:100%;height:100%;overflow:hidden}body{margin:0}</style><base href="' +
              props.domain + '"><div id="parser"' + (props.selectable ? '>' : ' style="user-select:none">') + this._handleHtml(html).replace(/\n/g, '\\n') +
              '</div><script>"use strict";function e(e){if(window.__dcloud_weex_postMessage||window.__dcloud_weex_){var t={data:[e]};window.__dcloud_weex_postMessage?window.__dcloud_weex_postMessage(t):window.__dcloud_weex_.postMessage(JSON.stringify(t))}}document.body.onclick=function(){e({action:"click"})},' +
              (props.showWithAnimation ? 'document.body.style.animation="_show .5s",' : '') +
              'setTimeout(function(){e({action:"load",text:document.body.innerText,height:document.getElementById("parser").scrollHeight})},50);\x3c/script>';
          if (platform == 'android') html = html.replace(/%/g, '%25');
          instance?.proxy?.$refs.web.evalJs("document.write('" + html.replace(/'/g, "\\'") + "');document.close()");
        }
        instance?.proxy?.$refs.web.evalJs(
            'var t=document.getElementsByTagName("title");t.length&&e({action:"getTitle",title:t[0].innerText});for(var o,n=document.getElementsByTagName("style"),r=1;o=n[r++];)o.innerHTML=o.innerHTML.replace(/body/g,"#parser");for(var a,c=document.getElementsByTagName("img"),s=[],i=0==c.length,d=0,l=0,g=0;a=c[l];l++)parseInt(a.style.width||a.getAttribute("width"))>' +
            windowWidth + '&&(a.style.height="auto"),a.onload=function(){++d==c.length&&(i=!0)},a.onerror=function(){++d==c.length&&(i=!0),' + (cfg.errorImg ? 'this.src="' + cfg.errorImg + '",' : '') +
            'e({action:"error",source:"img",target:this})},a.hasAttribute("ignore")||"A"==a.parentElement.nodeName||(a.i=g++,s.push(a.getAttribute("original-src")||a.src||a.getAttribute("data-src")),a.onclick=function(t){t.stopPropagation(),e({action:"preview",img:{i:this.i,src:this.src}})});e({action:"getImgList",imgList:s});for(var u,m=document.getElementsByTagName("a"),f=0;u=m[f];f++)u.onclick=function(m){m.stopPropagation();var t,o=this.getAttribute("href");if("#"==o[0]){var n=document.getElementById(o.substr(1));n&&(t=n.offsetTop)}return e({action:"linkpress",href:o,offset:t}),!1};for(var h,y=document.getElementsByTagName("video"),v=0;h=y[v];v++)h.style.maxWidth="100%",h.onerror=function(){e({action:"error",source:"video",target:this})}' +
            (props.autopause ? ',h.onplay=function(){for(var e,t=0;e=y[t];t++)e!=this&&e.pause()}' : '') +
            ';for(var _,p=document.getElementsByTagName("audio"),w=0;_=p[w];w++)_.onerror=function(){e({action:"error",source:"audio",target:this})};' +
            (props.autoscroll ? 'for(var T,E=document.getElementsByTagName("table"),B=0;T=E[B];B++){var N=document.createElement("div");N.style.overflow="scroll",T.parentNode.replaceChild(N,T),N.appendChild(T)}' : '') +
            'var x=document.getElementById("parser");clearInterval(window.timer),window.timer=setInterval(function(){i&&clearInterval(window.timer),e({action:"ready",ready:i,height:x.scrollHeight})},350)'
        )
        state.nodes = [1];
        // #endif
        // #ifdef H5 || MP-360
        if (!html) {
          if (this.rtf && !append) this.rtf.parentNode.removeChild(this.rtf);
          return;
        }
        var div = document.createElement('div');
        if (!append) {
          if (this.rtf) this.rtf.parentNode.removeChild(this.rtf);
          this.rtf = div;
        } else {
          if (!this.rtf) this.rtf = div;
          else this.rtf.appendChild(div);
        }
        div.innerHTML = this._handleHtml(html, append);
        for (var styles = this.rtf.getElementsByTagName('style'), i = 0, style; style = styles[i++];) {
          style.innerHTML = style.innerHTML.replace(/body/g, '#rtf' + this._uid);
          style.setAttribute('scoped', 'true');
        }
        // 懒加载
        if (!this._observer && props.lazyLoad && IntersectionObserver) {
          this._observer = new IntersectionObserver(changes => {
            for (let item, i = 0; item = changes[i++];) {
              if (item.isIntersecting) {
                item.target.src = item.target.getAttribute('data-src');
                item.target.removeAttribute('data-src');
                this._observer.unobserve(item.target);
              }
            }
          }, {
            rootMargin: '500px 0px 500px 0px'
          })
        }

        // 获取标题
        var title = this.rtf.getElementsByTagName('title');
        if (title.length && props.autosetTitle)
          uni.setNavigationBarTitle({
            title: title[0].innerText
          })
        // 填充 domain
        const fill = (target: any) => {
          var src = target.getAttribute('src');
          if (props.domain && src) {
            if (src[0] == '/') {
              if (src[1] == '/')
                target.src = (props.domain.includes('://') ? props.domain.split('://')[0] : '') + ':' + src;
              else target.src = props.domain + src;
            } else if (!src.includes('://') && src.indexOf('data:') != 0) target.src = props.domain + '/' + src;
          }
        }
        // 图片处理
        this.imgList.length = 0;
        const imgs = this.rtf.getElementsByTagName('img');
        for (let i = 0, j = 0, img; img = imgs[i]; i++) {
          if (parseInt(img.style.width || img.getAttribute('width')) > windowWidth)
            img.style.height = 'auto';
          fill(img);
          if (!img.hasAttribute('ignore') && img.parentElement.nodeName != 'A') {
            img.i = j++;
            this.imgList.push(img.getAttribute('original-src') || img.src || img.getAttribute('data-src'));
            img.onclick = function(e) {
              e.stopPropagation();
              var preview = true;
              this.ignore = () => preview = false;
              context.emit('imgtap', this);
              if (preview) {
                uni.previewImage({
                  current: this.i,
                  urls: this.imgList
                });
              }
            }
          }
          img.onerror = function() {
            if (cfg.errorImg)
              this.imgList[this.i] = this.src = cfg.errorImg;
            context.emit('error', {
              source: 'img',
              target: this
            });
          }
          if (props.lazyLoad && this._observer && img.src && img.i != 0) {
            img.setAttribute('data-src', img.src);
            img.removeAttribute('src');
            this._observer.observe(img);
          }
        }
        // 链接处理
        var links = this.rtf.getElementsByTagName('a');
        for (var link of links) {
          link.onclick = function(e) {
            e.stopPropagation();
            var jump = true,
                href = this.getAttribute('href');
            context.emit('linkpress', {
              href,
              ignore: () => jump = false
            });
            if (jump && href) {
              if (href[0] == '#') {
                if (props.useAnchor) {
                  this.navigateTo({
                    id: href.substr(1)
                  })
                }
              } else if (href.indexOf('http') == 0 || href.indexOf('//') == 0)
                return true;
              else
                uni.navigateTo({
                  url: href
                })
            }
            return false;
          }
        }
        // 视频处理
        var videos = this.rtf.getElementsByTagName('video');
        this.videoContexts = videos;
        for (let video, i = 0; video = videos[i++];) {
          fill(video);
          video.style.maxWidth = '100%';
          video.onerror = function() {
            this.$emit('error', {
              source: 'video',
              target: this
            });
          }
          video.onplay = function() {
            if (this.autopause)
              for (let item, i = 0; item = this.videoContexts[i++];)
                if (item != this) item.pause();
          }
        }
        // 音频处理
        var audios = this.rtf.getElementsByTagName('audio');
        for (var audio of audios) {
          fill(audio);
          audio.onerror = function() {
            context.emit('error', {
              source: 'audio',
              target: this
            });
          }
        }
        // 表格处理
        if (props.autoscroll) {
          var tables = this.rtf.getElementsByTagName('table');
          for (var table of tables) {
            let div = document.createElement('div');
            div.style.overflow = 'scroll';
            table.parentNode.replaceChild(div, table);
            div.appendChild(table);
          }
        }
        if (!append) document.value.appendChild(this.rtf);
        nextTick(() => {
          state.nodes = [1];
          context.emit('load');
        });
        setTimeout(() => state.showAm = '', 500);
        // #endif
        // #ifndef APP-PLUS-NVUE
        // #ifndef H5 || MP-360
        let nodes;
        if (!html) return state.nodes = [];
        var parser = new Parser(html, this);
        // 缓存读取
        if (props.useCache) {
          var hashVal = hash(html);
          if (cache[hashVal])
            nodes = cache[hashVal];
          else {
            nodes = parser.parse();
            cache[hashVal] = nodes;
          }
        } else nodes = parser.parse();
        context.emit('parse', nodes);
        if (append) state.nodes = state.nodes.concat(nodes);
        else state.nodes = nodes;
        if (nodes.length && nodes.title && props.autosetTitle)
          uni.setNavigationBarTitle({
            title: nodes.title
          })
        if (this.imgList) this.imgList.length = 0;
        this.videoContexts = [];
        this.$nextTick(() => {
          (function f(cs) {
            for (var i = cs.length; i--;) {
              if (cs[i].top) {
                cs[i].controls = [];
                cs[i].init();
                f(cs[i].$children);
              }
            }
          })(this.$children)
          context.emit('load');
        })
        // #endif
        let height;
        clearInterval(_timer.value);
        _timer.value = setInterval(() => {
          // #ifdef H5 || MP-360
          this.rect = this.rtf.getBoundingClientRect();
          // #endif
          // #ifndef H5 || MP-360
          uni.createSelectorQuery().in(instance)
              .select('#_top').boundingClientRect().exec(res => {
            if (!res) return;
            this.rect = res[0];
            // #endif
            if (this.rect.height == height) {
              context.emit('ready', this.rect)
              clearInterval(_timer.value);
            }
            height = this.rect.height;
            // #ifndef H5 || MP-360
          });
          // #endif
        }, 350);
        if (props.showWithAnimation && !append) state.showAm = 'animation:_show .5s';
        // #endif
      };

      // 获取文本内容
      const getText = (ns = state.nodes) => {
        var txt = '';
        // #ifdef APP-PLUS-NVUE
        txt = this._text;
        // #endif
        // #ifdef H5 || MP-360
        txt = this.rtf.innerText;
        // #endif
        // #ifndef H5 || APP-PLUS-NVUE || MP-360
        for (var i = 0, n; n = ns[i++];) {
          if (n.type == 'text') txt += n.text.replace(/&nbsp;/g, '\u00A0').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&');
          else if (n.type == 'br') txt += '\n';
          else {
            // 块级标签前后加换行
            var block = n.name == 'p' || n.name == 'div' || n.name == 'tr' || n.name == 'li' || (n.name[0] == 'h' && n.name[1] >
                '0' && n.name[1] < '7');
            if (block && txt && txt[txt.length - 1] != '\n') txt += '\n';
            if (n.children) txt += this.getText(n.children);
            if (block && txt[txt.length - 1] != '\n') txt += '\n';
            else if (n.name == 'td' || n.name == 'th') txt += '\t';
          }
        }
        // #endif
        return txt;
      };

      // 锚点跳转
      const in = (obj: any) => {
        if (obj.page && obj.selector && obj.scrollTop) this._in = obj;
      };

      const navigateTo = (obj: any) => {
        if (!props.useAnchor) return obj.fail && obj.fail('Anchor is disabled');
        // #ifdef APP-PLUS-NVUE
        if (!obj.id)
          weexDom.scrollToElement(this.$refs.web);
        else
          this.$refs.web.evalJs('var pos=document.getElementById("' + obj.id +
              '");if(pos)post({action:"linkpress",href:"#",offset:pos.offsetTop+' + (obj.offset || 0) + '})');
        obj.success && obj.success();
        // #endif
        // #ifndef APP-PLUS-NVUE
        var d = ' ';
        // #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
        d = '>>>';
        // #endif
        var selector = uni.createSelectorQuery().in(this._in ? this._in.page : this).select((this._in ? this._in.selector :
            '#_top') + (obj.id ? `${d}#${obj.id},${this._in?this._in.selector:'#_top'}${d}.${obj.id}` : '')).boundingClientRect();
        if (this._in) selector.select(this._in.selector).scrollOffset().select(this._in.selector).boundingClientRect();
        else selector.selectViewport().scrollOffset();
        selector.exec(res => {
          if (!res[0]) return obj.fail && obj.fail('Label not found')
          var scrollTop = res[1].scrollTop + res[0].top - (res[2] ? res[2].top : 0) + (obj.offset || 0);
          if (this._in) this._in.page[this._in.scrollTop] = scrollTop;
          else uni.pageScrollTo({
            scrollTop,
            duration: 300
          })
          obj.success && obj.success();
        })
        // #endif
      };

      // 获取视频对象
      const getVideoContext = (id: string) => {
        // #ifndef APP-PLUS-NVUE
        if (!id) return this.videoContexts;
        else
          for (var i = this.videoContexts.length; i--;)
            if (this.videoContexts[i].id == id) return this.videoContexts[i];
        // #endif
      };

      // #ifdef H5 || APP-PLUS-NVUE || MP-360
      const _handleHtml = (html: string, append: any) => {
        if (!append) {
          // 处理 tag-style 和 userAgentStyles
          var style = '<style>@keyframes _show{0%{opacity:0}100%{opacity:1}}img{max-width:100%}';
          for (var item in cfg.userAgentStyles)
            style += `${item}{${cfg.userAgentStyles[item]}}`;
          for (item in props.tagStyle)
            style += `${item}{${props.tagStyle[item]}}`;
          style += '</style>';
          html = style + html;
        }
        // 处理 rpx
        if (html.includes('rpx'))
          html = html.replace(/[0-9.]+\s*rpx/g, $ => (parseFloat($) * windowWidth / 750) + 'px');
        return html;
      };
      // #endif

      // #ifdef APP-PLUS-NVUE
      const _message = (e: any) => {
        // 接收 web-view 消息
        var d = e.detail.data[0];
        switch (d.action) {
          case 'load':
            context.emit('load');
            state.height = d.height;
            this._text = d.text;
            break;
          case 'getTitle':
            if (props.autosetTitle)
              uni.setNavigationBarTitle({
                title: d.title
              })
            break;
          case 'getImgList':
            this.imgList.length = 0;
            for (var i = d.imgList.length; i--;)
              this.imgList.setItem(i, d.imgList[i]);
            break;
          case 'preview':
            var preview = true;
            d.img.ignore = () => preview = false;
            context.emit('imgtap', d.img);
            if (preview)
              uni.previewImage({
                current: d.img.i,
                urls: this.imgList
              })
            break;
          case 'linkpress':
            var jump = true,
                href = d.href;
            context.emit('linkpress', {
              href,
              ignore: () => jump = false
            })
            if (jump && href) {
              if (href[0] == '#') {
                if (props.useAnchor)
                  weexDom.scrollToElement(this.$refs.web, {
                    offset: d.offset
                  })
              } else if (href.includes('://'))
                plus.runtime.openWeb(href);
              else
                uni.navigateTo({
                  url: href
                })
            }
            break;
          case 'error':
            if (d.source == 'img' && cfg.errorImg)
              this.imgList.setItem(d.target.i, cfg.errorImg);
            context.emit('error', {
              source: d.source,
              target: d.target
            })
            break;
          case 'ready':
            state.height = d.height;
            if (d.ready) uni.createSelectorQuery().in(instance).select('#_top').boundingClientRect(() => {}).exec(res => {
              this.rect = res[0];
              context.emit('ready', res[0]);
            });
            break;
          case 'click':
            context.emit('click');
            context.emit('tap');
        }
      };
      // #endif

      watch(() => props.html, (newValue, oldValue) => {
        setContent(newValue);
      });

      onMounted(() => {
        // #ifdef H5 || MP-360
        document.value = document.getElementById('rtf' + this._uid);
        // #endif
        // #ifndef H5 || APP-PLUS-NVUE || MP-360
        if (dom) document.value = new dom(instance);
        // #endif
        if (search) search.value = (args: any) => search(instance, args);
        // #ifdef APP-PLUS-NVUE
        document.value = instance?.proxy.$refs.web;
        setTimeout(() => {
          // #endif
          if (props.html) setContent(props.html);
          // #ifdef APP-PLUS-NVUE
        }, 30);
        // #endif
      });

      onBeforeUnmount(() => {
        // #ifdef H5 || MP-360
        if (this._observer) this._observer.disconnect();
        // #endif
        this.imgList.each((src: string) => {
          // #ifdef APP-PLUS
          if (src && src.includes('_doc')) {
            plus.io.resolveLocalFileSystemURL(src, entry => {
              entry.remove();
            });
          }
          // #endif
          // #ifdef MP-WEIXIN || MP-TOUTIAO
          if (src && src.includes(uni.env.USER_DATA_PATH))
            fs && fs.unlink({
              filePath: src
            })
          // #endif
        })
        clearInterval(_timer.value);
      });

      return {
        ...toRefs(state),
        trees,
        setContent,
        getText,
        in,
        navigateTo,
        getVideoContext,
        _handleHtml,
        _message,

      };
    },
	});
</script>

<style>
	@keyframes _show {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	/* #ifdef MP-WEIXIN */
	:host {
		display: block;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* #endif */
</style>
