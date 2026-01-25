package org.tribenet.tribenet.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.tribenet.tribenet.dto.UserResponseDTO;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.service.AdminService;
import org.tribenet.tribenet.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        List<UserResponseDTO> users = adminService.getAllUsersAdmin(currentUser);
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        adminService.deleteUser(userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @DeleteMapping("/clubs/{clubId}")
    public ResponseEntity<Map<String, String>> deleteClub(@PathVariable Long clubId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        adminService.deleteClubAdmin(clubId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Club deleted successfully"));
    }

    private User getUserFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return userService.findByUsername(userDetails.getUsername());
    }
}
