package org.tribenet.tribenet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.tribenet.tribenet.model.User;
import java.util.List;


@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.id != :userId")
    List<User> findAllExceptUserId(@Param("userId") Long userId);
}
