package com.Drive_Service.service;

import com.Drive_Service.client.StorageClient;
import com.Drive_Service.dto.FileDownload;
import com.Drive_Service.model.DriveItem;
import feign.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class DriveService {

    // SpringBoot internally uses the slf4j for logging perspective
    private static final Logger log = LoggerFactory.getLogger(DriveService.class);

    // the things that we are getting are in the form of items
    private final ItemService itemService;

    // now if some file reached here i need something to store them right
    private final StorageClient storageClient;

    public DriveService(ItemService itemService, StorageClient storageClient) {
        this.itemService = itemService;
        this.storageClient = storageClient;
    }

    // Creating a folder
    public DriveItem create(String name, UUID parentId){
        return  itemService.create(name,parentId,DriveItem.Kind.FOLDER,0,null);
    }         // I have applied the check before thats why not applying , applying check again is not great practice


    // List of folders
    public List<DriveItem> list( UUID parentId){
        return itemService.list(parentId);
    }


    public DriveItem upload(UUID parentId, MultipartFile file){
        DriveItem item =  itemService.create(file.getOriginalFilename(),parentId,DriveItem.Kind.FILE,file.getSize(),file.getContentType() );
        // Now we need to use the try and catch block
        try{
            storageClient.put(item.getId(), file);
            return itemService.ready(item.getId());           // converting the state to the ready
        }
        catch(RuntimeException e){
          try{
              storageClient.delete(item.getId());
              itemService.remove(item.getId());          // here we are removing  the metadata
          } catch (RuntimeException cleanUpFailure) {
             log.warn("Pending upload cleanUp {}",item.getId() ,cleanUpFailure);
          }
            throw e;
        }
    }

    public FileDownload download(UUID id ){
       DriveItem item = itemService.get(id);
       if(item.getKind() != DriveItem.Kind.FILE){
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The folder has no content");
       }
       // we can also add check like this in the Response
        Response response = storageClient.get(id);
        return new FileDownload(item.getName(),item.getSize(),response);
  // because the  file we are storing is in the local Storage but their info or metadata is stored in H2 databse
    }

    public void delete(UUID id ){

        DriveItem item = itemService.delete(id);
        // Should call FeignClient before removing the metadata
        if(item.getKind() == DriveItem.Kind.FILE){
            storageClient.delete(id);
        }
        itemService.remove(id);
    }


}
