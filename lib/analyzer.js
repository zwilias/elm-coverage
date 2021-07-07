(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.S.F === region.Z.F)
	{
		return 'on line ' + region.S.F;
	}
	return 'on lines ' + region.S.F + ' through ' + region.Z.F;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.aW,
		impl.bb,
		impl.a7,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = A2(update, msg, model);
		stepper(model = result.a, viewMetadata);
		_Platform_enqueueEffects(managers, result.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$List$cons = _List_cons;
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $author$project$Service$emit = _Platform_outgoingPort('emit', $elm$core$Basics$identity);
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.a) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.c);
		} else {
			var treeLen = builder.a * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.d) : builder.d;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.a);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.c);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{d: nodeList, a: (len / $elm$core$Array$branchFactor) | 0, c: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Service$handle = F4(
	function (handler, encode, msg, version) {
		if (!msg.$) {
			var input = msg.a;
			return _Utils_Tuple2(
				version,
				$author$project$Service$emit(
					encode(
						A2(handler, version, input))));
		} else {
			var val = msg.a;
			return _Utils_Tuple2(
				version,
				$author$project$Service$emit(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'type',
								$elm$json$Json$Encode$string('error')),
								_Utils_Tuple2(
								'message',
								$elm$json$Json$Encode$string(val))
							]))));
		}
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (!result.$) {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Service$innerInit = function (flags) {
	return _Utils_Tuple2(
		A2(
			$elm$core$Result$withDefault,
			'1.0.0',
			A2(
				$elm$json$Json$Decode$decodeValue,
				A2($elm$json$Json$Decode$field, 'version', $elm$json$Json$Decode$string),
				flags)),
		$elm$core$Platform$Cmd$none);
};
var $author$project$Service$Bad = function (a) {
	return {$: 1, a: a};
};
var $author$project$Service$Receive = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Service$receive = _Platform_incomingPort('receive', $elm$json$Json$Decode$value);
var $author$project$Service$subscribe = F2(
	function (decoder, _v0) {
		return $author$project$Service$receive(
			function (data) {
				var _v1 = A2($elm$json$Json$Decode$decodeValue, decoder, data);
				if (!_v1.$) {
					var input = _v1.a;
					return $author$project$Service$Receive(input);
				} else {
					var e = _v1.a;
					return $author$project$Service$Bad(
						$elm$json$Json$Decode$errorToString(e));
				}
			});
	});
var $elm$core$Platform$worker = _Platform_worker;
var $author$project$Service$create = function (settings) {
	return $elm$core$Platform$worker(
		{
			aW: $author$project$Service$innerInit,
			a7: $author$project$Service$subscribe(settings.a1),
			bb: A2($author$project$Service$handle, settings.aR, settings.aO)
		});
};
var $author$project$Analyzer$Model = F2(
	function (inputs, moduleMap) {
		return {ad: inputs, N: moduleMap};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $author$project$Coverage$CaseBranch = {$: 3};
var $author$project$Coverage$IfElseBranch = {$: 4};
var $author$project$Coverage$LambdaBody = function (a) {
	return {$: 2, a: a};
};
var $author$project$Coverage$LetDeclaration = function (a) {
	return {$: 1, a: a};
};
var $author$project$Coverage$caseBranch = 'caseBranch';
var $author$project$Coverage$declaration = 'declaration';
var $author$project$Coverage$Declaration = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Coverage$declarationDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Coverage$Declaration,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'complexity', $elm$json$Json$Decode$int));
var $author$project$Coverage$ifElseBranch = 'ifElseBranch';
var $author$project$Coverage$lambdaBody = 'lambdaBody';
var $author$project$Coverage$letDeclaration = 'letDeclaration';
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Coverage$typeIs = F2(
	function (expectedValue, decoder) {
		return A2(
			$elm$json$Json$Decode$andThen,
			function (actual) {
				return _Utils_eq(actual, expectedValue) ? decoder : $elm$json$Json$Decode$fail('not this one');
			},
			A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
	});
var $author$project$Coverage$withComplexity = function (tag) {
	return A2(
		$elm$json$Json$Decode$map,
		tag,
		A2($elm$json$Json$Decode$field, 'complexity', $elm$json$Json$Decode$int));
};
var $author$project$Coverage$annotationDecoder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2($author$project$Coverage$typeIs, $author$project$Coverage$declaration, $author$project$Coverage$declarationDecoder),
			A2(
			$author$project$Coverage$typeIs,
			$author$project$Coverage$letDeclaration,
			$author$project$Coverage$withComplexity($author$project$Coverage$LetDeclaration)),
			A2(
			$author$project$Coverage$typeIs,
			$author$project$Coverage$lambdaBody,
			$author$project$Coverage$withComplexity($author$project$Coverage$LambdaBody)),
			A2(
			$author$project$Coverage$typeIs,
			$author$project$Coverage$caseBranch,
			$elm$json$Json$Decode$succeed($author$project$Coverage$CaseBranch)),
			A2(
			$author$project$Coverage$typeIs,
			$author$project$Coverage$ifElseBranch,
			$elm$json$Json$Decode$succeed($author$project$Coverage$IfElseBranch))
		]));
var $author$project$Coverage$evaluationCountDecoder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2($elm$json$Json$Decode$field, 'count', $elm$json$Json$Decode$int),
			$elm$json$Json$Decode$succeed(0)
		]));
var $elm$json$Json$Decode$map3 = _Json_map3;
var $author$project$Coverage$Region = F2(
	function (from, to) {
		return {aQ: from, ba: to};
	});
var $author$project$Coverage$position = A3(
	$elm$json$Json$Decode$map2,
	F2(
		function (a, b) {
			return _Utils_Tuple2(a, b);
		}),
	A2($elm$json$Json$Decode$field, 'line', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'column', $elm$json$Json$Decode$int));
var $author$project$Coverage$regionDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Coverage$Region,
	A2($elm$json$Json$Decode$field, 'from', $author$project$Coverage$position),
	A2($elm$json$Json$Decode$field, 'to', $author$project$Coverage$position));
var $author$project$Coverage$annotationInfoDecoder = A4(
	$elm$json$Json$Decode$map3,
	F3(
		function (a, b, c) {
			return _Utils_Tuple3(a, b, c);
		}),
	$author$project$Coverage$regionDecoder,
	$author$project$Coverage$annotationDecoder,
	$author$project$Coverage$evaluationCountDecoder);
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Coverage$regionsDecoder = A2(
	$elm$json$Json$Decode$map,
	$elm$core$Dict$fromList,
	$elm$json$Json$Decode$keyValuePairs(
		$elm$json$Json$Decode$list($author$project$Coverage$annotationInfoDecoder)));
var $author$project$Analyzer$decodeModel = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Analyzer$Model,
	A2(
		$elm$json$Json$Decode$field,
		'files',
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Dict$fromList,
			$elm$json$Json$Decode$keyValuePairs($elm$json$Json$Decode$string))),
	A2($elm$json$Json$Decode$field, 'coverage', $author$project$Coverage$regionsDecoder));
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $zwilias$elm_html_string$Html$Types$indent = F3(
	function (perLevel, level, x) {
		return _Utils_ap(
			A2($elm$core$String$repeat, perLevel * level, ' '),
			x);
	});
var $zwilias$elm_html_string$Html$Types$join = F2(
	function (between, list) {
		if (!list.b) {
			return '';
		} else {
			if (!list.b.b) {
				var x = list.a;
				return x;
			} else {
				var x = list.a;
				var xs = list.b;
				return A3(
					$elm$core$List$foldl,
					F2(
						function (y, acc) {
							return _Utils_ap(
								y,
								_Utils_ap(between, acc));
						}),
					x,
					xs);
			}
		}
	});
