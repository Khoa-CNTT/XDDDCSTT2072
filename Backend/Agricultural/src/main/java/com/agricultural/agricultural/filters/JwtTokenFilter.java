package com.agricultural.agricultural.filters;

import com.agricultural.agricultural.components.JwtTokenUtil;
import com.agricultural.agricultural.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    @Value("${api.prefix}")
    private String apiPrefix;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Ghi log đường dẫn URL và phương thức để debug
            String requestURI = request.getRequestURI();
            String method = request.getMethod();
            System.out.println("Request URI: " + requestURI + ", Method: " + method);
            
            // Kiểm tra đường dẫn login/register trước khi xử lý JWT
            if (requestURI.contains("/users/login") || requestURI.contains("/users/register")) {
                System.out.println("Login/Register request - bypassing JWT filter");
                filterChain.doFilter(request, response);
                return;
            }
            
            // 📌 Bỏ qua xác thực nếu API không yêu cầu token
            if (isBypassToken(request)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 📌 Kiểm tra header Authorization
            final String authHeader = request.getHeader("Authorization");
            
            // Bỏ qua kiểm tra JWT nếu không có header, để API công khai vẫn hoạt động
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("Missing or invalid Authorization header for: " + requestURI);
                // Cho các request không có token vẫn đi qua filter chain 
                // để SecurityConfig quyết định có cho phép truy cập hay không
                filterChain.doFilter(request, response);
                return;
            }

            // 📌 Trích xuất token và lấy thông tin user từ token
            final String token = authHeader.substring(7); // Bỏ "Bearer "
            final String email = jwtTokenUtil.extractEmail(token);

            // 📌 Nếu token hợp lệ và user chưa được xác thực
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    User userDetails = (User) userDetailsService.loadUserByUsername(email);
                    
                    if (jwtTokenUtil.validateToken(token, userDetails.getEmail())) {
                        // Chỉ sử dụng các thuộc tính eager của User, không truy cập các thuộc tính lazy
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities()
                                );
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    } else {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ");
                        return;
                    }
                } catch (Exception e) {
                    System.out.println("Lỗi khi tải thông tin người dùng: " + e.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Lỗi khi tải thông tin người dùng: " + e.getMessage());
                    return;
                }
            } else if (email == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Không thể trích xuất email từ token");
                return;
            }

            // 📌 Tiếp tục xử lý request
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            System.out.println("Lỗi xác thực JWT: " + e.getMessage());
            e.printStackTrace();
            
            // Ghi log thêm thông tin cho debug
            if (request.getRequestURI().contains("user-addresses")) {
                System.out.println("Debug API user-addresses:");
                System.out.println("URI: " + request.getRequestURI());
                System.out.println("Method: " + request.getMethod());
                System.out.println("Has Authorization header: " + (request.getHeader("Authorization") != null));
                if (request.getHeader("Authorization") != null) {
                    System.out.println("Auth header starts with Bearer: " + request.getHeader("Authorization").startsWith("Bearer "));
                }
            }
            
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Lỗi xác thực: " + e.getMessage());
        }
    }

    private boolean isBypassToken(@NonNull HttpServletRequest request) {
        // Log URL để debug
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        System.out.println("Current request URL: " + requestURI);
        System.out.println("Current request method: " + method);
        
        // Loại bỏ tham số URL (nếu có) để lấy đường dẫn cơ bản
        String baseURI = requestURI;
        if (baseURI.contains("?")) {
            baseURI = baseURI.substring(0, baseURI.indexOf("?"));
        } else if (baseURI.contains("&")) {
            // Xử lý trường hợp URL không đúng định dạng, có & thay vì ?
            baseURI = baseURI.substring(0, baseURI.indexOf("&"));
        }
        System.out.println("Base URI for bypass check: " + baseURI);
        
        final List<Pair<String, String>> bypassTokens = Arrays.asList(
                Pair.of(String.format("%s/roles", apiPrefix), "GET"),
                // Đảm bảo URL đăng nhập đúng format, thêm nhiều pattern có thể
                Pair.of(String.format("%s/users/login", apiPrefix), "POST"),
                Pair.of(String.format("%s/users/register", apiPrefix), "POST"),
                // Thêm URL không có tiền tố api.prefix nếu cần
                Pair.of("/api/v1/users/login", "POST"),
                Pair.of("/api/users/login", "POST"),
                
                // API refresh token và logout
                Pair.of(String.format("%s/auth/refresh-token", apiPrefix), "POST"),
                Pair.of(String.format("%s/auth/logout", apiPrefix), "POST"),
                
                // Chỉ bypass các API công khai liên quan đến thời tiết
                Pair.of(String.format("%s/weather/locations", apiPrefix), "GET"),
                Pair.of(String.format("%s/weather/locations/[0-9]+$", apiPrefix), "GET"),
                
                // Tạm thời bypass để debug
                Pair.of(String.format("%s/weather-subscriptions", apiPrefix), "GET"),
                Pair.of(String.format("%s/user-addresses", apiPrefix), "GET"),
                
                // VNPAY callback URLs - không yêu cầu xác thực
                Pair.of(String.format("%s/payment/vnpay-return", apiPrefix), "GET"),
                Pair.of(String.format("%s/payment/vnpay-return", apiPrefix), "POST"),
                Pair.of(String.format("%s/payment/vnpay-ipn", apiPrefix), "GET"),
                Pair.of(String.format("%s/payment/vnpay-ipn", apiPrefix), "POST")
        );

        // In ra tất cả các pattern bypass để debug
        System.out.println("===== Bypass patterns =====");
        for (Pair<String, String> bypass : bypassTokens) {
            System.out.println(bypass.getFirst() + " - " + bypass.getSecond());
        }
        System.out.println("===========================");

        for (Pair<String, String> bypassToken : bypassTokens) {
            String pattern = bypassToken.getFirst();
            if ((pattern.contains("[") && 
                 baseURI.matches(pattern) &&
                 request.getMethod().equalsIgnoreCase(bypassToken.getSecond())) ||
                (baseURI.equals(pattern) &&
                 request.getMethod().equalsIgnoreCase(bypassToken.getSecond())) ||
                // Thêm kiểm tra URL kết thúc bằng pattern để đảm bảo phủ hết các trường hợp
                (baseURI.endsWith(pattern) && 
                 request.getMethod().equalsIgnoreCase(bypassToken.getSecond()))) {
                System.out.println("URL bypassed: " + requestURI);
                return true;
            }
        }
        
        // Log URL không được bypass để debug
        System.out.println("URL not bypassed: " + requestURI);
        return false;
    }
}
