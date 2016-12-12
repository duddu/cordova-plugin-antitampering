package com.duddu.antitampering;

import android.content.res.AssetManager;
import android.util.Log;
import android.util.Base64;
import android.util.ArrayMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map.Entry;


public class AntiTamperingPlugin extends CordovaPlugin {

    private AssetManager cordovaAssets;
    private ArrayMap<String, String> AssetsHashes = new ArrayMap<String, String>();

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        cordovaAssets = cordova.getActivity().getAssets();
    }

    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {

        if ("verify".equals(action)) {
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run () {
                    PluginResult result;
                    String dir = "www";
                    long startTime = System.nanoTime();
                    try {
                        for (Entry<String, String> entry : AssetsHashes.entrySet())
                        {
                            byte[] fileNameDecode = Base64.decode(entry.getKey(), 0);
                            String fileName = new String(fileNameDecode, StandardCharsets.UTF_8);
                            Log.d("antitampering", fileName + " -> " + entry.getValue());
                            if (entry.getValue() == null ||
                                !entry.getValue().equals(createHash("www/" + fileName))) {
                                throw new Exception("Hash for " + fileName + " doesn't match");
                            }
                        }
                        long endTime = System.nanoTime();
                        long time = (endTime - startTime) / 1000000;
                        Log.d("antitampering", Long.toString(time));
                        result = new PluginResult(PluginResult.Status.OK, true);
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

    private String createHash(String fileName) throws IOException, NoSuchAlgorithmException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        InputStream file = cordovaAssets.open(fileName);
        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = file.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(buffer.toByteArray());
        StringBuffer hexString = new StringBuffer();
        for (int i = 0; i < hashBytes.length; i++) {
            if ((0xff & hashBytes[i]) < 0x10) {
                hexString.append("0");
            }
            hexString.append(Integer.toHexString(0xFF & hashBytes[i]));
        }
        String hash = new String(hexString);
        Log.d("antitampering" + fileName, hash);
        return hash;
    }

}
