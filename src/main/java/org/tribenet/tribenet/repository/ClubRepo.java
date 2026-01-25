package org.tribenet.tribenet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.tribenet.tribenet.model.Club;

@Repository
public interface ClubRepo extends JpaRepository<Club, Long> {
}
