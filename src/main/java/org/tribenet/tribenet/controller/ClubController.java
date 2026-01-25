package org.tribenet.tribenet.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.tribenet.tribenet.dto.*;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.service.ClubService;
import org.tribenet.tribenet.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clubs")
public class ClubController {

    private final ClubService clubService;
    private final UserService userService;

    public ClubController(ClubService clubService, UserService userService) {
        this.clubService = clubService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ClubDetailDTO> createClub(@Valid @RequestBody ClubCreateDTO dto, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        ClubDetailDTO createdClub = clubService.createClub(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClub);
    }

    @GetMapping
    public ResponseEntity<List<ClubDetailDTO>> getAllClubs() {
        List<ClubDetailDTO> clubs = clubService.getAllClubs();
        return ResponseEntity.ok(clubs);
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<ClubDetailDTO> getClubById(@PathVariable Long clubId) {
        ClubDetailDTO club = clubService.getClubById(clubId);
        return ResponseEntity.ok(club);
    }

    @PutMapping("/{clubId}")
    public ResponseEntity<ClubDetailDTO> updateClub(
            @PathVariable Long clubId,
            @Valid @RequestBody ClubUpdateDTO dto,
            Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        ClubDetailDTO updatedClub = clubService.updateClub(clubId, dto, currentUser);
        return ResponseEntity.ok(updatedClub);
    }

    @DeleteMapping("/{clubId}")
    public ResponseEntity<Map<String, String>> deleteClub(@PathVariable Long clubId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        clubService.deleteClub(clubId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Club deleted successfully"));
    }

    @PostMapping("/{clubId}/join")
    public ResponseEntity<Map<String, String>> joinClub(@PathVariable Long clubId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        clubService.joinClub(clubId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Successfully joined the club"));
    }

    @DeleteMapping("/{clubId}/leave")
    public ResponseEntity<Map<String, String>> leaveClub(@PathVariable Long clubId, Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        clubService.leaveClub(clubId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Successfully left the club"));
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<List<MemberResponseDTO>> getClubMembers(@PathVariable Long clubId) {
        List<MemberResponseDTO> members = clubService.getClubMembers(clubId);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/{clubId}/members/{userId}/promote")
    public ResponseEntity<Map<String, String>> promoteMember(
            @PathVariable Long clubId,
            @PathVariable Long userId,
            Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        clubService.promoteMember(clubId, userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Member promoted to admin successfully"));
    }

    @DeleteMapping("/{clubId}/members/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long clubId,
            @PathVariable Long userId,
            Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        clubService.removeMember(clubId, userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

    private User getUserFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return userService.findByUsername(userDetails.getUsername());
    }
}
