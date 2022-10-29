<template>
	<view
      class="u-upload"
      v-if="!props.disabled"
  >
		<view
			v-if="props.showUploadList"
			class="u-list-item u-preview-wrap"
			v-for="(item, ind) in state.lists"
			:key="ind"
			:style="{
				width: addUnit(props.width),
				height: addUnit(props.height)
			}"
		>
			<view
				v-if="props.deletable"
				class="u-delete-icon"
				@tap.stop="deleteItem(ind)"
				:style="{
					background: props.delBgColor
				}"
			>
				<u-icon
            class="u-icon"
            :name="props.delIcon"
            size="20"
            :color="props.delColor"
        ></u-icon>
			</view>
			<u-line-progress
				v-if="props.showProgress && item.progress > 0 && !item.error"
				:show-percent="false"
				height="16"
				class="u-progress"
				:percent="item.progress"
			></u-line-progress>
			<view
          v-if="state.uploading"
          class="u-loading-box"
      >
        <view class="u-loading-text">
          上传中...
        </view>
      </view>
			<view
          @tap.stop="retry(ind)"
          v-if="item.error"
          class="u-error-btn"
      >
        点击重试
      </view>
			<image
          @tap.stop="doPreviewImage(item.url || item.path, ind)"
          class="u-preview-image"
          v-if="!item.isImage"
          :src="item.url || item.path"
          :mode="props.imageMode"
      ></image>
		</view>
		<slot name="file" :file="state.lists"></slot>
		<view
        style="display: inline-block;"
        @tap="selectFile"
        v-if="props.maxCount > state.lists.length"
    >
			<slot name="addBtn"></slot>
			<view
				v-if="!props.customBtn"
				class="u-list-item u-add-wrap"
				hover-class="u-add-wrap__hover"
				hover-stay-time="150"
				:style="{
					width: addUnit(props.width),
					height: addUnit(props.height)
				}"
			>
				<u-icon name="plus" class="u-add-btn" size="40"></u-icon>
				<view class="u-add-tips">
          {{ props.uploadText }}
        </view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-upload',
  }
</script>

