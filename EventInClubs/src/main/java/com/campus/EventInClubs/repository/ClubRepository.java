package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.ApprovalStatus;
import com.campus.EventInClubs.domain.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    
    Optional<Club> findByName(String name);
    
    Optional<Club> findByShortName(String shortName);
    
    List<Club> findByCategory(String category);
    
    List<Club> findByIsActiveTrue();
    List<Club> findByIsActiveTrueAndApprovalStatus(ApprovalStatus approvalStatus);
    List<Club> findByApprovalStatus(ApprovalStatus approvalStatus);
    
    List<Club> findByAdminUserId(Long adminUserId);
    
    @Query("SELECT c FROM Club c WHERE c.isActive = true AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Club> searchActiveClubs(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Club c WHERE c.isActive = true ORDER BY c.rating DESC, c.memberCount DESC")
    List<Club> findTopClubs();
    
    @Query("SELECT c FROM Club c WHERE c.isActive = true AND c.category = :category ORDER BY c.rating DESC")
    List<Club> findTopClubsByCategory(@Param("category") String category);
    
    boolean existsByName(String name);
    
    boolean existsByShortName(String shortName);
}
