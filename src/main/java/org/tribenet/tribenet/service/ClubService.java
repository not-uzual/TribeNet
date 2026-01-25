package org.tribenet.tribenet.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tribenet.tribenet.dto.*;
import org.tribenet.tribenet.exception.BadRequestException;
import org.tribenet.tribenet.exception.ResourceNotFoundException;
import org.tribenet.tribenet.exception.UnauthorizedException;
import org.tribenet.tribenet.model.Club;
import org.tribenet.tribenet.model.ClubRole;
import org.tribenet.tribenet.model.Role;
import org.tribenet.tribenet.model.User;
import org.tribenet.tribenet.model.UserClub;
import org.tribenet.tribenet.repository.ClubRepo;
import org.tribenet.tribenet.repository.UserClubRepo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClubService {

    private final ClubRepo clubRepo;
    private final UserClubRepo userClubRepo;

    public ClubService(ClubRepo clubRepo, UserClubRepo userClubRepo) {
        this.clubRepo = clubRepo;
        this.userClubRepo = userClubRepo;
    }

    @Transactional
    public ClubDetailDTO createClub(ClubCreateDTO dto, User creator) {
        Club club = new Club();
        club.setName(dto.getName());
        club.setDescription(dto.getDescription());
        club.setCategory(dto.getCategory());
        club.setFree(dto.getFree());
        club.setPrice(dto.getPrice());
        club.setCreator(creator);

        Club savedClub = clubRepo.save(club);

        UserClub membership = new UserClub();
        membership.setUser(creator);
        membership.setClub(savedClub);
        membership.setClubRole(ClubRole.ADMIN);
        membership.setJoinedAt(LocalDateTime.now());
        userClubRepo.save(membership);

        return convertToClubDetailDTO(savedClub);
    }

    public List<ClubDetailDTO> getAllClubs() {
        return clubRepo.findAll().stream()
                .map(this::convertToClubDetailDTO)
                .collect(Collectors.toList());
    }

    public ClubDetailDTO getClubById(Long clubId) {
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
        return convertToClubDetailDTO(club);
    }

    @Transactional
    public ClubDetailDTO updateClub(Long clubId, ClubUpdateDTO dto, User currentUser) {
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        if (!isUserClubAdmin(clubId, currentUser.getId())) {
            throw new UnauthorizedException("Only club admins can update club details");
        }

        if (dto.getName() != null) {
            club.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            club.setDescription(dto.getDescription());
        }
        if (dto.getCategory() != null) {
            club.setCategory(dto.getCategory());
        }
        if (dto.getFree() != null) {
            club.setFree(dto.getFree());
        }
        if (dto.getPrice() != null) {
            club.setPrice(dto.getPrice());
        }

        Club updatedClub = clubRepo.save(club);
        return convertToClubDetailDTO(updatedClub);
    }

    @Transactional
    public void deleteClub(Long clubId, User currentUser) {
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only system administrators can delete clubs");
        }

        clubRepo.delete(club);
    }

    @Transactional
    public void joinClub(Long clubId, User user) {
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        if (userClubRepo.findByUserIdAndClubId(user.getId(), clubId).isPresent()) {
            throw new BadRequestException("You are already a member of this club");
        }

        UserClub membership = new UserClub();
        membership.setUser(user);
        membership.setClub(club);
        membership.setClubRole(ClubRole.MEMBER);
        membership.setJoinedAt(LocalDateTime.now());
        userClubRepo.save(membership);
    }

    @Transactional
    public void leaveClub(Long clubId, User user) {
        UserClub membership = userClubRepo.findByUserIdAndClubId(user.getId(), clubId)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this club"));

        List<UserClub> admins = userClubRepo.findAdminsByClubId(clubId);
        if (admins.size() == 1 && admins.get(0).getId().equals(membership.getId())) {
            throw new BadRequestException("Cannot leave club: you are the last admin. Please promote another member first or delete the club.");
        }

        userClubRepo.delete(membership);
    }

    public List<MemberResponseDTO> getClubMembers(Long clubId) {
        if (!clubRepo.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with id: " + clubId);
        }

        return userClubRepo.findByClubId(clubId).stream()
                .map(this::convertToMemberResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void promoteMember(Long clubId, Long userId, User currentUser) {
        if (!isUserClubAdmin(clubId, currentUser.getId())) {
            throw new UnauthorizedException("Only club admins can promote members");
        }

        UserClub membership = userClubRepo.findByUserIdAndClubId(userId, clubId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this club"));

        if (membership.getClubRole() == ClubRole.ADMIN) {
            throw new BadRequestException("User is already a club admin");
        }

        membership.setClubRole(ClubRole.ADMIN);
        userClubRepo.save(membership);
    }

    @Transactional
    public void removeMember(Long clubId, Long userId, User currentUser) {
        if (!isUserClubAdmin(clubId, currentUser.getId())) {
            throw new UnauthorizedException("Only club admins can remove members");
        }

        UserClub membership = userClubRepo.findByUserIdAndClubId(userId, clubId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this club"));

        if (userId.equals(currentUser.getId())) {
            throw new BadRequestException("Cannot remove yourself. Use the leave endpoint instead.");
        }

        if (membership.getClubRole() == ClubRole.ADMIN) {
            List<UserClub> admins = userClubRepo.findAdminsByClubId(clubId);
            if (admins.size() == 1) {
                throw new BadRequestException("Cannot remove the last admin. Promote another member first.");
            }
        }

        userClubRepo.delete(membership);
    }

    private boolean isUserClubAdmin(Long clubId, Long userId) {
        return userClubRepo.findByUserIdAndClubId(userId, clubId)
                .map(uc -> uc.getClubRole() == ClubRole.ADMIN)
                .orElse(false);
    }

    private ClubDetailDTO convertToClubDetailDTO(Club club) {
        Integer memberCount = userClubRepo.countByClubId(club.getId());
        return new ClubDetailDTO(
                club.getId(),
                club.getName(),
                club.getDescription(),
                club.getCategory(),
                club.isFree(),
                club.getPrice(),
                club.getCreator() != null ? club.getCreator().getId() : null,
                memberCount
        );
    }

    private MemberResponseDTO convertToMemberResponseDTO(UserClub userClub) {
        User user = userClub.getUser();
        return new MemberResponseDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                userClub.getClubRole().name(),
                userClub.getJoinedAt()
        );
    }
}
