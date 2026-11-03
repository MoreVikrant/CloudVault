package com.Drive_Service.controller;

import com.Drive_Service.dto.FileDownload;
import com.Drive_Service.dto.FolderRequest;
import com.Drive_Service.model.DriveItem;
import com.Drive_Service.service.DriveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api")
public class DriveController {

    private final DriveService drive;

    public DriveController(DriveService drive) {
        this.drive = drive;
    }

    @PostMapping("/folders")
    @ResponseStatus(HttpStatus.CREATED)
    public DriveItem folder(@Valid @RequestBody FolderRequest request){
        return drive.create(request.name(),request.parentId());
    }

    @GetMapping("/items")
    List<DriveItem> List(@RequestParam(required = false) UUID parentId){
        return drive.list(parentId);
    }

    @PostMapping(value = "/files",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DriveItem upload(@RequestPart("file") MultipartFile file ,@RequestParam(required = false) UUID parentId ){
         return drive.upload(parentId, file);
    }

    @GetMapping("/files/{id}")
    public ResponseEntity<StreamingResponseBody> download(@PathVariable UUID id) throws Exception {
        FileDownload download = drive.download(id);
        try{
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                    .filename(download.name(), StandardCharsets.UTF_8).build().toString())
                    .header("X-Content-Type-Options","nosniff")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(download.size()).body(download::writeTo);
        } catch (RuntimeException e) {
            download.close();
            throw e;
        }

    }

    @DeleteMapping("/items/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id){
        drive.delete(id);
    }
}
