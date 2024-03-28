import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Category } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {

  @Input() categories;
  @Input() tous;
  @Input() categoryParentId;
  @Output() change: EventEmitter<any> = new EventEmitter();
  mainCategories;
  public categorie:Category[];


  constructor(public domHandlerService: DomHandlerService, public appService:AppService) { }

  public ngDoCheck() {
    if(this.categories && !this.mainCategories) {
      this.mainCategories = this.categories.filter(category => category.parentId == this.categoryParentId);
      console.log("Categorie :"+this.categories.id)
    }
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
    console.log("Categorie tous :"+JSON.stringify(this.tous))

    this.appService.getCategories().subscribe(data =>{

      this.tous = data;
      console.log("Categorie tous :"+JSON.stringify(this.tous))
    })
  }
}
