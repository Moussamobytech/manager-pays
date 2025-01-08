import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {
  @Input() categories: any[];
  @Output() change: EventEmitter<any> = new EventEmitter();

  constructor() { }

  public changeCategory(event){
    this.change.emit(event);
  }
}
