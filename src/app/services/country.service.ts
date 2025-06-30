import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande.models';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  addRegion(data: any): Observable<any> {
    console.log("Form Region ", data);

    return this.api.post(`/region/create`, data);
  }
  getAllRegions(): Observable<any> {
   return this.api.get(`/region/getAll`);
  }


  getAllRegionsByCountrie(id: any):Observable<any> {
    return this.api.get(`/region/getAllByCountrie/${id}`);
      }

  getAllRegionsByCountrieName(name: any):Observable<any> {
    return this.api.get(`/region/getAllByCountrieName/${name}`);
      }

  constructor(private api: ApiService,) { }

  addCountries(datas: any): any {
    return this.api.post(`/country/create`, datas);
  }
  updateCountries(id,datas: any): any {
    return this.api.put(`/country/update/${id}`, datas);
  }
  getAllCountries(): Observable<any> {
    return this.api.get(`/country/getAll`);
  }

  getCityByCountry(id: any): Observable<any> {
    return this.api.get(`/region/getAllByCountrie/${id}`);
  }

  updateState(id: any, status) {
    return this.api
      .put(`/country/status/${id}/${status}`, null)
      .toPromise();
  }



  public delete(id: any) {
    return this.api.delete(`/country/delete/${id}`)
  }
  public getById(id: any): Observable<any> {
    return this.api.get(`/country/get/${id}`)
  }

}




