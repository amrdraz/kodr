public class Test {
    private static boolean hashSet=false;
    private static String hash="TestOut";

    public static void setHash(String h) {
        if(!hashSet) {
            hash = h;
            hashSet=true;
        }
    }

    private static void out(boolean pass,String msg, int point) {
        System.out.println("<["+hash+"]>{\"pass\":"+pass+",\"message\":\""+msg+"\",\"score\":"+point+"}<["+hash+"]>");
    }

    public static void pass(String msg, int point) {
        out(true,msg,point);
    }

    public static void pass(String msg) {
        pass(msg,0);
    }

    public static void pass(int s) {
        pass("Passed Test",s);
    }

    public static void pass() {
        pass("Passed Test");
    }

    public static void fail(String msg, int point) {
        out(false,msg,0);
    }

    public static void fail(String msg) {
        fail(msg,0);
    }
    
    public static void fail(int s) {
        fail("Failed Test",s);
    }

    public static void fail() {
        fail("Failed Test");
    }
}