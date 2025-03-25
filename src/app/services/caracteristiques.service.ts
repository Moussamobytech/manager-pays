import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { TokenStorageService } from './token-storage.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CaracteristiquesService {
  user: User | null = null;

  constructor(private api: ApiService) {}

  public getCaracteristiques(): Observable<any>  {
    return this.api.get('/caracteristiques/liste');
  }

  public findByProduit(id: string) {
    return this.api.get('/caracteristiques//list-to-caracteristique/'+ id).toPromise();
  }

  public findByCaracteristiques(id: string) {
    return this.api.get('/caracteristiques/list-from-caracteristique/'+ id).toPromise();
  }

  public find(id: string): Observable<any> {
    return this.api.get('/caracteristiques/find/' + id);
  }

  public delete(id: string): Observable<any> {
    return this.api.delete('/caracteristiques/delete/' + id);
  }

  public addCaracteristiques(caracteristiques: any) {
    return this.api.post(`/caracteristiques/add`, caracteristiques);
  }

  public addCaracteristiquesToProduct(caracteristiques: any) {
    return this.api.post(`/caracteristiques/add-to-product`, caracteristiques);
  }

  public updateCaracteristiques(id: string,
    caracteristiques: any
  ): Observable<any> {
    // Envoyer la requête PUT à l'API avec l'objet FormData
    return this.api.put(`/caracteristiques/update/${id}`, caracteristiques);
  }
}
