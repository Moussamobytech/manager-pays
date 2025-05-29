import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

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

  supprimer(id: string): Observable<any> {
    return this.api.delete(`/produit/supprimer/${id}`);
  }

  products(): any {
    return this.api.get(`/produit/list`).toPromise();
  }
  getProductsWithCampaigns(): Promise<any> {
    return this.api.get(`/produit/products-with-campaigns`).toPromise();
  }

  public getCategories() {
    return this.api.get('/categorie/list').toPromise();
  }

  public getProductByCategorie(id: string): any {
    return this.api.get('/produit/list-by-category/' + id).toPromise();
  }

  public getProductBySeller(username: string):Observable<any> {
    return this.api.get('/produit/list-by-user/' + username);
  }

  public getAllProducts() {
    return this.api.get('/produit/list').toPromise();
  }

  public getProductById(id) {
    return this.api.get('/produit/find/' + id).toPromise();
  }

  public viewProductById(id) {
    return this.api.post(`/produit/view-product/${id}`,null).toPromise();
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
   // return this.api.get('/produit/top-rates').toPromise();
    return this.api.get('/produit/products-with-campaigns').toPromise();
  }

  public getViewsForCurrentMonthOfProduct(username) {
    return this.api.get('/produit/views-month/'+username).toPromise();
  }


  public getproductOnPromo(limit){
    return this.api.get('/campagne/all-product-promo-active?limit='+limit).toPromise();
  }

  public addToFavorites(produitId: string,userId: string): Observable<any> {
    
    return this.api.post(`/produit/like/${produitId}/${userId}`, null);
  }

  public getFavorites(userId: string): Observable<any> {
    return this.api.get(`/produit/favorites/${userId}`);
  }

  public removeFromFavorites(productId: string,userId: string): Observable<any> {
    return this.api.delete(`/produit/unlike/${productId}/${userId}`);
  }
  public getProduitsLikesByUser(userId: string): Observable<any> {
    console.log('USER ID :::::::::::: ',userId);
    return this.api.get(`/produit/likes/${userId}`).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response.map(product => ({
            ...product,
            isFavorite: true
          }));
        }
        return response;
      })
    );
  }

}