var $zwilias$elm_html_string$Html$Types$closingTag = function (tagName) {
	return '</' + (tagName + '>');
};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $zwilias$elm_html_string$Html$Types$escapeHtmlText = A2(
	$elm$core$Basics$composeR,
	A2($elm$core$String$replace, '&', '&amp;'),
	A2(
		$elm$core$Basics$composeR,
		A2($elm$core$String$replace, '<', '&lt;'),
		A2($elm$core$String$replace, '>', '&gt;')));
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$core$String$foldl = _String_foldl;
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $zwilias$elm_html_string$Html$Types$escape = A2(
	$elm$core$String$foldl,
	F2(
		function (_char, acc) {
			return (_char === '\"') ? (acc + '\\\"') : _Utils_ap(
				acc,
				$elm$core$String$fromChar(_char));
		}),
	'');
var $elm$core$Char$toLower = _Char_toLower;
var $zwilias$elm_html_string$Html$Types$hyphenate = A2(
	$elm$core$String$foldl,
	F2(
		function (_char, acc) {
			return $elm$core$Char$isUpper(_char) ? (acc + ('-' + $elm$core$String$fromChar(
				$elm$core$Char$toLower(_char)))) : _Utils_ap(
				acc,
				$elm$core$String$fromChar(_char));
		}),
	'');
var $zwilias$elm_html_string$Html$Types$buildProp = F2(
	function (key, value) {
		return $zwilias$elm_html_string$Html$Types$hyphenate(key) + ('=\"' + ($zwilias$elm_html_string$Html$Types$escape(value) + '\"'));
	});
var $NoRedInk$elm_string_conversions$String$Conversions$fromValue = function (value) {
	return A2($elm$json$Json$Encode$encode, 0, value);
};
var $zwilias$elm_html_string$Html$Types$propName = function (prop) {
	switch (prop) {
		case 'className':
			return 'class';
		case 'defaultValue':
			return 'value';
		case 'htmlFor':
			return 'for';
		default:
			return prop;
	}
};
var $zwilias$elm_html_string$Html$Types$addAttribute = F2(
	function (attribute, acc) {
		var classes = acc.a;
		var styles = acc.b;
		var attrs = acc.c;
		switch (attribute.$) {
			case 0:
				var key = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						A2($zwilias$elm_html_string$Html$Types$buildProp, key, value),
						attrs));
			case 1:
				if (attribute.a === 'className') {
					var value = attribute.b;
					return _Utils_Tuple3(
						A2($elm$core$List$cons, value, classes),
						styles,
						attrs);
				} else {
					var string = attribute.a;
					var value = attribute.b;
					return _Utils_Tuple3(
						classes,
						styles,
						A2(
							$elm$core$List$cons,
							A2(
								$zwilias$elm_html_string$Html$Types$buildProp,
								$zwilias$elm_html_string$Html$Types$propName(string),
								value),
							attrs));
				}
			case 2:
				var string = attribute.a;
				var enabled = attribute.b;
				return enabled ? _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						$zwilias$elm_html_string$Html$Types$hyphenate(
							$zwilias$elm_html_string$Html$Types$propName(string)),
						attrs)) : acc;
			case 3:
				var string = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						A2(
							$zwilias$elm_html_string$Html$Types$buildProp,
							$zwilias$elm_html_string$Html$Types$propName(string),
							$NoRedInk$elm_string_conversions$String$Conversions$fromValue(value)),
						attrs));
			case 4:
				var key = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					A2(
						$elm$core$List$cons,
						$zwilias$elm_html_string$Html$Types$escape(key) + (': ' + $zwilias$elm_html_string$Html$Types$escape(value)),
						styles),
					attrs);
			default:
				return acc;
		}
	});
var $zwilias$elm_html_string$Html$Types$withClasses = F2(
	function (classes, attrs) {
		if (!classes.b) {
			return attrs;
		} else {
			return A2(
				$elm$core$List$cons,
				A2(
					$zwilias$elm_html_string$Html$Types$buildProp,
					'class',
					A2($zwilias$elm_html_string$Html$Types$join, ' ', classes)),
				attrs);
		}
	});
var $zwilias$elm_html_string$Html$Types$withStyles = F2(
	function (styles, attrs) {
		if (!styles.b) {
			return attrs;
		} else {
			return A2(
				$elm$core$List$cons,
				A2(
					$zwilias$elm_html_string$Html$Types$buildProp,
					'style',
					A2($zwilias$elm_html_string$Html$Types$join, '; ', styles)),
				attrs);
		}
	});
var $zwilias$elm_html_string$Html$Types$attributesToString = function (attrs) {
	var _v0 = A3(
		$elm$core$List$foldl,
		$zwilias$elm_html_string$Html$Types$addAttribute,
		_Utils_Tuple3(_List_Nil, _List_Nil, _List_Nil),
		attrs);
	var classes = _v0.a;
	var styles = _v0.b;
	var regular = _v0.c;
	return A2(
		$zwilias$elm_html_string$Html$Types$withStyles,
		styles,
		A2($zwilias$elm_html_string$Html$Types$withClasses, classes, regular));
};
var $zwilias$elm_html_string$Html$Types$tag = F2(
	function (tagName, attributes) {
		return '<' + (A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$cons,
				tagName,
				$zwilias$elm_html_string$Html$Types$attributesToString(attributes))) + '>');
	});
var $zwilias$elm_html_string$Html$Types$toStringHelper = F3(
	function (indenter, tags, acc) {
		toStringHelper:
		while (true) {
			if (!tags.b) {
				var _v1 = acc.t;
				if (!_v1.b) {
					return acc;
				} else {
					var _v2 = _v1.a;
					var tagName = _v2.a;
					var cont = _v2.b;
					var rest = _v1.b;
					var $temp$indenter = indenter,
						$temp$tags = cont,
						$temp$acc = _Utils_update(
						acc,
						{
							f: acc.f - 1,
							h: A2(
								$elm$core$List$cons,
								A2(
									indenter,
									acc.f - 1,
									$zwilias$elm_html_string$Html$Types$closingTag(tagName)),
								acc.h),
							t: rest
						});
					indenter = $temp$indenter;
					tags = $temp$tags;
					acc = $temp$acc;
					continue toStringHelper;
				}
			} else {
				if (!tags.a.$) {
					var _v3 = tags.a;
					var tagName = _v3.a;
					var attributes = _v3.b;
					var children = _v3.c;
					var rest = tags.b;
					switch (children.$) {
						case 0:
							var $temp$indenter = indenter,
								$temp$tags = rest,
								$temp$acc = _Utils_update(
								acc,
								{
									h: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.f,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.h)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
						case 1:
							var childNodes = children.a;
							var $temp$indenter = indenter,
								$temp$tags = childNodes,
								$temp$acc = _Utils_update(
								acc,
								{
									f: acc.f + 1,
									h: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.f,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.h),
									t: A2(
										$elm$core$List$cons,
										_Utils_Tuple2(tagName, rest),
										acc.t)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
						default:
							var childNodes = children.a;
							var $temp$indenter = indenter,
								$temp$tags = A2($elm$core$List$map, $elm$core$Tuple$second, childNodes),
								$temp$acc = _Utils_update(
								acc,
								{
									f: acc.f + 1,
									h: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.f,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.h),
									t: A2(
										$elm$core$List$cons,
										_Utils_Tuple2(tagName, rest),
										acc.t)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
					}
				} else {
					var string = tags.a.a;
					var rest = tags.b;
					var $temp$indenter = indenter,
						$temp$tags = rest,
						$temp$acc = _Utils_update(
						acc,
						{
							h: A2(
								$elm$core$List$cons,
								A2(
									indenter,
									acc.f,
									$zwilias$elm_html_string$Html$Types$escapeHtmlText(string)),
								acc.h)
						});
					indenter = $temp$indenter;
					tags = $temp$tags;
					acc = $temp$acc;
					continue toStringHelper;
				}
			}
		}
	});
var $zwilias$elm_html_string$Html$Types$toString = F2(
	function (depth, html) {
		var joinString = function () {
			if (!depth) {
				return '';
			} else {
				return '\n';
			}
		}();
		var initialAcc = {f: 0, h: _List_Nil, t: _List_Nil};
		var indenter = function () {
			if (!depth) {
				return $elm$core$Basics$always($elm$core$Basics$identity);
			} else {
				return $zwilias$elm_html_string$Html$Types$indent(depth);
			}
		}();
		return A2(
			$zwilias$elm_html_string$Html$Types$join,
			joinString,
			A3(
				$zwilias$elm_html_string$Html$Types$toStringHelper,
				indenter,
				_List_fromArray(
					[html]),
				initialAcc).h);
	});
var $zwilias$elm_html_string$Html$String$toString = function (indent) {
	return $zwilias$elm_html_string$Html$Types$toString(indent);
};
var $zwilias$elm_html_string$Html$Types$Node = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $zwilias$elm_html_string$Html$Types$Regular = function (a) {
	return {$: 1, a: a};
};
var $zwilias$elm_html_string$Html$String$node = F3(
	function (tag, attributes, children) {
		return A3(
			$zwilias$elm_html_string$Html$Types$Node,
			tag,
			attributes,
			$zwilias$elm_html_string$Html$Types$Regular(children));
	});
var $zwilias$elm_html_string$Html$String$a = $zwilias$elm_html_string$Html$String$node('a');
var $zwilias$elm_html_string$Html$Types$StringProperty = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$stringProperty = $zwilias$elm_html_string$Html$Types$StringProperty;
var $zwilias$elm_html_string$Html$String$Attributes$class = function (className) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'className', className);
};
var $zwilias$elm_html_string$Html$String$code = $zwilias$elm_html_string$Html$String$node('code');
var $zwilias$elm_html_string$Html$String$div = $zwilias$elm_html_string$Html$String$node('div');
var $author$project$Markup$Rendered = F2(
	function (lines, source) {
		return {w: lines, au: source};
	});
var $author$project$Util$indexedFoldr = F3(
	function (op, acc, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, _v0) {
					var idx = _v0.a;
					var a = _v0.b;
					return _Utils_Tuple2(
						idx - 1,
						A3(op, idx, x, a));
				}),
			_Utils_Tuple2(
				$elm$core$List$length(xs) - 1,
				acc),
			xs).b;
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $author$project$Util$intercalate = function (sep) {
	return A2(
		$elm$core$Basics$composeR,
		$elm$core$List$intersperse(
			_List_fromArray(
				[sep])),
		$elm$core$List$concat);
};
var $zwilias$elm_html_string$Html$Types$NoChildren = {$: 0};
var $zwilias$elm_html_string$Html$String$nodeWithoutChildren = F3(
	function (tag, attrs, _v0) {
		return A3($zwilias$elm_html_string$Html$Types$Node, tag, attrs, $zwilias$elm_html_string$Html$Types$NoChildren);
	});
