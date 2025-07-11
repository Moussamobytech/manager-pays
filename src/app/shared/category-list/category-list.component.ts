import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {
  @Input() categories: any[];
  @Output() change: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router) { 
  }

  public changeCategory(event){
    this.change.emit(event);
  }

  onSubCategoryClick(subCategory:any): void {
   // this.selectedSubCategory = subCategory;
   console.log('SubCategory clicked:', subCategory);
    this.router.navigate(['/categories', subCategory.id]);
  }
}
