package com.agricultural.agricultural.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Log {
    private final static Logger log = LoggerFactory.getLogger(Log.class);
    public void LogInfo(SuccessCode code){
        log.info("code: {}, message: {}, httpStatus: {}", code.getCode(), code.getMessage(), code.getHttpStatus());
    }
    public void LogError(ErrorCode code){
        log.error("code: {}, message: {}, httpStatus: {}", code.getCode(), code.getMessage(), code.getHttpStatus());
    }
}