var $zwilias$elm_html_string$Html$String$br = $zwilias$elm_html_string$Html$String$nodeWithoutChildren('br');
var $author$project$Markup$linebreak = A2($zwilias$elm_html_string$Html$String$br, _List_Nil, _List_Nil);
var $elm$core$Tuple$mapSecond = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			x,
			func(y));
	});
var $author$project$Coverage$complexity = function (annotation) {
	switch (annotation.$) {
		case 0:
			var c = annotation.b;
			return $elm$core$Maybe$Just(c);
		case 1:
			var c = annotation.a;
			return $elm$core$Maybe$Just(c);
		case 2:
			var c = annotation.a;
			return $elm$core$Maybe$Just(c);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $zwilias$elm_html_string$Html$String$Attributes$href = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'href', val);
};
var $zwilias$elm_html_string$Html$String$Attributes$id = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'id', val);
};
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $elm$core$String$fromFloat = _String_fromNumber;
var $zwilias$elm_html_string$Html$String$span = $zwilias$elm_html_string$Html$String$node('span');
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $zwilias$elm_html_string$Html$Types$Style = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$style = $zwilias$elm_html_string$Html$Types$Style;
var $zwilias$elm_html_string$Html$Types$TextNode = function (a) {
	return {$: 1, a: a};
};
var $zwilias$elm_html_string$Html$String$text = $zwilias$elm_html_string$Html$Types$TextNode;
var $zwilias$elm_html_string$Html$String$Attributes$title = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'title', val);
};
var $author$project$Markup$indicator = function (complexity) {
	var intensity = $elm$core$Basics$sqrt(
		A3($elm$core$Basics$clamp, 0, 50, complexity) / 50);
	return A2(
		$zwilias$elm_html_string$Html$String$span,
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$Attributes$class('indicator'),
				A2(
				$zwilias$elm_html_string$Html$String$Attributes$style,
				'opacity',
				$elm$core$String$fromFloat(intensity)),
				$zwilias$elm_html_string$Html$String$Attributes$title(
				'Cyclomatic complexity: ' + $elm$core$String$fromInt(complexity))
			]),
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text(' ')
			]));
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Util$rFilterMap = function (toMaybe) {
	return A2(
		$elm$core$List$foldl,
		F2(
			function (x, acc) {
				var _v0 = toMaybe(x);
				if (!_v0.$) {
					var ok = _v0.a;
					return A2($elm$core$List$cons, ok, acc);
				} else {
					return acc;
				}
			}),
		_List_Nil);
};
var $author$project$Markup$showLine = F3(
	function (coverageId, lineNr, info) {
		var lineId = coverageId + ('_' + $elm$core$String$fromInt(lineNr));
		return A2(
			$zwilias$elm_html_string$Html$String$a,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$href('#' + lineId),
					$zwilias$elm_html_string$Html$String$Attributes$id(lineId),
					$zwilias$elm_html_string$Html$String$Attributes$class('line')
				]),
			_List_fromArray(
				[
					A2(
					$zwilias$elm_html_string$Html$String$div,
					_List_Nil,
					_Utils_ap(
						A2(
							$author$project$Util$rFilterMap,
							A2(
								$elm$core$Basics$composeR,
								function ($) {
									return $.W;
								},
								A2(
									$elm$core$Basics$composeR,
									$author$project$Coverage$complexity,
									$elm$core$Maybe$map($author$project$Markup$indicator))),
							info),
						_List_fromArray(
							[
								$zwilias$elm_html_string$Html$String$text(
								$elm$core$String$fromInt(lineNr))
							])))
				]));
	});
var $author$project$Markup$foldRendered = F2(
	function (coverageId, xs) {
		return function (_v2) {
			var a = _v2.a;
			var b = _v2.b;
			return A2($author$project$Markup$Rendered, a, b);
		}(
			A2(
				$elm$core$Tuple$mapSecond,
				$author$project$Util$intercalate($author$project$Markup$linebreak),
				A3(
					$author$project$Util$indexedFoldr,
					F3(
						function (idx, _v0, _v1) {
							var info = _v0.a;
							var content = _v0.b;
							var lines = _v1.a;
							var sources = _v1.b;
							return _Utils_Tuple2(
								A2(
									$elm$core$List$cons,
									A3($author$project$Markup$showLine, coverageId, idx + 1, info),
									lines),
								A2($elm$core$List$cons, content, sources));
						}),
					_Utils_Tuple2(_List_Nil, _List_Nil),
					xs)));
	});
var $zwilias$elm_html_string$Html$String$h2 = $zwilias$elm_html_string$Html$String$node('h2');
var $author$project$Coverage$annotationType = function (annotation) {
	switch (annotation.$) {
		case 0:
			return $author$project$Coverage$declaration;
		case 1:
			return $author$project$Coverage$letDeclaration;
		case 2:
			return $author$project$Coverage$lambdaBody;
		case 3:
			return $author$project$Coverage$caseBranch;
		default:
			return $author$project$Coverage$ifElseBranch;
	}
};
var $author$project$Util$mapBoth = F3(
	function (f, _v0, _v1) {
		var a = _v0.a;
		var b = _v0.b;
		var x = _v1.a;
		var y = _v1.b;
		return _Utils_Tuple2(
			A2(f, a, x),
			A2(f, b, y));
	});
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Overview$addCount = F2(
	function (_v0, acc) {
		var annotation = _v0.b;
		var count = _v0.c;
		return A3(
			$elm$core$Dict$update,
			$author$project$Coverage$annotationType(annotation),
			A2(
				$elm$core$Basics$composeR,
				$elm$core$Maybe$withDefault(
					_Utils_Tuple2(0, 0)),
				A2(
					$elm$core$Basics$composeR,
					A2(
						$author$project$Util$mapBoth,
						$elm$core$Basics$add,
						_Utils_Tuple2(
							A2($elm$core$Basics$min, count, 1),
							1)),
					$elm$core$Maybe$Just)),
			acc);
	});
