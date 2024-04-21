import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { TokenStorageService } from './token-storage.service';


@Injectable({ providedIn: 'root' })
export class CategoryService {
    user: User | null = null;

    constructor (private api: ApiService) {
    }
    

    /**
     * Performs the signup auth
     * @param nom nom of user
     * @param description description of user
     * @param phoneNumber phoneNumber of user
     * @param role role of user
     * @param email email of user
     * @param image1 image1 of user
     * @param image2 image2 of user
     * @param image3 image3 of user
     * @param image4 image4 of user
     * @param image5 image5 of user
     */
    add(formData: any): any {
        return this.api.post(`/produit/list-by-user`, formData);
    }

    
    productUser(id: any) {
        return this.api.get(`/produit/list-by-user/`+id).toPromise();
    }
    
    categories(): any {
        return this.api.get(`/categorie/list`);
    }


}

