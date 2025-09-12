import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSettings, Settings } from 'src/app/app.settings';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Product } from 'src/app/models/product.models';
import { Category } from 'src/app/models/category.models';
// import { Category, Product } from 'src/app/app.models';

@Component({
  selector: 'app-categorie-detail',
  // standalone: true,

  templateUrl: './categorie-detail.component.html',
  styleUrl: './categorie-detail.component.scss'
})
export class CategorieDetailComponent implements OnInit{
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public counts = [12, 24, 36];
  public count:any;
  public settings: Settings;
  public page:any;
  public products: Array<Product> = [];
  public categories:Category[];
  public categoryId: string;
  public cate : any;
  public selectedCategoryId: any;
  public Allcategories:any;
  private sub: any;
  constructor(public appSettings:AppSettings,
    private activatedRoute: ActivatedRoute,
    public appService:AppService,
    public dialog: MatDialog,
    private router: Router,
    public domHandlerService: DomHandlerService) {
this.settings = this.appSettings.settings;
}
  ngOnInit(): void {
    this.getCategories();
    // this.getBrands();
    this.getProductsByCetegorie(this.selectedCategoryId);
    this.getCategorieById(this.categoryId);
    this.getCategorie();

    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.getProductsByCetegorie(params['id']);
        this.getCategorieById(params['id']);
      }
      else{
        this.getProductsByCetegorie(this.selectedCategoryId);
        this.getCategorieById(this.categoryId)
      }
    });
  }


public getProductsByCetegorie(categoryId: string){
  this.appService.getProductByCategorie(categoryId).subscribe(data=>{
    this.products = data;
    console.log("PRODUCTS : ", this.products);
    //for show more product
    // for (var index = 0; index < 3; index++) {
    //   this.products = this.products.concat(this.products);
    // }
  });
}

public getCategories(){
  if(this.appService.Data.categories.length == 0) {
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      this.appService.Data.categories = data;
      console.log("Categorie : ", this.categories);
    });
  }
  else{
    this.categories = this.appService.Data.categories;


  }
}

public getCategorie(){
  this.appService.getCategories().subscribe(data =>{
    this.Allcategories = data;
    console.log("ALL CATEGORIES : ", this.Allcategories);
  })
}

public getCategorieById(id){
  this.appService.getCategorieById(id).subscribe(data=>{
    this.cate = data;
    console.log('Category Id ', this.cate);
  });
}
}
