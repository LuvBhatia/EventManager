package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.SuperAdminRequest;
import com.campus.EventInClubs.domain.model.SuperAdminRequest.SuperAdminRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuperAdminRequestRepository extends JpaRepository<SuperAdminRequest, Long> {
    
    List<SuperAdminRequest> findByStatus(SuperAdminRequestStatus status);
    
    List<SuperAdminRequest> findByStatusOrderByRequestedAtDesc(SuperAdminRequestStatus status);
    
    Optional<SuperAdminRequest> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    long countByStatus(SuperAdminRequestStatus status);
}
