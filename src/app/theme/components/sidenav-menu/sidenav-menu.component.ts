import { Component, OnInit, Input } from '@angular/core';
import { SidenavMenuService } from './sidenav-menu.service';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.scss'],
  providers: [ SidenavMenuService ]
})
export class SidenavMenuComponent implements OnInit {
  @Input('menuItems') menuItems;
  @Input('menuParentId') menuParentId;
  parentMenu:Array<any>;

  constructor(private sidenavMenuService:SidenavMenuService, private appService: AppService ) { }

  async ngOnInit() {
    // console.log("this.menuItems :::::: ",this.menuItems)
    this.menuItems = this.formatListCategorie(this.menuItems)
    // console.log("this.menuItems :::::: ",this.menuItems)
    if (this.menuItems) {
      this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
    }
    
    // this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
  }

  formatListCategorie(stringArray){
    var sortedArray: string[] = stringArray.sort((a,b) => {
      if(a.title < b.title) { return -1; }
      if(a.title > b.title) { return 1; }
      return 0;
    });
    
    // return sortedArray || stringArray
    return sortedArray
  }

  onClick(menuId){
    this.sidenavMenuService.toggleMenuItem(menuId);
    this.sidenavMenuService.closeOtherSubMenus(this.menuItems, menuId);    
  }


}
