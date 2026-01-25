package org.tribenet.tribenet.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tribenet.tribenet.dto.UserResponseDTO;
import org.tribenet.tribenet.exception.ResourceNotFoundException;
import org.tribenet.tribenet.exception.UnauthorizedException;
import org.tribenet.tribenet.model.Role;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.repository.ClubRepo;
import org.tribenet.tribenet.repository.UserRepo;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepo userRepo;
    private final ClubRepo clubRepo;

    public AdminService(UserRepo userRepo, ClubRepo clubRepo) {
        this.userRepo = userRepo;
        this.clubRepo = clubRepo;
    }

    public List<UserResponseDTO> getAllUsersAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only system administrators can access this resource");
        }

        return userRepo.findAll().stream()
                .map(this::convertToUserResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only system administrators can delete users");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (userId.equals(currentUser.getId())) {
            throw new UnauthorizedException("Cannot delete your own account");
        }

        userRepo.delete(user);
    }

    @Transactional
    public void deleteClubAdmin(Long clubId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only system administrators can force delete clubs");
        }

        if (!clubRepo.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with id: " + clubId);
        }

        clubRepo.deleteById(clubId);
    }

    private UserResponseDTO convertToUserResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
