package com.files.crud.db.repository;

import com.files.crud.db.model.FileDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileDBRepository extends JpaRepository<FileDB, String> {

    @Query(
            value = "SELECT * FROM files u WHERE u.user_id = ?1",
            nativeQuery = true)
    List<FileDB> findAllByUserId(String userId);
}
