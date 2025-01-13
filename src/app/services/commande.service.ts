import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande.models';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  constructor(private api: ApiService,) { }



  getAllCommande():Observable<Commande[]> {
        try{
          let  commande :Observable<Commande[]> = this.api.get("commande/get-all");
          return commande;
        }catch(error){
          return null;
        }
      }
  
      public delete(id : any){
        return this.api.get('/commande/delete?id='+id)
  
    }

  public getAllCommandeByFournisseur(username): Observable<any> {
    return this.api.get('/panier/get-all-by-fournisseur/' + username);
  }

  public getAllByIdCommande(id:string): Observable<any> {
    return this.api.get('/panier/get-all-by-id/' + id);
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

