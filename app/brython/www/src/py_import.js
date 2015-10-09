// import modules

;(function($B){

var _b_ = $B.builtins

$B.$ModuleDict = {
    __class__ : $B.$type,
    __name__ : 'module'
}
$B.$ModuleDict.__repr__ = $B.$ModuleDict.__str__ = function(self){
    return '<module '+self.__name__+'>'
}
$B.$ModuleDict.__mro__ = [$B.$ModuleDict,_b_.object.$dict]

function module(name,doc,package){
    return {__class__:$B.$ModuleDict,
        __name__:name,
        __doc__:doc||_b_.None,
        __package__:package||_b_.None
    }
}

module.__class__ = $B.$factory
module.$dict = $B.$ModuleDict
$B.$ModuleDict.$factory = module

var loader = function(){}
var Loader = {__class__:$B.$type,
    __name__ : 'Loader'
}
Loader.__mro__ = [Loader, _b_.object.$dict]
Loader.$factory = loader
loader.$dict = Loader
loader.__class__ = $B.$factory

/**
 * Module's parent package name
 */
function parent_package(mod_name) {
    var parts = mod_name.split('.');
    parts.pop();
    return parts.join('.');
}

function $importer(){
    // returns the XMLHTTP object to handle imports
    var $xmlhttp = new XMLHttpRequest();
    if ($B.$CORS && "withCredentials" in $xmlhttp) {
       // Check if the XMLHttpRequest object has a "withCredentials" property.
       // "withCredentials" only exists on XMLHTTPRequest2 objects.
    } else if ($B.$CORS && typeof window.XDomainRequest != "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      $xmlhttp = new window.XDomainRequest();
    } else if (window.XMLHttpRequest){
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      // code for IE7+, Firefox, Chrome, Opera, Safari
      //$xmlhttp=new XMLHttpRequest();  // we have already an instance of XMLHttpRequest
    }else{// code for IE6, IE5
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var fake_qs;
    switch ($B.$options.cache) {
       case 'version':
            fake_qs="?v="+$B.version_info[2]
            break;
       case 'browser':
            fake_qs=''
            break;
       default:
            fake_qs="?v="+$B.UUID()
    }

    var timer = setTimeout( function() {
        $xmlhttp.abort()
        throw _b_.ImportError("No module named '"+module+"'")}, 5000)
    return [$xmlhttp,fake_qs,timer]
}

function $download_module(module,url){
    var imp = $importer(),
        $xmlhttp = imp[0],fake_qs=imp[1],timer=imp[2],res=null,
        mod_name = module.__name__

    $xmlhttp.open('GET',url+fake_qs,false)

    if ($B.$CORS) {
      $xmlhttp.onload=function() {
         if ($xmlhttp.status == 200 || $xmlhttp.status == 0) {
            res = $xmlhttp.responseText
         } else {
            res = _b_.FileNotFoundError("No module named '"+mod_name+"'")
         }
      }
      $xmlhttp.onerror=function() {
         res = _b_.FileNotFoundError("No module named '"+mod_name+"'")
      }
    } else {
      $xmlhttp.onreadystatechange = function(){
        if($xmlhttp.readyState==4){
            window.clearTimeout(timer)
            if($xmlhttp.status==200 || $xmlhttp.status==0){
                res=$xmlhttp.responseText
                module.$last_modified = $xmlhttp.getResponseHeader('Last-Modified')
            }else{
                // don't throw an exception here, it will not be caught (issue #30)
                console.log('Error '+$xmlhttp.status+
                    ' means that Python module '+mod_name+
                    ' was not found at url '+url)
                res = _b_.FileNotFoundError("No module named '"+mod_name+"'")
            }
        }
      }
    }
    if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
    $xmlhttp.send()

    //sometimes chrome doesn't set res correctly, so if res == null, assume no module found
    if(res == null) throw _b_.FileNotFoundError("No module named '"+mod_name+"' (res is null)")

    if(res.constructor===Error){throw res} // module not found
    return res
}

$B.$download_module=$download_module

function import_js(module,path) {
    try{var module_contents=$download_module(module, path)}
    catch(err){return null}
    run_js(module_contents,path,module)
    return true
}

function run_js(module_contents,path,module){
    // FIXME : Enhanced module isolation e.g. run_js arg names , globals ...
    try{
        eval(module_contents);
    }catch(err){
        console.log(err)
        throw err
    }
    // check that module name is in namespace
    try{$module}
    catch(err){
        throw _b_.ImportError("name '$module' is not defined in module")
    }
    if (module !== undefined) {
        // FIXME : This might not be efficient . Refactor js modules instead.
        // Overwrite original module object . Needed e.g. for reload()
        for (var attr in $module) { module[attr] = $module[attr]; }
        $module = module;
    }
    else {
        // add class and __str__
        $module.__class__ = $B.$ModuleDict
        $module.__name__ = module.name
        $module.__repr__=$module.__str__ = function(){
          if ($B.builtin_module_names.indexOf(module.name) > -1) {
             return "<module '"+module.name+"' (built-in)>"
          }

          //if(module.name == 'builtins') return "<module '"+module.name+"' (built-in)>"
          return "<module '"+module.name+"' from "+path+" >"
        }

        $module.toString = function(){return "<module '"+module.name+"' from "+path+" >"}
        if(module.name != 'builtins') { // builtins do not have a __file__ attribute
          $module.__file__ = path
        }
    }
    return true
}

function show_ns(){
    var kk = Object.keys(window)
    for (var i=0, _len_i = kk.length; i < _len_i; i++){
        console.log(kk[i])
        if(kk[i].charAt(0)=='$'){console.log(eval(kk[i]))}
    }
    console.log('---')
}

function import_py(module,path,package){
    // import Python module at specified path
    var mod_name = module.__name__,
        module_contents = $download_module(module, path)
    $B.imported[mod_name].$is_package = module.$is_package
    $B.imported[mod_name].$last_modified = module.$last_modified
    if(path.substr(path.length-12)=='/__init__.py'){
        //module.is_package = true
        $B.imported[mod_name].__package__ = mod_name
        $B.imported[mod_name].$is_package = module.$is_package = true
    }else if(package){
        $B.imported[mod_name].__package__ = package
    }else{
        var mod_elts = mod_name.split('.')
        mod_elts.pop()
        $B.imported[mod_name].__package__ = mod_elts.join('.')
    }
    $B.imported[mod_name].__file__ = path
    return run_py(module_contents,path,module)
}

//$B.run_py is needed for import hooks..
$B.run_py=run_py=function(module_contents,path,module,compiled) {
    if (!compiled) {
        var $Node = $B.$Node,$NodeJSCtx=$B.$NodeJSCtx
        $B.$py_module_path[module.__name__]=path

        var root = $B.py2js(module_contents,module.__name__,
            module.__name__,'__builtins__')

        var body = root.children
        root.children = []
        // use the module pattern : module name returns the results of an anonymous function
        var mod_node = new $Node('expression')
        new $NodeJSCtx(mod_node,'var $module=(function()')
        root.insert(0,mod_node)
        for(var i=0, _len_i = body.length; i < _len_i;i++){mod_node.add(body[i])}

        // $globals will be returned when the anonymous function is run
        var ret_node = new $Node('expression')
        new $NodeJSCtx(ret_node,'return $locals_'+module.__name__.replace(/\./g,'_'))
        mod_node.add(ret_node)
        // add parenthesis for anonymous function execution

        var ex_node = new $Node('expression')
        new $NodeJSCtx(ex_node,')(__BRYTHON__)')
        root.add(ex_node)
    }

    try{
        var js = (compiled)? module_contents : root.to_js()
        if ($B.$options.debug == 10) {
           console.log('code for module '+module.__name__)
           console.log(js)
        }
        eval(js)

    }catch(err){
        console.log(err+' for module '+module.__name__)
        //console.log(module_contents)
        //for(var attr in err){
            //console.log(attr, err[attr])
        //}
        console.log('message: '+err.$message)
        console.log('filename: '+err.fileName)
        console.log('linenum: '+err.lineNumber)
        if($B.debug>0){console.log('line info '+ $B.line_info)}
        throw err
    }

    try{
        // Create module object
        var mod = eval('$module')
        // Apply side-effects upon input module object
        for (var attr in mod) {
            module[attr] = mod[attr];
        }
        module.__initializing__ = false
        // $B.imported[mod.__name__] must be the module object, so that
        // setting attributes in a program affects the module namespace
        // See issue #7
        $B.imported[module.__name__] = module
        return true
    }catch(err){
        console.log(''+err+' '+' for module '+module.name)
        for(var attr in err) console.log(attr+' '+err[attr])

        if($B.debug>0){console.log('line info '+__BRYTHON__.line_info)}
        throw err
    }
}

function new_spec(fields) {
    // TODO : Implement ModuleSpec class i.e. not a module object
    // add Python-related fields
    fields.__class__ = $B.$ModuleDict
    return fields;
}

// Virtual File System optimized module import
function finder_VFS(){
    return {__class__:finder_VFS.$dict}
}
finder_VFS.__class__ = $B.$factory

finder_VFS.$dict = {
    $factory: finder_VFS,
    __class__: $B.$type,
    __name__: 'VFSFinder',

    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None;
    },

    exec_module : function(cls, module) {
        var stored = module.__spec__.loader_state.stored;
        delete module.__spec__['loader_state'];
        var ext = stored[0],
            module_contents = stored[1];
        module.$is_package = stored[2];
        var path = $B.brython_path+'Lib/'+module.__name__
        if(module.$is_package){path += '/__init__.py'}
        module.__file__ = path
        if (ext == '.js') {run_js(module_contents, module.__path__, module)}
        else {run_py(module_contents, module.__path__, module, ext=='.pyc.js')}
        if($B.debug>1){console.log('import '+module.__name__+' from VFS')}
    },

    find_module: function(cls, name, path){
        return {__class__:Loader,
            load_module:function(name, path){
                var spec = cls.$dict.find_spec(cls, name, path)
                var mod = module(name)
                $B.imported[name] = mod
                mod.__spec__ = spec
                cls.$dict.exec_module(cls, mod)
            }
        }
    },

    find_spec : function(cls, fullname, path, prev_module) {
        if (!$B.use_VFS) {
            return _b_.None;
        }
        var stored = $B.VFS[fullname];
        if (stored===undefined) {
            return _b_.None;
        }
        var is_package = stored[2],
            is_builtin = $B.builtin_module_names.indexOf(fullname) > -1;
        return new_spec({name : fullname,
                         loader: cls,
                         // FIXME : Better origin string.
                         origin : is_builtin? 'built-in' : 'py_VFS',
                         // FIXME: Namespace packages ?
                         submodule_search_locations: is_package? [] : _b_.None,
                         loader_state: {stored: stored},
                         // FIXME : Where exactly compiled module is stored ?
                         cached: _b_.None,
                         parent: is_package? fullname : parent_package(fullname),
                         has_location: _b_.False});
    }
}

finder_VFS.$dict.__mro__ = [finder_VFS.$dict, _b_.object.$dict]
finder_VFS.$dict.create_module.$type = 'classmethod'
finder_VFS.$dict.exec_module.$type = 'classmethod'
finder_VFS.$dict.find_module.$type = 'classmethod'
finder_VFS.$dict.find_spec.$type = 'classmethod'

/**
 * Module importer optimizing module lookups via stdlib_paths.js
 */

function finder_stdlib_static(){
    return {__class__:finder_stdlib_static.$dict}
}
finder_stdlib_static.__class__ = $B.$factory

finder_stdlib_static.$dict = {
    $factory : finder_stdlib_static,
    __class__ : $B.$type,
    __name__ : 'StdlibStatic',
    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None;
    },
    exec_module : function(cls, module) {
        var metadata = module.__spec__.loader_state;
        delete module.__spec__['loader_state'];
        module.$is_package = metadata.is_package; 
        if (metadata.ext == 'py') {
            import_py(module, metadata.path, module.__package__);
        }
        else {
            import_js(module, metadata.path);
        }
    },
    find_module: function(cls, name, path){
        return {__class__:Loader,
            load_module:function(name, path){
                var spec = cls.$dict.find_spec(cls, name, path)
                var mod = module(name)
                $B.imported[name] = mod
                mod.__spec__ = spec
                cls.$dict.exec_module(cls, mod)
            }
        }
    },
    find_spec: function(cls, fullname, path, prev_module) {
        if ($B.stdlib) {
            var address = $B.stdlib[fullname];
            if(address===undefined){
                var elts = fullname.split('.')
                if(elts.length>1){
                    var mod_name = elts.pop()
                    var package = $B.stdlib[elts.join('.')]
                    if(package && package[1]){address = ['py']}
                }
            }
            if (address !== undefined) {
                var ext = address[0],
                    is_pkg = address[1] !== undefined,
                    path = $B.brython_path + ((ext == 'py')? 'Lib/' : 'libs/') +
                           fullname.replace(/\./g, '/'),
                    metadata = {ext: ext,
                                is_package: is_pkg,
                                path: path + (is_pkg? '/__init__.py' :
                                              ((ext == 'py')? '.py' : '.js')),
                                address: address}

                var res = new_spec(
                    {name : fullname,
                     loader: cls,
                     // FIXME : Better origin string.
                     origin : metadata.path,
                     submodule_search_locations: is_pkg? [path] : _b_.None,
                     loader_state: metadata,
                     // FIXME : Where exactly compiled module is stored ?
                     cached: _b_.None,
                     parent: is_pkg? fullname :
                                         parent_package(fullname),
                     has_location: _b_.True});
                 return res
            }
        }
        return _b_.None;
    }
}
finder_stdlib_static.$dict.__mro__ = [finder_stdlib_static.$dict,
    _b_.object.$dict]
finder_stdlib_static.$dict.create_module.$type = 'classmethod'
finder_stdlib_static.$dict.exec_module.$type = 'classmethod'
finder_stdlib_static.$dict.find_module.$type = 'classmethod'
finder_stdlib_static.$dict.find_spec.$type = 'classmethod'

/**
 * Search an import path for .py modules
 */
function finder_path(){
    return {__class__:finder_path.$dict}
}
finder_path.__class__ = $B.$factory

finder_path.$dict = {
    $factory: finder_path,
    __class__: $B.$type,
    __name__: 'ImporterPath',

    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None;
    },

    exec_module : function(cls, module) {
        var _spec = _b_.getattr(module, '__spec__'),
            code = _spec.loader_state.code;
        module.$is_package = _spec.loader_state.is_package,
        delete _spec.loader_state['code'];
        var src_type = _spec.loader_state.type
        if (src_type == 'py' || src_type == 'pyc.js') {
            run_py(code, _spec.origin, module, src_type=='pyc.js');
        }
        else if (_spec.loader_state.type == 'js') {
            run_js(code, _spec.origin, module)
        }
    },

    find_module: function(cls, name, path){
        return finder_path.find_spec(cls, name, path)
    },

    find_spec : function(cls, fullname, path, prev_module) {
        if (is_none(path)) {
            // [Import spec] Top-level import , use sys.path
            path = $B.path
        }
        for (var i = 0, li = path.length; i<li; ++i) {
            var path_entry = path[i];
            if (path_entry[path_entry.length - 1] != '/') {
                path_entry += '/'
            }
            // Try path hooks cache first
            var finder = $B.path_importer_cache[path_entry];
            if (finder === undefined) {
                var finder_notfound = true;
                for (var j = 0, lj = $B.path_hooks.length;
                     j < lj && finder_notfound;
                     ++j) {
                    var hook = $B.path_hooks[j];
                    try {
                        finder = _b_.getattr(hook, '__call__')(path_entry)
                        finder_notfound = false;
                    }
                    catch (e) {
                        if (e.__class__ !== _b_.ImportError.$dict) { throw e; }
                    }
                }
                if (finder_notfound) {
                    $B.path_importer_cache[path_entry] = _b_.None;
                }
            }
            var spec = _b_.getattr(_b_.getattr(finder, 'find_spec'),
                                   '__call__')(fullname, prev_module);
            if (!is_none(spec)) {
                return spec;
            }
        }
        return _b_.None;
    }
}

