import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subscribable, catchError, map, of, throwError, timeout } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Campagne, Category, Contact, Newsletter, Product } from './app.models';
import { environment } from 'src/environments/environment';
import { ApiService } from './services/api.service';
import { Category } from './models/category.models';
import { Product } from './models/product.models';
import { Contact, Newsletter } from './app.models';
import { CartService } from './services/carte.service';
import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';
import { SearchSynonymsService } from './services/search-synonyms.service';

export class Data {
  constructor(
    public categories: Category[],
    public compareList: Product[],
    public wishList: Product[],
    public cartList: any[],
    public totalPrice: number,
    public totalCartCount: number,
  ) {}
}

@Injectable()
export class AppService {
  public Data = new Data(
    [], // categories
    [], // compareList
    [], // wishList
    [], // cartList
    null, //totalPrice,
    0 //totalCartCount
  );

  // public url = "http://localhost:8590/ecommerce/api/v1" ;
  public url = environment.url;
  productList: Product[];

  constructor(
    public http: HttpClient,
    public snackBar: MatSnackBar,
    public apiService: ApiService,
    private cartService:CartService,
    private synonymService: SearchSynonymsService,
  ) {}

  infoSeller(username: string):Observable<any> {
    try {
      return this.apiService.get(`/users/info-for-seller?username=`+username);
    } catch (error) {
      console.log(error)
      return null;
    }
  }

  getImage(fullUrl: any): Observable<any> {
    let reqOpts: any = {
      params: new HttpParams(),
      observe: 'response',
      responseType: 'blob' as 'json',
    };

    return this.http.get<Blob>(fullUrl, reqOpts).pipe(
      timeout(60000),
      catchError((err) => {
        throw err;
      })
    );
  }

  public saveLogs(data : any) {
    return this.apiService.post('/save-logs',data).subscribe(val =>{})
  }

  public getCategoriesByChild(id: string): Observable<any> {
    return this.apiService.get('/categorie/list-child'+(id == null || id == undefined ? '' : '?parent='+id));
  }

  public getCategoriesByChildEnable(id: string): Observable<any> {
    return this.apiService.get('/categorie/list-child-enable'+(id == null ? '' : '?parent='+id));
  }

  public getCategories(): Observable<any> {
    return this.apiService.get('/categorie/list');
  }

  public getCategoriesSidenav(): Observable<any> {
    return this.apiService.get('/categorie/sidenav');
  }

  public getCategorieById(id: string): Observable<any> {
    return this.apiService.get('/categorie/' + id);
  }

  public getBrandById(id: string): Observable<any> {
    return this.apiService.get('/brand/' + id);
  }
  public getProducts(type): Observable<any> {
    return this.apiService.get('/produit/list-by-category/' + type);
  }
  public getProductByCategorie(id: string): Observable<any> {
    return this.apiService.get('/produit/list-by-category/' + id);
  }
  public getAllProducts(): Observable<any> {
    return this.apiService.get('/produit/list');
  }
 
  public searchProducts(term: string): Observable<Product[]> {
    let products = this.getAllProducts().pipe(
      map(products =>
        products.filter((product: Product) =>
          product.nom.toLowerCase().includes(term.toLowerCase())
        )
      )
    );
    return products;
  }

  public searchNotFoundTerme(terme:string):Observable<any>{
    return this.apiService.post(`/produit/search/${terme}`,null);
  }
  
  public getAllSearchNotFoundTerme():Observable<any>{
    console.log(":: IN SEARCH ::::");
    
    return this.apiService.get(`/produit/get-all-search-terme`);
  }

  private cache = new Map<string, any>();
  private normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  private fuseOptions: IFuseOptions<{ type: string, item: Category | Product }> = {
    // ignore diacritics (accents)
    ignoreDiacritics: true,
    // should be case sensitive
    isCaseSensitive: false,
    // We’ll be searching the `item.nom` field
    keys: [
      { name: 'item.nom', weight: 2 },
      { name: 'item.description', weight: 1 }
    ],
    // 0.0 = exact only; raise for more permissive matching (0.3 is a good start)
    threshold: 0.2,
    // allow matches anywhere in the string
    ignoreLocation: true,
    // sort by match score
    shouldSort: true,
    // include score in the result
    includeScore: true,
    // matches at least 2 chars
    minMatchCharLength: 2,
  };

