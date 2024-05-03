import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.models';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  currentUser : User
  public products : any = []
  public followers = [
    { id: 1, image: 'assets/images/profile/michael.jpg', name: 'Michael Blair', storeId: 1 },
    { id: 2, image: 'assets/images/profile/tereza.jpg', name: 'Tereza Stiles', storeId: 2 },
    { id: 3, image: 'assets/images/profile/adam.jpg', name: 'Adam Sandler', storeId: 1 },
    { id: 4, image: 'assets/images/profile/julia.jpg', name: 'Julia Aniston', storeId: 2 },
    { id: 5, image: 'assets/images/profile/bruno.jpg', name: 'Bruno Vespa', storeId: 2 },
    { id: 6, image: 'assets/images/profile/ashley.jpg', name: 'Ashley Ahlberg', storeId: 1 },
    { id: 7, image: 'assets/images/avatars/avatar-5.png', name: 'Michelle Ormond', storeId: 1 }
  ];
  public stores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' }
  ];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public orders = [
    { number: '#3258', date: 'March 29, 2018', status: 'Completed', total: '$140.00 for 2 items', invoice: true },
    { number: '#3145', date: 'February 14, 2018', status: 'On hold', total: '$255.99 for 1 item', invoice: false },
    { number: '#2972', date: 'January 7, 2018', status: 'Processing', total: '$255.99 for 1 item', invoice: true },
    { number: '#2971', date: 'January 5, 2018', status: 'Completed', total: '$73.00 for 1 item', invoice: true },
    { number: '#1981', date: 'December 24, 2017', status: 'Pending Payment', total: '$285.00 for 2 items', invoice: false },
    { number: '#1781', date: 'September 3, 2017', status: 'Refunded', total: '$49.00 for 2 items', invoice: false }
  ]
  constructor(private productService : ProductService, private auth : AuthenticationService, private router: Router) { }

  ngOnInit() {

    this.currentUser = this.auth.currentUser()
    console.log("currentUser :::::::: ",this.currentUser)

    this.loadData()
  }

  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  async loadData(){

    let res = await this.productService.productUser(this.currentUser.username)
    console.log("res product :::::::: ",res)
    this.products = res
  }

  public add(){
    this.router.navigate(["/account/add-product"])
  }

  public edit(id){
    this.router.navigate(["/account/add-product/"+id])
  }

  public etat(key){
    let res = ""
    switch (key) {
      case "ACTIF":
        res = "Actif"
        break;

      case "INACTIF":
        res = "Inactif"
        break;

      case "PENDING":
        res = "En attente de validation"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }

  public updateState(id, state){
    this.productService.updateState(id, state).then((data : any) =>{
      console.log(data)
    })
  }
  public remove(follower:any){
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   maxWidth: "400px",
    //   data: {
    //     title: "Confirm Action",
    //     message: "Are you sure you want remove this follower?"
    //   }
    // });
    // dialogRef.afterClosed().subscribe(dialogResult => {
    //   if(dialogResult){
    //     const index: number = this.followers.indexOf(follower);
    //     if (index !== -1) {
    //       this.followers.splice(index, 1);
    //     }
    //   }
    // });
  }
}
