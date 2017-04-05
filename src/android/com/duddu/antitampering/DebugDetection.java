package com.duddu.antitampering;

import android.os.Debug;

import java.lang.reflect.Field;


class DebugDetection {

    public static void check(String packageName) throws Exception {
        if (hasDebuggerAttached()) {
            throw new Exception("Debugger attached");
        } else if (getDebugField(packageName)) {
            throw new Exception("App running in Debug mode");
        }
    }

    private static Boolean getDebugField(String packageName) throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
        Class<?> buildConfigClass = Class.forName(packageName.concat(".BuildConfig"));
        Field debugField = buildConfigClass.getField("DEBUG");
        return debugField.getBoolean(null);
    }

    private static Boolean hasDebuggerAttached() {
        return Debug.isDebuggerConnected() || Debug.waitingForDebugger();
    }

}
