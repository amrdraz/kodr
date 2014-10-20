
public class Test {
    public final static String DEFAULT_HASH="TestOut";
    private final static String DEFAULT_PASS="Passed Test";
    private final static String DEFAULT_FAIL="Failed Test";
    private final static int DEFAULT_SCORE=0;

    private static String hash=DEFAULT_HASH;

    public static void setHash(String h) {
        hash = h;
    }
    public static void resetTest() {
       Test.setHash(Test.DEFAULT_HASH);
    }

    private static void out(boolean pass,String msg, int point, String tag) {
        String str = "<["+hash+"]>{"+
            "\"pass\":"+pass+
            ",\"message\":\""+msg+"\""+
            ",\"score\":"+point;
        if(tag!=null) {
            str+=",\"tag\":\""+tag+"\"";
        }
        str+="}<["+hash+"]>";
        System.out.println(str);
    }
    private static void out(boolean pass,String msg, int point) {
        out( pass, msg,  point, null);
    }

    public static void pass(String msg, int point, String tag) {
        if(point<0) { // you can not award negative points for pass
            point=0;
        }
        out(true,msg,point, tag);
    }
    public static void pass(String msg, int point) {
        pass(msg,point, null);
    }

    public static void pass(String msg) {
        pass(msg,0);
    }
    public static void pass(String msg, String tag) {
        pass(msg,0, tag);
    }

    public static void pass(int s, String tag) {
        pass(DEFAULT_PASS,s, tag);
    }

    public static void pass(int s) {
        pass(DEFAULT_PASS,s, null);
    }

    public static void pass() {
        pass(DEFAULT_PASS);
    }

    public static void fail(String msg, int point, String tag) {
        if(point>0) { // you can not award positive points for failure
            point=0;
        }
        out(false,msg,0, tag);
    }
    public static void fail(String msg, int point) {
        fail(msg,0,null);
    }
    public static void fail(String msg) {
        fail(msg,0);
    }
    public static void fail(String msg,String tag) {
        fail(msg,0,tag);
    }
    public static void fail(int s) {
        fail(DEFAULT_FAIL,s);
    }
    public static void fail(int s, String tag) {
        fail(DEFAULT_FAIL,s,tag);
    }
    public static void fail() {
        fail(DEFAULT_FAIL);
    }

    public static void expect(Object user, Object expected, String msg, String failmsg, int s, String tag) {
        if(user.equals(expected)){
            pass(msg,s,tag);
        } else {
            fail(failmsg,s,tag);
        }
    }
    public static void expect(Object user, Object expected, String msg, int s, String tag) {
        if(user.equals(expected)){
            pass(msg, s,tag);
        } else {
            fail("Expected "+user+" to equal "+expected+"",s,tag);
        }
    }
    public static void expect(Object user, Object expected, String msg, String failmsg, String tag) {
        expect(user,expected,msg,failmsg,0,tag);
    }
    public static void expect(Object user, Object expected, String msg, String tag) {
        expect(user,expected,msg,0,tag);
    }
     public static void expect(Object user, Object expected, String msg, String failmsg, int s) {
        expect(user,expected,msg,failmsg,0,null);
    }
    public static void expect(Object user, Object expected, String msg, int s) {
        expect(user,expected,msg,s,null);
    }
    public static void expect(Object user, Object expected, String msg) {
        expect(user,expected,msg,0,null);
    }
    public static void expect(Object user, Object expected, int s, String tag) {
        expect(user,expected,DEFAULT_PASS,s,tag);
    }
    public static void expect(Object user, Object expected, int s) {
        expect(user,expected,DEFAULT_PASS,s);
    }
    public static void expect(Object user, Object expected) {
        expect(user,expected,DEFAULT_PASS);
    }
}