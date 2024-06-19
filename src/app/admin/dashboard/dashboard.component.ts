import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  statsNumber : any = {
    total : 0,
    actif : 0,
    inactif : 0,
    pending : 0
  }
  constructor(private productService : ProductService, private router: Router) { }

  ngOnInit(): void {
  }

  public stats(id){
    this.productService.stats(id).then((data : any) =>{
      console.log(data)
      this.statsNumber.total = data.total
      this.statsNumber.actif = data.actif
      this.statsNumber.inactif = data.inactif
      this.statsNumber.pending = data.pending
    })
  }
}
