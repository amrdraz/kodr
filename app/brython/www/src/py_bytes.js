;(function($B){

var _b_=$B.builtins
var $ObjectDict = _b_.object.$dict
var isinstance = _b_.isinstance, getattr=_b_.getattr, None=_b_.None

var from_unicode={}, to_unicode={}

//bytearray() (built in function)
var $BytearrayDict = {__class__:$B.$type,__name__:'bytearray'}

var mutable_methods = ['__delitem__','clear','copy','count','index','pop',
    'remove','reverse','sort']

for(var i=0, _len_i = mutable_methods.length; i < _len_i;i++){
    var method = mutable_methods[i]
    $BytearrayDict[method] = (function(m){
        return function(self){
            var args = [self.source], pos=1
            for(var i=1, _len_i = arguments.length; i < _len_i;i++) args[pos++]=arguments[i]
            return _b_.list.$dict[m].apply(null,args)
        }
    })(method)
}

var $bytearray_iterator = $B.$iterator_class('bytearray_iterator')
$BytearrayDict.__iter__ = function(self){
    return $B.$iterator(self.source,$bytearray_iterator)
}
$BytearrayDict.__mro__ = [$BytearrayDict,$ObjectDict]

$BytearrayDict.__repr__ = $BytearrayDict.__str__ = function(self){
    return 'bytearray('+$BytesDict.__repr__(self)+")"
}

$BytearrayDict.__setitem__ = function(self,arg,value){
    if(isinstance(arg,_b_.int)){
        if(!isinstance(value, _b_.int)){
            throw _b_.TypeError('an integer is required')
        }else if(value>255){
            throw _b_.ValueError("byte must be in range(0, 256)")
        }
        var pos = arg
        if(arg<0) pos=self.source.length+pos
        if(pos>=0 && pos<self.source.length){self.source[pos]=value}
        else{throw _b_.IndexError('list index out of range')}
    } else if(isinstance(arg,_b_.slice)){
        var start = arg.start===None ? 0 : arg.start
        var stop = arg.stop===None ? self.source.length : arg.stop
        var step = arg.step===None ? 1 : arg.step

        if(start<0) start=self.source.length+start
        if(stop<0) stop=self.source.length+stop

        self.source.splice(start,stop-start)

        // copy items in a temporary JS array
        // otherwise, a[:0]=a fails
        if(_b_.hasattr(value,'__iter__')){
            var $temp = _b_.list(value)
            for(var i=$temp.length-1;i>=0;i--){
                if(!isinstance($temp[i], _b_.int)){
                    throw _b_.TypeError('an integer is required')
                }else if($temp[i]>255){
                    throw ValueError("byte must be in range(0, 256)")
                }
                self.source.splice(start,0,$temp[i])
            }
        }else{
            throw _b_.TypeError("can only assign an iterable")
        }
    }else {
        throw _b_.TypeError('list indices must be integer, not '+$B.get_class(arg).__name__)
    }
}

$BytearrayDict.append = function(self,b){
    if(arguments.length!=2){throw _b_.TypeError(
        "append takes exactly one argument ("+(arguments.length-1)+" given)")
    }
    if(!isinstance(b, _b_.int)) throw _b_.TypeError("an integer is required")
    if(b>255) throw ValueError("byte must be in range(0, 256)")
    self.source[self.source.length]=b
}

$BytearrayDict.insert = function(self,pos,b){
    if(arguments.length!=3){throw _b_.TypeError(
        "insert takes exactly 2 arguments ("+(arguments.length-1)+" given)")
    }
    if(!isinstance(b, _b_.int)) throw _b_.TypeError("an integer is required")
    if(b>255) throw ValueError("byte must be in range(0, 256)")
    _b_.list.$dict.insert(self.source,pos,b)
}

function bytearray(source, encoding, errors) {
    var _bytes = bytes(source, encoding, errors)
    var obj = {__class__:$BytearrayDict}
    $BytearrayDict.__init__(obj,source,encoding,errors)
    return obj
}
bytearray.__class__=$B.$factory
bytearray.$dict = $BytearrayDict
$BytearrayDict.$factory = bytearray

bytearray.__code__={}
bytearray.__code__.co_argcount=1
bytearray.__code__.co_consts=[]
bytearray.__code__.co_varnames=['i']

//bytes() (built in function)
var $BytesDict = {__class__ : $B.$type,__name__ : 'bytes'}

$BytesDict.__add__ = function(self,other){
    if(!isinstance(other,bytes)){
        throw _b_.TypeError("can't concat bytes to " + _b_.str(other))
    }
    self.source = self.source.concat(other.source)
    return self
}

var $bytes_iterator = $B.$iterator_class('bytes_iterator')
$BytesDict.__iter__ = function(self){
    return $B.$iterator(self.source,$bytes_iterator)
}

$BytesDict.__eq__ = function(self,other){
    return getattr(self.source,'__eq__')(other.source)
}

$BytesDict.__ge__ = function(self,other){
    return _b_.list.$dict.__ge__(self.source,other.source)
}

// borrowed from py_string.js.
$BytesDict.__getitem__ = function(self,arg){
    var i
    if(isinstance(arg,_b_.int)){
        var pos = arg
        if(arg<0) pos=self.source.length+pos

        if(pos>=0 && pos<self.source.length) return self.source[pos]
        throw _b_.IndexError('index out of range')
    } else if(isinstance(arg,_b_.slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? getattr(self.source,'__len__')() : arg.stop
        }else{
            var start = arg.start===None ? 
            getattr(self.source,'__len__')()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0) start=self.source.length+start
        if(stop<0) stop=self.source.length+stop
        var res = [],i=null, pos=0
        if(step>0){
          if(stop<=start) return ''
          for(i=start;i<stop;i+=step) res[pos++]=self.source[i]
        } else {
            if(stop>=start) return ''
            for(i=start;i>=stop;i+=step) res[pos++]=self.source[i]
        }
        return bytes(res)
    } else if(isinstance(arg,bool)){
        return self.source.__getitem__(_b_.int(arg))
    }
}


$BytesDict.__gt__ = function(self,other){
    return _b_.list.$dict.__gt__(self.source,other.source)
}

$BytesDict.__hash__ = function(self) {
  if (self === undefined) {
     return $BytesDict.__hashvalue__ || $B.$py_next_hash--  // for hash of str$
  }

  //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-$
  // this implementation for strings maybe good enough for us..

  var hash=1;
  for(var i=0, _len_i = self.length; i < _len_i; i++) {
      hash=(101*hash + self.source[i]) & 0xFFFFFFFF
  }

  return hash
}


$BytesDict.__init__ = function(self,source,encoding,errors){
    var int_list = [], pos=0
    if(source===undefined){
        // empty list
    }else if(isinstance(source,_b_.int)){
        var i=source
        //for(var i=0;i<source;i++) 
        while(i--) int_list[pos++]=0
    }else{
        if(isinstance(source,_b_.str)){
            if(encoding===undefined)
                throw _b_.TypeError("string argument without an encoding")
            int_list = encode(source,encoding)
        }else{
            // tranform iterable "source" into a list
            int_list = _b_.list(source)
        }
    }
    self.source = int_list
    self.encoding = encoding
    self.errors = errors
}

$BytesDict.__le__ = function(self,other){
    return _b_.list.$dict.__le__(self.source,other.source)
}

$BytesDict.__len__ = function(self){return self.source.length}

$BytesDict.__lt__ = function(self,other){
    return _b_.list.$dict.__lt__(self.source,other.source)
}

$BytesDict.__mro__ = [$BytesDict,$ObjectDict]

$BytesDict.__ne__ = function(self,other){return !$BytesDict.__eq__(self,other)}

$BytesDict.__repr__ = $BytesDict.__str__ = function(self){
    var res = "b'"
    for(var i=0, _len_i = self.source.length; i < _len_i;i++){
        var s=self.source[i]
        if(s<32 || s>=128){
            var hx = s.toString(16)
            hx = (hx.length==1 ? '0' : '') + hx
            res += '\\x'+hx
        }else{
            res += String.fromCharCode(s)
        }
    }
    return res+"'"
}

$BytesDict.__reduce_ex__ = function(self){return $BytesDict.__repr__(self)}

$BytesDict.decode = function(self,encoding,errors){
    if(encoding === undefined) encoding = 'utf-8'
    if(errors === undefined) errors='strict'

    switch (errors) {
      case 'strict':
      case 'ignore':
      case 'replace':
      case 'surrogateescape':
      case 'xmlcharrefreplace':
      case 'backslashreplace':
        return decode(self.source,encoding,errors)
      default:
        // raise error since errors variable is not valid
    }
}

$BytesDict.join = function(){
    var $ns = $B.args('join',2,{self:null,iterable:null},
        ['self','iterable'], arguments, {}),
        self = $ns['self'], iterable = $ns['iterable']
    var next_func = _b_.getattr(_b_.iter(iterable), '__next__'),
        res = bytes(),
        empty = true
    while(true){
        try{
            var item = next_func()
            if(empty){empty=false}
            else{res = $BytesDict.__add__(res, self)}
            res = $BytesDict.__add__(res, item)
        }catch(err){
            if(isinstance(err, _b_.StopIteration)){break}
            throw err
        }
    }
    return res
}

$BytesDict.maketrans=function(from, to) {
    var _t=[]
    // make 'default' translate table
    for(var i=0; i < 256; i++) _t[i]=i

    // make substitution in the translation table
    for(var i=0, _len_i = from.source.length; i < _len_i; i++) {
       var _ndx=from.source[i]     //retrieve ascii code of char
       _t[_ndx]=to.source[i]
    }

    // return the bytes object associated to the 256-elt list
    return bytes(_t)
}

function _strip(self,cars,lr){
    if(cars===undefined){
        cars = [], pos=0
        var ws = '\r\n \t'
        for(var i=0, _len_i = ws.length; i < _len_i; i++) cars[pos++]=ws.charCodeAt(i)
    }else if(isinstance(cars,bytes)){
        cars = cars.source
    }else{
        throw _b_.TypeError("Type str doesn't support the buffer API")
    }
    if(lr=='l'){
        for(var i=0, _len_i = self.source.length; i < _len_i;i++){
            if(cars.indexOf(self.source[i])==-1) break
        }
        return bytes(self.source.slice(i))
    }
    for(var i=self.source.length-1;i>=0;i--){
       if(cars.indexOf(self.source[i])==-1) break
    }
    return bytes(self.source.slice(0,i+1))
}

$BytesDict.lstrip = function(self,cars) {return _strip(self,cars,'l')}
$BytesDict.rstrip = function(self,cars) {return _strip(self,cars,'r')}

$BytesDict.strip = function(self,cars){
    var res = $BytesDict.lstrip(self,cars)
    return $BytesDict.rstrip(res,cars)
}

$BytesDict.translate = function(self,table,_delete) {
    if(_delete===undefined){_delete=[]}
    else if(isinstance(_delete, bytes)){_delete=_delete.source}
    else{
        throw _b_.TypeError("Type "+$B.get_class(_delete).__name+" doesn't support the buffer API")    
    }
    var res = [], pos=0
    if (isinstance(table, bytes) && table.source.length==256) {
       for (var i=0, _len_i = self.source.length; i < _len_i; i++) {
           if(_delete.indexOf(self.source[i])>-1) continue
           res[pos++]=table.source[self.source[i]]
       }
    }
    return bytes(res)
}

$BytesDict.upper = function(self) {
    var _res=[], pos=0
    for(var i=0, _len_i = self.source.length; i < _len_i; i++) _res[pos++]=self.source[i].toUpperCase()
    return bytes(_res)
}

function $UnicodeEncodeError(encoding, code_point, position){
    throw _b_.UnicodeEncodeError("'"+encoding+
        "' codec can't encode character "+_b_.hex(code_point)+
        " in position "+position)
}

function $UnicodeDecodeError(encoding, position){
    throw _b_.UnicodeDecodeError("'"+encoding+
        "' codec can't decode bytes in position "+position)
}

function _hex(int){return int.toString(16)}
function _int(hex){return parseInt(hex,16)}

function normalise(encoding){
    var enc=encoding.toLowerCase()
    if(enc.substr(0,7)=='windows'){enc='cp'+enc.substr(7)}
    enc = enc.replace('-','') // first hyphen, like in cp-1250
    enc = enc.replace('-','_') // second, like in iso-8859-1
    return enc
}

function load_decoder(enc){
    // load table from Lib/encodings/<enc>.py
    if(to_unicode[enc]===undefined){
        load_encoder(enc)
        to_unicode[enc] = {}
        for(var attr in from_unicode[enc]){
            to_unicode[enc][from_unicode[enc][attr]]=attr
        }
    }
}

function load_encoder(enc){
    // load table from encodings/<enc>.py
    if(from_unicode[enc]===undefined){
        var mod = _b_.__import__('encodings.'+enc),
            table = mod[enc].decoding_table
        from_unicode[enc] = {}
        for(var i=0;i<table.length;i++){
            from_unicode[enc][table.charCodeAt(i)] = i
        }
    }
}

function decode(b,encoding,errors){
    var s='', enc=normalise(encoding)

    switch(enc) {
      case 'utf-8':
      case 'utf8':
        var i=0,cp
        var _int_800=_int('800'), _int_c2=_int('c2'), _int_1000=_int('1000')
        var _int_e0=_int('e0'), _int_e1=_int('e1'), _int_e3=_int('e3')
        var _int_a0=_int('a0'), _int_80=_int('80'), _int_2000=_int('2000')

        while(i<b.length){
            if(b[i]<=127){
                s += String.fromCharCode(b[i])
                i += 1
            }else if(b[i]<_int_e0){
                if(i<b.length-1){
                    cp = b[i+1] + 64*(b[i]-_int_c2)
                    s += String.fromCharCode(cp)
                    i += 2
                }else{$UnicodeDecodeError(encoding,i)}
            }else if(b[i]==_int_e0){
                if(i<b.length-2){
                    var zone = b[i+1]-_int_a0
                    cp = b[i+2]-_int_80+_int_800+64*zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{$UnicodeDecodeError(encoding,i)}
            }else if(b[i]<_int_e3){
                if(i<b.length-2){
                    var zone = b[i+1]-_int_80
                    cp = b[i+2]-_int_80+_int_1000+64*zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{$UnicodeDecodeError(encoding,i)}
            }else{
                if(i<b.length-2){
                    var zone1 = b[i]-_int_e1-1
                    var zone = b[i+1]-_int_80+64*zone1
                    cp = b[i+2]-_int_80+_int_2000+64*zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{
                    if (errors == 'surrogateescape') {
                       s+='\\udc' + _hex(b[i])
                       i+=1
                    } else {
                       $UnicodeDecodeError(encoding,i)
                    }
                }
            }
        }
        break;
      case 'latin1':
      case 'iso8859_1':
      case 'windows1252':
        for(var i=0, _len_i = b.length; i < _len_i;i++) s += String.fromCharCode(b[i])
        break;
      case 'ascii':
        for(var i=0, _len_i = b.length; i < _len_i;i++){
            var cp = b[i]
            if(cp<=127){s += String.fromCharCode(cp)}
            else{
                var msg = "'ascii' codec can't decode byte 0x"+cp.toString(16)
                msg += " in position "+i+": ordinal not in range(128)"
                throw _b_.UnicodeDecodeError(msg)
            }
        }
        break;
      default:
        try{load_decoder(enc)}
        catch(err){throw _b_.LookupError("unknown encoding: "+ enc)}
        for(var i=0, _len_i = b.length; i < _len_i;i++){
            var u = to_unicode[enc][b[i]]
            if(u!==undefined){s+=String.fromCharCode(u)}
            else{s += String.fromCharCode(b[i])}
        }
        break;
        throw _b_.LookupError("unknown encoding: "+encoding)
    }
    return s
}

function encode(s,encoding){
    var t=[], pos=0, enc=normalise(encoding)

    switch(enc) {
      case 'utf-8':
      case 'utf8':
        //optimize by creating constants..
        var _int_800=_int('800'), _int_c2=_int('c2'), _int_1000=_int('1000')
        var _int_e0=_int('e0'), _int_e1=_int('e1'),_int_a0=_int('a0'), _int_80=_int('80')
        var _int_2000=_int('2000'), _int_D000=_int('D000')
 
        for(var i=0, _len_i = s.length; i < _len_i;i++){
            var cp = s.charCodeAt(i) // code point
            if(cp<=127){
                t[pos++]=cp
            }else if(cp<_int_800){
                var zone = Math.floor((cp-128)/64)
                t[pos++]=_int_c2+zone
                t[pos++]=cp -64*zone
            }else if(cp<_int_1000){
                var zone = Math.floor((cp-_int_800)/64)
                t[pos++]=_int_e0
                t[pos++]=_int_a0+zone
                t[pos++]=_int_80 + cp - _int_800 - 64 * zone
            }else if(cp<_int_2000){
                var zone = Math.floor((cp-_int_1000)/64)
                t[pos++]=_int_e1+Math.floor((cp-_int_1000)/_int_1000)
                t[pos++]=_int_80+zone
                t[pos++]=_int_80 + cp - _int_1000 -64*zone
            }else if(cp<_int_D000){
                var zone = Math.floor((cp-_int_2000)/64)
                var zone1 = Math.floor((cp-_int_2000)/_int_1000)
                t[pos++]=_int_e1+Math.floor((cp-_int_1000)/_int_1000)
                t[pos++]=_int_80+zone-zone1*64
                t[pos++]=_int_80 + cp - _int_2000 - 64 * zone
            }
        }
        break;
      case 'latin1': 
      case 'iso8859_1': 
      case 'windows1252': 
        for(var i=0, _len_i = s.length; i < _len_i;i++){
            var cp = s.charCodeAt(i) // code point
            if(cp<=255){t[pos++]=cp}
            else{$UnicodeEncodeError(encoding,i)}
        }
        break;
      case 'ascii':
        for(var i=0, _len_i = s.length; i < _len_i;i++){
            var cp = s.charCodeAt(i) // code point
            if(cp<=127){t[pos++]=cp}
            else{$UnicodeEncodeError(encoding,i)}
        }
        break;
      default:
          try{load_encoder(enc)}
          catch(err){throw _b_.LookupError("unknown encoding: "+ enc)}
              
          for(var i=0, _len_i = s.length; i < _len_i;i++){
              var cp = s.charCodeAt(i) // code point
              if(from_unicode[enc][cp]===undefined){
                  $UnicodeEncodeError(encoding,cp,i)
              }
              t[pos++] = from_unicode[enc][cp]
          }
          break
    }
    return t
}


function bytes(source, encoding, errors) {
    // Whatever the type of "source" (integer or iterable), compute a list
    // of integers from 0 to 255
    var obj = {__class__:$BytesDict}
    $BytesDict.__init__(obj,source,encoding,errors)
    return obj
}

bytes.__class__ = $B.$factory
bytes.$dict = $BytesDict
$BytesDict.$factory = bytes

bytes.__code__={}
bytes.__code__.co_argcount=1
bytes.__code__.co_consts=[]
bytes.__code__.co_varnames=['i']

// add methods of bytes to bytearray
for(var $attr in $BytesDict){
    if($BytearrayDict[$attr]===undefined){
        $BytearrayDict[$attr]=(function(attr){
            return function(){return $BytesDict[attr].apply(null,arguments)}
        })($attr)
    }
}

$B.set_func_names($BytesDict)
$B.set_func_names($BytearrayDict)

_b_.bytes = bytes
_b_.bytearray = bytearray

})(__BRYTHON__)
