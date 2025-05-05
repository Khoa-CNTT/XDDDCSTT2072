package com.agricultural.agricultural.service.impl;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class KeywordValidatorService {

    private static final Set<String> AGRICULTURE_KEYWORDS = new HashSet<>();

    static {
        // Từ khóa về cây trồng, rau củ, trái cây, chăn nuôi, đất, nông nghiệp thông minh, v.v.
        String[] keywords = {
                // Cây trái
                "cây", "cây trồng", "cây ăn quả", "xoài", "sầu riêng", "cam", "bưởi", "chuối", "ổi", "mít", "dừa",
                "dưa hấu", "chanh", "nho", "vải", "na", "lựu", "măng cầu", "sapoche", "mận", "đào", "cốc", "quýt",
                
                // Rau củ
                "rau", "bắp cải", "cà chua", "cà rốt", "hành", "tỏi", "cải", "bí", "dưa", "đậu", "mướp", "củ cải",
                
                // Ngũ cốc - cây công nghiệp
                "gạo", "lúa", "ngô", "khoai", "sắn", "mía", "cà phê", "cao su", "hồ tiêu", "điều", "trà", "chè",
                
                // Chăn nuôi - thủy sản
                "gà", "vịt", "heo", "bò", "trâu", "cá", "tôm", "thủy sản", "gia súc", "gia cầm",
                
                // Chung chung
                "nông sản", "nông nghiệp", "trồng trọt", "chăn nuôi", "canh tác", "phân bón", "thu hoạch", "giống cây",
                "vườn", "ruộng", "đất nông nghiệp", "nước tưới", "bảo quản", "sâu bệnh", "phun thuốc", "côn trùng",
                
                // Thời tiết
                "thời tiết", "dự báo", "nhiệt độ", "độ ẩm", "nắng", "mưa", "gió", "khí hậu", "áp thấp", "bão", "thời tiết hôm nay",
                
                // Thêm các từ khóa kỹ thuật
                "kỹ thuật canh tác", "thuốc trừ sâu", "thuốc diệt cỏ", "vi sinh vật", "năng suất", "sản lượng",
                "sinh trưởng", "phát triển", "bệnh hại", "côn trùng gây hại", "dinh dưỡng", "phân hữu cơ",
                "phân vô cơ", "NPK", "nitơ", "kali", "photpho", "vi lượng", "hạt giống", "cây giống",
                
                // Mùa vụ và thời điểm
                "vụ đông xuân", "vụ hè thu", "vụ mùa", "gieo trồng", "thu hoạch", "thời vụ", "thời điểm gieo trồng",
                
                // Kỹ thuật canh tác
                "luân canh", "xen canh", "gối vụ", "làm đất", "xới đất", "tưới nước", "phun thuốc", "bón phân",
                "bao phủ", "làm cỏ", "tỉa cành", "tạo hình", "ghép cành", "chiết cành",
                
                // Bệnh hại và xử lý
                "sâu", "bệnh", "nấm", "vi khuẩn", "rỉ sắt", "đạo ôn", "thán thư", "vàng lá", "héo rũ", "xoăn lá",
                
                // Kỹ thuật trồng và chăm sóc
                "mật độ", "khoảng cách", "chiều sâu", "thời gian", "thời kỳ", "giai đoạn", "sinh trưởng",
                "ra hoa", "đậu trái", "phát triển", "nuôi dưỡng", "chăm sóc",
                
                // Nông nghiệp công nghệ cao
                "thủy canh", "khí canh", "nhà kính", "nhà lưới", "tưới nhỏ giọt", "tưới phun mưa",
                "IoT", "cảm biến", "tự động hóa", "nông nghiệp thông minh", "nông nghiệp 4.0",
                "nông nghiệp hữu cơ", "nông nghiệp sạch", "nông nghiệp bền vững"
        };
        
        for (String keyword : keywords) {
            AGRICULTURE_KEYWORDS.add(keyword.toLowerCase().trim());
        }
    }
    
    /**
     * Lấy tất cả các từ khóa về nông nghiệp
     * @return Set các từ khóa
     */
    public Set<String> getAgricultureKeywords() {
        return AGRICULTURE_KEYWORDS;
    }
    
    /**
     * Lấy các từ khóa dưới dạng chuỗi, phân cách bởi dấu phẩy
     * @return Chuỗi các từ khóa
     */
    public String getAgricultureKeywordsString() {
        return String.join(", ", AGRICULTURE_KEYWORDS);
    }
    
    /**
     * Kiểm tra xem một từ có phải là từ khóa nông nghiệp không
     * @param keyword Từ khóa cần kiểm tra
     * @return true nếu là từ khóa nông nghiệp
     */
    public boolean isAgricultureKeyword(String keyword) {
        if (keyword == null) return false;
        return AGRICULTURE_KEYWORDS.contains(keyword.toLowerCase().trim());
    }
} 