var $author$project$Overview$computeCounts = function (emptyCountDict) {
	return A2($elm$core$List$foldl, $author$project$Overview$addCount, emptyCountDict);
};
var $author$project$Markup$emptyCountDict = A3(
	$elm$core$List$foldl,
	function (k) {
		return A2(
			$elm$core$Dict$insert,
			k,
			_Utils_Tuple2(0, 0));
	},
	$elm$core$Dict$empty,
	_List_fromArray(
		[$author$project$Coverage$letDeclaration, $author$project$Coverage$lambdaBody, $author$project$Coverage$caseBranch, $author$project$Coverage$ifElseBranch]));
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $zwilias$elm_html_string$Html$String$Attributes$max = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'max', val);
};
var $zwilias$elm_html_string$Html$String$progress = $zwilias$elm_html_string$Html$String$node('progress');
var $zwilias$elm_html_string$Html$String$td = $zwilias$elm_html_string$Html$String$node('td');
var $zwilias$elm_html_string$Html$String$Attributes$value = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'value', val);
};
var $author$project$Overview$showCount = function (_v0) {
	var used = _v0.a;
	var total = _v0.b;
	return (!total) ? A2(
		$zwilias$elm_html_string$Html$String$td,
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$Attributes$class('none')
			]),
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text('n/a')
			])) : A2(
		$zwilias$elm_html_string$Html$String$td,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$zwilias$elm_html_string$Html$String$div,
				_List_fromArray(
					[
						$zwilias$elm_html_string$Html$String$Attributes$class('wrapper')
					]),
				_List_fromArray(
					[
						A2(
						$zwilias$elm_html_string$Html$String$div,
						_List_fromArray(
							[
								$zwilias$elm_html_string$Html$String$Attributes$class('info')
							]),
						_List_fromArray(
							[
								$zwilias$elm_html_string$Html$String$text(
								$elm$core$String$fromInt(used) + ('/' + $elm$core$String$fromInt(total)))
							])),
						A2(
						$zwilias$elm_html_string$Html$String$progress,
						_List_fromArray(
							[
								$zwilias$elm_html_string$Html$String$Attributes$max(
								$elm$core$String$fromInt(total)),
								$zwilias$elm_html_string$Html$String$Attributes$value(
								$elm$core$String$fromInt(used))
							]),
						_List_Nil)
					]))
			]));
};
var $zwilias$elm_html_string$Html$String$th = $zwilias$elm_html_string$Html$String$node('th');
var $zwilias$elm_html_string$Html$String$tr = $zwilias$elm_html_string$Html$String$node('tr');
var $elm$core$Dict$values = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2($elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var $author$project$Overview$row = F2(
	function (name, counts) {
		return A2(
			$zwilias$elm_html_string$Html$String$tr,
			_List_Nil,
			A2(
				$elm$core$List$cons,
				A2(
					$zwilias$elm_html_string$Html$String$th,
					_List_Nil,
					_List_fromArray(
						[name])),
				A2(
					$elm$core$List$map,
					$author$project$Overview$showCount,
					$elm$core$Dict$values(counts))));
	});
var $author$project$Markup$foldDeclarations = F3(
	function (moduleId, declaration, _v0) {
		var rows = _v0.a;
		var totals = _v0.b;
		var totalComplexity = _v0.c;
		var declarationId = '#' + (moduleId + ('_' + $elm$core$String$fromInt(declaration.T)));
		var formattedName = A2(
			$zwilias$elm_html_string$Html$String$a,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$href(declarationId)
				]),
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$text(
					'(' + ($elm$core$String$fromInt(declaration.E) + ')\u00A0')),
					A2(
					$zwilias$elm_html_string$Html$String$code,
					_List_Nil,
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$text(declaration.O)
						]))
				]));
		var counts = A2($author$project$Overview$computeCounts, $author$project$Markup$emptyCountDict, declaration.K);
		var adjustTotals = F2(
			function (coverageType, innerCounts) {
				return A2(
					$elm$core$Dict$update,
					coverageType,
					A2(
						$elm$core$Basics$composeR,
						$elm$core$Maybe$map(
							A2($author$project$Util$mapBoth, $elm$core$Basics$add, innerCounts)),
						A2(
							$elm$core$Basics$composeR,
							$elm$core$Maybe$withDefault(innerCounts),
							$elm$core$Maybe$Just)));
			});
		var adjustedTotals = A3($elm$core$Dict$foldl, adjustTotals, totals, counts);
		return _Utils_Tuple3(
			A2(
				$elm$core$List$cons,
				A2($author$project$Overview$row, formattedName, counts),
				rows),
			adjustedTotals,
			A2($elm$core$List$cons, declaration.E, totalComplexity));
	});
var $author$project$Coverage$fromAnnotation = F2(
	function (settings, annotation) {
		switch (annotation) {
			case 'declaration':
				return settings.aK;
			case 'letDeclaration':
				return settings.aY;
			case 'lambdaBody':
				return settings.aX;
			case 'caseBranch':
				return settings.aH;
			case 'ifElseBranch':
				return settings.aU;
			default:
				return settings.aL;
		}
	});
var $author$project$Overview$shortHumanCoverageType = $author$project$Coverage$fromAnnotation(
	{
		aH: _List_fromArray(
			[
				A2(
				$zwilias$elm_html_string$Html$String$code,
				_List_Nil,
				_List_fromArray(
					[
						$zwilias$elm_html_string$Html$String$text('case')
					])),
				$zwilias$elm_html_string$Html$String$text(' branches')
			]),
		aK: _List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text('Declarations')
			]),
		aL: _List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text('unknown')
			]),
		aU: _List_fromArray(
			[
				A2(
				$zwilias$elm_html_string$Html$String$code,
				_List_Nil,
				_List_fromArray(
					[
						$zwilias$elm_html_string$Html$String$text('if/else')
					])),
				$zwilias$elm_html_string$Html$String$text(' branches')
			]),
		aX: _List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text('Lambdas')
			]),
		aY: _List_fromArray(
			[
				A2(
				$zwilias$elm_html_string$Html$String$code,
				_List_Nil,
				_List_fromArray(
					[
						$zwilias$elm_html_string$Html$String$text('let')
					])),
				$zwilias$elm_html_string$Html$String$text(' declarations')
			])
	});
