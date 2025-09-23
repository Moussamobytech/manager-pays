import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { get } from 'http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  constructor(private api: ApiService,) { }


  getAllPaiements(): Observable<any> {  
    return this.api.get(`/paiement/get-all`);
  }

  
  getPaiementById(id: any): any {   
    return this.api.get(`/paiement/getById/${id}`);
  }
  addPaiement(data: any): any {   
    return this.api.post(`/paiement/create`, data);
  }
  updatePaiement(id: any, data: any): any {
    return this.api.put(`/paiement/update/${id}`, data);
  }
  deletePaiement(id: any): any {
    return this.api.delete(`/paiement/delete/${id}`);
  }
  getPaiementByCode(code: any): any {
    return this.api.get(`/paiement/getByCode/${code}`);
  }
}
