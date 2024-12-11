import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { AppSettings, Settings } from '../../../app.settings';
import { CustomersService } from './customers.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, catchError, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Customer } from 'src/app/models/customers.model';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ CustomersService ]
})
export class CustomersComponent implements OnInit {
    public customers: Customer[];
    public sortedCustomers: Customer[] = null;
    public searchText: string;
    public page:any;
    public settings: Settings;
    domHandlerService = inject(DomHandlerService);
    isAboveSmSize$: Observable<boolean>;
    isAboveMdSize$: Observable<boolean>;
    ascFirstname: boolean = true;
    ascLastname: boolean = true;
    ascType: boolean = true;
    ascMember: boolean = true;

    constructor(
      public appSettings: AppSettings,
      public customersService: CustomersService,
      private breakpointObserver:BreakpointObserver,
      private ngxSpinnerService: NgxSpinnerService,
      private customerService: CustomersService,
      private auth:AuthenticationService
    ){
        this.settings = this.appSettings.settings;
    }

    ngOnInit() {
      this.getCustomers();
      // Check Small size
      this.isAboveSmSize$ = this.breakpointObserver.observe([Breakpoints.Small,Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(
        map(result => result.matches)
      );
      //  Check Medium size
      this.isAboveMdSize$ = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(
        map(result => result.matches)
      );
    }

    public async getCustomers(){
      const observable = await this.customerService.getCustomers(this.auth.currentUser().username);

      observable.pipe(
        map((customers: any[]) => {
          return customers.map((customer) => {
            // Iterate through each property in the customer object
            for (const key in customer) {
              if (customer.hasOwnProperty(key)) {
                if ((customer[key] === null || customer[key] === undefined || customer[key] === '')&& key !== 'nom') {
                  customer[key] = '............';
                }
              }
            }
            return customer;
          });
        }),
        catchError((error: any) => {
          console.error("Erreur lors de la transformation des données users: " + error);
          throw error;
        })
      ).subscribe(
        (data: any) => {
          this.customers = data;
          this.ngxSpinnerService.hide();
        }
      );

      // this.http.get<any[]>('api/customers').subscribe(data => {
      //   this.customers = data;
      //   console.log(this.customers)
      //   this.ngxSpinnerService.hide();
      // });
    }

    public onPageChanged(event){
        this.page = event;
        this.getCustomers();
        this.domHandlerService.winScroll(0, 0);
    }

    // the sorting method
    sortCustomers(keyWord: string) {

      /* For you to understand this, just asume that the const ascKey and the this[ascKey] are different:
         - ascKey exists just to help with accessing the correct keyWord to sort on (like this["ascPrenom"])
         - this[ascKey] is the actual dynamic sort direction, and it is object property which stores boolean state for each entry of the keyWord
      */
      const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
      if (this[ascKey] === undefined) {
        this[ascKey] = true; // Initialize to ascending on the first sort
      }

      const isAscending = this[ascKey];
      const sortOrder = isAscending ? 1 : -1;

      this.sortedCustomers = [...this.customers].sort((a, b) => {
        const valueA = this.getSortValue(a, keyWord);
        const valueB = this.getSortValue(b, keyWord);

        if (typeof valueA === "string" && typeof valueB === "string") {
          // This sorting way allows us to account every french characters even accentuated ones
          return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
        }

        if (valueA < valueB) return -sortOrder;
        if (valueA > valueB) return sortOrder;
        return 0;
      });

      // Toggle the direction for the next sort dynamically
      this[ascKey] = !isAscending;
    }

  // function to get the sortable value based on 'keyWord'
  getSortValue(customer: Customer, keyWord: string): any {
    switch (keyWord) {
      case "prenom":
        return customer.prenom?.trim().toLowerCase() || '';
      case "member_since":
        return new Date(customer.createdAt).getTime() || 0;
      default:
        return '';
    }
  }
}
