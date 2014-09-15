// import java.io.IOException;
// import java.io.PrintWriter;
// import java.io.StringWriter;
// import java.net.URI;
// import java.util.Arrays;

// import javax.tools.Diagnostic;
// import javax.tools.DiagnosticCollector;
// import javax.tools.JavaCompiler;
// import javax.tools.JavaFileObject;
// import javax.tools.SimpleJavaFileObject;
// import javax.tools.ToolProvider;
// import javax.tools.JavaCompiler.CompilationTask;
// import javax.tools.JavaFileObject.Kind;


import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.Locale;
import java.util.logging.Logger;
import java.lang.reflect.InvocationTargetException;
 
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

// compiles source in memory
// public class JavaRunner {
//   public static void main(String args[]) throws IOException {
//     JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
//     DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();

//     String code = "public class Main {\n"+
//     "  public static void main(String args[]) {\n";
//     if(args.length>0)
//       code+=args[0];
//     code+="  }"+
//     "}";
//     SimpleJavaFileObject file = new JavaSourceFromString("Main", code);

//     Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(file);
//     CompilationTask task = compiler.getTask(null, null, diagnostics, null, null, compilationUnits);
    
//     boolean success = task.call();
//     for (Diagnostic diagnostic : diagnostics.getDiagnostics()) {
//       // System.out.println(diagnostic.getCode());
//       // System.out.println(diagnostic.getKind());
//       // System.out.println(diagnostic.getPosition());
//       // System.out.println(diagnostic.getStartPosition());
//       // System.out.println(diagnostic.getEndPosition());
//       // System.out.println(diagnostic.getSource());
//       System.out.println(diagnostic.getMessage(null));

//     }

//     if (success) {
//       try {
//         Class.forName("Main").getDeclaredMethod("main", new Class[] { String[].class }).invoke(null, new Object[] { null });
//       } catch (ClassNotFoundException e) {
//         System.err.println("Class not found: " + e);
//       } catch (NoSuchMethodException e) {
//         System.err.println("No such method: " + e);
//       } catch (IllegalAccessException e) {
//         System.err.println("Illegal access: " + e);
//       } catch (InvocationTargetException e) {
//         System.err.println("Invocation target: " + e);
//       }
//     }
//   }
// }

 
/**
 * A test class to test dynamic compilation API.
 *
 */
public class JavaRunner {
    final Logger logger = Logger.getLogger(JavaRunner.class.getName()) ;
  
    public static void main(String args[]){
        String name = "Main";
        String code = "public class "+name+" {\n"+
        "  public static void main(String args[]) {\n";
        if(args.length>0)
          code+=args[0];
        code+="  }"+
        "}";
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
        StandardJavaFileManager stdFileManager = compiler.getStandardFileManager(null, Locale.getDefault(), null);
 
        /* Prepare a list of compilation units (java source code file objects) to input to compilation task*/
        Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(javaFileObjects);
 
        /*Prepare any compilation options to be used during compilation*/
        //In this example, we are asking the compiler to place the output files under bin folder.
        String[] compileOptions = new String[]{} ;
        Iterable<String> compilationOptionss = Arrays.asList(compileOptions);
 
        /*Create a diagnostic controller, which holds the compilation problems*/
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();
 
        /*Create a compilation task from compiler by passing in the required input objects prepared above*/
        CompilationTask compilerTask = compiler.getTask(null, stdFileManager, diagnostics, compilationOptionss, null, compilationUnits) ;
 
        //Perform the compilation by calling the call method on compilerTask object.
        boolean status = compilerTask.call();
 
        if (!status){//If compilation error occurs
            /*Iterate through each compilation problem and print it*/
            for (Diagnostic diagnostic : diagnostics.getDiagnostics()){
                System.err.format("Error on line %d in %s", diagnostic.getLineNumber(), diagnostic);
            }
        } else {
          try {
            Class.forName(name).getDeclaredMethod("main", new Class[] { String[].class }).invoke(null, new Object[] { null });
          } catch (ClassNotFoundException e) {
            System.err.println("Class not found: " + e);
          } catch (NoSuchMethodException e) {
            System.err.println("No such method: " + e);
          } catch (IllegalAccessException e) {
            System.err.println("Illegal access: " + e);
          } catch (InvocationTargetException e) {
            System.err.println("Invocation target: " + e);
          }
        }
        try {
            stdFileManager.close() ;//Close the file manager
        } catch (IOException e) {
            e.printStackTrace();
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
    private String qualifiedName ;
    private String sourceCode ;
 
    /**
     * Converts the name to an URI, as that is the format expected by JavaFileObject
     *
     *
     * @param fully qualified name given to the class file
     * @param code the source code string
     */
    protected DynamicJavaSourceCodeObject(String name, String code) {
        super(URI.create("string:///" +name.replaceAll("\\.", "/") + Kind.SOURCE.extension), Kind.SOURCE);
        this.qualifiedName = name ;
        this.sourceCode = code ;
    }
 
    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors)
            throws IOException {
        return sourceCode ;
    }
 
    public String getQualifiedName() {
        return qualifiedName;
    }
 
    public void setQualifiedName(String qualifiedName) {
        this.qualifiedName = qualifiedName;
    }
 
    public String getSourceCode() {
        return sourceCode;
    }
 
    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }
}