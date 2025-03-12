import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { TokenStorageService } from './token-storage.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CampagneService {
  user: User | null = null;

  constructor(private api: ApiService,private common: CommonMessageService) {}

  public getCampagne(): Observable<any>  {
    return this.api.get('/campagne/liste/');
  }

  public getCampagneEligible() {
    return this.api.get('/campagne/liste-eligible').toPromise();
  }

  public getCampagneById(id: string): Observable<any> {
    return this.api.get('/campagne/' + id);
  }

  public addCampagne(campagne: any, image: File) {
    const formData = new FormData();
    formData.append('libelle', campagne.libelle);
    formData.append('username', campagne.username);
    formData.append('type', campagne.type);
    formData.append('dateDebut', campagne.dateDebut.toUTCString()); // Convertir la date en chaîne de caractères UTC
    formData.append('dateFin', campagne.dateFin.toUTCString()); // Convertir la date en chaîne de caractères UTC
    formData.append('produit', campagne.produit);
    formData.append('image', image);

    // const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    return this.api.postFile(`/campagne/add`, formData, Headers);
  }

  public updateCampagne(
    id: string,
    libelle: string,
    username: string,
    type: string,
    dateDebut: Date,
    dateFin: Date,
    produit: any,
    image: File
  ): Observable<any> {
    // Créer un objet FormData pour envoyer à l'API
    const formData = new FormData();
    formData.append('id', id);
    formData.append('libelle', libelle);
    formData.append('username', username);
    formData.append('type', type);
    formData.append('dateDebut', dateDebut.toDateString());
    formData.append('dateFin', dateFin.toDateString());

    formData.append('produit', produit);
    formData.append('image', image);

    // Envoyer la requête PUT à l'API avec l'objet FormData
    return this.api.putFile(`/campagne/update/${id}`, formData, Headers);
  }


///!:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
///!:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
///#::::::::::::::::::::::: BY ADAMA :::::::::::::::::::::::::::::::::::
///!:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
///!:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

   public add(formData: any):Observable<any> {
    return  this.api.post(`/campagne/add-campagne`, formData);
  }
  public edit(id:string,formData: any):Observable<any> {    
    return  this.api.put(`/campagne/update-campagne/${id}`,formData);
  }

  public getAllCampagneByUsername(username: string): Observable<any> {
    return this.api.get('/campagne/user-getAllCampagne/' + username);
  }

  public getAllTypePromo(): Observable<any> {
    return this.api.get('/campagne/getAllPromo');
  }
  

  public setStatus(id: string,status:boolean): Observable<any> {
    return this.api.get('/campagne/status/' + id,status);
  }

  updateState(id: any, status) {
    return this.api
      .put(`/campagne/status/${id}/${status}`,null)
      .toPromise();
  }
  supprimer(id: string): Observable<any> {
    return this.api.delete(`/campagne/delete-campagne/${id}`);
  }
  find(id: any) {
    return this.api.get(`/campagne/get-by-id/` + id).toPromise();
  }



  public generateCode(formData: any):Observable<any> {
    return  this.api.post(`/code-promo/add`, formData);
  }

  public getAllCodeByCampagne(id: any):Observable<any> {
    return  this.api.get(`/code-promo/getAllCodeByCampagne/${id}`);
  }
  supprimerCode(id: string): Observable<any> {
    return this.api.delete(`/code-promo/delete/${id}`);
  }

}
