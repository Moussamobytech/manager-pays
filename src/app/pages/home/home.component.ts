import { Component, OnInit } from '@angular/core';
import { AppService, Data } from '../../app.service';
import { Product } from "../../app.models";
import { json } from 'stream/consumers';
import { ProductService } from 'src/app/services/product.service';

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

  public brands: any;
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


  constructor(public appService:AppService, public produitService : ProductService) { }

  ngOnInit() {
    this.getBanners();
    // this.getProducts("PC");
    // this.getAllProduit();
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

  public getBrands(){
    // this.brands = this.appService.getBrands();
    this.appService.getBrands().subscribe(data => {
      this.brands=data;
      console.log('branddddd',this.brands);
    });
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
  public async getProduitByBest() {
    this.best = await this.produitService.getProductByTop()
    console.log("res best :::::::: ",this.best)
  }

  public async getNewArrivals() {
    this.newArrivals = await this.produitService.getProductByNewArrival("yes")
    console.log("res newArrivals :::::::: ",this.newArrivals)
    
  }
  public async getTopRate() {
    this.topRate = await this.produitService.getProductByTop()
    console.log("res topRate :::::::: ",this.topRate)
  }

}
