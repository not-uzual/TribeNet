package org.tribenet.tribenet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.tribenet.tribenet.model.UserClub;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserClubRepo extends JpaRepository<UserClub, Long> {

    @Query("SELECT uc FROM UserClub uc WHERE uc.user.id = :userId AND uc.club.id = :clubId")
    Optional<UserClub> findByUserIdAndClubId(@Param("userId") Long userId, @Param("clubId") Long clubId);

    @Query("SELECT uc FROM UserClub uc WHERE uc.club.id = :clubId")
    List<UserClub> findByClubId(@Param("clubId") Long clubId);

    @Query("SELECT COUNT(uc) FROM UserClub uc WHERE uc.club.id = :clubId")
    Integer countByClubId(@Param("clubId") Long clubId);

    @Query("SELECT uc FROM UserClub uc WHERE uc.club.id = :clubId AND uc.clubRole = 'ADMIN'")
    List<UserClub> findAdminsByClubId(@Param("clubId") Long clubId);
}
