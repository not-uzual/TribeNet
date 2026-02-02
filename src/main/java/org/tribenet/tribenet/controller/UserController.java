package org.tribenet.tribenet.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tribenet.tribenet.dto.ClubResponseDTO;
import org.tribenet.tribenet.dto.UserResponseDTO;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    UserController(UserService userService){
        this.userService = userService;
    }
    
    @GetMapping()
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(Authentication auth){
        List<UserResponseDTO> result = userService.getAllUsers(auth);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/clubs")
    public ResponseEntity<List<ClubResponseDTO>> getUserClubs(@PathVariable Long userId) {
        return userService.getUserClubs(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
