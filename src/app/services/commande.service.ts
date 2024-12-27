import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  constructor(private api: ApiService,) { }



  public getAllCommandeByFournisseur(username): Observable<any> {
    return this.api.get('/panier/get-all-by-fournisseur/' + username);
  }

  public getAllCommandeByUsername(username): Observable<any> {
    return this.api.get('/panier/get-all-by-username/' + username);
  }

  public getAllStatusCommander(): Observable<any> {
    return this.api.get('/panier/get-all-status-commande');
  }

  public setStatus(idPanier:string,status:string): Observable<any> {
    return this.api.put(`/panier/set-status/${idPanier}/${status}`,null);
  }
}

