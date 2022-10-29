import validation from './test';

// 添加单位，如果有rpx，%，px等单位结尾或者值为auto，直接返回，否则加上rpx单位结尾
export default function addUnit(value: string | number = 'auto', unit: 'rpx' | 'px' = 'rpx') {
  const _value = String(value);
	// 用uView内置验证规则中的number判断是否为数值
  return validation.number(_value) ? `${_value}${unit}` : _value;
}
