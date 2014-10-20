public class TerminalRunner {
    public static void main(String args[]){
        String name = args[0];
        String code = args[1];
        JavaRunner.compile(name,code);
    }
}