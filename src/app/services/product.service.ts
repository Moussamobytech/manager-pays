import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { Observable } from 'rxjs';
import { Product } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  user: User | null = null;

  constructor(private api: ApiService, private common: CommonMessageService) {}

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
  async add(formData: any) {
    try {
      let res = await this.api.postFile(`/produit/add`, formData).toPromise();
      this.common.successToast('Produit ajouté avec succèss');
      return res;
    } catch (error: any) {
      console.log(error);
      if (error.error == 'Bad Request') {
        this.common.errorToast('Merci de vérifier les informations saisie !');
      } else {
        this.common.errorToast(
          'Une erreur interne est intervenuu, merci de réessayer !'
        );
      }
    }
    return null;
  }




getTotalProductViewsDate(): Observable<any> {
  return this.api.get(`produit/views-today`);
}

getTotalViewsMonth(): Observable<any> {
  return this.api.get(`produit/month`);
}

getTotalViewsYear(): Observable<any> {
  return this.api.get(`produit/year`);
}
  async edit(id: string, formData: any) {
    try {
      let res = await this.api
        .putFile(`/produit/edit/` + id, formData)
        .toPromise();
      this.common.successToast('Produit modifié avec succèss');
      return res;
    } catch (error: any) {
      console.log(error);
      if (error.error == 'Bad Request') {
        this.common.errorToast('Merci de vérifier les informations saisie !');
      } else {
        this.common.errorToast(
          'Une erreur interne est intervenuu, merci de réessayer !'
        );
      }
    }
    return null;
  }

  find(id: any) {
    return this.api.get(`/produit/find/` + id).toPromise();
  }

  stats(id: any) {
    return this.api.get(`/produit/stats-seller/` + id).toPromise();
  }

  infoSellerContact(id: any) {
    return this.api.get(`/produit/info-seller-contact?username=` + id).toPromise();
  }

  statsSellerContact() {
    return this.api.get(`/produit/stats-seller-contact/`).toPromise();
  }

  statsSellerActif() {
    return this.api.get(`/produit/stats-seller-actifs`).toPromise();
  }

  updateState(id: any, status) {
    return this.api
      .get(`/produit/update-state?id=${id}&status=${status}`)
      .toPromise();
  }

  productUser(id: any) {
    return this.api.get(`/produit/list-by-user/` + id).toPromise();
  }

  supprimer(id: string): Observable<any> {
    return this.api.delete(`/produit/supprimer/${id}`);
  }
  
  products(): any {
    return this.api.get(`/produit/list`).toPromise();
  }
  // searchProducts(term: string): Promise<Product[]> {
  //   return this.products().then(products =>
  //     products.filter(product =>
  //       product.nom.toLowerCase().includes(term.toLowerCase())
  //     )
  //   );
  // }

  searchProducts(term: string): Promise<Product[]> {
    return this.products().then(products =>
      products.filter(product =>
        product.nom.toLowerCase().includes(term.toLowerCase())
      )
    );
  }
  public getCategories() {
    return this.api.get('/categorie/list').toPromise();
  }

  public getProducts(type) {
    return this.api.get('/produit/list-by-category/' + type).toPromise();
  }

  // public getProductByCategorie(categorie: string) {
  //   return this.api.get('/produit/list-by-category/' + categorie).toPromise();
  // }
  public getProductByCategorie(id: string): Observable<any> {
    return this.api.get('/produit/list-by-category/' + id);
  }

  public getProductByCategorieName(categorie: string) {
    return this.api.get('/produit/list-by-category-name/' + categorie).toPromise();
  }




  public getAllProducts() {
    return this.api.get('/produit/list').toPromise();
  }

  public async getProduct(): Promise<Product[]> {
    try {
      const response = await this.api.get('/produit/list').toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching products', error);
      return [];
    }
  }

  public getProductById(id) {
    return this.api.get('/produit/find/' + id).toPromise();
  }

  public getProductByNewArrival(limit) {
    return this.api.get('/produit/new-arrivals?limit='+limit).toPromise();
  }

  public nomProduits() {
    return this.api.get('/produit/liste-noms').toPromise();
  }

  public getProductByPromotion() {
    return this.api.get('/produit/promotions/').toPromise();
  }

  public getProductByBest() {
    return this.api.get('/produit/best-produits/').toPromise();
  }

  public getProductByTop() {
    return this.api.get('/produit/top-rates').toPromise();
  }

  
}
