// import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import { montly_sales } from '../dashboard.data';
// import { ProductService } from 'src/app/services/product.service';
// import { ExcelOperationService } from 'src/app/services/excel-operation.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-montly-sales',
//   templateUrl: './montly-sales.component.html',
//   styleUrls: ['./montly-sales.component.scss']
// })
// export class MontlySalesComponent implements OnInit {
//   public data: any[];
//   public statsData: any[];
//   public showLegend = false;
//   public gradient = true;
//   public colorScheme: any = {
//     domain: ['#2F3E9E', '#D22E2E', '#378D3B']
//   };
//   public showLabels = true;
//   public explodeSlices = true;
//   public doughnut = false;
//   @ViewChild('resizedDiv') resizedDiv:ElementRef;
//   public previousWidthOfResizedDiv:number = 0;

//   constructor(public produitService : ProductService, public router: Router, private excelExportService: ExcelOperationService) { }

//   ngOnInit(){
//     this.data = montly_sales;
//     this.statsSellerContact()
//   }

//   public onSelect(event) {
//     console.log(event);
//   }

//   ngAfterViewChecked() {
//     if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
//       setTimeout(() => this.data = [...montly_sales] );
//     }
//     this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
//   }

//   public async statsSellerContact() {
//     this.statsData = await this.produitService.statsSellerContact()
//     console.log("res statsSellerContact :::::::: ",this.statsData)
//   }

//   public info(id){
//     this.router.navigate(["/admin/seller-info/"+id])
//   }

//   exportAsExel(){
//     const stats:any = this.statsData.map(element => {
//       return{
//         "Username vendeur": this.formatToPhone(element.username),
//         "Nombre": element.nbre,
//         "Date Action": element.date_action,
//       }
//     });
//     this.excelExportService.exportToExcel(stats, 'Liste vendeurs Contacté');
//   }

//   formatToPhone(phone:any){
//     if(phone != 'null' && phone != null){
//       if((phone.length == 8)){
//         return "+223"+phone;
//       }else if(phone.length == 10){
//         return "+225"+phone;
//       }else if(phone.includes("223")||phone.includes("225")){
//         return '+'+phone;
//       }else{
//         return phone;
//       }
//     }
//   }
// }