var $author$project$Overview$heading = function (map) {
	var makeHead = A2(
		$elm$core$Basics$composeR,
		$author$project$Overview$shortHumanCoverageType,
		$zwilias$elm_html_string$Html$String$th(_List_Nil));
	return A2(
		$zwilias$elm_html_string$Html$String$tr,
		_List_Nil,
		A2(
			$elm$core$List$cons,
			A2($zwilias$elm_html_string$Html$String$th, _List_Nil, _List_Nil),
			A2(
				$elm$core$List$map,
				makeHead,
				$elm$core$Dict$keys(map))));
};
var $elm$core$List$sortBy = _List_sortBy;
var $zwilias$elm_html_string$Html$String$table = $zwilias$elm_html_string$Html$String$node('table');
var $zwilias$elm_html_string$Html$String$tbody = $zwilias$elm_html_string$Html$String$node('tbody');
var $zwilias$elm_html_string$Html$String$tfoot = $zwilias$elm_html_string$Html$String$node('tfoot');
var $zwilias$elm_html_string$Html$String$thead = $zwilias$elm_html_string$Html$String$node('thead');
var $author$project$Coverage$line = $elm$core$Tuple$first;
var $author$project$Markup$topLevelDeclarationInfo = F3(
	function (acc, children, annotations) {
		topLevelDeclarationInfo:
		while (true) {
			if (!annotations.b) {
				return $elm$core$List$reverse(acc);
			} else {
				if (!annotations.a.b.$) {
					var _v1 = annotations.a;
					var from = _v1.a.aQ;
					var _v2 = _v1.b;
					var name = _v2.a;
					var complexity = _v2.b;
					var rest = annotations.b;
					var decl = {
						K: children,
						E: complexity,
						O: name,
						T: $author$project$Coverage$line(from)
					};
					var $temp$acc = A2($elm$core$List$cons, decl, acc),
						$temp$children = _List_Nil,
						$temp$annotations = rest;
					acc = $temp$acc;
					children = $temp$children;
					annotations = $temp$annotations;
					continue topLevelDeclarationInfo;
				} else {
					var c = annotations.a;
					var rest = annotations.b;
					var $temp$acc = acc,
						$temp$children = A2($elm$core$List$cons, c, children),
						$temp$annotations = rest;
					acc = $temp$acc;
					children = $temp$children;
					annotations = $temp$annotations;
					continue topLevelDeclarationInfo;
				}
			}
		}
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$core$List$sum = function (numbers) {
	return A3($elm$core$List$foldl, $elm$core$Basics$add, 0, numbers);
};
var $author$project$Coverage$totalComplexity = function (annotations) {
	var allComplexities = A2(
		$elm$core$List$filterMap,
		function (_v0) {
			var annotation = _v0.b;
			if (!annotation.$) {
				var c = annotation.b;
				return $elm$core$Maybe$Just(c);
			} else {
				return $elm$core$Maybe$Nothing;
			}
		},
		annotations);
	return ($elm$core$List$sum(allComplexities) - $elm$core$List$length(allComplexities)) + 1;
};
var $author$project$Markup$listDeclarations = F2(
	function (moduleId, annotations) {
		var _v0 = A3(
			$elm$core$List$foldl,
			$author$project$Markup$foldDeclarations(moduleId),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil),
			A2(
				$elm$core$List$sortBy,
				function ($) {
					return $.E;
				},
				A3($author$project$Markup$topLevelDeclarationInfo, _List_Nil, _List_Nil, annotations)));
		var rows = _v0.a;
		var totals = _v0.b;
		var complexities = _v0.c;
		return A2(
			$zwilias$elm_html_string$Html$String$table,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$class('overview')
				]),
			_List_fromArray(
				[
					A2(
					$zwilias$elm_html_string$Html$String$thead,
					_List_Nil,
					_List_fromArray(
						[
							$author$project$Overview$heading(totals)
						])),
					A2($zwilias$elm_html_string$Html$String$tbody, _List_Nil, rows),
					A2(
					$zwilias$elm_html_string$Html$String$tfoot,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$author$project$Overview$row,
							$zwilias$elm_html_string$Html$String$text(
								'(' + ($elm$core$String$fromInt(
									$author$project$Coverage$totalComplexity(annotations)) + ') total')),
							totals)
						]))
				]));
	});
var $elm$core$String$toLower = _String_toLower;
var $author$project$Markup$moduleToId = A2(
	$elm$core$Basics$composeR,
	$elm$core$String$toLower,
	A2(
		$elm$core$Basics$composeR,
		$elm$core$String$split('.'),
		$elm$core$String$join('-')));
var $zwilias$elm_html_string$Html$String$p = $zwilias$elm_html_string$Html$String$node('p');
var $author$project$Markup$Line = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Markup$addToLine = F2(
	function (x, _v0) {
		var info = _v0.a;
		var xs = _v0.b;
		return A2(
			$author$project$Markup$Line,
			info,
			A2($elm$core$List$cons, x, xs));
	});
var $author$project$Markup$add = F2(
	function (content, acc) {
		return _Utils_update(
			acc,
			{
				n: A2($author$project$Markup$addToLine, content, acc.n)
			});
	});
var $author$project$Markup$newLine = function (acc) {
	return _Utils_update(
		acc,
		{
			n: A2($author$project$Markup$Line, acc.t, _List_Nil),
			w: A2($elm$core$List$cons, acc.n, acc.w)
		});
};
var $author$project$Markup$toClass = function (cnt) {
	return (!cnt) ? 'cover uncovered' : 'cover covered';
};
var $author$project$Markup$wrapper = F3(
	function (count, annotation, content) {
		var withComplexity = function (complexity) {
			return 'Evaluated ' + ($elm$core$String$fromInt(count) + (' times, complexity ' + ($elm$core$String$fromInt(complexity) + '.')));
		};
		var justCount = 'Evaluated ' + ($elm$core$String$fromInt(count) + 'times.');
		var title = A2(
			$elm$core$Maybe$withDefault,
			justCount,
			A2(
				$elm$core$Maybe$map,
				withComplexity,
				$author$project$Coverage$complexity(annotation)));
		return A2(
			$zwilias$elm_html_string$Html$String$span,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$class(
					$author$project$Markup$toClass(count)),
					$zwilias$elm_html_string$Html$String$Attributes$title(title)
				]),
			_List_fromArray(
				[content]));
	});
var $author$project$Markup$wrapTagger = F3(
	function (_v0, tagger, content) {
		var count = _v0.aJ;
		var annotation = _v0.W;
		return A3(
			$author$project$Markup$wrapper,
			count,
			annotation,
			tagger(content));
	});
var $author$project$Markup$tagWith = F3(
	function (markers, s, tagger) {
		tagWith:
		while (true) {
			if (!markers.b) {
				return tagger(
					$zwilias$elm_html_string$Html$String$text(s));
			} else {
				var marker = markers.a;
				var rest = markers.b;
				var $temp$markers = rest,
					$temp$s = s,
					$temp$tagger = A2($author$project$Markup$wrapTagger, marker, tagger);
				markers = $temp$markers;
				s = $temp$s;
				tagger = $temp$tagger;
				continue tagWith;
			}
		}
	});
var $author$project$Markup$tagAndAdd = F2(
	function (content, acc) {
		return A2(
			$author$project$Markup$add,
			A3($author$project$Markup$tagWith, acc.t, content, $elm$core$Basics$identity),
			acc);
	});
var $author$project$Markup$whitespace = function (indent) {
	return $zwilias$elm_html_string$Html$String$text(
		A2($elm$core$String$repeat, indent, ' '));
};
var $author$project$Markup$partsToHtml = F2(
	function (parts, acc) {
		partsToHtml:
		while (true) {
			if (!parts.b) {
				return acc;
			} else {
				switch (parts.a.$) {
					case 0:
						if (parts.a.a === '') {
							var rest = parts.b;
							var $temp$parts = rest,
								$temp$acc = acc;
							parts = $temp$parts;
							acc = $temp$acc;
							continue partsToHtml;
						} else {
							var s = parts.a.a;
							var rest = parts.b;
							return A2(
								$author$project$Markup$partsToHtml,
								rest,
								A2($author$project$Markup$tagAndAdd, s, acc));
						}
					case 1:
						var _v1 = parts.a;
						var rest = parts.b;
						return A2(
							$author$project$Markup$partsToHtml,
							rest,
							$author$project$Markup$newLine(acc));
					default:
						if ((!parts.a.a) && (parts.a.b === '')) {
							var _v2 = parts.a;
							var rest = parts.b;
							var $temp$parts = rest,
								$temp$acc = acc;
							parts = $temp$parts;
							acc = $temp$acc;
							continue partsToHtml;
						} else {
							var _v3 = parts.a;
							var indent = _v3.a;
							var content = _v3.b;
							var rest = parts.b;
							return A2(
								$author$project$Markup$partsToHtml,
								rest,
								A2(
									$author$project$Markup$add,
									$author$project$Markup$whitespace(indent),
									A2($author$project$Markup$tagAndAdd, content, acc)));
						}
				}
			}
		}
	});
