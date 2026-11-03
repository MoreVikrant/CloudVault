package com.Drive_Service.client;

import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

// if i don't want the eureka in picture and  i have only one instance of the feign client then i can give the url here also
@FeignClient(
        name= "Storage-Service",
        url = "${drive.storage.url}")
public interface StorageClient {

    // in AWS or in any other db when we store files, images called as objects
                     // In internal memory find the objects using the id
    @PutMapping(value = "/internal/objects/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)  // now it will take the media not JSON
    void put(@PathVariable("id") UUID id, @RequestPart("file")MultipartFile file);       // for UPLOAD
    // whenever we are putting here something its file not json right ,
    // that's why when we take the files we use the @RequestPart and hold by the multipart


    // For retrieving an object
    @GetMapping("/internal/objects/{id}")                          // for GET
    Response get(@PathVariable("id") UUID id);

    @DeleteMapping("/internal/objects/{id}")                           // for DELETING AN OBJECT
    void delete(@PathVariable("id") UUID id);


}