  /**
   * Search for products and categories matching the search term
   * Includes synonym expansion and intelligent scoring
   */
  public searchProductsAndCategories(categories: Category[] = [], products: Product[] = [], term: string):
  Observable<{ type: string; item: Category | Product }[]> {
  const q = term.trim();
  if (!q) {
    return of([]);
  }

  // Cache lookup
  if (this.cache.has(q)) {
    return of(this.cache.get(q)!);
  }

  // Use expandTerm to get all relevant terms - this includes the original term
  const expandedTerms = [q, ...this.synonymService.expandTerm(q)];

  // 1. Tag and combine all items
  const allItems: { type: string; item: Category | Product }[] = [
    ...products.map(p => ({ type: 'product', item: p })),
    ...categories.map(c => ({ type: 'category', item: c }))
  ];

  // 2. Build Fuse index
  const fuse = new Fuse(allItems, this.fuseOptions);

  // 3. Run searches for all expanded terms and combine results
  let allResults: FuseResult<{ type: string; item: Category | Product }>[] = [];

  expandedTerms.forEach(expandedTerm => {
    const termResults = fuse.search(expandedTerm);
    allResults = [...allResults, ...termResults];
  });

  // Remove duplicates from combined results by item ID
  const seenIds = new Set<string>();
  allResults = allResults.filter(result => {
    const id = result.item.item.id || '';
    if (seenIds.has(id)) {
      return false;
    }
    seenIds.add(id);
    return true;
  });

  // 4. Boost prefix matches & sort by adjusted score
  const normalizedQ = this.normalize(q);
  const boosted = allResults
    .map(r => {
      const nm = this.normalize(r.item.item.nom);

      // Calculate match type bonuses
      const isExactMatch = nm === normalizedQ;
      const isPrefix = nm.startsWith(normalizedQ);
      const isDirectSynonym = expandedTerms.slice(1).some(synonym =>
        this.normalize(r.item.item.nom).includes(this.normalize(synonym))
      );
      const isSynonymPrefix = expandedTerms.slice(1).some(synonym =>
        this.normalize(r.item.item.nom).startsWith(this.normalize(synonym))
      );

      // Apply score adjustments - lower scores are better in Fuse.js
      let adjustedScore = (r.score ?? 1);
      if (isExactMatch) adjustedScore -= 0.2;      // Strongest boost for exact matches
      else if (isPrefix) adjustedScore -= 0.1;     // Boost prefix matches

      if (isDirectSynonym) adjustedScore -= 0.08;  // Boost synonym matches
      if (isSynonymPrefix) adjustedScore -= 0.12;  // Boost synonym prefix matches

      return { item: r.item, adjustedScore, realScore: r.score };
    })
    .sort((a, b) => a.adjustedScore - b.adjustedScore);

  // Filter out low-scoring results
  const maybeMissing = boosted.find(r => r.realScore !== undefined && r.adjustedScore < 0.01);
  console.log('maybeMissing', maybeMissing);
  // 5. Remove same-named products/categories
  const unique: { type: string; item: Category | Product }[] = [];
  const seen = new Set<string>();
  for (const { item } of boosted) {
    const key = this.normalize(item.item.nom);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  // 6. Cache & return
  this.cache.set(q, unique);
  return of(unique);
}


  // public searchProductsAndCategories(categories: Category[]=[], products: Product[], term: string): Observable<{ type: string, item: Category | Product }[]> {
  //   // accents insensitivity
  //   const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  //   const lowerTerm = normalizeString(term).trim();
  //   if (this.cache.has(lowerTerm)) {
  //       return of(this.cache.get(lowerTerm)!);
  //   }

  //   const filterItems = <T extends { nom: string }>(items: T[], type: string): { type: string, item: T }[] => {
  //     // first i check if element starts with the term
  //     const startsWithTerm = items
  //       .filter(item => normalizeString(item.nom).startsWith(lowerTerm))
  //       .map(item => ({ type, item }));
  //     //Then element that contains the searchTerm but excluding the one starting with the term
  //     const includesTerm = items
  //       .filter(item =>
  //         !normalizeString(item.nom).startsWith(lowerTerm) && normalizeString(item.nom).includes(lowerTerm))
  //       .map(item => ({ type, item }));
  //     return [...startsWithTerm, ...includesTerm];
  //   };
  //   // filtered products and categories
  //   const matchingProducts = filterItems(products, 'product');
  //   const matchingCategories = filterItems(categories, 'category');
  //   let combinedResults: { type: string, item: Category | Product }[] = [...matchingProducts, ...matchingCategories];

  //   // remoing deduplicated results
  //   const uniqueResults: { type: string, item: Category | Product }[] = [];
  //   const seenNames = new Set<string>();

  //   combinedResults.forEach(result => {
  //       const name = result.item.nom.toLowerCase();
  //       if (!seenNames.has(name)) {
  //           seenNames.add(name);
  //           uniqueResults.push(result);
  //       }
  //   });

  //   // cache the combined results for future researches
  //   this.cache.set(lowerTerm, uniqueResults);
  //   return of(uniqueResults);
  // }

  public getProductById(id): Observable<any> {
    return this.apiService.get('/produit/find/' + id);
  }
  public getProductByNewArrival(): Observable<any> {
    return this.apiService.get('/produit/new-arrivals/');
  }

  public getProductByPromotion(): Observable<any> {
    return this.apiService.get('/produit/promotions/');
  }

  public getProductByBest(): Observable<any> {
    return this.apiService.get('/produit/best-produits/');
  }

  public getProductByTop(): Observable<any> {
    return this.apiService.get('/produit/top-rates/');
  }

  public addContact(contact: Contact): Observable<any> {
    return this.apiService.post('/contact/add', contact);
  }
  public getNewsletter(): Observable<any>{
    return this.apiService.get('/newsletter/liste');
  }
  public getContact(): Observable<any>{
    return this.apiService.get('/contact/liste');
  }
  public getContactById(id: string): Observable<any>{
    return this.apiService.get('/contact/' +id);
  }

   public addNewsletter(newsletter: Newsletter): Observable<any> {
    return this.apiService.post('/newsletter/add', newsletter);
   }


  public addCategory(categorie: Category, image: File, icon: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', categorie.nom);
    formData.append('image', image);
    formData.append('icon', icon);

    // const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    return this.apiService.postFile(`/categorie/add`, formData, Headers);
  }

  public addBrand(brand: any, logo: File): Observable<any> {
    const formData = new FormData();
    formData.append('libelle', brand.libelle);
    formData.append('description', brand.description);
    formData.append('logo', logo);

    // const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    return this.apiService.postFile(`/brand/add`, formData, Headers);
  }

  public updateCategory(id: string, nom: string, parentId: any, image: File, icon: File): Observable<any> {
    // Créer un objet FormData pour envoyer à l'API
    const formData: FormData = new FormData();
    // Ajouter les valeurs à l'objet FormData
    formData.append('id', id.toString());
    formData.append('nom', nom);
    formData.append('parentId', parentId);
    formData.append('image', image);
    formData.append('icon', icon);

    // Envoyer la requête PUT à l'API avec l'objet FormData
    return this.apiService.putFile(
      `/categorie/update/${id}`,
      formData,
      Headers
    );
  }

  public updateBrand(
    id: string,
    libelle: string,
    description: string,
    logo: File
  ): Observable<any> {
    // Créer un objet FormData pour envoyer à l'API
    const formData = new FormData();
    formData.append('id', id);
    formData.append('libelle', libelle);
    formData.append('description', description);
    formData.append('logo', logo);

    // Envoyer la requête PUT à l'API avec l'objet FormData
    return this.apiService.putFile(`/brand/update/${id}`, formData, Headers);
  }

  // public setStatus(id: string, status: string): Observable<any> {
  //   return this.apiService.put(`/categorie/status/${id}`, { params: status  });
  // }


  public setStatus (id : string , status : string ) : Observable<any> {
    // const formData: FormData = new FormData();
    // formData.append ('status', status.toString() );

  return this.apiService.put(`/categorie/status/${id}?status=${status}`, null) ;
  }

  public setStatusNewsletter (id : string , etat : boolean ) : Observable<any> {
    return this.apiService.put(`/newsletter/etat/${id}/${etat}`, null ).pipe() ;
  }


  public setStatusCampagne(id: string, etat: boolean): Observable<any> {
    return this.apiService.put(`/campagne/etat/${id}/${etat}`, null).pipe();
  }
  public setEtatBrand(id: string, etat: boolean): Observable<any> {
    return this.apiService.put(`/brand/etat/${id}/${etat}`, null).pipe();
  }

  //   public addProduit(produit: Product, images: File): Observable<Product> {
  //     const formData = new FormData();
  //     formData.append('nom', produit.nom || ''); // Vérifier si produit.nom est null ou undefined
  //     formData.append('description', produit.description || ''); // Vérifier si produit.description est null ou undefined
  //     formData.append('priceBasic', (produit.priceBasic !== null && produit.priceBasic !== undefined) ? produit.priceBasic.toString() : ''); // Vérifier si produit.priceBasic est null ou undefined
  //     formData.append('weight', (produit.weight !== null && produit.weight !== undefined) ? produit.weight.toString() : ''); // Vérifier si produit.weight est null ou undefined
  //     formData.append('pricePromotion', (produit.pricePromotion !== null && produit.pricePromotion !== undefined) ? produit.pricePromotion.toString() : ''); // Vérifier si produit.pricePromotion est null ou undefined
  //     formData.append('user', (produit.user !== null && produit.user !== undefined) ? produit.user.toString() : ''); // Vérifier si produit.user est null ou undefined
  //     formData.append('categorie', (produit.categorie !== null && produit.categorie !== undefined) ? produit.categorie.toString() : ''); // Vérifier si produit.categorie est null ou undefined
  //     formData.append('images', images);

  //     const headers = new HttpHeaders();

  //     return this.http.post<Product>(`${this.url}/produit/add`, formData, { headers });
  // }

  public supprimerCategorie(id: string): Observable<any> {
    return this.apiService.delete(`/categorie/supprimer/${id}`);
  }

  public supprimerCampagne(id: string): Observable<any> {
    return this.apiService.delete(`/campagne/supprimer/${id}`);
  }
  public getBanners(): Observable<any[]> {
    return this.http.get<any[]>('assets/data/banners.json');
  }

  public addToCompare(product: Product) {
    let message, status;
    if (this.Data.compareList.filter((item) => item.id == product.id)[0]) {
      message =
        'The product ' + product.nom + ' already added to comparison list.';
      status = 'error';
    } else {
      this.Data.compareList.push(product);
      message =
        'The product ' + product.nom + ' has been added to comparison list.';
      status = 'success';
    }
    this.snackBar.open(message, '×', {
      panelClass: [status],
      verticalPosition: 'top',
      duration: 3000,
    });
  }

  public addToWishList(product: Product) {
    let message, status;
    if (this.Data.wishList.filter((item) => item.id == product.id)[0]) {
      message = 'The product ' + product.nom + ' already added to wish list.';
      status = 'error';
    } else {
      this.Data.wishList.push(product);
      message = 'The product ' + product.nom + ' has been added to wish list.';
      status = 'success';
    }
    this.snackBar.open(message, '×', {
      panelClass: [status],
      verticalPosition: 'top',
      duration: 3000,
    });
  }

  public addToCart(product: Product): void {
    // Parse the stringified JSON array
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];

    let existingProduct = this.productList.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.cartCount += product.cartCount;
      // console.log("Already in cart, new count:", existingProduct.cartCount);
    } else {
      this.productList.push({ ...product });
    }

