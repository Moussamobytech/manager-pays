import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { Category, Product } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Category } from 'src/app/models/category.models';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {

  @Input() categories;
  @Input() ('categorieA') categorieA;
  @Input() tous;
  @Input() categoryParentId;
  @Input('products') products: Array<Product> = [];
  @Input('idCat') idCat: string;


  @Output() change: EventEmitter<any> = new EventEmitter();
  mainCategories;

  public categorie:Category[];

  categoryId: string;

  constructor(public domHandlerService: DomHandlerService, public appService:AppService) { }

  public ngDoCheck() {
    // console.log("ngDoCheck :::: ",this.categories);
    if(this.categories && !this.mainCategories) {
      //this.tous();
      // console.log("ngDoCheck if :::: ",this.categories);
      // this.categories = this.categories.filter(category => category.parentId == this.categoryParentId);
      this.categories = this.formatListCategorie(this.categories)
    }


  }

  formatListCategorie(stringArray){
    // console.log("stringArray :::: ",sortedArray);
    var sortedArray: any[] = stringArray.sort((a,b) => {
      if(a.nom < b.nom) { return -1; }
      if(a.nom > b.nom) { return 1; }
      return 0;
    });
    
    // return sortedArray || stringArray
    return sortedArray
  }

  public stopClickPropagate(event: any){
    if(this.domHandlerService.window?.innerWidth < 960){
      event.stopPropagation();
      event.preventDefault();
    }
  }

  public changeCategory(event){
    this.change.emit(event);
  }

  public getCategories(){

    if(this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {

        this.categorie= data;
        this.appService.Data.categories = data;


      });
    }
    else{
      this.categories = this.appService.Data.categories;
    }
  }

  public getCategorie(){

    this.appService.getCategories().subscribe(data =>{

      this.tous = data;
      console.log("Category ", this.tous)
    })
  }


  public getProductByCategorie(categorie: string){
    this.appService.getProductByCategorie(categorie).subscribe(
      data => {
        this.products= data


      }
    )
  }

  selectCategory(categoryId: string) {
    this.change.emit({ categoryId: categoryId });
  }
}
