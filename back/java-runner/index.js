var cp = require('child_process');
var path = require('path');
var Parallel = require('paralleljs');
var _ = require('lodash');
// var Docker = require('dockerode');
// var Streams = require('memory-streams');
// var docker = new Docker({socketPath: '/var/run/docker.sock'});
// var docker = new Docker({socketPath: false,host: 'http://192.168.59.103',port:'2375'});
var fs = require('fs');
var running=0;
var proc;
var procCount = 0;
var procMax = Math.min(require('os').cpus().length, 4);

function runProc(args, cb) {
    var stoutBuffer = '',
        sterrBuffer = '';
    var proc = cp.spawn('java', args, {
        cwd: __dirname
    });
    proc.stdout.on('data', function(data) {
        stoutBuffer += data;
    });
    proc.stderr.on('data', function(data) {
        sterrBuffer += data;
    });
    proc.on('close', function(code) {
        if (code === null) {
            console.error(code);
            cb(code);
        } else {
            cb(null, stoutBuffer, sterrBuffer);
        }
        running--;
    });
}
// run java inside main method using the java built in dynamic compiler
var run = exports.run = function(code, options, cb) {

    if (typeof options === 'function') {
        cb = options;
        options = {};
    } else {
        options = options || {};
    }
    var args = ["-cp", __dirname, "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "JavaRunner"];
    var pre = (options.preCode || '').replace(/\/\/.*$/gm, '').replace(/\r?\n|\r/g, ' ');
    var post = (options.postCode || '');
    var name = "Main";
    // <comma-separated-default-imports>        (default: none)
    var preClass = '';
    if (options.di) {
        preClass += _.reduce(options.di.split(','), function(s, i) {
            return s + 'import ' + i + ';';
        }, '');
    }
    // code to run
    code = pre + '\n' + code + '\n' + post;
    // escape " and $ because of terminal
    // code = code.replace(/"/g,'\\"').replace(/\$/g,'\\$');

    var program = "";
    program += preClass;
    program += "public class " + name + " {";
    program += "  public static void main(String args[]) {try {\n";
    program += "    " + code;
    program += '  } catch (Exception e) {System.err.print("Exception line "+(e.getStackTrace()[0].getLineNumber())+" "+e);}}' +
        "}";

    // console.log(code);
    args.push(name);
    args.push(program);

    // console.log(cmd.join(" "));
    // cp.exec('java '+args.join(" "),{timeout: 10000,cwd:__dirname},cb);
    if(running<1) {
        running++;
        runProc(args,cb);
    } else {
        running++;
        console.log(running);
        _.delay(function () {
           runProc(args,cb);
        },running*250);
    }
    // if (!proc) {
    //     proc = cp.fork(path.join(__dirname,'run-worker.js'));
    //     proc.on('message', function(data) {
    //         cb(data.error, data.stout, data.sterr);
    //     });
    // }
    // proc.send({
    //     args: args,
    //     cwd:__dirname
    // });
};


// exports.run = function (code,cb)
// {
//     var stderr = new Streams.WritableStream(),
//         stdout = new Streams.WritableStream();
//     docker.run('draz/java-runner:0.2', ['java -XX:+TieredCompilation -XX:TieredStopAtLevel=1 JavaRunner \'' + simple_program + '\''], [stdout, stderr], {Tty: false}, function (error, data, container)
//     {
//         // make sure the container is removed
//         if (container)
//         {
//             container.remove(function (err, data)
//             {
//                 console.log("container removed " + (err || data));
//             });
//         }

//         cb(error, stdout.toString(), stderr.toString());
//     });
// };

var runCMD = exports.runCMD = function(simple_program, cb) {
    cp.exec('docker run --rm draz/java-runner:0.3 java -XX:+TieredCompilation -XX:TieredStopAtLevel=1 JavaRunner "Main" "' + simple_program + '"', {
        timeout: 10000,
        cwd: __dirname
    }, cb);
};

// var UID = 1;
// // run java inside main method using the java built in dnamic compiler
// function runByJavaFile(program) {
//     var name = 'tempFile' + (UID++);

//     fs.writeFile('./' + name + '.java', 'public class ' + name + ' {' + program + '}', function(err) {
//         if (err) {
//             console.log(err);
//         } else {
//             cp.exec('javac ' + name + '.java && java -XX:+TieredCompilation -XX:TieredStopAtLevel=1 ' + name, function(err, stdout, stderr) {
//                 stderr && console.error(stderr);
//                 stdout && console.log(stdout);
//                 fs.unlinkSync('./'+name+'.java');
//                 fs.unlinkSync('./'+name+'.class');
//             });
//         }
//     });
// }

/**
 * Runs a String of java code as if it is inside a method
 * @param  {String} code    Java code to run
 * @param  {Object} options some flags that can wrap the running code
 *                          rt specifiy a return type default is void
 *                          pn comma seperated paramater names
 *                          pt comma seperated paramater types
 *                          te comma seperated throw exception types
 *                          di comma seperated default imports
 *                          values space seperated values for the paramaters
 *                          paramaters names,types and values need to match count
 */
var runJavaAsScript = exports.runJavaAsScript = function(code, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = {};
    } else {
        options = options || {};
    }

    var cmd = ['java -cp ' + __dirname + ':' + __dirname + '/janino/commons-compiler.jar:' + __dirname + '/janino/janino.jar ScriptRunner'];
    var pre = (options.preCode || '').replace(/\/\/.*$/gm, ''); //.replace(/\r?\n|\r/g, ' ');
    var post = (options.postCode || '');

    // <return-type>                            (default: void)
    options.rt && cmd.push('-rt', options.rt);
    // <comma-separated-parameter-names>        (default: none)
    options.pn && cmd.push('-pn', options.pn);
    // <comma-separated-parameter-types>        (default: none)
    options.pt && cmd.push('-pt', options.pt);
    // <comma-separated-thrown-exception-types> (default: none)
    options.te && cmd.push('-te', options.te);
    // <comma-separated-default-imports>        (default: none)
    options.di && cmd.push('-di', options.di);
    // code to run
    code = pre + code + '\n' + post;
    // escape " and $ because of terminal
    code = code.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    // console.log(code);
    cmd.push('"' + code + '"');

    // value to pass if paramaters are used
    options.values && cmd.push(options.values);

    // console.log(cmd.join(' '));
    cp.exec(cmd.join(" "), {
        timeout: 10000
    }, cb);
};

