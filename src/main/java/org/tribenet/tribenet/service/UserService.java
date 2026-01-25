package org.tribenet.tribenet.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.tribenet.tribenet.dto.ClubResponseDTO;
import org.tribenet.tribenet.dto.UserResponseDTO;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.model.UserClub;
import org.tribenet.tribenet.model.UserPrincipal;
import org.tribenet.tribenet.repository.UserRepo;

@Service
public class UserService implements UserDetailsService {

    private final UserRepo repo;

    public UserService(UserRepo repo){
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username);

        if(user == null){
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return new UserPrincipal(user);
    }

    public User findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public List<User> getAllUsers(Authentication auth){
        User user = getUserFromAuth(auth);
        return repo.findAllExceptUserId(user.getId());
    }

    public Optional<UserResponseDTO> getUserById(Long userId) {
        return repo.findById(userId)
                .map(this::convertToUserResponseDTO);
    }

    public Optional<List<ClubResponseDTO>> getUserClubs(Long userId) {
        return repo.findById(userId)
                .map(user -> user.getMemberships().stream()
                        .map(this::convertToClubResponseDTO)
                        .collect(Collectors.toList())
                );
    }

    private User getUserFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return findByUsername(userDetails.getUsername());
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

    private ClubResponseDTO convertToClubResponseDTO(UserClub userClub) {
        return new ClubResponseDTO(
                userClub.getClub().getId(),
                userClub.getClub().getName(),
                userClub.getClub().getDescription(),
                userClub.getClub().getCategory(),
                userClub.getClub().isFree(),
                userClub.getClub().getPrice(),
                userClub.getClubRole().name()
        );
    }
}