finder_path.$dict.__mro__ = [finder_path.$dict,
    _b_.object.$dict]
finder_path.$dict.create_module.$type = 'classmethod'
finder_path.$dict.exec_module.$type = 'classmethod'
finder_path.$dict.find_module.$type = 'classmethod'
finder_path.$dict.find_spec.$type = 'classmethod'


/**
 * Find modules packaged in a js script to be used as a virtual file system
 *
 * @param {string}      URL pointing at location of VFS js file
 */

function vfs_hook(path) {
    if (path.substr(-1) == '/') {
        path = path.slice(0, -1);
    }
    var ext = path.substr(-7);
    if (ext != '.vfs.js') {
        throw _b_.ImportError('VFS file URL must end with .vfs.js extension');
    }
    self = {__class__: vfs_hook.$dict, path: path};
    vfs_hook.$dict.load_vfs(self);
    return self;
}

vfs_hook.__class__ = $B.$factory

vfs_hook.$dict = {
    $factory: vfs_hook,
    __class__: $B.$type,
    __name__: 'VfsPathFinder',

    load_vfs: function(self) {
        try { var code = $download_module({__name__:'<VFS>'}, self.path) }
        catch (e) {
            self.vfs = undefined;
            throw new _b_.ImportError(e.$message || e.message);
        }
        eval(code);
        try {
            self.vfs = $vfs;
        }
        catch (e) { throw new _b_.ImportError('Expecting $vfs var in VFS file'); }
        $B.path_importer_cache[self.path + '/'] = self;
    },
    find_spec: function(self, fullname, module) {
        if (self.vfs === undefined) {
            try { vfs_hook.$dict.load_vfs(self) }
            catch(e) {
                console.log("Could not load VFS while importing '" + fullname + "'");
                return _b_.None;
            }
        }
        var stored = self.vfs[fullname];
        if (stored === undefined) {
            return _b_.None;
        }
        var is_package = stored[2];
        return new_spec({name : fullname,
                         loader: finder_VFS,
                         // FIXME : Better origin string.
                         origin : self.path + '#' + fullname,
                         // FIXME: Namespace packages ?
                         submodule_search_locations: is_package? [self.path] :
                                                                 _b_.None,
                         loader_state: {stored: stored},
                         // FIXME : Where exactly compiled module is stored ?
                         cached: _b_.None,
                         parent: is_package? fullname : parent_package(fullname),
                         has_location: _b_.True});
    },
    invalidate_caches: function(self) {
        self.vfs = undefined;
    }
}
vfs_hook.$dict.__mro__ = [vfs_hook.$dict, _b_.object.$dict]