<script setup lang="ts">
  import {
    withDefaults,
    ComponentInternalInstance,
    getCurrentInstance,
    reactive,
    toRefs,
    watch,
  } from 'vue';
  import { useComposable } from '../../libs/hooks';
  /**
   * upload 图片上传
   * @description 该组件用于上传图片场景
   * @tutorial https://www.uviewui.com/components/upload.html
   * @property {String} action 服务器上传地址
   * @property {String Number} max-count 最大选择图片的数量（默认99）
   * @property {Boolean} custom-btn 如果需要自定义选择图片的按钮，设置为true（默认false）
   * @property {Boolean} show-progress 是否显示进度条（默认true）
   * @property {Boolean} disabled 是否启用(显示/移仓)组件（默认false）
   * @property {String} image-mode 预览图片等显示模式，可选值为uni的image的mode属性值（默认aspectFill）
   * @property {String} del-icon 右上角删除图标名称，只能为uView内置图标
   * @property {String} del-bg-color 右上角关闭按钮的背景颜色
   * @property {String | Number} index 在各个回调事件中的最后一个参数返回，用于区别是哪一个组件的事件
   * @property {String} del-color 右上角关闭按钮图标的颜色
   * @property {Object} header 上传携带的头信息，对象形式
   * @property {Object} form-data 上传额外携带的参数
   * @property {String} name 上传文件的字段名，供后端获取使用（默认file）
   * @property {Array<String>} size-type original 原图，compressed 压缩图，默认二者都有（默认['original', 'compressed']）
   * @property {Array<String>} source-type 选择图片的来源，album-从相册选图，camera-使用相机，默认二者都有（默认['album', 'camera']）
   * @property {Boolean} preview-full-image	是否可以通过uni.previewImage预览已选择的图片（默认true）
   * @property {Boolean} multiple	是否开启图片多选，部分安卓机型不支持（默认true）
   * @property {Boolean} deletable 是否显示删除图片的按钮（默认true）
   * @property {String Number} max-size 选择单个文件的最大大小，单位B(byte)，默认不限制（默认Number.MAX_VALUE）
   * @property {Array<Object>} file-list 默认显示的图片列表，数组元素为对象，必须提供url属性
   * @property {Boolean} upload-text 选择图片按钮的提示文字（默认“选择图片”）
   * @property {Boolean} auto-upload 选择完图片是否自动上传，见上方说明（默认true）
   * @property {Boolean} show-tips 特殊情况下是否自动提示toast，见上方说明（默认true）
   * @property {Boolean} show-upload-list 是否显示组件内部的图片预览（默认true）
   * @event {Function} on-oversize 图片大小超出最大允许大小
   * @event {Function} on-preview 全屏预览图片时触发
   * @event {Function} on-remove 移除图片时触发
   * @event {Function} on-success 图片上传成功时触发
   * @event {Function} on-change 图片上传后，无论成功或者失败都会触发
   * @event {Function} on-error 图片上传失败时触发
   * @event {Function} on-progress 图片上传过程中的进度变化过程触发
   * @event {Function} on-uploaded 所有图片上传完毕触发
   * @event {Function} on-choose-complete 每次选择图片后触发，只是让外部可以得知每次选择后，内部的文件列表
   * @example <u-upload :action="action" :file-list="fileList" ></u-upload>
   */
  interface ICodeMessageProps {
    [key: number]: string;
  }
  interface IListItemProps {
    url: string;
    path?: string;
    error: boolean;
    progress: number;
    file?: any;
    response?: any | null;
    uploadTask?: any;
    process?: any;
  }
  interface UUploadState {
    lists: IListItemProps[];
    isInCount:  boolean;
    uploading: boolean;
  }
  interface UploadHeader {
    [key: number]: string;
  }
  interface UploadFormData {
    [key: number]: string;
  }
  interface UploadFileList<T> {
    [key: number]: string;
  }
  interface UUploadProps<T> {
    //是否显示组件自带的图片预览功能
    showUploadList?: boolean;
    // 后端地址
    action: string;
    // 最大上传数量
    maxCount?: number | string;
    //  是否显示进度条
    showProgress?: boolean;
    // 是否启用
    disabled?: boolean;
    // 预览上传的图片时的裁剪模式，和image组件mode属性一致
    imageMode?: string;
    // 头部信息
    header?: UploadHeader;
    // 额外携带的参数
    formData?: UploadFormData;
    // 上传的文件字段名
    name?: string;
    // 所选的图片的尺寸, 可选值为original compressed
    sizeType?: ('original' | 'compressed')[];
    sourceType?: ('album' | 'camera')[];
    // 是否在点击预览图后展示全屏图片预览
    previewFullImage?: boolean;
    // 是否开启图片多选，部分安卓机型不支持
    multiple?: boolean;
    // 是否展示删除按钮
    deletable?: boolean;
    // 文件大小限制，单位为byte
    maxSize?: number | string;
    // 文件大小限制，提示语
    fileSizeExceededTip?: string;
    // 显示已上传的文件列表
    fileList?: UploadFileList<T>[];
    // 上传区域的提示文字
    uploadText?: string;
    // 是否自动上传
    autoUpload?: boolean;
    // 是否显示toast消息提示
    showTips?: boolean;
    // 是否通过slot自定义传入选择图标的按钮
    customBtn?: boolean;
    // 内部预览图片区域和选择图片按钮的区域宽度
    width?: number | string;
    // 内部预览图片区域和选择图片按钮的区域高度
    height?: number | string;
    // 右上角关闭按钮的背景颜色
    delBgColor?: string;
    // 右上角关闭按钮的叉号图标的颜色
    delColor?: string;
    // 右上角删除图标名称，只能为uView内置图标
    delIcon?: string;
    // 如果上传后的返回值为json字符串，是否自动转json
    toJson?: boolean;
    // 上传前的钩子，每个文件上传前都会执行
    beforeUpload?: Function | null;
    // 移除文件前的钩子
    beforeRemove?: Function | null;
    // 允许上传的图片后缀
    limitType?: string[];
    // 在各个回调事件中的最后一个参数返回，用于区别是哪一个组件的事件
    index?: number | string;
    // 用于数据回显
    imageList?: IListItemProps[];
  }

  const props = withDefaults(defineProps<UUploadProps<T>>(),{
    //是否显示组件自带的图片预览功能
    showUploadList: true,
    // 后端地址
    action: '',
    // 最大上传数量
    maxCount: 52,
    //  是否显示进度条
    showProgress: true,
    // 是否启用
    disabled: false,
    // 预览上传的图片时的裁剪模式，和image组件mode属性一致
    imageMode: 'aspectFill',
    // 头部信息
    header: {},
    // 额外携带的参数
    formData: {},
    // 上传的文件字段名
    name: 'file',
    // 所选的图片的尺寸, 可选值为original compressed
    sizeType: () => ['original', 'compressed'],
    sourceType: () => ['album', 'camera'],
    // 是否在点击预览图后展示全屏图片预览
    previewFullImage: true,
    // 是否开启图片多选，部分安卓机型不支持
    multiple: true,
    // 是否展示删除按钮
    deletable: true,
    // 文件大小限制，单位为byte
    maxSize: Number.MAX_VALUE,
    // 文件大小限制，提示语
    fileSizeExceededTip: "超出允许的文件大小",
    // 显示已上传的文件列表
    fileList: [],
    // 上传区域的提示文字
    uploadText: '选择图片',
    // 是否自动上传
    autoUpload: true,
    // 是否显示toast消息提示
    showTips: true,
    // 是否通过slot自定义传入选择图标的按钮
    customBtn: false,
    // 内部预览图片区域和选择图片按钮的区域宽度
    width: 200,
    // 内部预览图片区域和选择图片按钮的区域高度
    height: 200,
    // 右上角关闭按钮的背景颜色
    delBgColor: '#fa3534',
    // 右上角关闭按钮的叉号图标的颜色
    delColor: '#ffffff',
    // 右上角删除图标名称，只能为uView内置图标
    delIcon: 'close',
    // 如果上传后的返回值为json字符串，是否自动转json
    toJson: true,
    // 上传前的钩子，每个文件上传前都会执行
    beforeUpload: null,
    // 移除文件前的钩子
    beforeRemove: null,
    // 允许上传的图片后缀
    // 支付宝小程序真机选择图片的后缀为"image"
    // https://opendocs.alipay.com/mini/api/media-image
    limitType: () => ['png', 'jpg', 'jpeg', 'webp', 'gif', 'image'],
    // 在各个回调事件中的最后一个参数返回，用于区别是哪一个组件的事件
    index: '',
    // 用于数据回显
    imageList: [],
  });

  const emit = defineEmits<{
    (e: 'on-oversize', file: any, lists: any[], name: string | number): void;
    (e: 'on-exceed', file: any, lists: any[], name: string | number): void;
    (e: 'on-choose-complete', lists: any[], name: string | number): void;
    (e: 'on-list-change', lists: any[], name: string | number): void;
    (e: 'on-choose-fail', error: Error): void;
    (e: 'on-uploaded', lists: any[], name: string | number): void;
    (e: 'on-success', data: any, index: number, lists: any[], name: string | number): void;
    (e: 'on-change', res: any, index: number, lists: any[], name: string | number): void;
    (e: 'on-progress', res: any, index: number, lists: any[], name: string | number): void;
    (e: 'on-error', res: any, index: number, lists: any[], name: string | number): void;
    (e: 'on-remove', index: number, lists: any[], name: string | number): void;
    (e: 'on-preview', url: string, lists: any[], name: string | number): void;
  }>();

  const { guid, test, addUnit, getRect, $parentUtil } = useComposable();

	const codeMessage: ICodeMessageProps = {
		200: '服务器成功返回请求的数据。',
		201: '新建或修改数据成功。',
		202: '一个请求已经进入后台排队（异步任务）。',
		204: '删除数据成功。',
		400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
		401: '用户没有权限（令牌、用户名、密码错误）。',
		403: '用户得到授权，但是访问是被禁止的。',
		404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
		406: '请求的格式不可得。',
		410: '请求的资源被永久删除，且不会再得到的。',
		422: '当创建一个对象时，发生一个验证错误。',
		500: '服务器发生错误，请检查服务器。',
		502: '网关错误。',
		503: '服务不可用，服务器暂时过载或维护。',
		504: '网关超时。',
	};

  const instance: ComponentInternalInstance | null = getCurrentInstance();

  const state = reactive<UUploadState>({
    lists: props.imageList,
    isInCount: true,
    uploading: false,
  });

  // 清除列表
  const clear = () => {
    state.lists = [];
  };

  // 重新上传队列中上传失败的所有文件
  const reUpload = () => {
    uploadFile();
  };

  // 选择图片
  const selectFile = () => {
    if (props.disabled) return;
    let chooseFile = null;
    const newMaxCount = Number(props.maxCount) - state.lists.length;
    // 设置为只选择图片的时候使用 chooseImage 来实现
    chooseFile = new Promise((resolve, reject) => {
      uni.chooseImage({
        count: props.multiple ? (newMaxCount > 9 ? 9 : newMaxCount) : 1,
        sourceType: props.sourceType,
        sizeType: props.sizeType,
        success: resolve,
        fail: reject
      });
    });
    chooseFile.then((res: any) => {
      let file = null;
      let listOldLength = state.lists.length;
      res.tempFiles.map((val: any, index: number) => {
        // 检查文件后缀是否允许，如果不在props.limitType内，就会返回false
        if(!checkFileExt(val)) return ;

        // 如果是非多选，index大于等于1或者超出最大限制数量时，不处理
        if (!props.multiple && index >= 1) return;
        if (val.size > Number(props.maxSize)) {
          emit('on-oversize', val, state.lists, props.index);
          showToast(props.fileSizeExceededTip);
        } else {
          if (Number(props.maxCount) <= state.lists.length) {
            emit('on-exceed', val, state.lists, props.index);
            showToast('超出最大允许的文件个数');
            return;
          }
          state.lists.push({
            url: val.path,
            progress: 0,
            error: false,
            file: val
          });
        }
      });
      // 每次图片选择完，抛出一个事件，并将当前内部选择的图片数组抛出去
      emit('on-choose-complete', state.lists, props.index);
      if (props.autoUpload) uploadFile(listOldLength);
    })
      .catch(error => {
        emit('on-choose-fail', error);
      });
  };


  // 提示用户消息
  const showToast = (message: string, force = false) => {
    if (props.showTips || force) {
      uni.showToast({
        title: message,
        icon: 'none'
      });
    }
  };

  // 该方法供用户通过ref调用，手动上传
  const upload = () => {
    uploadFile();
  };

  // 对失败的图片重新上传
  const retry = (index: number) => {
    state.lists[index].progress = 0;
    state.lists[index].error = false;
    state.lists[index].response = null;
    uni.showLoading({
      title: '重新上传',
    });
    uploadFile(index);
  };

  // 上传失败
  const uploadError = (index: number, err: any) => {
    state.lists[index].progress = 0;
    state.lists[index].error = true;
    state.lists[index].response = null;
    emit('on-error', err, index, state.lists, props.index);
    // showToast('上传失败，请重试');
  };

  // 上传图片
  // @ts-ignore
  const uploadFile = async (index: number = 0): any => {
    if (props.disabled) return;
    if (state.uploading) return;
    // 全部上传完成
    if (index >= state.lists.length) {
      emit('on-uploaded', state.lists, props.index);
      return;
    }
    // 检查是否是已上传或者正在上传中
    if (state.lists[index].progress == 100) {
      if (props.autoUpload == false) uploadFile(index + 1);
      return;
    }
    // 执行before-upload钩子
    if(props.beforeUpload && typeof(props.beforeUpload) === 'function') {
      // 执行回调，同时传入索引和文件列表当作参数
      // 在微信，支付宝等环境(H5正常)，会导致父组件定义的customBack()函数体中的this变成子组件的this
      // 通过bind()方法，绑定父组件的this，让this.customBack()的this为父组件的上下文
      // 因为upload组件可能会被嵌套在其他组件内，比如u-form，这时this.$parent其实为u-form的this，
      // 非页面的this，所以这里需要往上历遍，一直寻找到最顶端的$parent，这里用了$parentUtil.call(this)
      // 明白意思即可，无需纠结$parentUtil.call(this)的细节
      // let beforeResponse = props.beforeUpload.bind($parentUtil('u-upload'))(index, state.lists);
      let beforeResponse = props.beforeUpload.bind($parentUtil('u-upload'))(index, state.lists);
      // 判断是否返回了promise
      if (!!beforeResponse && typeof beforeResponse.then === 'function') {
        await beforeResponse.then((res: any) => {
          // promise返回成功，不进行动作，继续上传
        }).catch((err: any) => {
          // 进入catch回调的话，继续下一张
          return uploadFile(index + 1);
        })
      } else if(beforeResponse === false) {
        // 如果返回false，继续下一张图片的上传
        return uploadFile(index + 1);
      } else {
        // 此处为返回"true"的情形，这里不写代码，就跳过此处，继续执行当前的上传逻辑
      }
    }
    // 检查上传地址
    if (!props.action) {
      showToast('请配置上传地址', true);
      return;
    }
    state.lists[index].error = false;
    state.uploading = true;
    // 创建上传对象
    const task = uni.uploadFile({
      url: props.action,
      filePath: state.lists[index].url,
      name: props.name,
      formData: props.formData,
      header: props.header,
      success: res => {
        // 判断是否json字符串，将其转为json格式
        let data = props.toJson && test.jsonString(res.data) ? JSON.parse(res.data) : res.data;
        if (![200, 201, 204].includes(res.statusCode)) {
          uni.showToast({
            duration: 3000,
            icon: 'none',
            title: codeMessage[res?.statusCode],
          });
          uploadError(index, data);
          return;
        }
        // 上传成功
        state.lists[index].response = data;
        state.lists[index].progress = 100;
        state.lists[index].error = false;
        emit('on-success', data, index, state.lists, props.index);
      },
      fail: e => {
        uploadError(index, e);
      },
      complete: (res: UniApp.GeneralCallbackResult) => {
        uni.hideLoading();
        state.uploading = false;
        uploadFile(index + 1);
        emit('on-change', res, index, state.lists, props.index);
      }
    });
    task.onProgressUpdate(res => {
      if (res.progress > 0) {
        state.lists[index].progress = res.progress;
        emit('on-progress', res, index, state.lists, props.index);
      }
    });
  };

  // 删除一个图片
  const deleteItem = (index: number) => {
    uni.showModal({
      title: '提示',
      content: '您确定要删除此项吗？',
      success: async (res) => {
        if (res.confirm) {
          // 先检查是否有定义before-remove移除前钩子
          // 执行before-remove钩子
          if(props.beforeRemove && typeof(props.beforeRemove) === 'function') {
            // 此处钩子执行 原理同before-remove参数，见上方注释
            // let beforeResponse = props.beforeRemove.bind($parentUtil('u-upload'))(index, state.lists);
            let beforeResponse = props.beforeRemove.bind($parentUtil('u-upload'))(index, state.lists);
            // 判断是否返回了promise
            if (!!beforeResponse && typeof beforeResponse.then === 'function') {
              await beforeResponse.then((res: any) => {
                // promise返回成功，不进行动作，继续上传
                handlerDeleteItem(index);
              }).catch((err: any) => {
                // 如果进入promise的reject，终止删除操作
                showToast('已终止移除');
              })
            } else if(beforeResponse === false) {
              // 返回false，终止删除
              showToast('已终止移除');
            } else {
              // 如果返回true，执行删除操作
              handlerDeleteItem(index);
            }
          } else {
            // 如果不存在before-remove钩子，
            handlerDeleteItem(index);
          }
        }
      }
    });
  };

  // 执行移除图片的动作，上方代码只是判断是否可以移除
  const handlerDeleteItem = (index: number) => {
    // 如果文件正在上传中，终止上传任务，进度在0 < progress < 100则意味着正在上传
    if (state.lists[index].process < 100 && state.lists[index].process > 0) {
      typeof state.lists[index].uploadTask != 'undefined' && state.lists[index].uploadTask.abort();
    }
    state.lists.splice(index, 1);
    instance?.proxy?.$forceUpdate();
    emit('on-remove', index, state.lists, props.index);
    showToast('移除成功');
  };

  // 用户通过ref手动的形式，移除一张图片
  const remove = (index: number) => {
    // 判断索引的合法范围
    if (index >= 0 && index < state.lists.length) {
      state.lists.splice(index, 1);
      emit('on-list-change', state.lists, props.index);
    }
  };

  // 预览图片
  const doPreviewImage = (url: string, index: number) => {
    if (!props.previewFullImage) return;
    const images: string[] = state.lists.map((item: any) => item.url || item.path);
    uni.previewImage({
      urls: images,
      current: url,
      success: () => {
        emit('on-preview', url, state.lists, props.index);
      },
      fail: () => {
        uni.showToast({
          title: '预览图片失败',
          icon: 'none'
        });
      }
    });
  };

  // 判断文件后缀是否允许
  const checkFileExt = (file: any) => {
    // 检查是否在允许的后缀中
    let noArrowExt = false;
    // 获取后缀名
    let fileExt = '';
    const reg = /.+\./;
    // 如果是H5，需要从name中判断
    // #ifdef H5
    fileExt = file.name.replace(reg, "").toLowerCase();
    // #endif
    // 非H5，需要从path中读取后缀
    // #ifndef H5
    fileExt = file.path.replace(reg, "").toLowerCase();
    // #endif
    // 使用数组的some方法，只要符合limitType中的一个，就返回true
    noArrowExt = props.limitType.some((ext: any) => {
      // 转为小写
      return ext.toLowerCase() === fileExt;
    });
    if(!noArrowExt) showToast(`不允许选择${fileExt}格式的文件`);
    return noArrowExt;
  };

  watch(() => props.fileList, (newValue, oldValue) => {
    newValue?.map((value: any) => {
      // 首先检查内部是否已经添加过这张图片，因为外部绑定了一个对象给fileList的话(对象引用)，进行修改外部fileList
      // 时，会触发watch，导致重新把原来的图片再次添加到state.lists
      // 数组的some方法意思是，只要数组元素有任意一个元素条件符合，就返回true，而另一个数组的every方法的意思是数组所有元素都符合条件才返回true
      let tmp = state.lists.some((val: any) => {
        return val.url == value.url;
      });
      // 如果内部没有这个图片(tmp为false)，则添加到内部
      !tmp && state.lists.push({ url: value.url, error: false, progress: 100 });
    });
  }, {
    immediate: true,
  });

  // 监听lists的变化，发出事件
  watch(() => state.lists, (newValue, oldValue) => {
    emit('on-list-change', newValue, props.index);
  });

  defineExpose({
    ...toRefs(state),
    clear,
    reUpload,
    selectFile,
    showToast,
    upload,
    retry,
    uploadFile,
    deleteItem,
    handlerDeleteItem,
    remove,
    doPreviewImage,
    checkFileExt,
  });
