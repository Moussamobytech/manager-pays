import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.models';

@Injectable()
export class CommandeService {
    public url = "api/commande";
    constructor(public http:HttpClient) { }

    getCommandes(): Observable<User[]> {
        return this.http.get<User[]>(this.url);
    }


    updateCommande(user:User){
        return this.http.put(this.url, user);
    }

    deleteCommande(id: number) {
        return this.http.delete(this.url + "/" + id);
    }
}
