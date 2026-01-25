package org.tribenet.tribenet.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.tribenet.tribenet.dto.AuthResponseDTO;
import org.tribenet.tribenet.dto.LoginDTO;
import org.tribenet.tribenet.dto.RegisterDTO;
import org.tribenet.tribenet.model.Role;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.repository.UserRepo;
import org.tribenet.tribenet.utility.JwtUtil;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepo repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    AuthService(UserRepo repo, PasswordEncoder encoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager, UserService userService){
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    public ResponseEntity<?> registerUser(RegisterDTO dto) {
        try {
            User user = convertRegisterDTOToEntity(dto);
            User registeredUser = repo.save(user);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "username", registeredUser.getUsername()
            ));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Username already exists"));
        }
    }

    public ResponseEntity<?> loginUser(LoginDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );

            UserDetails userDetails = userService.loadUserByUsername(dto.getUsername());
            String role = userDetails.getAuthorities().iterator().next().getAuthority();
            String token = jwtUtil.generateToken(dto.getUsername(), role);

            AuthResponseDTO response = new AuthResponseDTO(token, dto.getUsername(), role);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }


    private User convertRegisterDTOToEntity(RegisterDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setRole(dto.getRole() != null ? dto.getRole() : Role.USER);
        return user;
    }
}
