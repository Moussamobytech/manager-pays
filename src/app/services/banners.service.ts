import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { TokenStorageService } from './token-storage.service';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class BannersService{
  
      constructor (private utility: CommonMessageService, private tokenStorage: TokenStorageService,
          private api: ApiService, private http : HttpClient) {
      }
  
  
  
  
  
  
    addBanners(formData: any): any {
    return this.api.postFile(`/banners/add`, formData);
}  

async convertUrlToFile(imageUrl: string): Promise<File> {
    const response = await fetch(`/banners/files/download?filename=${encodeURIComponent(imageUrl.split('/').pop()!)}`);
    const blob = await response.blob();
    return new File([blob], "image.jpg", { type: blob.type });
  }
  

getBannersByUsername(username:any):Observable<any>{
    return this.api.get(`/banners/get-by-user/${username}`)
}

}
