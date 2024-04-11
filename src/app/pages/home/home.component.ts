import { Component, OnInit } from '@angular/core';
import { AppService, Data } from '../../app.service';
import { Product } from "../../app.models";
import { json } from 'stream/consumers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public slides = [
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner1.jpg' },
    { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'assets/images/carousel/banner2.jpg' },
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner3.jpg' },
    { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'assets/images/carousel/banner4.jpg' },
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'assets/images/carousel/banner5.jpg' }
  ];

  public brands = [];
  public banners = [];
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


  constructor(public appService:AppService) { }

  ngOnInit() {
    this.getBanners();
    this.getProducts("PC");
    this.getAllProduit();
    this.getBrands();
    this.getCategorie();
    this.getProduitByPromotion();
    this.getProduitByBest();
    this.getNewArrivals();
    this.getTopRate();



  }

  public onLinkClick(e){
    this.getProducts(e.tab.textLabel.toLowerCase());
    this.getAllProduit();
  }


  public getProducts(type){
    if(type == "Les meilleurs produits"){
      this.appService.getProducts("featured").subscribe(data=>{
        this.featuredProducts = data;
        console.log("PCcccccccc  :",this.featuredProducts)
      })
    }
    if(type == "En promotion" && !this.onSaleProducts){
      this.appService.getProducts("on-sale").subscribe(data=>{
        this.onSaleProducts = data;
      })
    }
    if(type == "top rated" && !this.topRatedProducts){
      this.appService.getProducts("top-rated").subscribe(data=>{
        this.topRatedProducts = data;
      })
    }
    if(type == "new arrivals" && !this.newArrivalsProducts){
      this.appService.getProducts("new-arrivals").subscribe(data=>{
        this.newArrivalsProducts = data;
      })
    }

  }




  public getBanners(){
    this.appService.getBanners().subscribe(data=>{
      this.banners = data;
    })
  }

  public getBrands(){
    this.brands = this.appService.getBrands();
  }

  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{

      this.categories = data;
    })
  }

  public getAllProduit() {
    this.appService.getAllProducts().subscribe(data => {
      this.produit = data;

    });
  }

  public getProduitByPromotion() {
    this.appService.getProductByPromotion().subscribe(data => {
      this.promotion = data;
      console.log("Promotion : ", JSON.stringify);

    });
  }
  public getProduitByBest() {
    this.appService.getProductByBest().subscribe(data => {
      this.best = data;

    });
  }

  public getNewArrivals() {
    this.appService.getProductByNewArrival().subscribe(data => {
      this.newArrivals = data;

    });
  }
  public getTopRate() {
    this.appService.getProductByTop().subscribe(data => {
      this.topRate = data;

    });
  }

}
