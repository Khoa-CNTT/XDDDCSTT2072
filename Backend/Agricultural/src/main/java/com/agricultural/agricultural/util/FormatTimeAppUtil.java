package com.agricultural.agricultural.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class FormatTimeAppUtil {
    private static final SimpleDateFormat FORMATTER = new SimpleDateFormat("dd-MM-yyyy");
    public static String getStringFormatTime(){
        return FORMATTER.format(new Date());
    }
}
