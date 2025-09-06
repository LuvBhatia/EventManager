package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    
    List<ClubMembership> findByClubIdAndIsActiveTrue(Long clubId);
    List<ClubMembership> findByUserIdAndIsActiveTrue(Long userId);
    Optional<ClubMembership> findByUserIdAndClubIdAndIsActiveTrue(Long userId, Long clubId);
    
    @Query("SELECT COUNT(cm) FROM ClubMembership cm WHERE cm.club.id = :clubId AND cm.isActive = true")
    Long countActiveByClubId(@Param("clubId") Long clubId);
    
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club.id = :clubId AND cm.role = :role AND cm.isActive = true")
    List<ClubMembership> findByClubIdAndRole(@Param("clubId") Long clubId, @Param("role") ClubMembership.MembershipRole role);
    
    boolean existsByUserIdAndClubIdAndIsActiveTrue(Long userId, Long clubId);
}
