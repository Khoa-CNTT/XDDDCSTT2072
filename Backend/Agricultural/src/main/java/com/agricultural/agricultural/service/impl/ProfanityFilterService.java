package com.agricultural.agricultural.service.impl;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProfanityFilterService {

    private static final Set<String> VIETNAMESE_PROFANITY_WORDS = new HashSet<>();
    private static final Set<String> ENGLISH_PROFANITY_WORDS = new HashSet<>();
    
    static {
        // Danh sách từ ngữ tục tĩu tiếng Việt (được mã hóa để không hiển thị trực tiếp)
        String[] vietnameseProfanities = {
            "d[ij][teê]?[mn]", "cac", "l[oô]n", "bu[oô]?i", "c[aâ]?[cj]", "ch[oô]", "d[aâ][iíì]",
            "đ[aâ][iíì]", "đ[uư][jn]g?", "c[uư][tjc]", "m[ée]", "đ[ée]?o", "th[aằ]ng ch[oó]",
            "ngu", "ngoc", "ngo[aâ]i t[iì]nh"
        };
        VIETNAMESE_PROFANITY_WORDS.addAll(Arrays.asList(vietnameseProfanities));
        
        // Danh sách từ ngữ tục tĩu tiếng Anh
        String[] englishProfanities = {
            "fuck", "shit", "ass", "bitch", "cunt", "dick", "cock", "pussy", "whore",
            "bastard", "motherfucker", "asshole", "bullshit"
        };
        ENGLISH_PROFANITY_WORDS.addAll(Arrays.asList(englishProfanities));
    }
    
    /**
     * Kiểm tra xem nội dung có chứa từ ngữ tục tĩu không
     * @param content Nội dung cần kiểm tra
     * @return true nếu nội dung chứa từ ngữ tục tĩu
     */
    public boolean containsProfanity(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }
        
        // Chuyển nội dung về chữ thường để so sánh
        String lowerContent = content.toLowerCase();
        
        // Kiểm tra từ ngữ tiếng Việt bằng regex
        for (String word : VIETNAMESE_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b" + word + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lowerContent);
            if (matcher.find()) {
                return true;
            }
        }
        
        // Kiểm tra từ ngữ tiếng Anh
        for (String word : ENGLISH_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b" + word + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lowerContent);
            if (matcher.find()) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Kiểm tra và thay thế từ ngữ tục tĩu bằng dấu ***
     * @param content Nội dung cần kiểm tra
     * @return Nội dung đã được thay thế từ ngữ tục tĩu
     */
    public String filterProfanity(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        String filteredContent = content;
        
        // Thay thế từ ngữ tiếng Việt bằng regex
        for (String word : VIETNAMESE_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b(" + word + ")\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(filteredContent);
            if (matcher.find()) {
                filteredContent = matcher.replaceAll("***");
            }
        }
        
        // Thay thế từ ngữ tiếng Anh
        for (String word : ENGLISH_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b(" + word + ")\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(filteredContent);
            if (matcher.find()) {
                filteredContent = matcher.replaceAll("***");
            }
        }
        
        return filteredContent;
    }
} 