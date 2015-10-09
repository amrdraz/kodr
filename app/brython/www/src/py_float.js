;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

function $err(op,other){
    var msg = "unsupported operand type(s) for "+op
    msg += ": 'float' and '"+$.get_class(other).__name__+"'"
    throw _b_.TypeError(msg)
}

// dictionary for built-in class 'float'
var $FloatDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'float',
    $native:true}

$FloatDict.as_integer_ratio=function(self) {
   if (Math.round(self.valueOf()) == self.valueOf()){
       return _b_.tuple([_b_.int(self.valueOf()), _b_.int(1)])
   }
   var _temp=self.valueOf()
   var i=10
   while (!(Math.round(_temp/i) == _temp/i)) i*=10

   return _b_.tuple([_b_.int(_temp*i), _b_.int(i)])
}

$FloatDict.__bool__ = function(self){return _b_.bool(self.valueOf())}

$FloatDict.__class__ = $B.$type

$FloatDict.__eq__ = function(self,other){
    if(isinstance(other,_b_.int)) return self==other
    if(isinstance(other,float)) {
      // new Number(1.2)==new Number(1.2) returns false !!!
      return self.valueOf()==other.valueOf()
    }
    if(isinstance(other,_b_.complex)){
      if (other.imag != 0) return false
      return self==other.real
    }

    if (_b_.hasattr(other, '__eq__')) {
       return _b_.getattr(other, '__eq__')(self.value)
    }

    return self.value===other
}

$FloatDict.__floordiv__ = function(self,other){
    if(isinstance(other,[_b_.int, float])){
      if(other.valueOf()==0) throw ZeroDivisionError('division by zero')
      return float(Math.floor(self/other))
    }
    if(hasattr(other,'__rfloordiv__')) {
      return getattr(other,'__rfloordiv__')(self)
    }
    $err('//',other)
}

$FloatDict.fromhex = function(arg){
   // [sign] ['0x'] integer ['.' fraction] ['p' exponent]

   if (!isinstance(arg, _b_.str)) {
      throw _b_.ValueError('argument must be a string')
   }

   var value = arg.trim()   // remove leading and trailing whitespace
   switch(value.toLowerCase()) {
      case '+inf':
      case 'inf':
      case '+infinity':
      case 'infinity':
           return $FloatClass(Infinity)
      case '-inf':
      case '-infinity':
           return $FloatClass(-Infinity)
      case '+nan':
      case 'nan':
           return $FloatClass(Number.NaN)
      case '-nan':
           return $FloatClass(-Number.NaN)
      case '':
           throw _b_.ValueError('count not convert string to float')
   }

   var _m=/^(\d*\.?\d*)$/.exec(value)

   if (_m !== null) return $FloatClass(parseFloat(_m[1]))

   // lets see if this is a hex string.
   var _m=/^(\+|-)?(0x)?([0-9A-F]+\.?)?(\.[0-9A-F]+)?(p(\+|-)?\d+)?$/i.exec(value)

   if (_m == null) throw _b_.ValueError('invalid hexadecimal floating-point string')

   var _sign=_m[1]
   var _int = parseInt(_m[3] || '0', 16) 
   var _fraction=_m[4] || '.0'
   var _exponent=_m[5] || 'p0'

   if (_sign == '-') {_sign=-1} else {_sign=1}

   //'0x3.a7p10'
   //(3 + 10./16 + 7./16**2) * 2.0**10, or 3740.0
   //if (_int === undefined) throw _b_.ValueError('invalid hexadecimal floating-point string')
   var _sum=_int

   for (var i=1, _len_i = _fraction.length; i < _len_i; i++){
       _sum+=parseInt(_fraction.charAt(i),16)/Math.pow(16,i) 
   }
   return new Number(_sign * _sum * Math.pow(2, parseInt(_exponent.substring(1))))
}

$FloatDict.__getformat__ = function(arg){
    if(arg=='double' || arg =='float') return 'IEEE, little-endian'
    throw _b_.ValueError("__getformat__() argument 1 must be 'double' or 'float'")
}

$FloatDict.__getitem__ = function(){
    throw _b_.TypeError("'float' object is not subscriptable")
}

