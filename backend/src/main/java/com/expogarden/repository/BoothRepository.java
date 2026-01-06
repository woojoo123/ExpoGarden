package com.expogarden.repository;

import com.expogarden.domain.Booth;
import com.expogarden.domain.BoothStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoothRepository extends JpaRepository<Booth, Long>, JpaSpecificationExecutor<Booth> {
    
    @Query("SELECT b FROM Booth b WHERE b.id = :id AND b.deletedAt IS NULL")
    Optional<Booth> findByIdAndNotDeleted(@Param("id") Long id);
    
    @Query("SELECT b FROM Booth b WHERE b.status = :status AND b.deletedAt IS NULL")
    Page<Booth> findByStatusAndNotDeleted(@Param("status") BoothStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Booth b WHERE b.exhibitionId = :exhibitionId AND b.status = :status AND b.deletedAt IS NULL")
    Page<Booth> findByExhibitionIdAndStatus(
        @Param("exhibitionId") Long exhibitionId,
        @Param("status") BoothStatus status,
        Pageable pageable
    );
    
    @Query("SELECT b FROM Booth b WHERE b.ownerUserId = :ownerId AND b.deletedAt IS NULL")
    Page<Booth> findByOwnerUserId(@Param("ownerId") Long ownerId, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Booth b WHERE b.exhibitionId = :exhibitionId AND b.status = 'APPROVED' AND b.deletedAt IS NULL")
    long countByExhibitionIdAndApproved(@Param("exhibitionId") Long exhibitionId);
    
    @Query("SELECT COUNT(b) FROM Booth b WHERE b.hallId = :hallId AND b.status = 'APPROVED' AND b.deletedAt IS NULL")
    long countByHallIdAndApproved(@Param("hallId") Long hallId);
}

