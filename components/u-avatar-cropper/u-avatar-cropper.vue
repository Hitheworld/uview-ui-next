<template>
	<view class="content">
		<view
          class="cropper-wrapper"
          :style="{
            height: state.cropperOpt.height + 'px'
          }"
        >
			<canvas
        class="cropper"
        :disable-scroll="true"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
        :style="{
          width: state.cropperOpt.width,
          height: state.cropperOpt.height,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }"
				:canvas-id="state.cropperOpt.id"
				:id="state.cropperOpt.id"
			></canvas>
			<canvas
				class="cropper"
				:disable-scroll="true"
				:style="{
					position: 'fixed',
					top: `-${state.cropperOpt.width * state.cropperOpt.pixelRatio}px`,
					left: `-${state.cropperOpt.height * state.cropperOpt.pixelRatio}px`,
					width: `${state.cropperOpt.width * state.cropperOpt.pixelRatio}px`,
					height: `${state.cropperOpt.height * state.cropperOpt.pixelRatio}`
				}"
				:canvas-id="state.cropperOpt.targetId"
				:id="state.cropperOpt.targetId"
			></canvas>
		</view>
		<view
      class="cropper-buttons safe-area-padding"
      :style="{
        height: state.bottomNavHeight + 'px'
      }"
    >
			<!-- #ifdef H5 -->
			<view class="upload" @tap="uploadTap">选择图片</view>
			<!-- #endif -->
			<!-- #ifndef H5 -->
			<view class="upload" @tap="uploadTap">重新选择</view>
			<!-- #endif -->
			<view class="getCropperImage" @tap="getCropperImage(false)">确定</view>
		</view>
	</view>
</template>

<script lang="ts">
  export default {
    name: 'u-avatar-cropper',
  }
</script>