var $author$project$Markup$popStack = function (acc) {
	var _v0 = acc.t;
	if (!_v0.b) {
		return acc;
	} else {
		var rest = _v0.b;
		return _Utils_update(
			acc,
			{t: rest});
	}
};
var $author$project$Markup$addMarkerToLine = F2(
	function (marker, _v0) {
		var info = _v0.a;
		var content = _v0.b;
		return A2(
			$author$project$Markup$Line,
			A2($elm$core$List$cons, marker, info),
			content);
	});
var $author$project$Markup$pushStack = F2(
	function (marker, acc) {
		return _Utils_update(
			acc,
			{
				n: A2($author$project$Markup$addMarkerToLine, marker, acc.n),
				t: A2($elm$core$List$cons, marker, acc.t)
			});
	});
var $author$project$Markup$contentToHtml = F2(
	function (content, acc) {
		if (!content.$) {
			var parts = content.a;
			return A2($author$project$Markup$partsToHtml, parts, acc);
		} else {
			var marker = content.a;
			var parts = content.b;
			return $author$project$Markup$popStack(
				A3(
					$elm$core$List$foldl,
					$author$project$Markup$contentToHtml,
					A2($author$project$Markup$pushStack, marker, acc),
					parts));
		}
	});
var $author$project$Markup$render = function (content) {
	var initialAcc = {
		n: A2($author$project$Markup$Line, _List_Nil, _List_Nil),
		w: _List_Nil,
		t: _List_Nil
	};
	var finalize = function (_v0) {
		var lineSoFar = _v0.n;
		var lines = _v0.w;
		return A2($elm$core$List$cons, lineSoFar, lines);
	};
	return finalize(
		A3($elm$core$List$foldl, $author$project$Markup$contentToHtml, initialAcc, content));
};
var $author$project$Source$Content = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $author$project$Source$consumeMarker = F2(
	function (marker, acc) {
		if (!marker.$) {
			var markerInfo = marker.a;
			return {
				K: _List_Nil,
				t: A2(
					$elm$core$List$cons,
					_Utils_Tuple2(markerInfo, acc.K),
					acc.t)
			};
		} else {
			var _v1 = acc.t;
			if (!_v1.b) {
				return acc;
			} else {
				var _v2 = _v1.a;
				var markerInfo = _v2.a;
				var x = _v2.b;
				var xs = _v1.b;
				var content = A2($author$project$Source$Content, markerInfo, acc.K);
				return {
					K: A2($elm$core$List$cons, content, x),
					t: xs
				};
			}
		}
	});
var $author$project$Source$consumeMarkers = F2(
	function (markers, acc) {
		return A3($elm$core$List$foldl, $author$project$Source$consumeMarker, acc, markers);
	});
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $author$project$Source$LineBreak = {$: 1};
var $author$project$Source$Part = function (a) {
	return {$: 0, a: a};
};
var $author$project$Source$Plain = function (a) {
	return {$: 0, a: a};
};
var $author$project$Source$Indented = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$Source$findIndent = function (string) {
	var toIndentedString = function (spaces) {
		return _Utils_eq(
			$elm$core$String$length(string),
			spaces) ? A2($author$project$Source$Indented, spaces, '') : ((!spaces) ? $author$project$Source$Part(string) : A2(
			$author$project$Source$Indented,
			spaces,
			A3(
				$elm$core$String$slice,
				spaces,
				$elm$core$String$length(string),
				string)));
	};
	var countIndentLength = F2(
		function (c, _v0) {
			var spaces = _v0.a;
			var _continue = _v0.b;
			return (_continue && (c === ' ')) ? _Utils_Tuple2(spaces + 1, true) : _Utils_Tuple2(spaces, false);
		});
	return toIndentedString(
		A3(
			$elm$core$String$foldl,
			countIndentLength,
			_Utils_Tuple2(0, true),
			string).a);
};
var $elm$core$String$lines = _String_lines;
var $author$project$Source$stringParts = function (string) {
	var _v0 = $elm$core$String$lines(string);
	if (!_v0.b) {
		return $author$project$Source$Plain(_List_Nil);
	} else {
		var head = _v0.a;
		var rest = _v0.b;
		return $author$project$Source$Plain(
			$elm$core$List$reverse(
				A2(
					$elm$core$List$intersperse,
					$author$project$Source$LineBreak,
					A2(
						$elm$core$List$cons,
						$author$project$Source$Part(head),
						A2($elm$core$List$map, $author$project$Source$findIndent, rest)))));
	}
};
var $author$project$Source$markupHelper = F4(
	function (original, offset, markers, acc) {
		var rest = function (input) {
			return $author$project$Source$stringParts(
				A3(
					$elm$core$String$slice,
					offset,
					$elm$core$String$length(input),
					input));
		};
		var readUntil = function (pos) {
			return A2(
				$elm$core$Basics$composeR,
				A2($elm$core$String$slice, offset, pos),
				$author$project$Source$stringParts);
		};
		if (!markers.b) {
			return _Utils_update(
				acc,
				{
					K: A2(
						$elm$core$List$cons,
						rest(original),
						acc.K)
				});
		} else {
			var _v1 = markers.a;
			var pos = _v1.a;
			var markerList = _v1.b;
			var otherMarkers = markers.b;
			return A4(
				$author$project$Source$markupHelper,
				original,
				pos,
				otherMarkers,
				A2(
					$author$project$Source$consumeMarkers,
					markerList,
					_Utils_update(
						acc,
						{
							K: A2(
								$elm$core$List$cons,
								A2(readUntil, pos, original),
								acc.K)
						})));
		}
	});
var $author$project$Source$Begin = function (a) {
	return {$: 0, a: a};
};
var $author$project$Source$End = {$: 1};
var $author$project$Source$MarkerInfo = F2(
	function (count, annotation) {
		return {W: annotation, aJ: count};
	});
var $author$project$Source$addToListDict = F2(
	function (a, m) {
		if (m.$ === 1) {
			return $elm$core$Maybe$Just(
				_List_fromArray(
					[a]));
		} else {
			var xs = m.a;
			return $elm$core$Maybe$Just(
				A2($elm$core$List$cons, a, xs));
		}
	});
var $elm$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		if (ma.$ === 1) {
			return $elm$core$Maybe$Nothing;
		} else {
			var a = ma.a;
			if (mb.$ === 1) {
				return $elm$core$Maybe$Nothing;
			} else {
				var b = mb.a;
				return $elm$core$Maybe$Just(
					A2(func, a, b));
			}
		}
	});
var $author$project$Coverage$column = $elm$core$Tuple$second;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $author$project$Coverage$positionToOffset = F2(
	function (pos, idx) {
		return A2(
			$elm$core$Maybe$map,
			function (offSet) {
				return (offSet + $author$project$Coverage$column(pos)) - 1;
			},
			A2(
				$elm$core$Array$get,
				$author$project$Coverage$line(pos) - 1,
				idx));
	});
var $author$project$Source$addRegion = F3(
	function (offsets, _v0, acc) {
		var location = _v0.a;
		var annotation = _v0.b;
		var count = _v0.c;
		return A2(
			$elm$core$Maybe$withDefault,
			acc,
			A3(
				$elm$core$Maybe$map2,
				F2(
					function (from, to) {
						return A3(
							$elm$core$Dict$update,
							to,
							$author$project$Source$addToListDict($author$project$Source$End),
							A3(
								$elm$core$Dict$update,
								from,
								$author$project$Source$addToListDict(
									$author$project$Source$Begin(
										A2($author$project$Source$MarkerInfo, count, annotation))),
								acc));
					}),
				A2($author$project$Coverage$positionToOffset, location.aQ, offsets),
				A2($author$project$Coverage$positionToOffset, location.ba, offsets)));
	});