</script>

<style lang="scss" scoped>
  @import '../../libs/css/style.components.scss';

  .u-upload {
    @include vue-flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .u-list-item {
    width: 200rpx;
    height: 200rpx;
    overflow: hidden;
    margin: 10rpx;
    background: rgb(244, 245, 246);
    position: relative;
    border-radius: 10rpx;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    align-items: center;
    justify-content: center;
  }

  .u-preview-wrap {
    border: 1px solid rgb(235, 236, 238);
  }

  .u-add-wrap {
    flex-direction: column;
    color: $u-content-color;
    font-size: 26rpx;
  }

  .u-add-tips {
    margin-top: 20rpx;
    line-height: 40rpx;
  }

  .u-add-wrap__hover {
    background-color: rgb(235, 236, 238);
  }

  .u-preview-image {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
  }

  .u-delete-icon {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    z-index: 10;
    background-color: $u-type-error;
    border-radius: 100rpx;
    width: 44rpx;
    height: 44rpx;
    @include vue-flex;
    align-items: center;
    justify-content: center;
  }

  .u-icon {
    @include vue-flex;
    align-items: center;
    justify-content: center;
  }

  .u-progress {
    position: absolute;
    bottom: 10rpx;
    left: 8rpx;
    right: 8rpx;
    z-index: 9;
    width: auto;
  }
	.u-loading-box {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 9;
		background: rgba(255, 255, 255, 0.6);
		.u-loading-text {
			color: #ffffff;
			font-size: 20rpx;
			text-shadow: 2px 3px 0 #898999;
			text-transform: uppercase;
			padding: 4px 0;
			text-align: center;
			line-height: 1;
		}
	}

  .u-error-btn {
    color: #ffffff;
    background-color: $u-type-error;
    font-size: 20rpx;
    padding: 4px 0;
    text-align: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9;
    line-height: 1;
  }
</style>