<script setup lang="ts">
  import { reactive, toRefs } from "vue";
  import { onLoad } from "@dcloudio/uni-app";
  import WeCropper from './we-cropper';
  import { useComposable } from '../../libs/hooks'
  import { Wx } from './we-cropper/types/wx'
  interface Cut {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  interface BoundStyle {
    lineWidth?: number;
    mask?: string;
    color?: string;
  }
  interface CropperOpt {
    id: string;
    targetId: string;
    pixelRatio: number;
    width: number;
    height: number;
    scale: number;
    zoom: number;
    cut: Cut;
    boundStyle: BoundStyle;
  }
  interface UAvatarCropperState {
    // 底部导航的高度
    bottomNavHeight: number;
    originWidth: number;
    width: number;
    height: number;
    cropperOpt: CropperOpt;
    // 裁剪框和输出图片的尺寸，高度默认等于宽度
    // 输出图片宽度，单位px
    destWidth: number;
    // 裁剪框宽度，单位px
    rectWidth: number;
    // 输出的图片类型，如果'png'类型发现裁剪的图片太大，改成"jpg"即可
    fileType: string;
    // 选择的图片路径，用于在点击确定时，判断是否选择了图片
    src: string;
  }
  interface UAvatarCropperBoundStyle {
    lineWidth?: number;
    mask?: string;
    borderColor?: string;
  }
  interface UAvatarCropperProps {
    // 裁剪矩形框的样式，其中可包含的属性为lineWidth-边框宽度(单位rpx)，color: 边框颜色，
    // mask-遮罩颜色，一般设置为一个rgba的透明度，如"rgba(0, 0, 0, 0.35)"
    boundStyle?: UAvatarCropperBoundStyle;
    // // 裁剪框宽度，单位rpx
    // rectWidth?: number | string;
    // // 裁剪框高度，单位rpx
    // rectHeight?: number | string;
    // // 输出图片宽度，单位rpx
    // destWidth?: number | string;
    // // 输出图片高度，单位rpx
    // destHeight?: number | string;
    // // 输出的图片类型，如果发现裁剪的图片很大，可能是因为设置为了"png"，改成"jpg"即可
    // fileType?: string;
    // // 生成的图片质量
    // // H5上无效，目前不考虑使用此参数
    // quality?: number | string;
  }

  const props = withDefaults(defineProps<UAvatarCropperProps>() ,{
    // 裁剪矩形框的样式，其中可包含的属性为lineWidth-边框宽度(单位rpx)，color: 边框颜色，
    // mask-遮罩颜色，一般设置为一个rgba的透明度，如"rgba(0, 0, 0, 0.35)"
    boundStyle: () => {
      return {
        lineWidth: 4,
        borderColor: 'rgb(245, 245, 245)',
        mask: 'rgba(0, 0, 0, 0.35)',
      }
    },
    // // 裁剪框宽度，单位rpx
    // rectWidth: 400,
    // // 裁剪框高度，单位rpx
    // rectHeight: 400,
    // // 输出图片宽度，单位rpx
    // destWidth: 400,
    // // 输出图片高度，单位rpx
    // destHeight: 400,
    // // 输出的图片类型，如果发现裁剪的图片很大，可能是因为设置为了"png"，改成"jpg"即可
    // fileType: 'jpg',
    // // 生成的图片质量
    // // H5上无效，目前不考虑使用此参数
    // quality: 1,
  });

  const { toast, route } = useComposable();

  const state = reactive<UAvatarCropperState>({
    // 底部导航的高度
    bottomNavHeight: 50,
    originWidth: 200,
    width: 0,
    height: 0,
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: 1,
      width: 0,
      height: 0,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      boundStyle: {
        lineWidth: props?.boundStyle?.lineWidth ? uni.upx2px(props?.boundStyle?.lineWidth) : 0,
        mask: props?.boundStyle?.mask,
        color: props?.boundStyle?.borderColor,
      },
    },
    // 裁剪框和输出图片的尺寸，高度默认等于宽度
    // 输出图片宽度，单位px
    destWidth: 200,
    // 裁剪框宽度，单位px
    rectWidth: 200,
    // 输出的图片类型，如果'png'类型发现裁剪的图片太大，改成"jpg"即可
    fileType: 'jpg',
    src: '', // 选择的图片路径，用于在点击确定时，判断是否选择了图片
  });


  let cropper = new WeCropper(state.cropperOpt)
    .on('ready', (ctx: Wx.CanvasContext) => {
      // wecropper is ready for work!
    })
    .on('beforeImageLoad', (ctx: Wx.CanvasContext) => {
      // before picture loaded, i can do something
    })
    .on('imageLoad', (ctx: Wx.CanvasContext) => {
      // picture loaded
    })
    .on('beforeDraw', (ctx: Wx.CanvasContext, instance: any) => {
      // before canvas draw,i can do something
    });

  onLoad((option: any) => {
    let rectInfo = uni.getSystemInfoSync();
    state.width = rectInfo.windowWidth;
    state.height = rectInfo.windowHeight - state.bottomNavHeight;
    state.cropperOpt.width = state.width;
    state.cropperOpt.height = state.height;
    state.cropperOpt.pixelRatio = rectInfo.pixelRatio;
    state.cropperOpt.cut.x = (state.width - state.originWidth) / 2;
    state.cropperOpt.cut.y = (state.height - state.originWidth) / 2;
    state.cropperOpt.cut.width = state.originWidth;
    state.cropperOpt.cut.height = state.originWidth;

    if (option.destWidth) {
      state.destWidth = option.destWidth;
    }
    if (option.rectWidth) {
      let rectWidth = Number(option.rectWidth);
      state.cropperOpt.cut = {
        x: (state.width - rectWidth) / 2,
        y: (state.height - rectWidth) / 2,
        width: rectWidth,
        height: rectWidth,
      };
    }
    state.rectWidth = option.rectWidth;
    if (option.fileType) state.fileType = option.fileType;
    // 初始化
    cropper = new WeCropper(state.cropperOpt)
      .on('ready', ctx => {
        // wecropper is ready for work!
      })
      .on('beforeImageLoad', (ctx: Wx.CanvasContext) => {
        // before picture loaded, i can do something
      })
      .on('imageLoad', (ctx: Wx.CanvasContext) => {
        // picture loaded
      })
      .on('beforeDraw', (ctx: Wx.CanvasContext, instance: any) => {
        // before canvas draw,i can do something
      });
    // 设置导航栏样式，以免用户在page.json中没有设置为黑色背景
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000'
    });
    uni.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        state.src = res.tempFilePaths[0];
        //  获取裁剪图片资源后，给data添加src属性及其值
        cropper.pushOrign(state.src);
      }
    });
  });

  const touchStart = (e: any) => {
    cropper.touchStart(e);
  };

  const touchMove = (e: any) => {
    cropper.touchMove(e);
  };

  const touchEnd = (e: any) => {
    cropper.touchEnd(e);
  };

  const getCropperImage = (isPre = false) => {
    if(!state.src) {
      return toast('请先选择图片再裁剪');
    }

    let cropper_opt = {
      destHeight: Number(state.destWidth), // uni.canvasToTempFilePath要求这些参数为数值
      destWidth: Number(state.destWidth),
      fileType: state.fileType
    };
    cropper.getCropperImage(cropper_opt, (path: string, err: Error) => {
      if (err) {
        uni.showModal({
          title: '温馨提示',
          content: err.message
        });
      } else {
        if (isPre) {
          uni.previewImage({
            current: '', // 当前显示图片的 http 链接
            urls: [path] // 需要预览的图片 http 链接列表
          });
        } else {
          uni.$emit('uAvatarCropper', path);
          route({
            type: 'back'
          });
        }
      }
    });
  };

  const uploadTap = () => {
    uni.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        state.src = res.tempFilePaths[0];
        //  获取裁剪图片资源后，给data添加src属性及其值
        cropper.pushOrign(state.src);
      }
    });
  };

  defineExpose({
    ...toRefs(state),
    touchStart,
    touchMove,
    touchEnd,
    getCropperImage,
    uploadTap,
  });
</script>

<style scoped lang="scss">
@import '../../libs/css/style.components.scss';

.content {
	background: rgba(255, 255, 255, 1);
}

.cropper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 11;
}

.cropper-buttons {
	background-color: #000000;
	color: #eee;
}

.cropper-wrapper {
	position: relative;
	@include vue-flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	background-color: #000;
}

.cropper-buttons {
	width: 100vw;
	@include vue-flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	position: fixed;
	bottom: 0;
	left: 0;
	font-size: 28rpx;
}

.cropper-buttons .upload,
.cropper-buttons .getCropperImage {
	width: 50%;
	text-align: center;
}

.cropper-buttons .upload {
	text-align: left;
	padding-left: 50rpx;
}

.cropper-buttons .getCropperImage {
	text-align: right;
	padding-right: 50rpx;
}
</style>
