package com.files.crud.db.message;

public class ResponseFile {
  private String name;
  private String url;
  private String type;
  private long size;

  private Long createdAt;

  private Long updatedAt;

  public ResponseFile(String name, String url, String type, long size, Long createdAt, Long updatedAt) {
    this.name = name;
    this.url = url;
    this.type = type;
    this.size = size;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public long getSize() {
    return size;
  }

  public void setSize(long size) {
    this.size = size;
  }

  public Long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Long createdAt) {
    this.createdAt = createdAt;
  }

  public Long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Long updatedAt) {
    this.updatedAt = updatedAt;
  }
}