/**
 * Find modules deployed in a hierarchy under a given base URL
 *
 * @param {string}      search path URL, used as a reference during ihe import
 * @param {string}      one of 'js', 'py' or undefined (i.e. yet unknown)
 */

function url_hook(path_entry, hint) { 
    return {__class__: url_hook.$dict, path_entry:path_entry, hint:hint }
}
url_hook.__class__ = $B.$factory

url_hook.$dict = {
    $factory: url_hook,
    __class__: $B.$type,
    __name__ : 'UrlPathFinder',
    __repr__: function(self) {
        return '<UrlPathFinder' + (self.hint? " for '" + self.hint + "'":
                                   "(unbound)") + ' at ' + self.path_entry + '>'
    },

    find_spec : function(self, fullname, module) {
        var loader_data = {},
            notfound = true,
            hint = self.hint,
            base_path = self.path_entry + fullname.match(/[^.]+$/g)[0],
            modpaths = [];
        var tryall = hint === undefined;
        if (tryall || hint == 'js') {
            // either js or undefined , try js code
            modpaths = [[base_path + '.js', 'js', false]];
        }
        if (tryall || hint == 'pyc.js') {
            // either pyc or undefined , try pre-compiled module code
            modpaths = modpaths.concat([[base_path + '.pyc.js', 'pyc.js', false],
                                        [base_path + '/__init__.pyc.js',
                                         'pyc.js', true]]);
        }
        if (tryall || hint == 'py') {
            // either py or undefined , try py code
            modpaths = modpaths.concat([[base_path + '.py', 'py', false],
                                         [base_path + '/__init__.py', 'py', true]]);
        }

        for (var j = 0; notfound && j < modpaths.length; ++j) {
            try{
                var file_info = modpaths[j];
                loader_data.code=$download_module({__name__:fullname}, file_info[0]);
                notfound = false;
                loader_data.type = file_info[1];
                loader_data.is_package = file_info[2];
                if (hint === undefined) {
                    self.hint = file_info[1];
                    // Top-level import
                    $B.path_importer_cache[self.path_entry] = self;
                }
                if (loader_data.is_package) {
                    // Populate cache in advance to speed up submodule imports
                    $B.path_importer_cache[base_path + '/'] =
                            url_hook(base_path + '/', self.hint);
                }
                loader_data.path = file_info[0];
            }catch(err){
            }
        }
        if (!notfound) {
            return new_spec({
                name : fullname,
                loader: finder_path,
                origin : loader_data.path,
                // FIXME: Namespace packages ?
                submodule_search_locations: loader_data.is_package? [base_path]:
                                                                    _b_.None,
                loader_state: loader_data,
                // FIXME : Where exactly compiled module is stored ?
                cached: _b_.None,
                parent: loader_data.is_package? fullname :
                                                parent_package(fullname),
                has_location: _b_.True});
        }
        return _b_.None;
    },

    invalidate_caches : function(self) {
        // TODO: Implement
    }
}
url_hook.$dict.__mro__ = [url_hook.$dict, _b_.object.$dict]