var $elm$core$Elm$JsArray$push = _JsArray_push;
var $elm$core$Elm$JsArray$singleton = _JsArray_singleton;
var $elm$core$Elm$JsArray$unsafeSet = _JsArray_unsafeSet;
var $elm$core$Array$insertTailInTree = F4(
	function (shift, index, tail, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		if (_Utils_cmp(
			pos,
			$elm$core$Elm$JsArray$length(tree)) > -1) {
			if (shift === 5) {
				return A2(
					$elm$core$Elm$JsArray$push,
					$elm$core$Array$Leaf(tail),
					tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, $elm$core$Elm$JsArray$empty));
				return A2($elm$core$Elm$JsArray$push, newSub, tree);
			}
		} else {
			var value = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!value.$) {
				var subTree = value.a;
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, subTree));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4(
						$elm$core$Array$insertTailInTree,
						shift - $elm$core$Array$shiftStep,
						index,
						tail,
						$elm$core$Elm$JsArray$singleton(value)));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			}
		}
	});
var $elm$core$Array$unsafeReplaceTail = F2(
	function (newTail, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		var originalTailLen = $elm$core$Elm$JsArray$length(tail);
		var newTailLen = $elm$core$Elm$JsArray$length(newTail);
		var newArrayLen = len + (newTailLen - originalTailLen);
		if (_Utils_eq(newTailLen, $elm$core$Array$branchFactor)) {
			var overflow = _Utils_cmp(newArrayLen >>> $elm$core$Array$shiftStep, 1 << startShift) > 0;
			if (overflow) {
				var newShift = startShift + $elm$core$Array$shiftStep;
				var newTree = A4(
					$elm$core$Array$insertTailInTree,
					newShift,
					len,
					newTail,
					$elm$core$Elm$JsArray$singleton(
						$elm$core$Array$SubTree(tree)));
				return A4($elm$core$Array$Array_elm_builtin, newArrayLen, newShift, newTree, $elm$core$Elm$JsArray$empty);
			} else {
				return A4(
					$elm$core$Array$Array_elm_builtin,
					newArrayLen,
					startShift,
					A4($elm$core$Array$insertTailInTree, startShift, len, newTail, tree),
					$elm$core$Elm$JsArray$empty);
			}
		} else {
			return A4($elm$core$Array$Array_elm_builtin, newArrayLen, startShift, tree, newTail);
		}
	});
var $elm$core$Array$push = F2(
	function (a, array) {
		var tail = array.d;
		return A2(
			$elm$core$Array$unsafeReplaceTail,
			A2($elm$core$Elm$JsArray$push, a, tail),
			array);
	});
var $author$project$Coverage$index = function (input) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (singleLine, _v0) {
				var acc = _v0.a;
				var sum = _v0.b;
				return _Utils_Tuple2(
					A2($elm$core$Array$push, sum, acc),
					(sum + $elm$core$String$length(singleLine)) + 1);
			}),
		_Utils_Tuple2($elm$core$Array$empty, 0),
		$elm$core$String$lines(input)).a;
};
var $author$project$Source$toMarkerDict = F2(
	function (regions, source) {
		var offsets = $author$project$Coverage$index(source);
		return $elm$core$Dict$toList(
			A3(
				$elm$core$List$foldl,
				$author$project$Source$addRegion(offsets),
				$elm$core$Dict$empty,
				regions));
	});
var $author$project$Source$render = F2(
	function (source, regions) {
		return A4(
			$author$project$Source$markupHelper,
			source,
			0,
			A2($author$project$Source$toMarkerDict, regions, source),
			{K: _List_Nil, t: _List_Nil}).K;
	});
var $author$project$Markup$file = F3(
	function (moduleName, coverageInfo, source) {
		var rendered = A2(
			$author$project$Markup$foldRendered,
			$author$project$Markup$moduleToId(moduleName),
			$author$project$Markup$render(
				A2($author$project$Source$render, source, coverageInfo)));
		return A2(
			$zwilias$elm_html_string$Html$String$div,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$class('file')
				]),
			_List_fromArray(
				[
					A2(
					$zwilias$elm_html_string$Html$String$h2,
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$Attributes$id(
							$author$project$Markup$moduleToId(moduleName))
						]),
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$text('Module: '),
							A2(
							$zwilias$elm_html_string$Html$String$code,
							_List_Nil,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$text(moduleName)
								])),
							A2(
							$zwilias$elm_html_string$Html$String$a,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$class('toTop'),
									$zwilias$elm_html_string$Html$String$Attributes$href('#top')
								]),
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$text('▲')
								]))
						])),
					A2(
					$author$project$Markup$listDeclarations,
					$author$project$Markup$moduleToId(moduleName),
					coverageInfo),
					A2(
					$zwilias$elm_html_string$Html$String$p,
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$Attributes$class('legend')
						]),
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$text('Declarations sorted by cyclomatic complexity')
						])),
					A2(
					$zwilias$elm_html_string$Html$String$div,
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$Attributes$class('coverage')
						]),
					_List_fromArray(
						[
							A2(
							$zwilias$elm_html_string$Html$String$div,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$class('lines')
								]),
							rendered.w),
							A2(
							$zwilias$elm_html_string$Html$String$div,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$class('source')
								]),
							rendered.au)
						]))
				]));
	});
var $author$project$Analyzer$adjustTotals = F2(
	function (coverageType, counts) {
		return A2(
			$elm$core$Dict$update,
			coverageType,
			A2(
				$elm$core$Basics$composeR,
				$elm$core$Maybe$map(
					A2($author$project$Util$mapBoth, $elm$core$Basics$add, counts)),
				A2(
					$elm$core$Basics$composeR,
					$elm$core$Maybe$withDefault(counts),
					$elm$core$Maybe$Just)));
	});
var $author$project$Analyzer$emptyCountDict = A3(
	$elm$core$List$foldl,
	function (k) {
		return A2(
			$elm$core$Dict$insert,
			k,
			_Utils_Tuple2(0, 0));
	},
	$elm$core$Dict$empty,
	_List_fromArray(
		[$author$project$Coverage$declaration, $author$project$Coverage$letDeclaration, $author$project$Coverage$lambdaBody, $author$project$Coverage$caseBranch, $author$project$Coverage$ifElseBranch]));
var $author$project$Analyzer$moduleToId = A2(
	$elm$core$Basics$composeR,
	$elm$core$String$toLower,
	A2(
		$elm$core$Basics$composeR,
		$elm$core$String$split('.'),
		$elm$core$String$join('-')));
var $author$project$Analyzer$foldFile = F2(
	function (_v0, _v1) {
		var moduleName = _v0.a;
		var coverageInfo = _v0.b;
		var rows = _v1.a;
		var totals = _v1.b;
		var name = A2(
			$zwilias$elm_html_string$Html$String$a,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$href(
					'#' + $author$project$Analyzer$moduleToId(moduleName))
				]),
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$text(
					'(' + ($elm$core$String$fromInt(
						$author$project$Coverage$totalComplexity(coverageInfo)) + ')\u00A0')),
					A2(
					$zwilias$elm_html_string$Html$String$code,
					_List_Nil,
					_List_fromArray(
						[
							$zwilias$elm_html_string$Html$String$text(moduleName)
						]))
				]));
		var counts = A2($author$project$Overview$computeCounts, $author$project$Analyzer$emptyCountDict, coverageInfo);
		return _Utils_Tuple2(
			A2(
				$elm$core$List$cons,
				A2($author$project$Overview$row, name, counts),
				rows),
			A3($elm$core$Dict$foldl, $author$project$Analyzer$adjustTotals, totals, counts));
	});
