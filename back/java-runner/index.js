var cp = require('child_process');
// var Docker = require('dockerode');
// var Streams = require('memory-streams');
// var docker = new Docker({socketPath: '/var/run/docker.sock'});
// var docker = new Docker({socketPath: false,host: 'http://192.168.59.103',port:'2375'});
var fs = require('fs');

// run java inside main method using the java built in dynamic compiler
var run = exports.run = function (simple_program,cb) {
    var name = 'Main';
    var cmd = 'java -cp '+__dirname+' -XX:+TieredCompilation -XX:TieredStopAtLevel=1 JavaRunner \'' + simple_program + '\'';
    console.log(cmd);
    cp.exec(cmd,{timeout: 10000}, cb);
};


// exports.run = function (simple_program,cb)
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

var runCMD = exports.runCMD = function (simple_program, cb) {
    cp.exec('docker run --rm  java -XX:+TieredCompilation -XX:TieredStopAtLevel=1 JavaRunner \'' + simple_program + '\'',{timeout: 10000}, cb);
};

var UID = 1;
// run java inside main method using the java built in dnamic compiler
function runByJavaFile(program) {
    var name = 'tempFile' + (UID++);

    fs.writeFile('./' + name + '.java', 'public class ' + name + ' {' + program + '}', function(err) {
        if (err) {
            console.log(err);
        } else {
            cp.exec('javac ' + name + '.java && java -XX:+TieredCompilation -XX:TieredStopAtLevel=1 ' + name, function(err, stdout, stderr) {
                stderr && console.error(stderr);
                stdout && console.log(stdout);
                fs.unlinkSync('./'+name+'.java');
                fs.unlinkSync('./'+name+'.class');
            });
        }
    });
}

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
var runJavaAsScript = exports.runJavaAsScript = function (code, options, cb) {
    if(typeof options==='function') {
        cb = options;
        options = {};
    } else {
        options = options || {};
    }

    var cmd = ['java -cp '+__dirname+':'+__dirname+'/janino/commons-compiler.jar:'+__dirname+'/janino/janino.jar ScriptRunner'];
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
    cmd.push('\'' + code + '\'');
    // value to pass if paramaters are used
    options.values && cmd.push(options.values);

    cp.exec(cmd.join(" "), cb);
};

/**
 * Run a Strign of java code as if it is inside the body of a class
 * @param  {String} code java code to run
 * @param  {String} args a string of arguments to pass to the main method seperated by space
 */
var runJavaAsClassBody = exports.runJavaAsClassBody = function (code, args, cb) {
    var cmd = ['java -cp '+__dirname+':'+__dirname+'/janino/commons-compiler.jar:'+__dirname+'/janino/janino.jar org.codehaus.commons.compiler.samples.ClassBodyDemo'];
    // code to run      
    cmd.push('\'public static void main (String [] args) {\n' + code + '\'\n}');
    // args to pass to main of class
    if(args) {
        cmd.push(args);
        cb = args;
    }

    cp.exec(cmd.join(" "), cb);
};

// var i = 1;
// var time = setInterval(function () {
//     i++;
    
//     // runByJavaFile('public static void main (String [] args) { int a = 30, b = 20;System.out.println("a - b = " + (a - b)); }');
    
    // run('int a = 33, b = 20; System.out.println("a - b = " + (a - b));',function(err, stdout, stderr) {
    //     stderr && console.error(stderr);
    //     stdout && console.log(stdout);
    // });

    runJavaAsScript('int a = 20, b = 20; Syste.out.println("a - b = " + (a - b));',{},function(err, stdout, stderr) {
        stderr && console.error(stderr);
        stdout && console.log(stdout);
    });

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
