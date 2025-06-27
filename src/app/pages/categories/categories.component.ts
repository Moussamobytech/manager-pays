import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MOCK_DATA } from './mock.data';
import { ProductService } from 'src/app/services/product.service';
import { Category } from 'src/app/models/category.models';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.models';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categoriesAndSubCategories: Category[];
  categories: Category[] = [];
  subCategories: Category[] = [];
  selectedSubCategory: Category = null;
  products: Product[] = [];
  subProducts: Product[] = [];
  unchangedSubProducts: Product[] = [];
  count: number = (window.innerWidth > 600) ? 10 : 6;
  loadIndex: number;
  parentCategory: Category;

  // Filter state properties
  selectedPriceRange: any = null;
  priceFrom = 100;
  priceTo = 250000;
  sortBy: string = '';
  sortOptions = [
    { value: 'LOWEST_FIRST', label: 'Prix croissant' },
    { value: 'HIGHEST_FIRST', label: 'Prix décroissant' },
    { value: 'PROMO', label: 'Promo en premier' },
    { value: 'MOST_RECENT', label: 'Plus récent' }
  ];

  // Category filter properties
  searchTerm: string = '';
  selectedCategories: string[] = [];
  isAllBoxSelected: boolean = false;

  @ViewChild('filterModalTemplate', { static: false }) filterModalTemplate!: TemplateRef<any>
  @ViewChild('scrollTarget', { static: false }) scrollTarget!: ElementRef

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.getProductsCategories().then((data: any) => {
      this.activatedRoute.params.subscribe((params) => {
        const id = params.id;
        if (id) {
          this.parentCategory = this.categoriesAndSubCategories.find(cat => cat.id == id);
          // console.log("this.parentCategory :::::: ", this.parentCategory);
          this.subCategories = this.categoriesAndSubCategories.filter(cat => cat.parentId == id);
          this.getCategoryProducts(id);
        }
      });
    });
  }

  getProductsCategories(): Promise<any> {
    return this.productService.getCategories().then((data: any) => {
      this.categoriesAndSubCategories = data.filter(cat => cat.status === 'ACTIF');
      this.categories = this.categoriesAndSubCategories
        .filter(cat => cat.parentId == null).map(category => ({
          ...category,
          image: category.image || 'assets/images/categories/default-category.png'
        }));
      // console.log("this.mainCategories ::::::", this.categories);
    });
  }

  getCategoryProducts(id: string) {
    this.productService.getProductByCategorie(id).then((data: any) => {
      this.products = data.filter(product => product.etat === 'ACTIF');
      // console.log("this.products :::::: ", this.products)

      this.subCategories = this.subCategories.filter(subCat =>
        this.products.some(product =>
          product.categorie?.id == subCat.id
        )
      ).map(subCat => ({
        ...subCat,
        image: subCat.image || 'assets/images/categories/default-category.png'
      }));

      // Select first valid subcategory
      this.selectedSubCategory = this.subCategories[0] || null;

      if (this.selectedSubCategory) {
        this.subProducts = this.products.filter(product =>
          product.categorie?.id == this.selectedSubCategory.id
        );
        // console.log("this.subProducts :::::: ", this.subProducts)
      } else {
        this.subProducts = [];
      }
      this.unchangedSubProducts = [...this.subProducts]; // Create a deep copy
    });
  }

  CategoryProductCount(id: string) {
    return this.products.filter(product => product.categorie?.id == id).length;
  }

  selectSubCategory(cat: Category) {
    this.selectedSubCategory = cat;

    // Filter products for the selected subcategory
    const filteredProducts = this.products.filter(product =>
      product.categorie?.id == cat.id
    );

    // Update both current and unchanged products
    this.unchangedSubProducts = [...filteredProducts];
    this.subProducts = [...filteredProducts];

    // Reset filters when changing subcategory
    this.resetFilters();

    // Reapply current filters if any
    this.applyCurrentFilters();

    //scroll to the products section
    if (this.scrollTarget) {
      const element = this.scrollTarget.nativeElement;
      const rect = element.getBoundingClientRect();
      const absoluteY = window.scrollY + rect.top;

      window.scrollTo({
        top: absoluteY - 50,// 50px above the element
        behavior: 'smooth'
      });
    }
  }

  openFilter(): void {
    const dialogRef: MatDialogRef<any> = this.dialog.open(this.filterModalTemplate, {
      width: '400px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      panelClass: 'filter-modal-panel',
      backdropClass: 'filter-modal-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'apply') {
        this.applyFilters();
      } else if (result === 'reset') {
        this.resetFilters();
      }
    });
  }

  closeModal(dialogRef: MatDialogRef<any>, action?: string): void {
    dialogRef.close(action);
  }

  onPriceRangeChange(range: any): void {
    this.selectedPriceRange = this.selectedPriceRange === range ? null : range;
  }

  onSortChange(sortValue: string): void {
    if (!sortValue) return;

    switch (sortValue) {
      case 'LOWEST_FIRST':
        this.subProducts.sort((a, b) => {
          const priceA = Number(a.pricePromotion) || Number(a.priceBasic) || 0;
          const priceB = Number(b.pricePromotion) || Number(b.priceBasic) || 0;
          return priceA - priceB;
        });
        break;
      case 'HIGHEST_FIRST':
        this.subProducts.sort((a, b) => {
          const priceA = Number(a.pricePromotion) || Number(a.priceBasic) || 0;
          const priceB = Number(b.pricePromotion) || Number(b.priceBasic) || 0;
          return priceB - priceA;
        });
        break;
      case 'PROMO':
        this.subProducts.sort((a, b) => {
          const hasPromotionA = a.pricePromotion && (a.pricePromotion != a.priceBasic) ? 1 : 0;
          const hasPromotionB = b.pricePromotion && (b.pricePromotion != b.priceBasic) ? 1 : 0;
          if (hasPromotionA != hasPromotionB) {
            return hasPromotionB - hasPromotionA;
          }
          return a.nom?.localeCompare(b.nom) || 0;
        });
        break;
      case 'MOST_RECENT':
      default:
        this.subProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
    }
  }

  applyFilters(): void {
    let filteredProducts = [...this.unchangedSubProducts];

    // Apply category filter
    if (this.selectedCategories.length > 0 && !this.isAllBoxSelected) {
      filteredProducts = filteredProducts.filter(product => 
        this.selectedCategories.includes(product.categorie?.id)
      );
    }

    // Apply price range filter
    if (this.priceFrom !== 100 || this.priceTo !== 250000) {
      filteredProducts = filteredProducts.filter(product => 
        product.prix >= this.priceFrom && product.prix <= this.priceTo
      );
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'LOWEST_FIRST':
        filteredProducts.sort((a, b) => a.prix - b.prix);
        break;
      case 'HIGHEST_FIRST':
        filteredProducts.sort((a, b) => b.prix - a.prix);
        break;
      case 'PROMO':
        filteredProducts.sort((a, b) => (b.campagne?.type ? 1 : 0) - (a.campagne?.type ? 1 : 0));
        break;
      case 'MOST_RECENT':
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    this.subProducts = filteredProducts;
  }

  // Helper method to apply current filters without opening modal
  applyCurrentFilters(): void {
    if (this.hasActiveFilters()) {
      this.applyFilters();
    }
  }

  // Check if there are active filters
  hasActiveFilters(): boolean {
    return (this.priceFrom !== 100 || this.priceTo !== 250000 || this.sortBy !== '');
  }

  resetFilters(): void {
    // Reset filter values
    this.selectedPriceRange = null;
    this.priceFrom = 100;
    this.priceTo = 250000;
    this.sortBy = '';

    // Reset products to original unfiltered state
    this.subProducts = [...this.unchangedSubProducts];

    // Reset load index
    this.loadIndex = this.count;
  }

  validateNumberPrice(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'];
    const isNumber = /^[0-9]$/.test(event.key);
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validatePastePrice(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData && !/^\d+$/.test(clipboardData)) {
      event.preventDefault();
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/logo_fidelity.gif';
  }

  onImageLoad(event: Event, image: string) {
    const imgElement = event.target as HTMLImageElement;
    if (image && image != 'null') {
      imgElement.src = image;
    }
  }

  onLoadMore() {
    this.loadIndex += this.count;
  }

  // Category filter methods
  toggleAllCategories(checked: boolean): void {
    this.isAllBoxSelected = checked;
    if (checked) {
      this.selectedCategories = this.categories.map(cat => cat.id);
    } else {
      this.selectedCategories = [];
    }
    this.applyFilters();
  }

  onCategoryChange(checked: boolean, categoryId: string): void {
    if (checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
    this.isAllBoxSelected = this.selectedCategories.length === this.categories.length;
    this.applyFilters();
  }
}
