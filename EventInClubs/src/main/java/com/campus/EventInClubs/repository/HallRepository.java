package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Hall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HallRepository extends JpaRepository<Hall, Long> {
    
    List<Hall> findByIsActiveTrueOrderBySeatingCapacityAsc();
    
    List<Hall> findBySeatingCapacityGreaterThanEqualAndIsActiveTrueOrderBySeatingCapacityAsc(Integer capacity);
    
    @Query(value = "SELECT h.* FROM halls h WHERE h.is_active = true " +
           "AND h.seating_capacity >= :requiredCapacity " +
           "AND h.id NOT IN (" +
           "    SELECT DISTINCT e.hall_id FROM events e " +
           "    WHERE e.hall_id IS NOT NULL " +
           "    AND e.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "    AND e.approval_status = 'APPROVED' " +
           "    AND ((" +
           "        (e.start_date - INTERVAL '2 hours') <= :endTime AND " +
           "        (e.end_date + INTERVAL '2 hours') >= :startTime" +
           "    ) OR (" +
           "        e.start_date IS NULL OR e.end_date IS NULL" +
           "    ))" +
           ") " +
           "ORDER BY " +
           "CASE " +
           "    WHEN h.seating_capacity <= :requiredCapacity + 20 THEN 1 " +
           "    ELSE 2 " +
           "END, " +
           "h.seating_capacity ASC", nativeQuery = true)
    List<Hall> findAvailableHalls(@Param("requiredCapacity") Integer requiredCapacity,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);
    
    @Query(value = "SELECT h.* FROM halls h WHERE h.is_active = true " +
           "AND h.seating_capacity >= :requiredCapacity " +
           "AND h.id NOT IN (" +
           "    SELECT DISTINCT e.hall_id FROM events e " +
           "    WHERE e.hall_id IS NOT NULL " +
           "    AND e.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "    AND e.approval_status = 'APPROVED' " +
           "    AND e.id != :excludeEventId " +
           "    AND ((" +
           "        (e.start_date - INTERVAL '2 hours') <= :endTime AND " +
           "        (e.end_date + INTERVAL '2 hours') >= :startTime" +
           "    ) OR (" +
           "        e.start_date IS NULL OR e.end_date IS NULL" +
           "    ))" +
           ") " +
           "ORDER BY " +
           "CASE " +
           "    WHEN h.seating_capacity <= :requiredCapacity + 20 THEN 1 " +
           "    ELSE 2 " +
           "END, " +
           "h.seating_capacity ASC", nativeQuery = true)
    List<Hall> findAvailableHallsExcludingEvent(@Param("requiredCapacity") Integer requiredCapacity,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime,
                                                @Param("excludeEventId") Long excludeEventId);
}
