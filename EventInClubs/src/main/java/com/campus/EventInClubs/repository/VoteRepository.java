package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Vote;
import com.campus.EventInClubs.domain.model.Vote.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    // Basic queries
    Optional<Vote> findByUserIdAndIdeaId(Long userId, Long ideaId);
    Optional<Vote> findByIdeaIdAndUserId(Long ideaId, Long userId);
    List<Vote> findByIdeaId(Long ideaId);
    List<Vote> findByUserId(Long userId);
    List<Vote> findByIdeaIdAndVoteType(Long ideaId, VoteType voteType);
    
    // Count methods
    Long countByIdeaIdAndVoteType(Long ideaId, VoteType voteType);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId AND v.voteType = 'UP'")
    Long countUpvotesByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId AND v.voteType = 'DOWN'")
    Long countDownvotesByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId")
    Long countTotalVotesByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT v.voteType FROM Vote v WHERE v.user.id = :userId AND v.idea.id = :ideaId")
    Optional<VoteType> findVoteTypeByUserIdAndIdeaId(@Param("userId") Long userId, @Param("ideaId") Long ideaId);
    
    @Query("SELECT v.idea.id FROM Vote v WHERE v.user.id = :userId AND v.voteType = :voteType")
    List<Long> findIdeaIdsByUserIdAndVoteType(@Param("userId") Long userId, @Param("voteType") VoteType voteType);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.user.id = :userId")
    Long countVotesByUserId(@Param("userId") Long userId);
    
    // Additional method for achievement service
    Long countByUserId(Long userId);
    
    @Query("SELECT v.idea.id, COUNT(v) as voteCount FROM Vote v WHERE v.idea.id IN :ideaIds GROUP BY v.idea.id ORDER BY voteCount DESC")
    List<Object[]> countVotesByIdeaIds(@Param("ideaIds") List<Long> ideaIds);
    
    boolean existsByUserIdAndIdeaId(Long userId, Long ideaId);
    
    void deleteByUserIdAndIdeaId(Long userId, Long ideaId);
}
