package com.files.crud.db.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.files.crud.db.message.ResponseMessage;
import com.files.crud.db.model.FileDB;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.files.crud.db.service.FileStorageService;
import com.files.crud.db.message.ResponseFile;

@Controller
public class FileController {

  @Autowired
  private FileStorageService storageService;

  @PostMapping("/upload/{userId}")
  public ResponseEntity<ResponseMessage> uploadFile(@PathVariable("userId") String userId , @RequestParam("file") MultipartFile file) {
    String message = "";
    try {
      storageService.store(file, userId);

      message = "Uploaded the file successfully: " + file.getOriginalFilename();
      return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
    } catch (Exception e) {
      message = "Could not upload the file: " + file.getOriginalFilename() + "!";
      return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
    }
  }

  @PostMapping("/update/{userId}/{fileId}")
  public ResponseEntity<ResponseMessage> updateFile(@PathVariable("userId") String userId, @PathVariable("fileId") String fileId ,@RequestParam("file") MultipartFile file) throws IllegalAccessException, IOException {
    String message = "";
//    try {
      storageService.update(file, userId, fileId);

      message = "Updated the file successfully: " + file.getOriginalFilename();
      return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
//    } catch (Exception e) {
//      message = "Could not update the file: " + file.getOriginalFilename() + "!";
//      return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
//    }
  }

  @GetMapping("/files/{userId}")
  public ResponseEntity<List<ResponseFile>> getListFiles(@PathVariable("userId") String userId) {
    List<ResponseFile> files = storageService.getAllFiles(userId).map(dbFile -> {
      String fileDownloadUri = ServletUriComponentsBuilder
          .fromCurrentContextPath()
          .path("/files/")
          .path(userId)
          .path("/")
          .path(dbFile.getId())
          .toUriString();

      return new ResponseFile(
          dbFile.getName(),
          fileDownloadUri,
          dbFile.getType(),
          dbFile.getData().length,
          dbFile.getCreatedAt(),
          dbFile.getUpdatedAt());
    }).collect(Collectors.toList());

    return ResponseEntity.status(HttpStatus.OK).body(files);
  }

  @GetMapping("/files/{userId}/{id}")
  public ResponseEntity<byte[]> getFile(@PathVariable String userId,@PathVariable String id) {
    FileDB fileDB = storageService.getFile(id);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileDB.getName() + "\"")
        .body(fileDB.getData());
  }

  @DeleteMapping("/file/{userId}/{id}")
  public ResponseEntity<ResponseMessage> deleteFile(@PathVariable String userId, @PathVariable String id) throws IllegalAccessException {
    boolean isDeleted = storageService.deleteFile(userId, id);
    if(isDeleted) {
      return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage("File deleted Successfully"));
    } else {
      return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage("File deletion failed"));
    }
  }
}
