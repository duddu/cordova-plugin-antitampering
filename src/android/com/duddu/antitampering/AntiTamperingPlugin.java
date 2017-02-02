package com.duddu.antitampering;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;


public class AntiTamperingPlugin extends CordovaPlugin {

    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {

        if ("verify".equals(action)) {
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run () {
                    PluginResult result;
                    try {
                        JSONObject response = new JSONObject();
                        response.put("assets", AssetsIntegrity.check(cordova.getActivity().getAssets()));
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
