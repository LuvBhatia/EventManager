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
    
    @Query("SELECT h FROM Hall h WHERE h.isActive = true " +
           "AND h.seatingCapacity >= :requiredCapacity " +
           "AND h.id NOT IN (" +
           "    SELECT DISTINCT e.hall.id FROM Event e " +
           "    WHERE e.hall IS NOT NULL " +
           "    AND e.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "    AND ((" +
           "        e.startDate <= :endTime AND e.endDate >= :startTime" +
           "    ) OR (" +
           "        e.startDate IS NULL OR e.endDate IS NULL" +
           "    ))" +
           ") " +
           "ORDER BY " +
           "CASE " +
           "    WHEN h.seatingCapacity <= :requiredCapacity + 20 THEN 1 " +
           "    ELSE 2 " +
           "END, " +
           "h.seatingCapacity ASC")
    List<Hall> findAvailableHalls(@Param("requiredCapacity") Integer requiredCapacity,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT h FROM Hall h WHERE h.isActive = true " +
           "AND h.seatingCapacity >= :requiredCapacity " +
           "AND h.id NOT IN (" +
           "    SELECT DISTINCT e.hall.id FROM Event e " +
           "    WHERE e.hall IS NOT NULL " +
           "    AND e.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "    AND e.id != :excludeEventId " +
           "    AND ((" +
           "        e.startDate <= :endTime AND e.endDate >= :startTime" +
           "    ) OR (" +
           "        e.startDate IS NULL OR e.endDate IS NULL" +
           "    ))" +
           ") " +
           "ORDER BY " +
           "CASE " +
           "    WHEN h.seatingCapacity <= :requiredCapacity + 20 THEN 1 " +
           "    ELSE 2 " +
           "END, " +
           "h.seatingCapacity ASC")
    List<Hall> findAvailableHallsExcludingEvent(@Param("requiredCapacity") Integer requiredCapacity,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime,
                                                @Param("excludeEventId") Long excludeEventId);
}
