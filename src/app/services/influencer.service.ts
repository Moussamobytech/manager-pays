import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';


@Injectable({ providedIn: 'root' })
export class InfluencerService {

    constructor (private api: ApiService) {
    }
    

    /**
     * Performs the add influencer
     * @param nomComplet nom of user
     * @param email description of user
     * @param code phoneNumber of user
     */
    add(formData: any): any {
        return this.api.post(`/influencer/add`, formData);
    }

    /**
     * Performs the add influencer
     * @param nomComplet nom of user
     * @param email description of user
     * @param code phoneNumber of user
     */
    update(id, formData: any): any {
        return this.api.post(`/influencer/update?id=${id}`, formData);
    }
    
    list(): any {
        return this.api.get(`/influencer/liste`).toPromise();
    }
    
    find(id): any {
        return this.api.get(`/influencer/find/`+id).toPromise();
    }
    
    findByCode(code): any {
        return this.api.get(`/influencer/find-by-code/`+code).toPromise();
    }
    
    setEtat(id, etat): any {
        return this.api.get(`/influencer/etat/${id}/${etat}`).toPromise();
    }


}

