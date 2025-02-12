import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../../../models/customers.model';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  public url = "api/users";
  constructor(private api: ApiService, public http:HttpClient) { }

  async getCustomerById(id:any) {
    return await this.api.get('prospect/find/'+id).toPromise();
  }
  async getCustomers(boutiqueName:any): Promise<Observable<Customer[]>> {
    return await this.api.get('prospect/find-by-boutique/'+boutiqueName);
  }

  addCustomer(customer:any){
    return this.api.post(`prospect/add`, customer).subscribe();
  }
  addMultipleCustomers(customers:Customer[]){
    return this.api.post(`prospect/add-multiple`, customers).subscribe();
  }

  updateCustomer(customer:any,id:any){
    return this.api.put(`prospect/edit/`+id, customer).subscribe();
  }

  deleteCustomer(id: any) {
    return this.api.delete(`prospect/delete/`+id).subscribe();
  }

}




