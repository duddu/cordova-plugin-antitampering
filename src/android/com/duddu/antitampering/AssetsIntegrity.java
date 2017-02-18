package com.duddu.antitampering;

import android.content.res.AssetManager;
import android.util.Base64;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;


class AssetsIntegrity {

    private static final String MESSAGE_DIGEST_ALGORITHM = "SHA-256";
    private static final String ASSETS_BASE_PATH = "www/";

    private static final Map<String, String> assetsHashes = Collections.unmodifiableMap(
        new HashMap<String, String>()
    );

    public static JSONObject check(AssetManager assets) throws Exception {
        for (Map.Entry<String, String> entry : assetsHashes.entrySet()) {
            byte[] fileNameDecode = Base64.decode(entry.getKey(), 0);
            String fileName = new String(fileNameDecode, StandardCharsets.UTF_8);
            // Log.d("AntiTampering", fileName + " -> " + entry.getValue());
            String filePath = ASSETS_BASE_PATH.concat(fileName);
            InputStream file = assets.open(filePath);
            String hash = getFileHash(file);
            if (entry.getValue() == null || !entry.getValue().equals(hash)) {
                throw new Exception("Content of " + fileName + " has been tampered");
            }
        }
        JSONObject result = new JSONObject();
        result.put("count", assetsHashes.size());
        return result;
    }

    private static String getFileHash(InputStream file) throws IOException, NoSuchAlgorithmException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = file.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        MessageDigest digest = MessageDigest.getInstance(MESSAGE_DIGEST_ALGORITHM);
        byte[] hashBytes = digest.digest(buffer.toByteArray());
        StringBuffer hexString = new StringBuffer();
        for (int i = 0; i < hashBytes.length; i++) {
            if ((0xff & hashBytes[i]) < 0x10) {
                hexString.append("0");
            }
            hexString.append(Integer.toHexString(0xFF & hashBytes[i]));
        }
        // Log.d("AntiTampering", String(hexString));
        return new String(hexString);
    }

}
