package com.Drive_Service.repo;

import com.Drive_Service.model.DriveItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// To hold the data we need to make a entity
public interface ItemRepository extends JpaRepository<DriveItem, UUID> {

    // Find items inside a parent folder,
    // filter by status, and sort by name.
    List<DriveItem> findByParentIdAndStatusOrderByNameAsc(UUID parentId, DriveItem.Status status);

    // Check whether any items have this parent ID.
    boolean existsByParentId(UUID parentId);

    // Retrieve an item while requesting a write lock.
    @Lock(LockModeType.PESSIMISTIC_WRITE)       // so that only one person can lock at onetime
    @Query("select i from DriveItem i where i.id =:id") //query finds the drive item whose ID matches the supplied ID.
    Optional<DriveItem> lockById(@Param("id") UUID id);
}                               // This connects the Java method parameter to the :id parameter in the query.
