package com.files.crud.db.service;

import java.io.IOException;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import com.files.crud.db.model.FileDB;
import com.files.crud.db.repository.FileDBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

  @Autowired
  private FileDBRepository fileDBRepository;

  public FileDB store(MultipartFile file, String userId) throws IOException {
    String fileName = StringUtils.cleanPath(file.getOriginalFilename());
    FileDB FileDB = new FileDB(userId, fileName, file.getContentType(), file.getBytes());

    return fileDBRepository.save(FileDB);
  }

  public FileDB getFile(String id) {
    return fileDBRepository.findById(id).get();
  }
  
  public Stream<FileDB> getAllFiles(String userId) {
    return fileDBRepository.findAllByUserId(userId).stream();
  }

  public FileDB update(MultipartFile file, String userId, String fileId) throws IOException, IllegalAccessException {

    Optional<FileDB> fileDB = fileDBRepository.findById(fileId);
    if(fileDB.isPresent() && Objects.equals(fileDB.get().getUserId(), userId)){
      fileDB.get().setUpdatedAt(Instant.now().toEpochMilli());
      fileDB.get().setData(file.getBytes());
      fileDB.get().setType(file.getContentType());
      fileDB.get().setName(file.getOriginalFilename());
      return fileDBRepository.save(fileDB.get());
    }

    throw new IllegalAccessException("File does not exists");
  }

  public boolean deleteFile(String userId, String id) throws IllegalAccessException {
    Optional<FileDB> fileDB = fileDBRepository.findById(id);
    if(fileDB.isPresent() && Objects.equals(fileDB.get().getUserId(), userId)) {
      fileDBRepository.deleteById(id);
      return true;
    }

    throw new IllegalAccessException("File does not exists");
  }
}
