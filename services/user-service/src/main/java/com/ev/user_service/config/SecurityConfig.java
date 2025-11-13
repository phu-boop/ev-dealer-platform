package com.ev.user_service.config;

import com.ev.user_service.security.JwtUtil;
import com.ev.user_service.service.RedisService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import com.ev.user_service.filter.RateLimitFilter;
import com.ev.user_service.security.JwtAuthenticationFilter;
import com.ev.user_service.security.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final String urlFrontend;
    private final RateLimitFilter rateLimitFilter;

    SecurityConfig(RateLimitFilter rateLimitFilter, OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                   @Value("${frontend.url}") String urlFrontend) {
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.urlFrontend = urlFrontend;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, RedisService redisService) {
        return new JwtAuthenticationFilter(jwtUtil, redisService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/auth/**", "/auth/oauth2/success", "/users/**",
                                 "/paymentt/**", "/paymentt/return/**").permitAll()
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger/**"
                ).permitAll()
                .requestMatchers("/auth/admin/**").hasRole("ADMIN")
                .requestMatchers("/auth/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/auth/oauth2/success").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(oAuth2LoginSuccessHandler)
            )
            .exceptionHandling(ex -> ex.accessDeniedHandler((req, res, e) -> {
                throw e;
            }))
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(
            @Value("${spring.redis.host:localhost}") String redisHost,
            @Value("${spring.redis.port:6379}") int redisPort) {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHost, redisPort);
        return new LettuceConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(LettuceConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}


//package com.ev.user_service.config;
//
//
//import com.ev.user_service.security.JwtUtil;
//import com.ev.user_service.service.RedisService;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.data.redis.serializer.StringRedisSerializer;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.client.RestTemplate;
//import com.ev.user_service.filter.RateLimitFilter;
//import com.ev.user_service.security.JwtAuthenticationFilter;
//import com.ev.user_service.security.OAuth2LoginSuccessHandler;
//
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//public class SecurityConfig {
//    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
//    private final String urlFrontend;
//    private final RateLimitFilter rateLimitFilter;
//
//    SecurityConfig(RateLimitFilter rateLimitFilter, OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler, @Value("${frontend.url}") String urlFrontend) {
//        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
//        this.urlFrontend = urlFrontend;
//        this.rateLimitFilter = rateLimitFilter;
//    }
//
//    @Bean
//    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, RedisService redisService) {
//        return new JwtAuthenticationFilter(jwtUtil, redisService);
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//                //.cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/", "/error", "/auth/**", "/auth/oauth2/success", "/users/**", "/paymentt/**", "/paymentt/return/**").permitAll()
//                        .requestMatchers(
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html",
//                                "/swagger/**"
//                        ).permitAll()
//                        .requestMatchers("/auth/admin/**").hasRole("ADMIN")
//                        .requestMatchers("/chua/").hasRole("USER")
//                        .requestMatchers("/auth/user/**").hasAnyRole("USER", "ADMIN")
//                        .requestMatchers("/auth/oauth2/success").authenticated()
//                        .anyRequest().authenticated()
//                )
//                .oauth2Login(oauth -> oauth
//                        .successHandler(oAuth2LoginSuccessHandler)
//                )
//                .exceptionHandling(ex -> ex.accessDeniedHandler((req, res, e) -> {
//                    throw e;
//                }))
//                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//
////    @Bean
////    public CorsConfigurationSource corsConfigurationSource() {
////        CorsConfiguration config = new CorsConfiguration();
////        config.setAllowedOrigins(List.of("http://localhost:5173")); // frontend React
////        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
////        config.setAllowedHeaders(List.of("*"));
////        config.setAllowCredentials(true);
////        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
////        source.registerCorsConfiguration("/**", config);
////        return source;
////    }
//
////    @Bean
////    public CorsConfigurationSource corsConfigurationSource() {
////        CorsConfiguration config = new CorsConfiguration();
////        config.setAllowedOrigins(List.of(urlFrontend));
////        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
////        config.setAllowedHeaders(List.of("*"));
////        config.setAllowCredentials(true);
////        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
////        source.registerCorsConfiguration("/**", config);
////        return source;
////    }
//
//    @Bean
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }
//
//    @Bean
//    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
//        RedisTemplate<String, String> template = new RedisTemplate<>();
//        template.setConnectionFactory(connectionFactory);
//        template.setKeySerializer(new StringRedisSerializer());
//        template.setValueSerializer(new StringRedisSerializer());
//        return template;
//    }
//
//}