var testJavaAsScript = exports.testJavaAsScript = function(code, test, options, cb) {
    if (_.isEmpty(code)) cb(new Error('code can not be undefined'));
    if (!test) cb(new Error('test can not be undefined'));
    if (!options.exp) cb(new Error('challange must have exp'));
    var hash = _.random(0, 200000000);
    var opt = _.clone(options);
    //capture sys streams and set uniq test hash
    opt.preCode = 'final ByteArrayOutputStream $userOut = new ByteArrayOutputStream();\n' +
        'final ByteArrayOutputStream $userErr = new ByteArrayOutputStream();\n' +
        'final PrintStream _$sysOut = System.out;\n' +
        'final PrintStream _$sysErr = System.err;\n' +
        'System.setOut(new PrintStream($userOut));\n' +
        'System.setErr(new PrintStream($userErr));\n' +
        'Test.setHash("' + hash + '");' +
        (opt.preCode || '');
    opt.postCode = (opt.postCode || '') + '\n' +
        'System.setOut(_$sysOut);' +
        'System.setErr(_$sysErr);' + '\n' +
        test;
    opt.di = (opt.di || '') + (opt.di ? ',' : '') + 'java.io.ByteArrayOutputStream,java.io.PrintStream';

    run(code, opt, function(err, stout, sterr) {
        if (err && !sterr) return cb(err);
        // console.log(stout);
        var report = {
            passed: false,
            score: 0,
            passes: [],
            failures: [],
            tests: []
        };
        var tests = stout.match(new RegExp("<\\[" + hash + "\\]>(.*)<\\[" + hash + "\\]>", "g")) || [];
        if (!_.isEmpty(tests)) {
            tests = report.tests = JSON.parse(('[' + tests.join(',') + ']').replace(new RegExp("<\\[" + hash + "\\]>", 'g'), ''));
            report.passes = _.filter(tests, 'pass');
            report.failures = _.reject(tests, 'pass');
            report.score = _.reduce(tests, function(sum, t) {
                return sum + t.score;
            }, 0);
            report.score = Math.max(0, Math.min(report.score, options.exp));
            report.passed = report.passes.length === tests.length;
        }
        cb(null, report, stout, sterr);
    });
};

/**
 * Run a Strign of java code as if it is inside the body of a class
 * @param  {String} code java code to run
 * @param  {String} args a string of arguments to pass to the main method seperated by space
 */
var runJavaAsClassBody = exports.runJavaAsClassBody = function(code, args, cb) {
    var cmd = ['java -cp ' + __dirname + ':' + __dirname + '/janino/commons-compiler.jar:' + __dirname + '/janino/janino.jar org.codehaus.commons.compiler.samples.ClassBodyDemo'];
    // code to run      
    cmd.push('\'public static void main (String [] args) {\n' + code + '\'\n}');
    // args to pass to main of class
    if (args) {
        cmd.push(args);
        cb = args;
    }

    cp.exec(cmd.join(" "), cb);
};

// var i = 1;
// var time = setInterval(function () {
//     i++;

//     // runByJavaFile('public static void main (String [] args) { int a = 30, b = 20;System.out.println("a - b = " + (a - b)); }');

//     // runJavaInMain('int a = 30, b = 20; System.out.println("a - b = " + (a - b));');

//     // runJavaAsScript('System.out.println("a - b = " + (a - b));', {pn:'a,b', pt:'double,double', values:'63.0 45.3'});

//     // runJavaAsScript('int a = 30, b = 20;System.out.println("a - b = " + (a - b));');


//     if(i===20) {
//         clearInterval(time);
//     }
// }, 500);


// runJavaAsClassBody('public static void main (String [] args) { System.out.println("Hello World") ; }');

// runJavaAsClassBody('import java.util.*;\n\
//  \n\
// // Field declaration:\n\
// private static final String hello = "World";\n\
//  \n\
// // Method declaration:\n\
// public static void main(String[] args) {\n\
//     System.out.println("hello" + args.length);\n\
// }','alpha beta gama');