var $author$project$Analyzer$overview = function (moduleMap) {
	var _v0 = A3(
		$elm$core$List$foldr,
		$author$project$Analyzer$foldFile,
		_Utils_Tuple2(_List_Nil, $elm$core$Dict$empty),
		$elm$core$Dict$toList(moduleMap));
	var rows = _v0.a;
	var totals = _v0.b;
	return A2(
		$zwilias$elm_html_string$Html$String$table,
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$Attributes$class('overview')
			]),
		_List_fromArray(
			[
				A2(
				$zwilias$elm_html_string$Html$String$thead,
				_List_Nil,
				_List_fromArray(
					[
						$author$project$Overview$heading(totals)
					])),
				A2($zwilias$elm_html_string$Html$String$tbody, _List_Nil, rows),
				A2(
				$zwilias$elm_html_string$Html$String$tfoot,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$author$project$Overview$row,
						$zwilias$elm_html_string$Html$String$text('total'),
						totals)
					]))
			]));
};
var $zwilias$elm_html_string$Html$Types$Attribute = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$attribute = $zwilias$elm_html_string$Html$Types$Attribute;
var $zwilias$elm_html_string$Html$String$footer = $zwilias$elm_html_string$Html$String$node('footer');
var $zwilias$elm_html_string$Html$String$h1 = $zwilias$elm_html_string$Html$String$node('h1');
var $author$project$Html$String$Extra$head = $zwilias$elm_html_string$Html$String$node('head');
var $zwilias$elm_html_string$Html$String$header = $zwilias$elm_html_string$Html$String$node('header');
var $author$project$Html$String$Extra$html = $zwilias$elm_html_string$Html$String$node('html');
var $zwilias$elm_html_string$Html$String$section = $zwilias$elm_html_string$Html$String$node('section');
var $author$project$Html$String$Extra$style = $zwilias$elm_html_string$Html$String$node('style');
var $author$project$Styles$page = F4(
	function (title, styles, version, content) {
		return A2(
			$author$project$Html$String$Extra$html,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$author$project$Html$String$Extra$head,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$author$project$Html$String$Extra$style,
							_List_Nil,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$text(styles)
								])),
							A3(
							$zwilias$elm_html_string$Html$String$node,
							'meta',
							_List_fromArray(
								[
									A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'charset', 'UTF-8')
								]),
							_List_Nil)
						])),
					A3(
					$zwilias$elm_html_string$Html$String$node,
					'body',
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$zwilias$elm_html_string$Html$String$header,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$h1,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$Attributes$id('top')
										]),
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(title)
										]))
								])),
							A2($zwilias$elm_html_string$Html$String$section, _List_Nil, content),
							A2(
							$zwilias$elm_html_string$Html$String$footer,
							_List_Nil,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$text('Generated with '),
									A2(
									$zwilias$elm_html_string$Html$String$a,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$Attributes$href('https://github.com/zwilias/elm-coverage')
										]),
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text('elm-coverage')
										])),
									$zwilias$elm_html_string$Html$String$text('@' + version)
								]))
						]))
				]));
	});
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $author$project$Styles$file = '\n.toTop {\n    float: right;\n    text-decoration: none;\n}\n\n.coverage {\n    font-family: "Fira Code", monospace;\n    font-size: 0.8em;\n    white-space: pre;\n    line-height: 1.2rem;\n    background-color: #fdfdfd;\n    padding: 1em 0.4em;\n    border: 1px solid #D0D0D0;\n    border-radius: 0.5em;\n    display: flex;\n    flex-direction: row;\n    padding-left: 0;\n}\n\n.source .covered {\n    background-color: #aef5ae;\n    color: #202020;\n    box-shadow: 0 0 0 2px #aef5ae;\n    border-bottom: 1px solid #aef5ae;\n}\n\n.source .uncovered {\n    background-color: rgb(255, 30, 30);\n    color: white;\n    box-shadow: 0 0 0 2px rgb(255, 30, 30);\n    border-bottom-width: 1px;\n    border-bottom-style: dashed;\n}\n\n.source .covered > .covered {\n    box-shadow: none;\n    background-color: initial;\n    border-bottom: none;\n}\n\n.source .uncovered > .uncovered {\n    box-shadow: none;\n    border-bottom: none;\n    background-color: initial;\n}\n\n.source .uncovered .covered {\n    background-color: transparent;\n    color: inherit;\n    box-shadow: none;\n}\n\n.lines {\n    text-align: right;\n    margin-right: 10px;\n    border-right: 1px solid #d0d0d0;\n    padding-right: 10px;\n    margin-top: -1em;\n    padding-top: 1em;\n    padding-bottom: 1em;\n    margin-bottom: -1em;\n}\n\n.lines .line {\n    display: block;\n    color: #c0c0c0;\n    text-decoration: none;\n    transition: all 0.3s ease;\n    font-size: 0.9em;\n    line-height: 1.2rem;\n}\n\n.lines .line:hover {\n    color: #303030;\n}\n\n.source {\n    flex: 1;\n    overflow: scroll;\n}\n\n.legend {\n    text-align: center;\n    font-size: 0.9em;\n    margin-bottom: 2em;\n}\n\n.indicator {\n    display: inline-block;\n    float: left;\n    background-color: rgb(255, 30, 30);\n}\n';
var $author$project$Styles$general = '\n@import url(https://fonts.googleapis.com/css?family=Fira+Sans);\n\n@font-face {\n    font-family: \'Fira Code\';\n    src: local(\'Fira Code\'), local(\'FiraCode\'), url(https://cdn.rawgit.com/tonsky/FiraCode/master/distr/ttf/FiraCode-Regular.ttf);\n}\n\ncode {\n    font-family: "Fira Code", monospace;\n    font-size: 0.9em;\n}\n\nbody {\n    margin: 0 30px;\n    color: #333333;\n    font-family: "Fira Sans", sans-serif;\n    background-color: #fdfdfd;\n    font-size: 16px;\n}\n\nfooter {\n    margin: 1em;\n    text-align: center;\n    font-size: 0.8em;\n}\n\na {\n    font-weight: normal;\n}\n';
var $author$project$Styles$overview = '\n.overview {\n    width: 100%;\n    padding: 0 30px;\n    border: 1px solid #d0d0d0;\n    border-radius: 0.5em;\n    table-layout: fixed;\n}\n\n.overview thead {\n    text-align: center;\n}\n\n.overview thead tr,\n.overview tfoot tr {\n    height: 3em;\n}\n\n.overview tbody th,\n.overview tfoot th {\n    text-align: right;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    direction: rtl;\n}\n\n.overview .wrapper {\n    display: flex;\n}\n\n.overview .none {\n    text-align: center;\n    color: #606060;\n    font-size: 0.8em;\n}\n\n.overview progress {\n    flex: 1.5;\n    display: none;\n}\n\n@media only screen  and (min-width : 960px) {\n    .overview progress {\n        display: block;\n    }\n}\n\n.overview .info {\n    flex: 1;\n    text-align: right;\n    margin: 0 1em;\n}\n';
var $author$project$Analyzer$styles = $elm$core$String$concat(
	_List_fromArray(
		[$author$project$Styles$general, $author$project$Styles$file, $author$project$Styles$overview]));
var $author$project$Analyzer$view = F2(
	function (version, model) {
		return A4(
			$author$project$Styles$page,
			'Coverage report',
			$author$project$Analyzer$styles,
			version,
			A2(
				$elm$core$List$cons,
				$author$project$Analyzer$overview(model.N),
				A2(
					$elm$core$List$filterMap,
					function (_v0) {
						var key = _v0.a;
						var coverageInfo = _v0.b;
						return A2(
							$elm$core$Maybe$map,
							A2($author$project$Markup$file, key, coverageInfo),
							A2($elm$core$Dict$get, key, model.ad));
					},
					$elm$core$Dict$toList(model.N))));
	});
var $author$project$Analyzer$main = $author$project$Service$create(
	{
		aO: $elm$json$Json$Encode$string,
		aR: F2(
			function (version, model) {
				return A2(
					$zwilias$elm_html_string$Html$String$toString,
					0,
					A2($author$project$Analyzer$view, version, model));
			}),
		a1: $author$project$Analyzer$decodeModel
	});
_Platform_export({'Analyzer':{'init':$author$project$Analyzer$main($elm$json$Json$Decode$value)(0)}});}(this));