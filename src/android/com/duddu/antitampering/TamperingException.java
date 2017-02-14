package com.duddu.antitampering;

class TamperingException extends SecurityException {

    public TamperingException(String message) {
        super(message);
    }

}