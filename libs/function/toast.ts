function toast(title: string, duration: number = 1500) {
	uni.showToast({
		title: title,
		icon: 'none',
		duration: duration,
	});
}

export default toast;
