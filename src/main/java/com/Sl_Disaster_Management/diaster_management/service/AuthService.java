package com.Sl_Disaster_Management.diaster_management.service;


import com.Sl_Disaster_Management.diaster_management.dto.AuthDTOs;
import com.Sl_Disaster_Management.diaster_management.model.User;
import com.Sl_Disaster_Management.diaster_management.repository.UserRepository;
import com.Sl_Disaster_Management.diaster_management.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;

    public AuthDTOs.MessageResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthDTOs.MessageResponse("Username is already taken!", false);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthDTOs.MessageResponse("Email is already in use!", false);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);
        return new AuthDTOs.MessageResponse("User registered successfully!", true);
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthDTOs.AuthResponse(
                jwt, user.getId(), user.getUsername(),
                user.getFullName(), user.getEmail(), user.getRole().name()
        );
    }
}