// FIXME : Add this code elsewhere ?
$B.path_hooks = [vfs_hook, url_hook];
$B.path_importer_cache = {};
// see #247 - By adding these early some unnecesary AJAX requests are not sent
var _sys_paths = [[$B.script_dir + '/', 'py'],
                  [$B.brython_path + 'Lib/', 'py'],
                  [$B.brython_path + 'Lib/site-packages/', 'py'],
                  [$B.brython_path + 'libs/', 'js']];

for (i = 0; i < _sys_paths.length; ++i) {
    var _path = _sys_paths[i],
        _type = _path[1];
    _path = _path[0];
    $B.path_importer_cache[_path] = url_hook(_path, _type);
}
delete _path;
delete _type;
delete _sys_paths;

$B.is_none = function (o) {
    return o === undefined || o == _b_.None;
}

// Default __import__ function
// TODO: Include at runtime in importlib.__import__
$B.$__import__ = function (mod_name, locals, fromlist){
   // [Import spec] Halt import logic
   var modobj = $B.imported[mod_name],
       parsed_name = mod_name.split('.');
   if (modobj == _b_.None) {
       // [Import spec] Stop loading loop right away
       throw _b_.ImportError(parent_name) 
   }

   if (modobj === undefined) {
       // [Import spec] Argument defaults and preconditions
       // get name of module this was called in
       if (is_none(fromlist)) {
            fromlist = [];
       }
       // TODO: Async module download and request multiplexing
       for (var i = 0, modsep = '', _mod_name = '', l = parsed_name.length - 1,
                __path__ = _b_.None; i <= l; ++i) {
            var _parent_name = _mod_name;
            _mod_name += modsep + parsed_name[i];
            modsep = '.';
            var modobj = $B.imported[_mod_name];
            if (modobj == _b_.None) {
                // [Import spec] Stop loading loop right away
                throw _b_.ImportError(_mod_name) 
            }
            else if (modobj === undefined) {
                try {$B.import_hooks(_mod_name, __path__)}
                catch(err) {
                    delete $B.imported[_mod_name]
                }

                if (is_none($B.imported[_mod_name])) {
                    throw _b_.ImportError(_mod_name) 
                }
                else {
                    // [Import spec] Preserve module invariant
                    // FIXME : Better do this in import_hooks ?
                    if (_parent_name) {
                        _b_.setattr($B.imported[_parent_name], parsed_name[i],
                                    $B.imported[_mod_name]);
                    }
                }
            }
            // else { } // [Import spec] Module cache hit . Nothing to do.
            // [Import spec] If __path__ can not be accessed an ImportError is raised
            if (i < l) {
                try { __path__ = _b_.getattr($B.imported[_mod_name], '__path__') }
                catch (e) { throw _b_.ImportError(_mod_name) }
            }
       }
   }
   // else { } // [Import spec] Module cache hit . Nothing to do.

   if (fromlist.length > 0) {
        // Return module object matching requested module name
        return $B.imported[mod_name]
   }
   else {
        // Return module object for top-level package
        return $B.imported[parsed_name[0]]
   }
}

