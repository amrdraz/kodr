
import java.io.IOException;
import java.io.BufferedWriter;
import java.io.PrintStream;
import java.io.File;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

import java.net.URI;
import java.util.Arrays;
import java.util.Locale;
import java.nio.charset.Charset;
import java.util.logging.Logger;
import java.util.ArrayList;
import java.util.List;
import java.lang.reflect.*;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.ExecutionException;
import java.util.ResourceBundle;

import javax.tools.StandardLocation;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import java.security.SecureClassLoader;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileManager;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.FileObject;
import javax.tools.JavaFileObject.Kind;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;





/**
 * A class for dynamic runinng JavaCode form a Sting.
 */
public class JavaRunner {

    public static void compile(String name, String code){
      compile(name,code,5000);
    }
    /**
     * compiles and runs main method from code
     * @param name      Class Name
     * @param code      String to compile
     * @param timeLimit (otional) limit for code to run, default to 5 seconds
     */
    public static void compile(String name, String code, int timeLimit){

        /*Creating dynamic java source code file object*/
        SimpleJavaFileObject fileObject = new DynamicJavaSourceCodeObject (name, code) ;
        JavaFileObject javaFileObjects[] = new JavaFileObject[]{fileObject} ;
        
        /*Instantiating the java compiler*/
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
 
        /**
         * Retrieving the standard file manager from compiler object, which is used to provide
         * basic building block for customizing how a compiler reads and writes to files.
         *
         * The same file manager can be reopened for another compiler task.
         * Thus we reduce the overhead of scanning through file system and jar files each time
         */
        StandardJavaFileManager stdFileManager = compiler.getStandardFileManager(null, null, null);
        //uses custom file manager with defined class loader inorder to unload the compiled class when this is done
        ClassFileManager fileManager =  new ClassFileManager(stdFileManager);

        /* Prepare a list of compilation units (java source code file objects) to input to compilation task*/
        Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(javaFileObjects);
 
        /*Prepare any compilation options to be used during compilation*/
        //In this example, we are asking the compiler to place the output files under bin folder.
        List<String> compileOptions = new ArrayList<String>();
        // compileOptions.addAll(Arrays.asList("-classpath", System.getProperty("java.class.path")));
        // Iterable<String> compilationOptionss = Arrays.asList(compileOptions);
 
        /*Create a diagnostic controller, which holds the compilation problems*/
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();
 
        /*Create a compilation task from compiler by passing in the required input objects prepared above*/
        CompilationTask compilerTask = compiler.getTask(null, fileManager, diagnostics, compileOptions, null, compilationUnits) ;
        
        //Perform the compilation by calling the call method on compilerTask object.
        boolean status = compilerTask.call();

        if (!status){//If compilation error occurs
            /*Iterate through each compilation problem and print it*/
            for (Diagnostic diagnostic : diagnostics.getDiagnostics()){
                System.err.format("Error on line %d in %s", diagnostic.getLineNumber(), diagnostic);
            }
        } else {
          // ExecutorService service = Executors.newSingleThreadExecutor();

          // try {
          //     Runnable r = new Runnable() {
          //         @Override
          //         public void run() {
                    try {
                      fileManager.getClassLoader(null).loadClass(name).getDeclaredMethod("main", new Class[] { String[].class }).invoke(null, new Object[] { null });
                    } catch (ClassNotFoundException e) {
                      System.err.println("Class not found: " + e);
                    } catch (NoSuchMethodException e) {
                      System.err.println("No such method: " + e);
                    } catch (IllegalAccessException e) {
                      System.err.println("Illegal access: " + e);
                    } catch (InvocationTargetException e) {
                      System.err.println("RuntimeError: "+e.getTargetException());
                    }
                    try {
                        fileObject.delete();
                        fileManager.close();
                        ResourceBundle.clearCache(ClassLoader.getSystemClassLoader()); // <--useless
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
              //     }
              // };

          //     Future<?> f = service.submit(r);

          //     f.get(timeLimit, TimeUnit.MILLISECONDS);     // attempt the task for timelimit default 5 seconds
          // }
          // catch (final InterruptedException e) {
          //   System.err.println("Thread Interrupted: " + e);
          // }
          // catch (final TimeoutException e) {
          //   System.err.println("TimeoutException: Your program ran for more than "+timeLimit);
          // }
          // catch (final ExecutionException e) {
          //   e.printStackTrace();
          // }
          // finally {
          //     service.shutdown();
          // }
        }
    }
}

/**
 * Creates a dynamic source code file object
 *
 * This is an example of how we can prepare a dynamic java source code for compilation.
 * This class reads the java code from a string and prepares a JavaFileObject
 *
 */
class DynamicJavaSourceCodeObject extends SimpleJavaFileObject{
    private String sourceCode ;
 
