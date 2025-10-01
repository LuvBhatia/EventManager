package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Problem;
import com.campus.EventInClubs.domain.model.Problem.ProblemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    
    // Basic queries
    List<Problem> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Problem> findByClubId(Long clubId);
    List<Problem> findByClubIdAndIsActiveTrueOrderByCreatedAtDesc(Long clubId);
    List<Problem> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category);
    List<Problem> findByPostedById(Long postedById);
    
    // Legacy methods for backward compatibility
    List<Problem> findByClubIdAndStatus(Long clubId, ProblemStatus status);
    List<Problem> findByStatus(ProblemStatus status);
    List<Problem> findByCategory(String category);
    List<Problem> findByDeadlineBefore(Instant deadline);
    
    @Query("SELECT p FROM Problem p WHERE p.status = 'OPEN' AND p.deadline > :now ORDER BY p.createdAt DESC")
    List<Problem> findActiveProblems(@Param("now") Instant now);
    
    @Query("SELECT p FROM Problem p WHERE p.status = 'OPEN' AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Problem> searchProblems(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT p FROM Problem p WHERE p.status = 'OPEN' AND p.category = :category ORDER BY p.createdAt DESC")
    List<Problem> findActiveProblemsByCategory(@Param("category") String category);
    
    @Query("SELECT p FROM Problem p WHERE p.status = 'OPEN' AND p.deadline > :now ORDER BY p.ideaCount DESC, p.viewCount DESC")
    List<Problem> findTrendingProblems(@Param("now") Instant now);
    
    @Query("SELECT p FROM Problem p WHERE p.club.id = :clubId ORDER BY p.createdAt DESC")
    Page<Problem> findByClubIdWithPagination(@Param("clubId") Long clubId, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Problem p WHERE p.club.id = :clubId AND p.status = :status")
    Long countByClubIdAndStatus(@Param("clubId") Long clubId, @Param("status") ProblemStatus status);
    
    // Search methods
    @Query("SELECT p FROM Problem p WHERE p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<Problem> searchActiveProblems(@Param("searchTerm") String searchTerm);
    
    // Trending problems method
    @Query("SELECT p FROM Problem p WHERE p.isActive = true ORDER BY " +
           "(SELECT COUNT(i) FROM Idea i WHERE i.problem.id = p.id AND i.isActive = true) DESC, " +
           "p.createdAt DESC")
    List<Problem> findTrendingProblems();
    
    // Find problems that are expired (deadline + 1 hour has passed)
    @Query("SELECT p FROM Problem p WHERE p.isActive = true AND p.deadline IS NOT NULL AND p.deadline < :oneHourAgo")
    List<Problem> findExpiredProblems(@Param("oneHourAgo") Instant oneHourAgo);
}