/**
 * Import a module and create corresponding bindings in the local namespace
 * 
 * The function sets __BRYTHON__.modules[mod_name] and 
 * __BRYTHON__.imported[mod_name] to an object representing the
 * imported module, or raises ImportError if the module couldn't be
 * found or loaded
 *
 * @param {string}      Module name specified in the import statement
 * @param {list}        Attribute names specified in from statement
 * @param {dict}        Aliases used to override local variable name bindings
 * @param {dict}        Local namespace import bindings will be applied upon
 * @return None
 */
$B.$import = function(mod_name, fromlist, aliases, locals){
    var parts = mod_name.split('.');
    // For . , .. and so on , remove one relative step
    if (mod_name[mod_name.length - 1] == '.') { parts.pop() }
    var norm_parts = [],
        prefix = true;
    for(var i = 0, _len_i = parts.length; i < _len_i;i++){
        var p = parts[i];
        if (prefix && p == '') {
            // Move up in package hierarchy
            elt = norm_parts.pop();
            if (elt === undefined) {
                throw _b_.ImportError("Parent module '' not loaded, cannot perform relative import");
            }
        }
        else {
            prefix=false;
            norm_parts.push(p.substr(0,2)=='$$' ? p.substr(2) : p)
        }
    }
    var mod_name = norm_parts.join('.')

    if ($B.$options.debug == 10) {
       console.log('$import '+mod_name+' origin '+origin)
       console.log('use VFS ? '+$B.use_VFS)
       console.log('use static stdlib paths ? '+$B.static_stdlib_import)  
    }
    //if ($B.$options.debug == 10) {show_ns()}

    // [Import spec] Resolve __import__ in global namespace
    var current_frame = $B.frames_stack[$B.frames_stack.length-1],
        globals = current_frame[3],
        __import__ = globals['__import__'];
    if (__import__ === undefined) {
        // [Import spec] Fall back to
        __import__ = $B.$__import__;
    }
    // FIXME: Should we need locals dict supply it in, now it is useless
    var modobj = _b_.getattr(__import__,
                             '__call__')(mod_name, undefined, fromlist);

    // Apply bindings upon local namespace
    if (!fromlist || fromlist.length == 0) {
        // import mod_name [as alias]
        // FIXME : Ensure this will work for relative imports
        var alias = aliases[mod_name];
        if (alias) {
            locals[alias] = $B.imported[mod_name];
        }
        else {
            locals[norm_parts[0]] = modobj;
            // TODO: After binding 'a' should we also bind 'a.b' , 'a.b.c' , ... ? 
        }
    }
    else {
        var __all__ = fromlist,
            thunk = {};
        if (fromlist && fromlist[0] == '*') {
            __all__ = _b_.getattr(modobj, '__all__', thunk);
            if (__all__ !== thunk) {
                // from modname import * ... when __all__ is defined
                // then fallback to importing __all__ names with no alias
                aliases = {};
            }
        }
        if (__all__ === thunk) {
            // from mod_name import * ... when __all__ is not defined
            for (var attr in modobj) {
                if (attr[0] !== '_') {
                    locals[attr] = modobj[attr];
                }
            }
        }
        else {
            // from mod_name import N1 [as V1], ... Nn [as Vn]
            // from modname import * ... when __all__ is defined
            for (var i = 0, l = __all__.length; i < l; ++i) {
                var name = __all__[i];
                var alias = aliases[name] || name;
                try {
                    // [Import spec] Check if module has an attribute by that name
                    locals[alias] = _b_.getattr(modobj, name);
                }
                catch ($err1) {
                    // [Import spec] attempt to import a submodule with that name ...
                    // FIXME : level = 0 ? level = 1 ?
                    try {
                        _b_.getattr(__import__,
                                    '__call__')(mod_name + '.' + name,
                                                 undefined, []);
                    }
                    catch ($err2) {
                        if ($err2.__class__ = _b_.ImportError.$dict) {
                            throw _b_.ImportError("cannot import name '" + name + "'")
                        }
                        throw $err2;
                    }
                    try {
                        // [Import spec] ... then check imported module again for name
                        locals[alias] = _b_.getattr(modobj, name);
                    }
                    catch ($err3) {
                        console.log('error', $err3)
                        // [Import spec] On attribute not found , raise ImportError
                        if ($err3.__class__ === _b_.AttributeError.$dict) {
                            $err3.__class__ = _b_.ImportError.$dict;
                        }
                    }
                }
            }
        }
    }
}

$B.meta_path = [finder_VFS, finder_stdlib_static, finder_path];

function optimize_import_for_path(path, filetype) {
    if (path.slice(-1) != '/') { path = path + '/' }
    // Ensure sys is loaded
    $B.path_importer_cache[path] = url_hook(path, filetype);
}

// Introspection for builtin importers

_importlib_module = {
    __class__ : $B.$ModuleDict,
    __name__ : '_importlib',
    Loader: Loader,
    VFSFinder: finder_VFS,
    StdlibStatic: finder_stdlib_static,
    ImporterPath: finder_path,
    VFSPathFinder : vfs_hook,
    UrlPathFinder: url_hook,
    optimize_import_for_path : optimize_import_for_path
}
_importlib_module.__repr__ = _importlib_module.__str__ = function(){
return "<module '_importlib' (built-in)>"
}
$B.imported['_importlib'] = $B.modules['_importlib'] = _importlib_module

})(__BRYTHON__)