    /**
     * Converts the name to an URI, as that is the format expected by JavaFileObject
     *
     *
     * @param String name given to the class file
     * @param String source the source code string
     */
    protected DynamicJavaSourceCodeObject(String name, String source) {
        super(URI.create("string:///" +name.replaceAll("\\.", "/") + Kind.SOURCE.extension), Kind.SOURCE);
        this.sourceCode = source ;
    }
 
    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors)
            throws IOException {
        return sourceCode ;
    }
 
    public String getSourceCode() {
        return sourceCode;
    }
}

// the idea is to create a Dynamic class instead of writing to filesystem
class JavaClassObject extends SimpleJavaFileObject {

    /**
    * Byte code created by the compiler will be stored in this
    * ByteArrayOutputStream so that we can later get the
    * byte array out of it
    * and put it in the memory as an instance of our class.
    */
    protected ByteArrayOutputStream bos =
        new ByteArrayOutputStream();

    /**
    * Registers the compiled class object under URI
    * containing the class full name
    *
    * @param name
    *            Full name of the compiled class
    * @param kind
    *            Kind of the data. It will be CLASS in our case
    */
    public JavaClassObject(String name, Kind kind) {
        super(URI.create("string:///" + name.replace('.', '/')
            + kind.extension), kind);
    }

    /**
    * Will be used by our file manager to get the byte code that
    * can be put into memory to instantiate our class
    *
    * @return compiled byte code
    */
    public byte[] getBytes() {
        return bos.toByteArray();
    }

    /**
    * Will provide the compiler with an output stream that leads
    * to our byte array. This way the compiler will write everything
    * into the byte array that we will instantiate later
    */
    @Override
    public OutputStream openOutputStream() throws IOException {
        return bos;
    }
}

/**
 * We use this file manager so that the compiled class from source can be unloaded
 * also not having ot write to fileSystem
 */
class ClassFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {
    /**
    * Instance of JavaClassObject that will store the
    * compiled bytecode of our class
    */
    private JavaClassObject jclassObject;
    /**
     * Instance of ClassLoader
     */
    private SecureClassLoader classLoader;

    /**
    * Will initialize the manager with the specified
    * standard java file manager
    *
    * @param standardManger
    */
    public ClassFileManager(StandardJavaFileManager standardManager) {
        super(standardManager);
        this.classLoader = new SecureClassLoader() {
            @Override
            protected Class<?> findClass(String name)
                throws ClassNotFoundException {
                byte[] b = jclassObject.getBytes();
                return super.defineClass(name, jclassObject
                    .getBytes(), 0, b.length);
            }
        };
    }

    /**
    * Will be used by us to get the class loader for our
    * compiled class. It creates an anonymous class
    * extending the SecureClassLoader which uses the
    * byte code created by the compiler and stored in
    * the JavaClassObject, and returns the Class for it
    */
    @Override
    public ClassLoader getClassLoader(Location location) {
        return this.classLoader; 
    }

    public void unloadClass(Location location) {
        this.classLoader = null;
        this.jclassObject = null;
        System.gc();
    }

    /**
    * Gives the compiler an instance of the JavaClassObject
    * so that the compiler can write the byte code into it.
    */
    @Override
    public JavaFileObject getJavaFileForOutput(Location location,
        String className, Kind kind, FileObject sibling)
            throws IOException {
            jclassObject = new JavaClassObject(className, kind);
        return jclassObject;
    }
}