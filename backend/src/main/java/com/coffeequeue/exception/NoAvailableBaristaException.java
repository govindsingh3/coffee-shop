package com.coffeequeue.exception;

public class NoAvailableBaristaException extends RuntimeException {
    public NoAvailableBaristaException(String message) {
        super(message);
    }
    
    public NoAvailableBaristaException(String message, Throwable cause) {
        super(message, cause);
    }
}
