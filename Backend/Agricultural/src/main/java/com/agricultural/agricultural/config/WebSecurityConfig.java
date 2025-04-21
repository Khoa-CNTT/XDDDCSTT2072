package com.agricultural.agricultural.config;

import com.agricultural.agricultural.filters.JwtTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Enable CORS for specific endpoints or all endpoints
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173") // Allow the frontend to access the backend
                .allowedMethods(HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.PUT.name(), HttpMethod.DELETE.name()) // Allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true); // Allow credentials (cookies, headers, etc.)
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF protection for testing
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless sessions (no session management)
                .authorizeHttpRequests(requests -> requests
                        // ✅ Cho phép API đăng nhập/đăng ký không cần token, chỉ định nhiều pattern để phủ hết các trường hợp
                        .requestMatchers("/api/v1/users/login", "/api/v1/users/register",
                                        "/api/users/login", "/api/users/register").permitAll()
                        .requestMatchers("/api/v1/forum/**").authenticated() // ✅ Yêu cầu đăng nhập với API forum
                        .requestMatchers("/api/v1/orders/**").authenticated() // Yêu cầu xác thực cho API orders
                        .requestMatchers("/api/v1/weather/locations", "/api/v1/weather/locations/*").permitAll() // Cho phép xem thông tin địa điểm 
                        .requestMatchers("/api/v1/weather-subscriptions/**").authenticated() // Yêu cầu xác thực cho đăng ký thời tiết
                        .requestMatchers("/api/v1/user-addresses/**").authenticated() // Yêu cầu xác thực cho địa chỉ người dùng
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN") // Chỉ Admin mới có quyền truy cập API admin
                        .anyRequest().permitAll() // Các API khác được phép truy cập công khai (cân nhắc thay đổi nếu cần bảo mật hơn)
                )
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class) // Add JWT filter
                .build();
    }
}
