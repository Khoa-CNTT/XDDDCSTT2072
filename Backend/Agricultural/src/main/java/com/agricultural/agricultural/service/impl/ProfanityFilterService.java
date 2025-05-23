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
        String[] vietnameseProfanities = {
            "d[ij][teê]?[mn]", "cac", "l[oô]n", "bu[oô]?i", "c[aâ]?[cj]", "ch[oô]", "d[aâ][iíì]",
            "đ[aâ][iíì]", "đ[uư][jn]g?", "c[uư][tjc]", "m[ée]", "đ[ée]?o", "th[aằ]ng ch[oó]",
            "ngu", "ngoc", "ngo[aâ]i t[iì]nh"
        };
        VIETNAMESE_PROFANITY_WORDS.addAll(Arrays.asList(vietnameseProfanities));
        
        String[] englishProfanities = {
            "fuck", "shit", "ass", "bitch", "cunt", "dick", "cock", "pussy", "whore",
            "bastard", "motherfucker", "asshole", "bullshit"
        };
        ENGLISH_PROFANITY_WORDS.addAll(Arrays.asList(englishProfanities));
    }
    

    public boolean containsProfanity(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }
        
        String lowerContent = content.toLowerCase();
        
        for (String word : VIETNAMESE_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b" + word + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lowerContent);
            if (matcher.find()) {
                return true;
            }
        }
        
        for (String word : ENGLISH_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b" + word + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lowerContent);
            if (matcher.find()) {
                return true;
            }
        }
        
        return false;
    }
    

    public String filterProfanity(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        String filteredContent = content;
        
        for (String word : VIETNAMESE_PROFANITY_WORDS) {
            Pattern pattern = Pattern.compile("\\b(" + word + ")\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(filteredContent);
            if (matcher.find()) {
                filteredContent = matcher.replaceAll("***");
            }
        }
        
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