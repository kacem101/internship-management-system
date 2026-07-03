package com.enscs.internship.config;

import com.enscs.internship.security.CustomUserDetailsService;
import com.enscs.internship.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableAsync        // SPRINT 2 — for @Async in NotificationServiceImpl and AuditServiceImpl
@EnableScheduling   // SPRINT 2 — for @Scheduled in OverdueReportScheduler
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public ────────────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()

                // ── Users ─────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // ── Offers ────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,    "/api/offers/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/offers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/offers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/offers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/offers/**").hasRole("ADMIN")

                // ── Companies / Contacts / Requirements / Attachments ─────────
                .requestMatchers(HttpMethod.POST, "/api/companies").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/companies/*/verify").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/companies/*/contacts").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/companies/**").hasAnyRole("ADMIN", "SUPERVISOR", "COMPANY_CONTACT")
                .requestMatchers("/api/company-contacts/**").hasRole("COMPANY_CONTACT")
                .requestMatchers(HttpMethod.GET, "/api/requirements/me").hasRole("STUDENT")
                .requestMatchers(HttpMethod.GET, "/api/requirements").hasAnyRole("ADMIN", "SUPERVISOR")
                .requestMatchers("/api/attachments/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/reports/*/verification").hasRole("COMPANY_CONTACT")
                .requestMatchers(HttpMethod.GET, "/api/reports/*/verification").authenticated()

                // ── Applications ──────────────────────────────────────────────
                .requestMatchers("/api/applications/**").authenticated()

                // ── Reports ───────────────────────────────────────────────────
                .requestMatchers("/api/reports/**").authenticated()

                // ── Evaluations ───────────────────────────────────────────────
                .requestMatchers("/api/evaluations/**").hasAnyRole("SUPERVISOR", "ADMIN", "STUDENT")

                // ── SPRINT 2: Notifications — any authenticated user ──────────
                .requestMatchers("/api/notifications/**").authenticated()

                // ── SPRINT 3: Audit log — admin only ─────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
