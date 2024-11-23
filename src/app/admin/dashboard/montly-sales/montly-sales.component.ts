import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { montly_sales } from '../dashboard.data';
import { ProductService } from 'src/app/services/product.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-montly-sales',
  templateUrl: './montly-sales.component.html',
  styleUrls: ['./montly-sales.component.scss']
})
export class MontlySalesComponent implements OnInit {
  public data: any[]; 
  public statsData: any[]; 
  public showLegend = false;
  public gradient = true;
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B']
  }; 
  public showLabels = true;
  public explodeSlices = true;
  public doughnut = false; 
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0; 
  
  constructor(public produitService : ProductService, public router: Router, private excelExportService: ExcelExportService) { }

  ngOnInit(){
    this.data = montly_sales;  
    this.statsSellerContact()
  }
  
  public onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {    
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
      setTimeout(() => this.data = [...montly_sales] );
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

  public async statsSellerContact() {
    this.statsData = await this.produitService.statsSellerContact()
    console.log("res statsSellerContact :::::::: ",this.statsData)
  }

  public info(id){
    this.router.navigate(["/admin/seller-info/"+id])
  }

  exportAsExel(){
    this.excelExportService.exportToExcel(this.statsData, 'Liste vendeur Contacte');
  }
}
