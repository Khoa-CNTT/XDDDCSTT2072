package com.agricultural.agricultural.config;

import com.agricultural.agricultural.filters.JwtTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        return http
//                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF để test API
//                .authorizeHttpRequests(requests -> requests
//                        // Cho phép mọi người truy cập vào login và register
//                        .requestMatchers("/api/users/login", "/api/users/register").permitAll()
//
//                        // Phân quyền: cho phép ADMIN truy cập vào các API dưới đường dẫn "/admin/**"
//                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
//
//                        // Phân quyền: cho phép USER và ADMIN truy cập vào các API dưới đường dẫn "/user/**"
//                        .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
//
//                        // Các API khác yêu cầu xác thực người dùng
//                        .anyRequest().authenticated()
//                )
//                .build();

//        return http
//                .csrf(AbstractHttpConfigurer::disable)
//                .authorizeHttpRequests(requests -> requests
//                        .requestMatchers("/**").permitAll() // ✅ Cho phép tất cả request (Tạm thời để test)
//                )
//                .build();

        return http
                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF để test API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không dùng session
                .authorizeHttpRequests(requests -> requests
                        // ✅ Cho phép API đăng nhập/đăng ký không cần token, chỉ định nhiều pattern để phủ hết các trường hợp
                        .requestMatchers("/api/v1/users/login", "/api/v1/users/register",
                                        "/api/users/login", "/api/users/register",
                                "/api/v1/auth/forgot-password","/api/v1/auth/reset-password", 
                                "/api/v1/auth/google/login").permitAll()
                        .requestMatchers("/api/v1/ai/**").permitAll() // ✅ Cho phép truy cập API AI Chat mà không cần xác thực
                        .requestMatchers("/api/v1/gemini/**").permitAll() // ✅ Cho phép truy cập API Gemini mà không cần xác thực
                        .requestMatchers("/api/v1/forum/**").authenticated() // ✅ Yêu cầu đăng nhập với API forum
                        .requestMatchers("/api/v1/orders/**").authenticated() // Yêu cầu xác thực cho API orders
                        .requestMatchers("/api/v1/weather/locations", "/api/v1/weather/locations/*").permitAll() // Cho phép xem thông tin địa điểm 
                        .requestMatchers("/api/v1/weather-subscriptions/**").authenticated() // Yêu cầu xác thực cho đăng ký thời tiết
                        .requestMatchers("/api/v1/user-addresses/**").authenticated() // Yêu cầu xác thực cho địa chỉ người dùng
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN") // Chỉ Admin mới có quyền truy cập API admin
                        .anyRequest().permitAll() // Các API khác được phép truy cập công khai (cân nhắc thay đổi nếu cần bảo mật hơn)
                )
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class) // ✅ Thêm filter kiểm tra JWT
                .build();
    }
}