    this.updateCartData();

    const message = `Le produit ${product.nom} a été ajouté au panier.`;
    const status = 'success';
    this.snackBar.open(message, '×', {
      panelClass: [status],
      verticalPosition: 'top',
      duration: 3000,
    });
  }

  public increment(product: Product): void {
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];

    let existingProduct = this.productList.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.cartCount += 1;
    } else {
      this.productList.push({ ...product, cartCount: 1 });
    }

    this.updateCartData();
  }

  public decrement(product: Product): void {
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];

    let existingProduct = this.productList.find((item) => item.id === product.id);

    if (existingProduct && existingProduct.cartCount > 1) {
      existingProduct.cartCount -= 1;
    } else if (existingProduct) {
      // Remove product from cart if count reaches 0
      this.productList = this.productList.filter((item) => item.id !== product.id);
    }

    this.updateCartData();
  }

  public remove(product: Product): void {
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];

    const index: number = this.productList.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      this.productList.splice(index, 1);
    }

    this.updateCartData();
  }

  private updateCartData(): void {
    this.Data.totalPrice = 0;
    this.Data.totalCartCount = 0;

    this.productList.forEach((product) => {
      const productPrice = product.priceBasic != null ? parseFloat(product.priceBasic) : parseFloat(product.pricePromotion);
      this.Data.totalPrice += product.cartCount * productPrice;
      this.Data.totalCartCount += product.cartCount;
    });

    sessionStorage.setItem('totalCartCount', JSON.stringify(this.Data.totalCartCount));
    sessionStorage.setItem('panier', JSON.stringify(this.productList));

    // Update the cart count using CartService
    this.cartService.updateCartCount(this.Data.totalCartCount);
  }





  public addCommande(id: string, senderUsername: string, referralCode: string, product:Product[]): Observable<any> {

    return this.apiService.post(`/commande/addTest?id=${id}&senderUsername=${senderUsername}&referralCode=${referralCode}`, product);
  }





  public resetProductCartCount(product: Product) {
    product.cartCount = 0;
    let compareProduct = this.Data.compareList.filter(
      (item) => item.id == product.id
    )[0];
    if (compareProduct) {
      compareProduct.cartCount = 0;
    }
    let wishProduct = this.Data.wishList.filter(
      (item) => item.id == product.id
    )[0];
    if (wishProduct) {
      wishProduct.cartCount = 0;
    }
  }

  public getBrands(): Observable<any> {
    return this.apiService.get('/brand/liste');
  }

  public getCountries() {
    return [
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Aland Islands', code: 'AX' },
      { name: 'Albania', code: 'AL' },
      { name: 'Algeria', code: 'DZ' },
      { name: 'American Samoa', code: 'AS' },
      { name: 'AndorrA', code: 'AD' },
      { name: 'Angola', code: 'AO' },
      { name: 'Anguilla', code: 'AI' },
      { name: 'Antarctica', code: 'AQ' },
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Aruba', code: 'AW' },
      { name: 'Australia', code: 'AU' },
      { name: 'Austria', code: 'AT' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Bermuda', code: 'BM' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Bouvet Island', code: 'BV' },
      { name: 'Brazil', code: 'BR' },
      { name: 'British Indian Ocean Territory', code: 'IO' },
      { name: 'Brunei Darussalam', code: 'BN' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Canada', code: 'CA' },
      { name: 'Cape Verde', code: 'CV' },
      { name: 'Cayman Islands', code: 'KY' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Chile', code: 'CL' },
      { name: 'China', code: 'CN' },
      { name: 'Christmas Island', code: 'CX' },
      { name: 'Cocos (Keeling) Islands', code: 'CC' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Congo', code: 'CG' },
      { name: 'Congo, The Democratic Republic of the', code: 'CD' },
      { name: 'Cook Islands', code: 'CK' },
      { name: 'Costa Rica', code: 'CR' },
      { name: "Cote D'Ivoire", code: 'CI' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czech Republic', code: 'CZ' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Egypt', code: 'EG' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Falkland Islands (Malvinas)', code: 'FK' },
      { name: 'Faroe Islands', code: 'FO' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'French Guiana', code: 'GF' },
      { name: 'French Polynesia', code: 'PF' },
      { name: 'French Southern Territories', code: 'TF' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Georgia', code: 'GE' },
      { name: 'Germany', code: 'DE' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Gibraltar', code: 'GI' },
      { name: 'Greece', code: 'GR' },
      { name: 'Greenland', code: 'GL' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guadeloupe', code: 'GP' },
      { name: 'Guam', code: 'GU' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Guernsey', code: 'GG' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
      { name: 'Holy See (Vatican City State)', code: 'VA' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Hong Kong', code: 'HK' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran, Islamic Republic Of', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Isle of Man', code: 'IM' },
      { name: 'Israel', code: 'IL' },
      { name: 'Italy', code: 'IT' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jersey', code: 'JE' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Kiribati', code: 'KI' },
      { name: "Korea, Democratic People'S Republic of", code: 'KP' },
      { name: 'Korea, Republic of', code: 'KR' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: "Lao People'S Democratic Republic", code: 'LA' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libyan Arab Jamahiriya', code: 'LY' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Macao', code: 'MO' },
      { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mali', code: 'ML' },
      { name: 'Malta', code: 'MT' },
      { name: 'Marshall Islands', code: 'MH' },
      { name: 'Martinique', code: 'MQ' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Mayotte', code: 'YT' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Micronesia, Federated States of', code: 'FM' },
      { name: 'Moldova, Republic of', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Montserrat', code: 'MS' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Myanmar', code: 'MM' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Nauru', code: 'NR' },
      { name: 'Nepal', code: 'NP' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Netherlands Antilles', code: 'AN' },
      { name: 'New Caledonia', code: 'NC' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Niue', code: 'NU' },
      { name: 'Norfolk Island', code: 'NF' },
      { name: 'Northern Mariana Islands', code: 'MP' },
      { name: 'Norway', code: 'NO' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Palau', code: 'PW' },
      { name: 'Palestinian Territory, Occupied', code: 'PS' },
      { name: 'Panama', code: 'PA' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Pitcairn', code: 'PN' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Puerto Rico', code: 'PR' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Reunion', code: 'RE' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russian Federation', code: 'RU' },
      { name: 'RWANDA', code: 'RW' },
      { name: 'Saint Helena', code: 'SH' },
      { name: 'Saint Kitts and Nevis', code: 'KN' },
      { name: 'Saint Lucia', code: 'LC' },
      { name: 'Saint Pierre and Miquelon', code: 'PM' },
      { name: 'Saint Vincent and the Grenadines', code: 'VC' },
      { name: 'Samoa', code: 'WS' },
      { name: 'San Marino', code: 'SM' },
      { name: 'Sao Tome and Principe', code: 'ST' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Serbia and Montenegro', code: 'CS' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Singapore', code: 'SG' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Solomon Islands', code: 'SB' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Suriname', code: 'SR' },
      { name: 'Svalbard and Jan Mayen', code: 'SJ' },
      { name: 'Swaziland', code: 'SZ' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Syrian Arab Republic', code: 'SY' },
      { name: 'Taiwan, Province of China', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Tanzania, United Republic of', code: 'TZ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Timor-Leste', code: 'TL' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tokelau', code: 'TK' },
      { name: 'Tonga', code: 'TO' },
      { name: 'Trinidad and Tobago', code: 'TT' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Turkmenistan', code: 'TM' },
      { name: 'Turks and Caicos Islands', code: 'TC' },
      { name: 'Tuvalu', code: 'TV' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'United States', code: 'US' },
      { name: 'United States Minor Outlying Islands', code: 'UM' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Vanuatu', code: 'VU' },
      { name: 'Venezuela', code: 'VE' },
      { name: 'Viet Nam', code: 'VN' },
      { name: 'Virgin Islands, British', code: 'VG' },
      { name: 'Virgin Islands, U.S.', code: 'VI' },
      { name: 'Wallis and Futuna', code: 'WF' },
      { name: 'Western Sahara', code: 'EH' },
      { name: 'Yemen', code: 'YE' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' },
    ];
  }

  public getMonths() {
    return [
      { value: '01', name: 'January' },
      { value: '02', name: 'February' },
      { value: '03', name: 'March' },
      { value: '04', name: 'April' },
      { value: '05', name: 'May' },
      { value: '06', name: 'June' },
      { value: '07', name: 'July' },
      { value: '08', name: 'August' },
      { value: '09', name: 'September' },
      { value: '10', name: 'October' },
      { value: '11', name: 'November' },
      { value: '12', name: 'December' },
    ];
  }

  public getYears() {
    return [
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
      '2025',
      '2026',
      '2027',
      '2028',
      '2029',
      '2030',
    ];
  }

  public getDeliveryMethods() {
    return [
      {
        value: 'free',
        name: 'A la livraison',
        desc: '$0.00 / Delivery in 7 to 14 business Days',
      },
      {
        value: 'standard',
        name: 'Orange Money',
        desc: '$7.99 / Delivery in 5 to 7 business Days',
      },
      {
        value: 'express',
        name: 'Carte VISA',
        desc: '$29.99 / Delivery in 1 business Days',
      },
    ];
  }
}
