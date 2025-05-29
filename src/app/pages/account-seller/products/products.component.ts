import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.models';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CommonService } from 'src/app/services/common.service';
import { Product } from 'src/app/models/product.models';
import { catchError, debounceTime, distinctUntilChanged, of, Subscription, switchMap, timeout } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  currentUser: User;
  products: any = [];
  unchangedProducts: any = []; // Original complete list
  filteredProducts: any = []; // Products after filter by state
  searchResults: any = []; // Products after search
  // public page: any;
  count: number = 5;
  domHandlerService = inject(DomHandlerService);
  filterType: 'all' | 'actifs' | 'inactifs' = 'all';
  loadedProductCount: number;
  searchTerm = new FormControl(null);
  private searchSubscription: Subscription | undefined;
  productCopiedId: string;
  copied = new Set<string>();
  expandedProductIds: string[] = [];

  constructor(private productService : ProductService, private commonService : CommonMessageService,
    private auth : AuthenticationService, public appService:AppService,
    public dialog: MatDialog, private cm:CommonService ) { }

  ngOnInit() {
    this.currentUser = this.auth.currentUser()
   // console.log("currentUser :::::::: ",this.currentUser)

    this.loadData()
    this.initializeSearch();
  }

  private initializeSearch(): void {
    this.searchSubscription = this.searchTerm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term) {
          // Search within the unchangedProducts (full dataset)
          return this.appService.searchProductsAndCategories([], this.unchangedProducts, term);
        } else {
          // If no search term, return to the unchanged products
          return of([...this.unchangedProducts]);
        }
      }),
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    ).subscribe(results => {
      // Store search results separately
      this.searchResults = results.map((result: any) => result.item || result);

      // Apply current filter to search results
      this.applyFilterToSearchResults();
    });
  }

  // public onPageChanged(event){
  //   this.page = event;
  //   this.domHandlerService.winScroll(0, 0);
  // }

  // Apply the current filter type to the search results
  private applyFilterToSearchResults(): void {
    let tempFilteredProducts = [...this.searchResults];

    // Apply state filter to search results
    if (this.filterType === 'actifs') {
      tempFilteredProducts = tempFilteredProducts.filter((product: Product) => product.etat === 'ACTIF');
    } else if (this.filterType === 'inactifs') {
      tempFilteredProducts = tempFilteredProducts.filter((product: Product) => product.etat === 'INACTIF');
    }

    // Update filtered products and visible products
    this.filteredProducts = tempFilteredProducts;
    this.products = this.filteredProducts.slice(0, this.loadedProductCount);
  }

  // to load data from backend
  async loadData() {
    let res = await this.productService.getProductBySeller(this.currentUser.username);
    this.unchangedProducts = res;
    this.searchResults = [...this.unchangedProducts]; // Initialize search results with all products
    console.log(this.unchangedProducts);
    this.loadedProductCount = this.count;
    this.setFilter(this.filterType); // Apply initial filter
  }

  // to redirect to add page
  public add(){
    this.cm.goTo("/account-seller/products-seller/add-product");
  }

  // to redirect to edit page
  public edit(id){
    this.cm.goTo("/account-seller/products-seller/edit-product/"+id);
  }

  toggleOrderDetails(orderId: string) {
    if (this.expandedProductIds.includes(orderId)) {
      this.expandedProductIds = this.expandedProductIds.filter(id => id !== orderId);
    } else {
      this.expandedProductIds.push(orderId);
    }
  }

  isProductExpanded(orderId: string): boolean {
    return this.expandedProductIds.includes(orderId);
  }

  // to format the status
  public formatedEtat(key){
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

  // to delete the product
  public remove(product: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous etes sur de supprimer produit?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.productService.supprimer(product.id).subscribe(
          () => {
            // Remove the product from all arrays
            this.removeProductFromArrays(product.id);
            console.log("Produit successfully deleted.");
          },
          (error) => {
            console.error("Error deleting produit:", error);
          }
        );
      }
    });
  }

  // Helper method to remove a product from all product arrays
  private removeProductFromArrays(productId: string): void {
    // Remove from unchangedProducts
    const indexUnchanged = this.unchangedProducts.findIndex((p: any) => p.id === productId);
    if (indexUnchanged !== -1) {
      this.unchangedProducts.splice(indexUnchanged, 1);
    }

    // Remove from searchResults
    const indexSearch = this.searchResults.findIndex((p: any) => p.id === productId);
    if (indexSearch !== -1) {
      this.searchResults.splice(indexSearch, 1);
    }

    // Remove from filteredProducts
    const indexFiltered = this.filteredProducts.findIndex((p: any) => p.id === productId);
    if (indexFiltered !== -1) {
      this.filteredProducts.splice(indexFiltered, 1);
    }

    // Remove from displayed products
    const indexProducts = this.products.findIndex((p: any) => p.id === productId);
    if (indexProducts !== -1) {
      this.products.splice(indexProducts, 1);
    }
  }

  // Method to set the product filter
  setFilter(type: 'all' | 'actifs' | 'inactifs'): void {
    this.filterType = type;

    // If we have search results, filter those instead of the unchangedProducts
    if (this.searchTerm.value) {
      this.applyFilterToSearchResults();
    } else {
      // No search term, filter the original list
      switch (type) {
        case 'all':
          this.filteredProducts = [...this.unchangedProducts];
          break;
        case 'actifs':
          this.filteredProducts = this.unchangedProducts.filter((product: Product) => product.etat === 'ACTIF');
          break;
        case 'inactifs':
          this.filteredProducts = this.unchangedProducts.filter((product: Product) => product.etat === 'INACTIF');
          break;
      }

      // Update displayed products
      this.products = this.filteredProducts.slice(0, this.loadedProductCount);
    }
  }

  // to update the edited product
  public updateState(id, state) {
    this.productService.updateState(id, state).then((data: any) => {
      // Update local data after successful API call
    });
  }

  // to update the edited product
  setStatus(product: Product) {
    const currentState = (product.etat == 'ACTIF') ? true : false;
    this.updateState(product.id, !currentState ? 'ok' : 'nok');

    // Update product status in all arrays
    this.updateProductStatusInArrays(product.id, currentState ? "INACTIF" : "ACTIF");

    // Reapply filter with updated data
    this.setFilter(this.filterType);
  }

  // Helper method to update a product's status in all arrays
  private updateProductStatusInArrays(productId: any, newStatus: string): void {
    // Update in unchangedProducts
    this.unchangedProducts = this.unchangedProducts.map((p: any) => {
      if (p.id === productId) {
        return { ...p, etat: newStatus };
      }
      return p;
    });

    // Update in searchResults
    this.searchResults = this.searchResults.map((p: any) => {
      if (p.id === productId) {
        return { ...p, etat: newStatus };
      }
      return p;
    });

    // If we have a search term active, reapply filter to search results
    if (this.searchTerm.value) {
      this.applyFilterToSearchResults();
    } else {
      // Otherwise just update filteredProducts and products
      this.setFilter(this.filterType);
    }
  }

  // to share a product
  shareProduct(product:Product) {
    const id = product.id;
    const link = `${window.location.origin}/#/products/${id}/${product.nom}`;
    this.copied.add(id);
    const shareData = {
      title: '',
      text: `Découvrez ce produit sur Fidelity-Market: ${product.nom} !`,
      url: link
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((error) => console.error('Erreur lors de l\'envoie: ', error));
    } else {
      this.cm.openWarningSnackBar("Partage non supporté sur ce navigateur, le lien a été copié.");
      this.copyLink(link, id);
    }
  }

  copyLink(link: string, id:string): void {
    navigator.clipboard.writeText(link).then(
      () => {
        setTimeout(() => (this.copied.delete(id)), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }

  // to load more products
  loadMore(): void {
    const nextIndex = this.products.length + this.count;
    this.loadedProductCount = nextIndex;
    this.products = this.filteredProducts.slice(0, nextIndex);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
