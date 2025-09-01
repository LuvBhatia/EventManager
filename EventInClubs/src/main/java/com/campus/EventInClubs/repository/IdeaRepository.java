package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Idea;
import com.campus.EventInClubs.domain.model.Idea.IdeaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    
    List<Idea> findByProblemId(Long problemId);
    
    List<Idea> findByProblemIdAndStatus(Long problemId, IdeaStatus status);
    
    List<Idea> findBySubmittedById(Long submittedById);
    
    List<Idea> findByStatus(IdeaStatus status);
    
    List<Idea> findByIsFeaturedTrue();
    
    @Query("SELECT i FROM Idea i WHERE i.problem.id = :problemId ORDER BY i.voteCount DESC, i.createdAt DESC")
    List<Idea> findTopIdeasByProblemId(@Param("problemId") Long problemId);
    
    @Query("SELECT i FROM Idea i WHERE i.problem.id = :problemId ORDER BY i.createdAt DESC")
    Page<Idea> findByProblemIdWithPagination(@Param("problemId") Long problemId, Pageable pageable);
    
    @Query("SELECT i FROM Idea i WHERE i.submittedBy.id = :userId ORDER BY i.createdAt DESC")
    Page<Idea> findByUserIdWithPagination(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT i FROM Idea i WHERE i.status = 'APPROVED' ORDER BY i.voteCount DESC, i.createdAt DESC")
    List<Idea> findTopApprovedIdeas();
    
    @Query("SELECT i FROM Idea i WHERE i.problem.id = :problemId AND i.status = 'SUBMITTED' ORDER BY i.voteCount DESC")
    List<Idea> findTopSubmittedIdeasByProblemId(@Param("problemId") Long problemId);
    
    @Query("SELECT i FROM Idea i WHERE i.problem.club.id = :clubId ORDER BY i.createdAt DESC")
    Page<Idea> findByClubIdWithPagination(@Param("clubId") Long clubId, Pageable pageable);
    
    @Query("SELECT COUNT(i) FROM Idea i WHERE i.problem.id = :problemId AND i.status = :status")
    Long countByProblemIdAndStatus(@Param("problemId") Long problemId, @Param("status") IdeaStatus status);
    
    @Query("SELECT i FROM Idea i WHERE i.submittedBy.id = :userId AND i.status = :status")
    List<Idea> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") IdeaStatus status);
}