function preformat(self, fmt){
    if(fmt.empty){return _b_.str(self)}
    if(fmt.type && 'eEfFgGn%'.indexOf(fmt.type)==-1){
        throw _b_.ValueError("Unknown format code '"+fmt.type+
            "' for object of type 'float'")
    }
    if(isNaN(self)){
        if(fmt.type=='f'||fmt.type=='g'){return 'nan'}
        else{return 'NAN'}
    }
    if(self==Number.POSITIVE_INFINITY){
        if(fmt.type=='f'||fmt.type=='g'){return 'inf'}
        else{return 'INF'}
    }
    if(fmt.precision===undefined && fmt.type !==undefined){
        fmt.precision = 6
    }
    if(fmt.type=='%'){self *= 100}
    
    if(fmt.type=='e'){
        var res = self.toExponential(fmt.precision),
            exp = parseInt(res.substr(res.search('e')+1))
            if(Math.abs(exp)<10){res=res.substr(0,res.length-1)+'0'+
                res.charAt(res.length-1)}
        return res        
    }
    
    if(fmt.precision!==undefined){
        // Use Javascript toPrecision to get the correct result
        // The argument of toPrecision is the number of digits after .
        // For format type f, precision is the total number of digits, so we
        // must add the number of digits before "."
        var prec = fmt.precision
        if(prec && 'fF%'.indexOf(fmt.type)>-1){
            var pos_pt = Math.abs(self).toString().search(/\./)
            if(pos_pt>-1){prec+=pos_pt}else{prec=Math.abs(self).toString().length}
        }
        var res = self.toPrecision(prec),
            pt_pos=res.indexOf('.')
        if(fmt.type!==undefined && 
            (fmt.type=='%' || fmt.type.toLowerCase()=='f')){
            if(pt_pos==-1){res += '.'+'0'.repeat(fmt.precision)}
            else{
                missing = fmt.precision-res.length+pt_pos+1
                if(missing>0)res += '0'.repeat(missing)
            }
        }else{
            var res1 = self.toExponential(fmt.precision-1),
                exp = parseInt(res1.substr(res1.search('e')+1))
            if(exp<-4 || exp>=fmt.precision-1){
                res = res1
                if(Math.abs(exp)<10){res=res.substr(0,res.length-1)+'0'+
                    res.charAt(res.length-1)}
            }
        }
    }else{var res = _b_.str(self)}

    if(fmt.type===undefined|| 'gGn'.indexOf(fmt.type)!=-1){
        // remove trailing 0
        while(res.charAt(res.length-1)=='0'){res=res.substr(0,res.length-1)}
        if(res.charAt(res.length-1)=='.'){
            if(fmt.type===undefined){res += '0'}
            else{res = res.substr(0,res.length-1)}
        }
    }
    if(fmt.sign!==undefined){
        if((fmt.sign==' ' || fmt.sign=='+') && self>0){res=fmt.sign+res}
    }
    if(fmt.type=='%'){res+='%'}
    
    return res
}

$FloatDict.__format__ = function(self, format_spec) {
    var fmt = new $B.parse_format_spec(format_spec)
    fmt.align = fmt.align || '>'
    var raw = preformat(self, fmt).split('.'),
        _int = raw[0]
    if(fmt.comma){
        var len = _int.length, nb = Math.ceil(_int.length/3), chunks = []
        for(var i=0;i<nb;i++){
            chunks.push(_int.substring(len-3*i-3, len-3*i))
        }
        chunks.reverse()
        raw[0] = chunks.join(',')
    }
    return $B.format_width(raw.join('.'), fmt)
}

$FloatDict.__hash__ = function(self) {
    if (self === undefined) {
       return $FloatDict.__hashvalue__ || $B.$py_next_hash--  // for hash of float type (not instance of int)
    }

    var _v= self.valueOf()
    if (_v === Infinity) return 314159
    if (_v === -Infinity) return -271828
    if (isNaN(_v)) return 0
    // for integers, return the value
    if (_v==Math.round(_v)) return Math.round(_v)

    var r=_b_.$frexp(_v)
    r[0] *= Math.pow(2,31)
    var hipart = _b_.int(r[0])
    r[0] = (r[0] - hipart) * Math.pow(2,31)
    var x = hipart + _b_.int(r[0]) + (r[1] << 15)
    return x & 0xFFFFFFFF
}

_b_.$isninf=function(x) {
    var x1=x
    if (isinstance(x, float)) x1=x.valueOf()
    return x1 == -Infinity || x1 == Number.NEGATIVE_INFINITY
}

_b_.$isinf=function(x) {
    var x1=x
    if (isinstance(x, float)) x1=x.valueOf()
    return x1 == Infinity || x1 == -Infinity || x1 == Number.POSITIVE_INFINITY || x1 == Number.NEGATIVE_INFINITY
}


_b_.$fabs=function(x){return x>0?float(x):float(-x)}

_b_.$frexp= function(x){
    var x1=x
    if (isinstance(x, float)) x1=x.valueOf()

    if (isNaN(x1) || _b_.$isinf(x1)) { return [x1,-1]}
    //if (x1 == 0) {return _b_.tuple([0,0])}
    if (x1 == 0) return [0,0]

    var sign=1, ex = 0, man = x1

    if (man < 0.) {
       sign=-sign
       man = -man
    }

    while (man < 0.5) {
       man *= 2.0
       ex--
    }

    while (man >= 1.0) {
       man *= 0.5
       ex++
    }

    man *= sign

    return [man , ex]
}

