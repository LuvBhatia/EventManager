package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByUserIdAndIsReadFalseAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false AND n.isActive = true")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    List<Notification> findByUserIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(Long userId, Notification.NotificationType type);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isActive = true ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userId") Long userId);
}
