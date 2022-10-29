// @ts-ignore
import IRegExpConstructor = DB.IRegExpConstructor;

// @ts-ignore
function _extends(a: any, b: any, c?: any, d?: any) {
	// @ts-ignore
	_extends = Object.assign || function(target: any) {
		for (let i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (let key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

	// @ts-ignore
	return _extends.apply(this, arguments);
}

/* eslint no-console:0 */
var formatRegExp = /%[sdj%]/g;
var warning: Function = function warning() {}; // don't print warning message when in production env or node runtime

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production' && typeof window !==
	'undefined' && typeof document !== 'undefined') {
	warning = function warning(type: string, errors: any[]) {
		if (typeof console !== 'undefined' && console.warn) {
			if (errors.every(function(e: string) {
					return typeof e === 'string';
				})) {
				console.warn(type, errors);
			}
		}
	};
}

function convertFieldsError(errors: any[]) {
	if (!errors || !errors.length) return null;
	let fields: any = {};
	errors.forEach(function(error) {
		let field = error.field;
		fields[field] = fields[field] || [];
		fields[field].push(error);
	});
	return fields;
}

function format(required: any, fullField: any, min?: number, max?: number) {
	for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	let i = 1;
	let f = args[0];
	let len = args.length;

	if (typeof f === 'function') {
		return f.apply(null, args.slice(1));
	}

	if (typeof f === 'string') {
		let str = String(f).replace(formatRegExp, function(x: any) {
			if (x === '%%') {
				return '%';
			}

			if (i >= len) {
				return x;
			}

			switch (x) {
				case '%s':
					return String(args[i++]);

				case '%d':
					return Number(args[i++]);

				case '%j':
					try {
						return JSON.stringify(args[i++]);
					} catch (_) {
						return '[Circular]';
					}

					break;

				default:
					return x;
			}
		});

		for (var arg = args[i]; i < len; arg = args[++i]) {
			str += " " + arg;
		}

		return str;
	}

	return f;
}

function isNativeStringType(type: 'string' | 'url' | 'hex' | 'email' | 'pattern' | string) {
	return type === 'string' || type === 'url' || type === 'hex' || type === 'email' || type === 'pattern';
}

function isEmptyValue(value: string | undefined | null, type?: 'string' | 'url' | 'hex' | 'email' | 'pattern' | 'array') {
	if (value === undefined || value === null) {
		return true;
	}

	if (type === 'array' && Array.isArray(value) && !value.length) {
		return true;
	}

	if (type && isNativeStringType(type) && typeof value === 'string' && !value) {
		return true;
	}

	return false;
}

function asyncParallelArray(arr: any[], func: (a: any, count: any) => void, callback: (res: any) => void) {
	var results: any[] = [];
	var total = 0;
	var arrLength = arr.length;

	function count(errors: any[]) {
		results.push.apply(results, errors);
		total++;

		if (total === arrLength) {
			callback(results);
		}
	}

	arr.forEach(function(a) {
		func(a, count);
	});
}

function asyncSerialArray(arr: any[], func: any, callback: (err: any[]) => void) {
	var index = 0;
	var arrLength = arr.length;

	function next(errors: any[]) {
		if (errors && errors.length) {
			callback(errors);
			return;
		}

		var original = index;
		index = index + 1;

		if (original < arrLength) {
			func(arr[original], next);
		} else {
			callback([]);
		}
	}

	next([]);
}

function flattenObjArr(objArr: any) {
	const ret: any[] = [];
	Object.keys(objArr).forEach(function(k) {
		ret.push.apply(ret, objArr[k]);
	});
	return ret;
}

function asyncMap(objArr: any, option: any, func: any, callback: (errors: any[]) => void) {
	if (option.first) {
		var _pending = new Promise<void>(function(resolve, reject) {
			var next = function next(errors: any[]) {
				callback(errors);
				return errors.length ? reject({
					errors: errors,
					fields: convertFieldsError(errors)
				}) : resolve();
			};

			var flattenArr = flattenObjArr(objArr);
			asyncSerialArray(flattenArr, func, next);
		});

		_pending["catch"](function(e) {
			return e;
		});

		return _pending;
	}

	var firstFields = option.firstFields || [];

	if (firstFields === true) {
		firstFields = Object.keys(objArr);
	}

	const objArrKeys = Object.keys(objArr);
	const objArrLength = objArrKeys.length;
	let total = 0;
	const results: any[] = [];
	const pending = new Promise<void>(function(resolve, reject) {
		const next = function next(errors: any[]) {
			results.push.apply(results, errors);
			total++;

			if (total === objArrLength) {
				callback(results);
				return results.length ? reject({
					errors: results,
					fields: convertFieldsError(results)
				}) : resolve();
			}
		};

		if (!objArrKeys.length) {
			callback(results);
			resolve();
		}

		objArrKeys.forEach(function(key) {
			var arr = objArr[key];

			if (firstFields.indexOf(key) !== -1) {
				asyncSerialArray(arr, func, next);
			} else {
				asyncParallelArray(arr, func, next);
			}
		});
	});
	pending["catch"](function(e) {
		return e;
	});
	return pending;
}

function complementError(rule: any) {
	return function(oe: any) {
		if (oe && oe.message) {
			oe.field = oe.field || rule.fullField;
			return oe;
		}

		return {
			message: typeof oe === 'function' ? oe() : oe,
			field: oe.field || rule.fullField
		};
	};
}

function deepMerge(target: any, source: any) {
	if (source) {
		for (let s in source) {
			if (source.hasOwnProperty(s)) {
				var value = source[s];

				if (typeof value === 'object' && typeof target[s] === 'object') {
					target[s] = _extends({}, target[s], {}, value);
				} else {
					target[s] = value;
				}
			}
		}
	}

	return target;
}

/**
 *  Rule for validating required fields.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function required(rule: any, value: any, source: any, errors: any[], options: any, type?: any) {
	if (rule.required && (!source.hasOwnProperty(rule.field) || isEmptyValue(value, type || rule.type))) {
		errors.push(format(options.messages.required, rule.fullField));
	}
}

/**
 *  Rule for validating whitespace.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function whitespace(rule: any, value: string, source: any, errors: any[], options: any) {
	if (/^\s+$/.test(value) || value === '') {
		errors.push(format(options.messages.whitespace, rule.fullField));
	}
}

/* eslint max-len:0 */

var pattern = {
	// http://emailregex.com/
	email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	url: new RegExp(
		"^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$",
		'i'),
	hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
};
var types: any = {
	integer: function integer(value: any) {
		return types.number(value) && parseInt(value, 10) === value;
	},
	"float": function float(value: string) {
		return types.number(value) && !types.integer(value);
	},
	array: function array(value: string) {
		return Array.isArray(value);
	},
	regexp: function regexp(value: any) {
		if (value instanceof RegExp) {
			return true;
		}

		try {
			return !!new RegExp(value);
		} catch (e) {
			return false;
		}
	},
	date: function date(value: any) {
		return typeof value.getTime === 'function' && typeof value.getMonth === 'function' && typeof value.getYear ===
			'function';
	},
	number: function number(value: any) {
		if (isNaN(value)) {
			return false;
		}

		// 修改源码，将字符串数值先转为数值
		return typeof +value === 'number';
	},
	object: function object(value: any) {
		return typeof value === 'object' && !types.array(value);
	},
	method: function method(value: any) {
		return typeof value === 'function';
	},
	email: function email(value: any) {
		return typeof value === 'string' && !!value.match(pattern.email) && value.length < 255;
	},
	url: function url(value: any) {
		return typeof value === 'string' && !!value.match(pattern.url);
	},
	hex: function hex(value: any) {
		return typeof value === 'string' && !!value.match(pattern.hex);
	}
};
/**
 *  Rule for validating the type of a value.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function type(rule: any, value: any, source: any, errors: any[], options: any) {
	if (rule.required && value === undefined) {
		required(rule, value, source, errors, options);
		return;
	}

	const custom = ['integer', 'float', 'array', 'regexp', 'object', 'method', 'email', 'number', 'date', 'url', 'hex'];
	const ruleType: string = rule.type;

	if (custom.indexOf(ruleType) > -1) {
		if (!types[ruleType](value)) {
			errors.push(format(options.messages.types[ruleType], rule.fullField, rule.type));
		} // straight typeof check

	} else if (ruleType && typeof value !== rule.type) {
		errors.push(format(options.messages.types[ruleType], rule.fullField, rule.type));
	}
}

/**
 *  Rule for validating minimum and maximum allowed values.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function range(rule: any, value: any, source: any, errors: any[], options: any) {
	var len = typeof rule.len === 'number';
	var min = typeof rule.min === 'number';
	var max = typeof rule.max === 'number'; // 正则匹配码点范围从U+010000一直到U+10FFFF的文字（补充平面Supplementary Plane）

	var spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	var val = value;
	var key = null;
	var num = typeof value === 'number';
	var str = typeof value === 'string';
	var arr = Array.isArray(value);

	if (num) {
		key = 'number';
	} else if (str) {
		key = 'string';
	} else if (arr) {
		key = 'array';
	} // if the value is not of a supported type for range validation
	// the validation rule rule should use the
	// type property to also test for a particular type


	if (!key) {
		return false;
	}

	if (arr) {
		val = value.length;
	}

	if (str) {
		// 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".lenght !== 3
		val = value.replace(spRegexp, '_').length;
	}

	if (len) {
		if (val !== rule.len) {
			errors.push(format(options.messages[key].len, rule.fullField, rule.len));
		}
	} else if (min && !max && val < rule.min) {
		errors.push(format(options.messages[key].min, rule.fullField, rule.min));
	} else if (max && !min && val > rule.max) {
		errors.push(format(options.messages[key].max, rule.fullField, rule.max));
	} else if (min && max && (val < rule.min || val > rule.max)) {
		errors.push(format(options.messages[key].range, rule.fullField, rule.min, rule.max));
	}
}

var ENUM = 'enum';
/**
 *  Rule for validating a value exists in an enumerable list.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function enumerable(rule: any, value: any, source: any, errors: any[], options: any) {
	rule[ENUM] = Array.isArray(rule[ENUM]) ? rule[ENUM] : [];

	if (rule[ENUM].indexOf(value) === -1) {
		errors.push(format(options.messages[ENUM], rule.fullField, rule[ENUM].join(', ')));
	}
}

/**
 *  Rule for validating a regular expression pattern.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function pattern$1(rule: any, value: any, source: any, errors: any[], options: any) {
	if (rule.pattern) {
		if (rule.pattern instanceof RegExp) {
			// if a RegExp instance is passed, reset `lastIndex` in case its `global`
			// flag is accidentally set to `true`, which in a validation scenario
			// is not necessary and the result might be misleading
			rule.pattern.lastIndex = 0;

			if (!rule.pattern.test(value)) {
				errors.push(format(options.messages.pattern.mismatch, rule.fullField, value, rule.pattern));
			}
		} else if (typeof rule.pattern === 'string') {
			var _pattern = new RegExp(rule.pattern);

			if (!_pattern.test(value)) {
				errors.push(format(options.messages.pattern.mismatch, rule.fullField, value, rule.pattern));
			}
		}
	}
}

var rules: any = {
	required: required,
	whitespace: whitespace,
	type: type,
	range: range,
	"enum": enumerable,
	pattern: pattern$1
};

/**
 *  Performs validation for string types.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function string(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value, 'string') && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options, 'string');

		if (!isEmptyValue(value, 'string')) {
			rules.type(rule, value, source, errors, options);
			rules.range(rule, value, source, errors, options);
			rules.pattern(rule, value, source, errors, options);

			if (rule.whitespace === true) {
				rules.whitespace(rule, value, source, errors, options);
			}
		}
	}

	callback(errors);
}

/**
 *  Validates a function.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function method(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates a number.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function number(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (value === '') {
			value = undefined;
		}

		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
			rules.range(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates a boolean.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function _boolean(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates the regular expression type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function regexp(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (!isEmptyValue(value)) {
			rules.type(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates a number is an integer.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function integer(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
			rules.range(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates a number is a floating point number.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function floatFn(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
			rules.range(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates an array.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function array(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value, 'array') && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options, 'array');

		if (!isEmptyValue(value, 'array')) {
			rules.type(rule, value, source, errors, options);
			rules.range(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates an object.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function object(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules.type(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

var ENUM$1 = 'enum';
/**
 *  Validates an enumerable list.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function enumerable$1(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (value !== undefined) {
			rules[ENUM$1](rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Validates a regular expression pattern.
 *
 *  Performs validation when a rule only contains
 *  a pattern property but is not declared as a string type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function pattern$2(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value, 'string') && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (!isEmptyValue(value, 'string')) {
			rules.pattern(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

function date(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);

		if (!isEmptyValue(value)) {
			var dateObject;

			if (typeof value === 'number') {
				dateObject = new Date(value);
			} else {
				dateObject = value;
			}

			rules.type(rule, dateObject, source, errors, options);

			if (dateObject) {
				rules.range(rule, dateObject.getTime(), source, errors, options);
			}
		}
	}

	callback(errors);
}

function required$1(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var type = Array.isArray(value) ? 'array' : typeof value;
	rules.required(rule, value, source, errors, options, type);
	callback(errors);
}

function type$1(rule: any, value: any, callback: any, source: any, options: any) {
	var ruleType = rule.type;
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value, ruleType) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options, ruleType);

		if (!isEmptyValue(value, ruleType)) {
			rules.type(rule, value, source, errors, options);
		}
	}

	callback(errors);
}

/**
 *  Performs validation for any type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */

function any(rule: any, value: any, callback: any, source: any, options: any) {
	var errors: any[] = [];
	var validate = rule.required || !rule.required && source.hasOwnProperty(rule.field);

	if (validate) {
		if (isEmptyValue(value) && !rule.required) {
			return callback();
		}

		rules.required(rule, value, source, errors, options);
	}

	callback(errors);
}

var validators: any = {
	string: string,
	method: method,
	number: number,
	"boolean": _boolean,
	regexp: regexp,
	integer: integer,
	"float": floatFn,
	array: array,
	object: object,
	"enum": enumerable$1,
	pattern: pattern$2,
	date: date,
	url: type$1,
	hex: type$1,
	email: type$1,
	required: required$1,
	any: any
};

function newMessages() {
	return {
		"default": 'Validation error on field %s',
		required: '%s is required',
		"enum": '%s must be one of %s',
		whitespace: '%s cannot be empty',
		date: {
			format: '%s date %s is invalid for format %s',
			parse: '%s date could not be parsed, %s is invalid ',
			invalid: '%s date %s is invalid'
		},
		types: {
			string: '%s is not a %s',
			method: '%s is not a %s (function)',
			array: '%s is not an %s',
			object: '%s is not an %s',
			number: '%s is not a %s',
			date: '%s is not a %s',
			"boolean": '%s is not a %s',
			integer: '%s is not an %s',
			"float": '%s is not a %s',
			regexp: '%s is not a valid %s',
			email: '%s is not a valid %s',
			url: '%s is not a valid %s',
			hex: '%s is not a valid %s'
		},
		string: {
			len: '%s must be exactly %s characters',
			min: '%s must be at least %s characters',
			max: '%s cannot be longer than %s characters',
			range: '%s must be between %s and %s characters'
		},
		number: {
			len: '%s must equal %s',
			min: '%s cannot be less than %s',
			max: '%s cannot be greater than %s',
			range: '%s must be between %s and %s'
		},
		array: {
			len: '%s must be exactly %s in length',
			min: '%s cannot be less than %s in length',
			max: '%s cannot be greater than %s in length',
			range: '%s must be between %s and %s in length'
		},
		pattern: {
			mismatch: '%s value %s does not match pattern %s'
		},
		clone: function clone() {
			var cloned = JSON.parse(JSON.stringify(this));
			cloned.clone = this.clone;
			return cloned;
		}
	};
}
var messages = newMessages();

/**
 *  Encapsulates a validation schema.
 *
 *  @param descriptor An object declaring validation rules
 *  for this schema.
 */

function Schema(descriptor: any) {
	// @ts-ignore
	this.rules = null;
	// @ts-ignore
	this._messages = messages;
	// @ts-ignore
	this.define(descriptor);
}

Schema.prototype = {
	messages: function messages(_messages: any) {
		if (_messages) {
			this._messages = deepMerge(newMessages(), _messages);
		}

		return this._messages;
	},
	define: function define(rules: any) {
		if (!rules) {
			throw new Error('Cannot configure a schema with no rules');
		}

		if (typeof rules !== 'object' || Array.isArray(rules)) {
			throw new Error('Rules must be an object');
		}

		this.rules = {};
		var z;
		var item;

		for (z in rules) {
			if (rules.hasOwnProperty(z)) {
				item = rules[z];
				this.rules[z] = Array.isArray(item) ? item : [item];
			}
		}
	},
	validate: function validate(source_: any, o: any, oc: any) {
		var _this = this;

		if (o === void 0) {
			o = {};
		}

		if (oc === void 0) {
			oc = function oc() {};
		}

		var source = source_;
		var options = o;
		var callback = oc;

		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!this.rules || Object.keys(this.rules).length === 0) {
			if (callback) {
				callback();
			}

			return Promise.resolve();
		}

		function complete(results: any) {
			let i;
			let errors: any = [];
			let fields: any = {};

			function add(e: any) {
				if (Array.isArray(e)) {
					let _errors;

					errors = (_errors = errors).concat.apply(_errors, e);
				} else {
					errors.push(e);
				}
			}

			for (i = 0; i < results.length; i++) {
				add(results[i]);
			}

			if (!errors.length) {
				errors = null;
				fields = null;
			} else {
				fields = convertFieldsError(errors);
			}

			callback(errors, fields);
		}

		if (options.messages) {
			var messages$1 = this.messages();

			if (messages$1 === messages) {
				messages$1 = newMessages();
			}

			deepMerge(messages$1, options.messages);
			options.messages = messages$1;
		} else {
			options.messages = this.messages();
		}

		let arr: any;
		let value: any;
		let series: any = {};
		let keys = options.keys || Object.keys(this.rules);
		keys.forEach(function(z: any) {
			arr = _this.rules[z];
			value = source[z];
			arr.forEach(function(r: any) {
				var rule = r;

				if (typeof rule.transform === 'function') {
					if (source === source_) {
						source = _extends({}, source);
					}

					value = source[z] = rule.transform(value);
				}

				if (typeof rule === 'function') {
					rule = {
						validator: rule
					};
				} else {
					rule = _extends({}, rule);
				}

				rule.validator = _this.getValidationMethod(rule);
				rule.field = z;
				rule.fullField = rule.fullField || z;
				rule.type = _this.getType(rule);

				if (!rule.validator) {
					return;
				}

				series[z] = series[z] || [];
				series[z].push({
					rule: rule,
					value: value,
					source: source,
					field: z
				});
			});
		});
		let errorFields: any = {};
		return asyncMap(series, options, function(data: any, doIt: any) {
			var rule = data.rule;
			var deep = (rule.type === 'object' || rule.type === 'array') && (typeof rule.fields === 'object' || typeof rule.defaultField ===
				'object');
			deep = deep && (rule.required || !rule.required && data.value);
			rule.field = data.field;

			function addFullfield(key: any, schema: any) {
				return _extends({}, schema, {
					fullField: rule.fullField + "." + key
				});
			}

			function cb(e?: any) {
				if (e === void 0) {
					e = [];
				}

				var errors = e;

				if (!Array.isArray(errors)) {
					errors = [errors];
				}

				if (!options.suppressWarning && errors.length) {
					Schema.warning('async-validator:', errors);
				}

				if (errors.length && rule.message) {
					errors = [].concat(rule.message);
				}

				errors = errors.map(complementError(rule));

				if (options.first && errors.length) {
					errorFields[rule.field] = 1;
					return doIt(errors);
				}

				if (!deep) {
					doIt(errors);
				} else {
					// if rule is required but the target object
					// does not exist fail at the rule level and don't
					// go deeper
					if (rule.required && !data.value) {
						if (rule.message) {
							errors = [].concat(rule.message).map(complementError(rule));
						} else if (options.error) {
							errors = [options.error(rule, format(options.messages.required, rule.field))];
						} else {
							errors = [];
						}

						return doIt(errors);
					}

					let fieldsSchema: any = {};

					if (rule.defaultField) {
						for (var k in data.value) {
							if (data.value.hasOwnProperty(k)) {
								fieldsSchema[k] = rule.defaultField;
							}
						}
					}

					fieldsSchema = _extends({}, fieldsSchema, {}, data.rule.fields);

					for (var f in fieldsSchema) {
						if (fieldsSchema.hasOwnProperty(f)) {
							var fieldSchema = Array.isArray(fieldsSchema[f]) ? fieldsSchema[f] : [fieldsSchema[f]];
							fieldsSchema[f] = fieldSchema.map(addFullfield.bind(null, f));
						}
					}
					// @ts-ignore
					const schema = new Schema(fieldsSchema);
					schema.messages(options.messages);

					if (data.rule.options) {
						data.rule.options.messages = options.messages;
						data.rule.options.error = options.error;
					}

					schema.validate(data.value, data.rule.options || options, function(errs: any[]) {
						var finalErrors: any[] = [];

						if (errors && errors.length) {
							finalErrors.push.apply(finalErrors, errors);
						}

						if (errs && errs.length) {
							finalErrors.push.apply(finalErrors, errs);
						}

						doIt(finalErrors.length ? finalErrors : null);
					});
				}
			}

			var res;

			if (rule.asyncValidator) {
				res = rule.asyncValidator(rule, data.value, cb, data.source, options);
			} else if (rule.validator) {
				res = rule.validator(rule, data.value, cb, data.source, options);

				if (res === true) {
					cb();
				} else if (res === false) {
					cb(rule.message || rule.field + " fails");
				} else if (res instanceof Array) {
					cb(res);
				} else if (res instanceof Error) {
					cb(res.message);
				}
			}

			if (res && res.then) {
				res.then(function() {
					return cb();
				}, function(e: any) {
					return cb(e);
				});
			}
		}, function(results) {
			complete(results);
		});
	},
	getType: function getType(rule: any) {
		if (rule.type === undefined && rule.pattern instanceof RegExp) {
			rule.type = 'pattern';
		}

		if (typeof rule.validator !== 'function' && rule.type && !validators.hasOwnProperty(rule.type)) {
			throw new Error(format('Unknown rule type %s', rule.type));
		}

		return rule.type || 'string';
	},
	getValidationMethod: function getValidationMethod(rule: any) {
		if (typeof rule.validator === 'function') {
			return rule.validator;
		}

		var keys = Object.keys(rule);
		var messageIndex = keys.indexOf('message');

		if (messageIndex !== -1) {
			keys.splice(messageIndex, 1);
		}

		if (keys.length === 1 && keys[0] === 'required') {
			return validators.required;
		}

		return validators[this.getType(rule)] || false;
	}
};

Schema.register = function register(type: any, validator: any) {
	if (typeof validator !== 'function') {
		throw new Error('Cannot register a validator by type, validator is not a function');
	}

	validators[type] = validator;
};

Schema.warning = warning;
Schema.messages = messages;

export default Schema;