_b_.$ldexp=function(x,i) {
    if(_b_.$isninf(x)) return float('-inf')
    if(_b_.$isinf(x)) return float('inf')

    var y=x
    if (isinstance(x, float)) y=x.valueOf()
    //var y=float_check(x)
    if (y == 0) return y

    var j=i
    if (isinstance(i, float)) j=i.valueOf()
    return y * Math.pow(2,j)
}

$FloatDict.hex = function(self) {
    // http://hg.python.org/cpython/file/d422062d7d36/Objects/floatobject.c
    var DBL_MANT_DIG=53   // 53 bits?
    var TOHEX_NBITS = DBL_MANT_DIG + 3 - (DBL_MANT_DIG+2)%4;

    switch(self.valueOf()) {
      case Infinity:
      case -Infinity:
      case Number.NaN:
      case -Number.NaN:
         return self
      case -0:
         return '-0x0.0p0'
      case 0:
         return '0x0.0p0'
    }

    var _a = _b_.$frexp(_b_.$fabs(self.valueOf()))
    var _m=_a[0], _e=_a[1]
    var _shift = 1 - Math.max( -1021 - _e, 0)
    _m = _b_.$ldexp(_m, _shift)
    _e -= _shift

    var _int2hex='0123456789ABCDEF'.split('')
    var _s=_int2hex[Math.floor(_m)]
    _s+='.'
    _m -= Math.floor(_m)

    for (var i=0; i < (TOHEX_NBITS-1)/4; i++) {
        _m*=16.0
        _s+=_int2hex[Math.floor(_m)]
        _m-=Math.floor(_m)
    }

    var _esign='+'
    if (_e < 0) { 
       _esign='-'
       _e=-_e
    }

    if (self.value < 0) return "-0x" + _s + 'p' + _esign + _e;
    return "0x" + _s + 'p' + _esign + _e;
}

$FloatDict.__init__ = function(self,value){self=new Number(value)}

$FloatDict.__int__ = function(self){return parseInt(self)}

$FloatDict.is_integer = function(self) {return _b_.int(self) == self}

$FloatDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(other==0){throw ZeroDivisionError('float modulo')}
    if(isinstance(other,_b_.int)) return new Number((self%other+other)%other)
    
    if(isinstance(other,float)){
        return new Number(((self%other)+other)%other)
    }
    if(isinstance(other,_b_.bool)){ 
        var bool_value=0; 
        if (other.valueOf()) bool_value=1;
        return new Number((self%bool_value+bool_value)%bool_value)
    }
    if(hasattr(other,'__rmod__')) return getattr(other,'__rmod__')(self)
    $err('%',other)
}

$FloatDict.__mro__ = [$FloatDict,$ObjectDict]

$FloatDict.__mul__ = function(self,other){
    if(isinstance(other,_b_.int)){
        if(other.__class__==$B.LongInt.$dict){
            return new Number(self*parseFloat(other.value))
        }
        return new Number(self*other)
    }
    if(isinstance(other,float)) return new Number(self*other)
    if(isinstance(other,_b_.bool)){ 
      var bool_value=0; 
      if (other.valueOf()) bool_value=1;
      return new Number(self*bool_value)
      // why not the following?
      // if(other.valueOf()) return float(self.value)
      // return float(0)
    }
    if(isinstance(other,_b_.complex)){
      return _b_.complex(float(self*other.real), 
          float(self*other.imag))
    }
    if(hasattr(other,'__rmul__')) return getattr(other,'__rmul__')(self)
    $err('*',other)
}

$FloatDict.__ne__ = function(self,other){return !$FloatDict.__eq__(self,other)}

$FloatDict.__neg__ = function(self,other){return float(-self)}

$FloatDict.__pow__= function(self,other){
    if(isinstance(other,[_b_.int, float])) return float(Math.pow(self,other))
    if(hasattr(other,'__rpow__')) return getattr(other,'__rpow__')(self)
    $err("** or pow()",other)
}

$FloatDict.__repr__ = $FloatDict.__str__ = function(self){
    if(self===float) return "<class 'float'>"
    if(self.valueOf() == Infinity) return 'inf'
    if(self.valueOf() == -Infinity) return '-inf'
    if(isNaN(self.valueOf())) return 'nan'

    var res = self.valueOf()+'' // coerce to string
    if(res.indexOf('.')==-1) res+='.0'
    return _b_.str(res)
}

$FloatDict.__setattr__ = function(self,attr,value){
    if(self.constructor===Number){
        if($FloatDict[attr]===undefined){
            throw _b_.AttributeError("'float' object has no attribute '"+attr+"'")
        }else{
            throw _b_.AttributeError("'float' object attribute '"+attr+"' is read-only")
        }
    }
    // subclasses of float can have attributes set
    self[attr] = value
    return $N
}

