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
                "bơ", "thanh long", "chôm chôm", "nhãn", "dâu tây", "dứa", "khế", "sung", "táo", "lê", "cherry", 
                "dâu", "dâu tằm", "hồng xiêm", "trái thanh trà", "mít tố nữ", "quả mâm xôi", "quả macca", "trái kiwi",
                "trái bòn bon", "trái cóc", "trái mãng cầu ta", "trái roi", "trái khóm", "trái hồng", "trái đu đủ",
                "trái saboche", "trái nhãn lồng", "trái bưởi da xanh", "trái bưởi năm roi", "trái cam sành",
                
                // Rau củ
                "rau", "bắp cải", "cà chua", "cà rốt", "hành", "tỏi", "cải", "bí", "dưa", "đậu", "mướp", "củ cải",
                "rau muống", "rau dền", "xà lách", "rau ngót", "rau rền", "rau mùi", "húng quế", "rau răm",
                "rau ngò", "đậu đũa", "đậu cove", "đậu Hà Lan", "bí ngòi", "bí đỏ", "khoai lang", "khoai môn",
                "khoai tây", "su hào", "súp lơ", "măng tây", "măng tre", "hẹ", "tía tô", "rau thơm",
                "húng lủi", "kinh giới", "cần tây", "cải thìa", "cải ngọt", "cải bó xôi", "mồng tơi",
                "cải xanh", "cải bẹ", "cải ngồng", "cải thảo", "củ đậu", "củ sắn", "củ năng", "củ từ",
                "củ niễng", "tỏi tây", "hành tây", "hành lá", "nấm hương", "nấm rơm", "nấm kim châm",
                "nấm đông cô", "nấm hàu", "nấm mèo", "nấm linh chi", "giá đỗ", "rau sam", "rau đay",
                
                // Ngũ cốc - cây công nghiệp
                "gạo", "lúa", "ngô", "khoai", "sắn", "mía", "cà phê", "cao su", "hồ tiêu", "điều", "trà", "chè",
                "đậu nành", "đậu xanh", "đậu tương", "đậu phộng", "lạc", "đậu đen", "bông vải", "bông cotton",
                "gạo nếp", "gạo tẻ", "gạo lứt", "gạo trắng", "gạo đỏ", "gạo huyết rồng", "gạo st25",
                "gạo japonica", "gạo thơm", "gạo nàng hoa", "kê", "yến mạch", "lúa mì", "lúa nếp",
                "lúa đặc sản", "cây cọ dầu", "cây lanh", "cây gai", "cây lương thực", "dược liệu",
                "gừng", "nghệ", "sả", "đinh hương", "quế", "hồi", "thảo quả", "ớt cay", "ớt ngọt",
                "ớt hiểm", "ớt sừng", "cây đậu", "cây họ đậu", "thuốc lá", "cỏ cây thuốc",
                
                // Chăn nuôi - thủy sản
                "gà", "vịt", "heo", "bò", "trâu", "cá", "tôm", "thủy sản", "gia súc", "gia cầm",
                "ngan", "ngỗng", "chim cút", "bồ câu", "dê", "cừu", "ngựa", "thỏ", "ong mật",
                "cá tra", "cá basa", "cá rô phi", "cá chép", "cá diêu hồng", "cá lóc", "cá trê",
                "cá kèo", "cá ngừ", "cá thu", "cá bớp", "cá hồi", "cá rô đồng", "cá mú", "cá hồng",
                "cá sấu", "ba ba", "ếch", "nhím", "dúi", "tằm", "tắc kè", "ong", "tổ ong", "mật ong",
                "sữa ong chúa", "tôm càng xanh", "tôm sú", "tôm thẻ chân trắng", "tôm hùm", "cua biển",
                "cua đồng", "ghẹ", "sò", "hến", "nghêu", "sò huyết", "tu hài", "hàu", "ốc", "bạch tuộc",
                "mực", "mực ống", "mực nang", "cá nước ngọt", "cá nước mặn", "cá cảnh", "chăn nuôi công nghiệp",
                
                // Chung chung
                "nông sản", "nông nghiệp", "trồng trọt", "chăn nuôi", "canh tác", "phân bón", "thu hoạch", "giống cây",
                "vườn", "ruộng", "đất nông nghiệp", "nước tưới", "bảo quản", "sâu bệnh", "phun thuốc", "côn trùng",
                "cây lương thực", "lâm nghiệp", "lâm sản", "ngư nghiệp", "nuôi trồng thủy sản", "làng nghề",
                "làng nông nghiệp", "kho dự trữ", "silo", "kho lạnh", "nông dân", "hợp tác xã", "kinh tế hộ",
                "trang trại", "gia trại", "nông trại", "hộ sản xuất", "doanh nghiệp nông nghiệp", "dự án nông nghiệp",
                "xuất khẩu nông sản", "nhập khẩu nông sản", "chuỗi giá trị", "chuỗi cung ứng", "thị trường nông sản",
                "giá nông sản", "giá thành", "chi phí sản xuất", "lợi nhuận", "hiệu quả kinh tế", "an toàn thực phẩm",
                "lãi suất nông nghiệp", "vay vốn nông nghiệp", "bảo hiểm nông nghiệp", "thuế nông nghiệp", "tiêu chuẩn",
                "tưới tiêu", "dẫn thủy", "đê điều", "kênh mương", "công trình thủy lợi", "hạn hán", "lũ lụt", "xói mòn",
                "sa mạc hóa", "ô nhiễm đất", "ô nhiễm nước", "nông thôn", "nông thôn mới", "khu dân cư nông thôn",
                
                // Thời tiết
                "thời tiết", "dự báo", "nhiệt độ", "độ ẩm", "nắng", "mưa", "gió", "khí hậu", "áp thấp", "bão", "thời tiết hôm nay",
                "hạn hán", "lũ lụt", "ngập úng", "khô hạn", "rét đậm", "rét hại", "nóng", "nắng nóng", "sương muối",
                "sương giá", "mưa đá", "mưa lớn", "mưa nhỏ", "mưa phùn", "tháng mùa", "mùa màng", "mùa khô", "mùa mưa",
                "mùa đông", "mùa hạ", "mùa thu", "mùa xuân", "El Nino", "La Nina", "biến đổi khí hậu", "hiệu ứng nhà kính",
                "thất thường", "sa mạc hóa", "tưới tiêu", "chống hạn", "chống úng", "chống rét", "phòng chống thiên tai",
                
                // Thêm các từ khóa kỹ thuật
                "kỹ thuật canh tác", "thuốc trừ sâu", "thuốc diệt cỏ", "vi sinh vật", "năng suất", "sản lượng",
                "sinh trưởng", "phát triển", "bệnh hại", "côn trùng gây hại", "dinh dưỡng", "phân hữu cơ",
                "phân vô cơ", "NPK", "nitơ", "kali", "photpho", "vi lượng", "hạt giống", "cây giống",
                "thuốc BVTV", "thuốc bảo vệ thực vật", "thuốc kích thích tăng trưởng", "hormone thực vật",
                "auxin", "gibberellin", "cytokinin", "axit abscisic", "ethylene", "vi sinh vật có ích",
                "vi sinh vật đối kháng", "nấm trichoderma", "vi khuẩn bacillus", "vi khuẩn cố định đạm",
                "nấm rễ", "nấm mycorrhiza", "vi khuẩn phân giải lân", "chế phẩm sinh học", "enzyme",
                "protein", "axit amin", "vitamin", "khoáng chất", "oligochitosan", "silica", "canxi",
                "magie", "lưu huỳnh", "bo", "kẽm", "đồng", "sắt", "mangan", "molypden", "coban",
                "vôi nông nghiệp", "thạch cao nông nghiệp", "đất sét", "đất cát", "đất thịt", "đất phù sa",
                "đất bazan", "đất mùn", "đất feralit", "độ pH", "độ chua", "đất kiềm", "nước tưới",
                "đất nhiễm mặn", "đất nhiễm phèn", "đất chua", "đất bạc màu", "đất hoang hóa",
                
                // Mùa vụ và thời điểm
                "vụ đông xuân", "vụ hè thu", "vụ mùa", "gieo trồng", "thu hoạch", "thời vụ", "thời điểm gieo trồng",
                "vụ đông", "vụ sớm", "vụ muộn", "vụ chính", "vụ nghịch", "thời gian sinh trưởng", "chu kỳ sinh trưởng",
                "thời kỳ ra hoa", "thời kỳ đậu trái", "thời kỳ chín", "thời điểm thu hoạch", "thời điểm xuống giống",
                "lịch thời vụ", "thời điểm gieo hạt", "thời điểm làm đất", "thời điểm cấy", "thời điểm tỉa cây",
                "thời điểm bón phân", "thời điểm phun thuốc", "thời điểm tưới nước", "thời điểm trồng", "thời điểm gieo",
                "thời điểm tỉa", "thời điểm làm cỏ", "thời điểm trừ sâu", "thời điểm phòng bệnh", "thời điểm bao trái",
                "thời điểm chăm sóc", "thời điểm tạo tán", "thời điểm kích ra hoa", "thời điểm bật chồi", "thời điểm ngủ đông",
                "thời điểm ra rễ", "thời điểm ra trái", "độ chín thu hoạch", "chín đồng loạt", "chín rải rác",
                
                // Kỹ thuật canh tác
                "luân canh", "xen canh", "gối vụ", "làm đất", "xới đất", "tưới nước", "phun thuốc", "bón phân",
                "bao phủ", "làm cỏ", "tỉa cành", "tạo hình", "ghép cành", "chiết cành",
                "trồng thuần", "trồng xen", "trồng gối", "trồng hỗn hợp", "canh tác hữu cơ", "canh tác truyền thống",
                "canh tác bền vững", "canh tác sinh thái", "canh tác tuần hoàn", "canh tác tái sinh", "trang trại tổng hợp",
                "đào hố", "lên luống", "trồng bầu", "trồng hạt", "giâm cành", "gieo hạt", "ươm cây", "cấy mô", "nuôi cấy mô",
                "tạo giống", "lai tạo", "thu thập", "sàng lọc", "bảo tồn giống", "bảo tồn nguồn gen", "chọn giống", 
                "sản xuất giống", "kiểm định giống", "bảo vệ giống", "bản quyền giống cây trồng", "ngân hàng gen",
                "chuyển gen", "gen biến đổi", "cây biến đổi gen", "cây chuyển gen", "khảo nghiệm giống", "thử nghiệm giống",
                "nhân giống", "nhân dòng vô tính", "khử trùng", "phâm loại", "phân loại cây", "xác định giống",
                "cắt tỉa", "uốn cành", "trồng dày", "trồng thưa", "bón lót", "bón thúc", "bón rãi", "bón vùi", "bón gốc",
                "bón lá", "tưới phun", "tưới nhỏ giọt", "tưới rãnh", "tưới ngập", "tưới tràn", "tưới nổ", "tưới tự động",
                "tưới tay", "tưới tiết kiệm", "tưới theo độ ẩm", "thu gom", "thu hoạch bằng máy", "thu hoạch thủ công",
                "đóng gói", "phân loại", "dán nhãn", "đóng thùng", "xử lý sau thu hoạch", "bảo quản", "vận chuyển",
                "phân phối", "tiêu thụ", "sơ chế", "chế biến", "bảo quản lạnh", "bảo quản đông lạnh", "sấy khô", "ủ chua",
                "hun khói", "đóng hộp", "thanh trùng", "tiệt trùng", "xông hơi", "chiếu xạ", "bao bì", "thùng xốp",
                "giấy gói", "màng bọc", "túi khí", "túi hút chân không", "khí quyển điều chỉnh", "kho lạnh", "kho thường", 
                "hầm chứa", "silô", "cơ giới hóa", "tự động hóa", "robot nông nghiệp", "máy cấy", "máy gặt", "máy tuốt",
                
                // Bệnh hại và xử lý
                "sâu", "bệnh", "nấm", "vi khuẩn", "rỉ sắt", "đạo ôn", "thán thư", "vàng lá", "héo rũ", "xoăn lá",
                "sâu đục thân", "sâu đục quả", "sâu ăn lá", "sâu cuốn lá", "sâu khoang", "sâu xanh", "sâu róm", "sâu tơ",
                "sâu vẽ bùa", "rầy nâu", "rầy xanh", "rầy lưng trắng", "bọ trĩ", "bọ xít", "bọ rùa", "ruồi đục quả",
                "ruồi vàng", "ruồi giấm", "bọ cánh cứng", "bọ hung", "mọt", "nhện đỏ", "nhện gié", "tuyến trùng", "bọ trĩ",
                "bệnh thối rễ", "bệnh lở cổ rễ", "bệnh thối thân", "bệnh thối củ", "bệnh thối quả", "bệnh thối nhũn",
                "bệnh khảm", "bệnh virus", "bệnh vàng lá", "bệnh đốm lá", "bệnh đốm nâu", "bệnh gỉ sắt", "bệnh thán thư",
                "bệnh sương mai", "bệnh phấn trắng", "bệnh thối đen", "bệnh thối xám", "bệnh thối hồng", "bệnh héo vàng",
                "bệnh héo xanh", "bệnh chùn đọt", "bệnh vàng lùn", "bệnh lùn sọc đen", "bệnh cháy bìa lá", "bệnh cháy lá",
                "bệnh thối gốc", "bệnh thối bắp", "bệnh tuyến trùng", "bệnh nứt thân", "bệnh nứt quả", "bệnh sẹo",
                "bệnh đen vỏ", "bệnh loét", "bệnh ghẻ", "bệnh bạch tạng", "bệnh vàng lá thối rễ", "thiếu dinh dưỡng",
                "thiếu đạm", "thiếu lân", "thiếu kali", "thiếu canxi", "thiếu magie", "thiếu lưu huỳnh", "thiếu sắt",
                "thiếu kẽm", "thiếu đồng", "thiếu bo", "thiếu molypden", "thừa đạm", "thừa lân", "thừa kali", "thừa phân bón",
                "ngộ độc phân bón", "ngộ độc thuốc BVTV", "cháy lá do thuốc", "cháy rễ", "thối rễ do ngập", "héo do hạn",
                "rụng lá do khô", "rụng trái non", "nứt quả do mưa", "dập quả do mưa đá", "thối quả do mưa",
                
                // Kỹ thuật trồng và chăm sóc
                "mật độ", "khoảng cách", "chiều sâu", "thời gian", "thời kỳ", "giai đoạn", "sinh trưởng",
                "ra hoa", "đậu trái", "phát triển", "nuôi dưỡng", "chăm sóc",
                "gieo hạt", "ươm mầm", "cây con", "cây mạ", "cấy", "trồng bầu", "trồng cây", "làm giàn", "làm chống",
                "tỉa cành", "tạo tán", "uốn tán", "tạo hình", "tỉa chồi", "tỉa nhánh", "tỉa hoa", "tỉa quả", "tỉa rễ",
                "tưới nước", "thoát nước", "bón phân", "làm cỏ", "vun gốc", "phủ gốc", "cắt tỉa", "đánh đông", "ủ đông",
                "kích thích ra hoa", "xử lý ra hoa", "bao trái", "bao bắp", "bao buồng", "thu hoạch đúng độ chín",
                "dưỡng bộ rễ", "dưỡng thân", "dưỡng cành", "dưỡng lá", "kích thích ra rễ", "kích thích sinh trưởng",
                "chăm sóc cây con", "chăm sóc cây trưởng thành", "chăm sóc sau thu hoạch", "xử lý trước khi trồng",
                "xử lý hạt giống", "ương cây", "che nắng", "che mưa", "che gió", "che sương", "lưới che", "màng phủ",
                "màng cách ly", "rơm rạ", "trấu", "lá khô", "mụn dừa", "vỏ trấu", "than bùn", "bột xơ dừa", "tro trấu",
                "đất thịt nhẹ", "đất mùn", "hỗn hợp giá thể", "giá thể hữu cơ", "giá thể vô cơ", "giá thể mụn dừa",
                "giá thể đá vermiculite", "giá thể perlite", "giá thể sơ dừa", "giá thể than bùn", "lô hội", 
                
                // Nông nghiệp công nghệ cao
                "thủy canh", "khí canh", "nhà kính", "nhà lưới", "tưới nhỏ giọt", "tưới phun mưa",
                "IoT", "cảm biến", "tự động hóa", "nông nghiệp thông minh", "nông nghiệp 4.0",
                "nông nghiệp hữu cơ", "nông nghiệp sạch", "nông nghiệp bền vững",
                "nông nghiệp tuần hoàn", "nông nghiệp tái sinh", "nông nghiệp thẳng đứng", "nông nghiệp đô thị",
                "nông nghiệp trong nhà", "nông nghiệp container", "nông nghiệp chính xác", "nông nghiệp trên mái",
                "nông nghiệp kết hợp", "dữ liệu nông nghiệp", "hệ thống giám sát", "hệ thống cảnh báo", "dò tìm sâu bệnh",
                "canh tác kết hợp", "hệ thống canh tác kết hợp", "không canh tác", "canh tác tối thiểu", 
                "tưới nhỏ giọt tự động", "tưới phun tự động", "tưới theo thời gian", "tưới theo độ ẩm", "tưới theo nhu cầu",
                "điều khiển từ xa", "điều khiển tự động", "robot nông nghiệp", "máy bay không người lái", "drone",
                "ảnh vệ tinh", "ảnh hàng không", "viễn thám", "bản đồ canh tác", "bản đồ nông nghiệp", "bản đồ sâu bệnh",
                "bản đồ thổ nhưỡng", "bản đồ dinh dưỡng", "phân tích đất", "phân tích lá", "phân tích nước", "phân tích quả",
                "nông lâm kết hợp", "nông ngư kết hợp", "nông súc kết hợp", "hệ thống aquaponic", "thuỷ trồng kết hợp nuôi cá",
                "nuôi tôm kết hợp trồng rừng", "vườn-ao-chuồng", "VAC", "thâm canh", "quảng canh", "canh tác tự nhiên",
                
                // Giao tiếp và chào hỏi
                "xin chào", "chào bạn", "kính chào", "xin kính chào", "thân chào", "xin hỏi", "giúp tôi", "tư vấn", 
                "hỏi đáp", "hỏi thăm", "tạm biệt", "tư vấn", "chào hỏi", "hướng dẫn", "giải đáp", "thắc mắc",
                "cảm ơn", "xin cảm ơn", "cám ơn", "cảm tạ", "tri ân", "cảm kích", "biết ơn", "xin lỗi", "xin phép",
                "chúc mừng", "chúc ngon miệng", "chúc sức khỏe", "chúc may mắn", "chúc thành công", "chúc bình an",
                "chào buổi sáng", "chào buổi trưa", "chào buổi chiều", "chào buổi tối", "chúc ngủ ngon", 
                "xin giới thiệu", "cho hỏi", "làm ơn", "vui lòng", "xin vui lòng", "nhờ bạn", "giúp đỡ", "hỗ trợ",
                "tư vấn giống", "tư vấn phân bón", "tư vấn thuốc", "tư vấn canh tác", "tư vấn kỹ thuật",
                "xin tư vấn", "mong muốn", "khảo sát", "đánh giá", "phản hồi", "góp ý", "khiếu nại", "phản ánh",
                "liên hệ", "kết nối", "gặp gỡ", "thăm quan", "tham quan", "khách hàng", "đối tác", "nhà cung cấp",
                "trao đổi", "thảo luận", "chia sẻ kinh nghiệm", "học hỏi", "rất vui được gặp", "hân hạnh được gặp",
                "gặp lại sau", "hẹn gặp lại", "rất tiếc", "rất buồn", "mong thông cảm", "mong thứ lỗi", "xin thứ lỗi"
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