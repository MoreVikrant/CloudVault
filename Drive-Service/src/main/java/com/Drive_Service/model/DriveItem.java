package com.Drive_Service.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
public class DriveItem {

    public enum Kind {FILE,FOLDER}

    public enum Status{PENDING,READY,DELETING}

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    private UUID parentId;         //File must be inside any parent folder can be  null because the folder
    // can be inside the root also without any parent folder

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Kind kind;

    @Enumerated(EnumType.STRING)      //   tells JPA to store the enum as text.
    @Column(nullable = false)
    private Status status;

    private long size;

    private String mediaType;

    @Column(nullable = false)
    private Instant createdAt;       // At what time the file was created


    @Version
    private Long version;            // If changes made in the file then to maintain the version
    // Say two users rename or move the same file at the same moment.
    // Without @Version, the second save silently overwrites the first

    protected DriveItem(){}      // Jpa requires the No arg constructor

    public DriveItem(String name, UUID parentId, Kind kind, long size, String mediaType){
        this.id = UUID.randomUUID();
        this.kind = kind;
        this.name = name;
        this.parentId = parentId;
        this.mediaType = mediaType;
        this.size = size;
        this.status = kind == Kind.FOLDER ? Status.READY : Status.PENDING;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Kind getKind() {
        return kind;
    }

    public void setKind(Kind kind) {
        this.kind = kind;
    }

    public UUID getParentId() {
        return parentId;
    }

    public void setParentId(UUID parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

}
