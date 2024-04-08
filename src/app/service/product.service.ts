import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { TokenStorageService } from './token-storage.service';


@Injectable({ providedIn: 'root' })
export class ProductService {
    user: User | null = null;

    constructor (private api: ApiService, private common : CommonMessageService) {
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
    async add(formData: any){
        try {
            let res = await this.api.postFile(`/produit/add`, formData).toPromise();
            this.common.successToast("Produit ajouté avec succèss")
            return res;
        } catch (error : any) {
            console.log(error)
            if (error.error == "Bad Request") {
                this.common.errorToast("Merci de vérifier les informations saisie !")
            }else{
                this.common.errorToast("Une erreur interne est intervenuu, merci de réessayer !")
            }
        }
        return null;
    }
    
    async edit(id : string, formData: any){
        try {
            let res = await this.api.putFile(`/produit/edit/`+id, formData).toPromise();
            this.common.successToast("Produit modifié avec succèss")
            return res;
        } catch (error : any) {
            console.log(error)
            if (error.error == "Bad Request") {
                this.common.errorToast("Merci de vérifier les informations saisie !")
            }else{
                this.common.errorToast("Une erreur interne est intervenuu, merci de réessayer !")
            }
        }
        return null;
    }

    
    find(id: any) {
        return this.api.get(`/produit/find/`+id).toPromise();
    }
    
    stats(id: any) {
        return this.api.get(`/produit/stats-seller/`+id).toPromise();
    }
    
    updateState(id: any, status) {
        return this.api.get(`/produit/update-state?id=${id}&status=${status}`).toPromise();
    }
    
    productUser(id: any) {
        return this.api.get(`/produit/list-by-user/`+id).toPromise();
    }
    
    products(id: any): any {
        return this.api.get(`/produit/list`);
    }


}

