import { Component, OnInit } from '@angular/core';
import { MOCK_DATA } from './mock.data';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public categories:any[] = MOCK_DATA;
  constructor() { }

  ngOnInit() {
  }

}
