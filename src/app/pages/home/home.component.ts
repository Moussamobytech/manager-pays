import { Component, OnInit } from '@angular/core';
import { AppService, Data } from '../../app.service';

import { ProductService } from 'src/app/services/product.service';
import { CampagneService } from 'src/app/services/campagne.service';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public slides = [
    { title: 'TU VEUX VENDRE TES PRODUITS?', subtitle: 'Crée ton compte vendeur et attire des clients dès maintenant!', image: 'assets/images/ads/3.jpg', show: 'Créer un compte', href:'sign-up' },
    { title: 'TOUT ACHETER TOUT VENDRE', subtitle: 'Choisis un produit qui t\'intéresse et contacte le vendeur en un clic.', image: 'assets/images/ads/1.jpg' },
    { title: 'FIABLE ET SÉCURISÉ', subtitle: 'Tous les vendeurs et produits sont vérifiés avant publication.', image: 'assets/images/ads/2.jpg' },
    { title: 'TU VEUX VENDRE TES PRODUITS?', subtitle: 'Crée ton compte vendeur et attire des clients dès maintenant!', image: 'assets/images/ads/3.jpg', show: 'Créer un compte', href:'sign-up' },
    // { title: 'LIVRAISON POSSIBLE PARTOUT', subtitle: 'Pas de temps? Nous te livrons à domicile.', image: 'assets/images/ads/4.jpg' }
    // { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner1.jpg' },
    // { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'assets/images/carousel/banner2.jpg' },
    // { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner3.jpg' },
    // { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'assets/images/carousel/banner4.jpg' },
    // { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner5.jpg' }
  ];



  public brands: any= [
    {
        "createdAt": "2024-05-06T01:51:39.000+00:00",
        "updatedAt": "2024-05-06T01:51:39.000+00:00",
        "id": "2cbd8227-8a8f-4f7e-9051-f28c506ebe32",
        "libelle": "H & M",
        "description": "La marque  de vetement H&M",
        "etat": true,
        "logo": "https://storage.googleapis.com/fidelity-e0007.appspot.com/2e11feeab444496fb9298a486801bce4.png"
    },
    {
        "createdAt": "2024-05-06T01:48:55.000+00:00",
        "updatedAt": "2024-05-06T01:48:55.000+00:00",
        "id": "31b5eba4-7d78-46bc-a703-77f8a34a9ab5",
        "libelle": "Bershka",
        "description": "La marque  Bershka",
        "etat": true,
        "logo": "https://storage.googleapis.com/fidelity-e0007.appspot.com/5e5de7d9ef024e9090167ae060fbc3e8.png"
    },
    {
        "createdAt": "2024-05-06T01:50:58.000+00:00",
        "updatedAt": "2024-05-06T01:50:58.000+00:00",
        "id": "a80d6198-9817-4cbe-9ca8-2ce620b2eca8",
        "libelle": "Zara",
        "description": "La marque  de vetement ZARA",
        "etat": true,
        "logo": "https://storage.googleapis.com/fidelity-e0007.appspot.com/519337814c1d4bbeb2c9c000f6ef3a43.png"
    },
    {
        "createdAt": "2024-05-06T01:49:56.000+00:00",
        "updatedAt": "2024-05-06T01:49:56.000+00:00",
        "id": "bd48ffd4-bf89-4ac5-a4c0-243ac3cb3977",
        "libelle": "Nike",
        "description": "La marque  d'equipementier Nike",
        "etat": true,
        "logo": "https://storage.googleapis.com/fidelity-e0007.appspot.com/c42ca8d48d34487a9aa9251fb882af9a.png"
    }
];
  public banners = [];
  public campagnes = [];
  public produit: Array<Product>;
  public ProductByCategorie: Array<Product>;
  public featuredProducts: Array<Product>;
  public onSaleProducts: Array<Product>;
  public topRatedProducts: Array<Product>;
  public newArrivalsProducts: Array<Product>;
  cate:any;
  categories: any;
  promotion:any;
  best:any;
  newArrivals:any;
  topRate:any;

  constructor(public appService:AppService, public produitService : ProductService, public campagneService : CampagneService) { }

  ngOnInit() {
    this.getTopRate();
    this.getBanners();
    // this.listCampagne();
    // this.getProducts("PC");
    // this.getAllProduit();
    // this.getBrands();
    this.getCategorie();
    this.nomProduits();
    // this.getProduitByPromotion();
    // this.getProduitByBest();
    // this.getNewArrivals();

  }

  ngAfterViewInit(){
    this.listCampagne()
  }

  public onLinkClick(e){
    this.getProducts(e.tab.textLabel.toLowerCase());
    this.getAllProduit();
  }

  public getProducts(type){
    if(type == "Les meilleurs produits"){
      // this.appService.getProducts("featured").subscribe(data=>{
      //   console.log("PCcccccccc  :",this.best)
      // })
      this.featuredProducts = this.best;

    }
    if(type == "En promotion" && !this.onSaleProducts){
      // this.appService.getProducts("on-sale").subscribe(data=>{
      //   this.onSaleProducts = this.promotion;
      // })
      this.onSaleProducts = this.promotion;
    }
    if(type == "top rated" && !this.topRatedProducts){
      this.topRatedProducts = this.topRate;
    }
    if(type == "new arrivals" && !this.newArrivalsProducts){
      this.topRatedProducts = this.topRate;
    }

  }

  public getBanners(){
    this.appService.getBanners().subscribe(data=>{
      this.banners = data;
    })
  }

  // public getBrands(){
  //   // this.brands = this.appService.getBrands();
  //   this.appService.getBrands().subscribe(data => {
  //     this.brands=data;
  //     console.log('branddddd',this.brands);
  //   });
  // }

  public getBrands(){
    this.appService.getBrands().subscribe(data=>{
      this.brands =data;
      this.brands.forEach(brand => { brand.selected = false });
      console.log("Brands ",data);
    });
    // this.brands.forEach(brand => { brand.selected = false });
  }

  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{

      this.categories = data;
    })
  }

  public async getAllProduit() {
    let res : Array<Product> = await this.produitService.products()
    console.log("res product :::::::: ",res)
    this.produit = res
    // this.appService.getAllProducts().subscribe(data => {
    //   this.produit = data;
    // });
  }

  public async getProduitByPromotion() {
    this.promotion = await this.produitService.getProductByTop()
    console.log("res promotion :::::::: ",this.promotion)
  }

  public async listCampagne() {
    this.campagnes = await this.campagneService.getCampagneEligible()
    console.log("res campagnes :::::::: ",this.campagnes)
    this.campagnes.forEach(val => {
      this.slides.push(val)
    })
    // this.slides
  }
  public async getProduitByBest() {
    this.best = await this.produitService.getProductByTop()
    console.log("res best :::::::: ",this.best)
  }

  public async getNewArrivals() {
    this.newArrivals = await this.produitService.getProductByNewArrival("yes")
    console.log("res newArrivals :::::::: ",this.newArrivals)

  }

  public async nomProduits() {
    this.newArrivals = await this.produitService.nomProduits()
    console.log("res nomProduits :::::::: ",this.newArrivals)

  }
  public async getTopRate() {
    this.topRate = await this.produitService.getProductByTop()
    console.log("res topRate :::::::: ",this.topRate)
  }



}
