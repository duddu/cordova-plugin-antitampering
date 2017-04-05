package com.duddu.antitampering;

import android.app.Activity;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;


public class AntiTamperingPlugin extends CordovaPlugin {

    private Activity activity;

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        activity = cordova.getActivity();
        checkAndStopExecution();
        super.initialize(cordova, webView);
    }

    private void checkAndStopExecution() {
        try {
            AssetsIntegrity.check(activity.getAssets());
            DebugDetection.check(activity.getPackageName());
        } catch (final Exception e) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run () {
                    e.printStackTrace();
                    throw new TamperingException("Anti-Tampering check failed");
                }
            });
        }
    }

    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {

        if ("verify".equals(action)) {
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run () {
                    PluginResult result;
                    try {
                        DebugDetection.check(activity.getPackageName());
                        JSONObject response = new JSONObject();
                        response.put("assets", AssetsIntegrity.check(activity.getAssets()));
                        result = new PluginResult(PluginResult.Status.OK, response);
                    } catch (Exception e) {
                        result = new PluginResult(PluginResult.Status.ERROR, e.toString());
                    }
                    callbackContext.sendPluginResult(result);
                }
            });
            return true;
        }

        return false;

    }

}