$FloatDict.__truediv__ = function(self,other){
    if(isinstance(other,[_b_.int, float])){
        if(other.valueOf()==0) throw ZeroDivisionError('division by zero')
        return float(self/other)
    }
    if(isinstance(other,_b_.complex)){
        var cmod = other.real*other.real+other.imag*other.imag
        if(cmod==0) throw ZeroDivisionError('division by zero')
        
        return _b_.complex(float(self*other.real/cmod),
                           float(-self*other.imag/cmod))
    }
    if(hasattr(other,'__rtruediv__')) return getattr(other,'__rtruediv__')(self)
    $err('/',other)
}

// operations
var $op_func = function(self,other){
    if(isinstance(other,_b_.int)){
        if(other.__class__===$B.LongInt.$dict){
            return float(self-parseInt(other.value))
        }else{return float(self-other)}
    }
    if(isinstance(other,float)) return float(self-other)
    if(isinstance(other,_b_.bool)){ 
      var bool_value=0; 
      if (other.valueOf()) bool_value=1;
      return float(self-bool_value)
    }
    if(isinstance(other,_b_.complex)){
      return _b_.complex(self - other.real, -other.imag)
    }
    if(hasattr(other,'__rsub__')) return getattr(other,'__rsub__')(self)
    $err('-',other)
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for(var $op in $ops){
    var $opf = $op_func.replace(/-/gm,$op)
    $opf = $opf.replace(/__rsub__/gm,'__r'+$ops[$op]+'__')
    eval('$FloatDict.__'+$ops[$op]+'__ = '+$opf)
}

// comparison methods
var $comp_func = function(self,other){
    if(isinstance(other,_b_.int)){
        if(other.__class__===$B.LongInt.$dict){return self > parseInt(other.value)}
        return self > other.valueOf()
    }
    if(isinstance(other,float)) return self > other
    throw _b_.TypeError(
        "unorderable types: "+self.__class__.__name__+'() > '+$B.get_class(other).__name__+"()")
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){
    eval("$FloatDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// add "reflected" methods
$B.make_rmethods($FloatDict)

// unsupported operations
var $notimplemented = function(self,other){
    throw _b_.TypeError(
        "unsupported operand types for OPERATOR: '"+self.__class__.__name__+
            "' and '"+$B.get_class(other).__name__+"'")
}
$notimplemented += '' // coerce to string
for(var $op in $B.$operators){
    // use __add__ for __iadd__ etc, so don't define __iadd__ below
    switch($op) {
      case '+=':
      case '-=':
      case '*=':
      case '/=':
      case '%=':
        //if(['+=','-=','*=','/=','%='].indexOf($op)>-1) continue
        break
      default:
        var $opfunc = '__'+$B.$operators[$op]+'__'
        if($FloatDict[$opfunc]===undefined){
            eval('$FloatDict.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
        }
    }//switch
}

function $FloatClass(value){
    return new Number(value)
}


// constructor for built-in class 'float'
var float = function (value){
    switch(value) {
      case undefined:
        return $FloatClass(0.0)
      case Number.MAX_VALUE:
        //take care of 'inf not identical to 1.797...e+308' error 
        return $FloatClass(Infinity)
      case -Number.MAX_VALUE:
        return $FloatClass(-Infinity)
    }//switch
    
    if(typeof value=="number") return $FloatClass(value)
    if(isinstance(value,float)) {return value}
    if(isinstance(value,_b_.bytes)) {
      return $FloatClass(parseFloat(getattr(value,'decode')('latin-1')))
    }
    if(hasattr(value, '__float__')) {
      return $FloatClass(getattr(value, '__float__')())
    }
    if (typeof value == 'string') {
       value = value.trim()   // remove leading and trailing whitespace
       switch(value.toLowerCase()) {
         case '+inf':
         case 'inf':
         case '+infinity':
         case 'infinity':
           return Number.POSITIVE_INFINITY
         case '-inf':
         case '-infinity':
           return Number.NEGATIVE_INFINTY
         case '+nan':
         case 'nan':
           return Number.NaN
         case '-nan':
           return -Number.NaN
         case '':
           throw _b_.ValueError('count not convert string to float')
         default:
           if (isFinite(value)) return $FloatClass(eval(value))
       }
    }
    console.log('error', value)
    throw _b_.ValueError("Could not convert to float(): '"+_b_.str(value)+"'")
}
float.__class__ = $B.$factory
float.$dict = $FloatDict
$FloatDict.$factory = float
$FloatDict.__new__ = $B.$__new__(float)

$B.$FloatClass = $FloatClass

_b_.float = float
})(__BRYTHON__)
