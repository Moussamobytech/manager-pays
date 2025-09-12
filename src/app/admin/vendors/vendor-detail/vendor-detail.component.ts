import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendorAddProductDialogComponent, VendorAddProductFormValue } from './vendor-add-product-dialog/vendor-add-product-dialog.component';

interface ProductCard {
  id: number;
  name: string;
  image?: string;
  active: boolean;
  price: number;
  oldPrice?: number;
  stock: number;
  description?: string;
  otherStocks?: { location: string; qty: number }[];

  // optional fields added for edit/add support
  category?: string;
  subCategory?: string;
  color?: string;
  weight?: string;
  sizes?: string[];
}

@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.scss']
})
export class VendorDetailComponent implements OnInit {
  shopName = 'Fidelity';
  products: ProductCard[] = [];
  filtered: ProductCard[] = [];
  filterStatus: 'all'|'active'|'inactive' = 'all';
  query = '';
  activeCount = 0;
  vendorId!: number;
  expandedId: number | null = null;
  // pagination
  itemsPerPage = 8;
  currentPage = 1;
isActive: any;

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.vendorId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.products = this.mockProducts();
    const persisted = this.loadPersistedProducts();
    if (persisted.length) {
      this.products = [
        ...persisted,
        ...this.products.filter(p => !persisted.some(pp => pp.id === p.id))
      ];
    }
    this.applyFilters();
  }

  applyFilters() {
    const norm = this.normalize(this.query);
    this.filtered = this.products
      .filter(p => this.filterStatus === 'all' || (this.filterStatus === 'active' ? p.active : !p.active))
      .filter(p => this.normalize(p.name).includes(norm));
    this.activeCount = this.products.filter(p => p.active).length;
  // reset to first page when filters change
  this.currentPage = 1;
  }
  setStatus(filter: 'all'|'active'|'inactive') {
    this.filterStatus = filter;
    this.applyFilters();
  }

  toggleActive(p: ProductCard) { p.active = !p.active; this.syncPersistedProduct(p); }
  editProduct(p: ProductCard) {
    const ref = this.dialog.open(VendorAddProductDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {
        vendorId: this.vendorId,
        product: {
          name: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          stock: p.stock,
          active: p.active,
          imageUrl: p.image,
          // pass through the extended fields so dialog can patch them
          category: p.category ?? '',
          subCategory: p.subCategory ?? '',
          color: p.color ?? '',
          weight: p.weight ?? '',
          sizes: p.sizes ?? []
        }
      }
    });
    ref.afterClosed().subscribe((val) => {
      if (!val) { return; }
      const idx = this.products.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        this.products[idx] = {
          ...this.products[idx],
          name: val.name,
          description: val.description || '',
          price: val.price,
          oldPrice: val.oldPrice || undefined,
          stock: val.stock,
          active: val.active,
          image: val.imageUrl || this.products[idx].image,
          // update extended fields
          category: val.category || this.products[idx].category,
          subCategory: val.subCategory || this.products[idx].subCategory,
          color: val.color || this.products[idx].color,
          weight: val.weight || this.products[idx].weight,
          sizes: val.sizes || this.products[idx].sizes
        };
        this.syncPersistedProduct(this.products[idx]);
        this.applyFilters();
      }
    });
  }
  shareProduct(p: ProductCard) {
    const title = p.name || 'Produit';
    const text = p.description || title;
    const shareUrl = `${location.origin}/vendors/${this.vendorId}/product/${p.id}`;

    // Prefer native Web Share API
    const nav = (navigator as any);
    if (nav && typeof nav.share === 'function') {
      nav.share({ title, text, url: shareUrl })
        .then(() => {
          this.snack.open('Partagé avec succès', 'Fermer', { duration: 2500 });
        })
        .catch((err: any) => {
          // fallback if user cancels or error
          this.snack.open('Partage annulé', 'Fermer', { duration: 2000 });
        });
      return;
    }

    // Fallback: copy link to clipboard and open WhatsApp web with prefilled message
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }

    const wa = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + shareUrl)}`;
    // open whatsapp share in a new window/tab
    try {
      window.open(wa, '_blank');
      this.snack.open('Lien copié. WhatsApp ouvert.', 'Fermer', { duration: 3000 });
    } catch (e) {
      this.snack.open('Impossible d\'ouvrir le partage, lien copié.', 'Fermer', { duration: 3000 });
    }
  }
  advanced(p: ProductCard) {
    this.expandedId = this.expandedId === p.id ? null : p.id;
  }

  addProduct() {
    const ref = this.dialog.open(VendorAddProductDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { vendorId: this.vendorId }
    });
    ref.afterClosed().subscribe((val: VendorAddProductFormValue|undefined) => {
      if (!val) { return; }
      const newProduct: ProductCard = {
        id: this.generateNextId(),
        name: val.name,
        image: val.imageUrl,
        active: val.active,
        price: val.price,
        oldPrice: val.oldPrice || undefined,
        stock: val.stock,
        description: val.description || '',
        // set extended fields from dialog value
        category: val.category || '',
        subCategory: val.subCategory || '',
        color: val.color || '',
        weight: val.weight || '',
        sizes: val.sizes || []
      };
      this.products = [newProduct, ...this.products];
      this.persistNewProduct(newProduct);
      this.applyFilters();
    });
  }

  private generateNextId(): number {
    const ids = this.products.map(p => p.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  private normalize(s: any): string {
    return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/gi,' ').replace(/\s+/g,' ').trim();
  }

  private mockProducts(): ProductCard[] {
    const names = ['T-shirt coton','Pantalon jean','Chaussures sport','Sac à dos','Montre digitale','Casquette logo','Chemise classic','Robe été'];
    const list: ProductCard[] = [];
    for (let i=1;i<=32;i++) {
      const n = names[Math.floor(Math.random()*names.length)];
      const active = Math.random() > 0.3;
      const price = Math.floor(Math.random()*50000)+5000;
      const promo = Math.random() > 0.6 ? price + Math.floor(Math.random()*10000+2000) : undefined;
      const stock = Math.floor(Math.random()*100);
      const locations = ['Entrepôt A', 'Entrepôt B', 'Boutique 1', 'Boutique 2'];
      const extraCount = Math.floor(Math.random()*3); // 0..2
      const otherStocks = Array.from({ length: extraCount }).map(() => ({
        location: locations[Math.floor(Math.random()*locations.length)],
        qty: Math.floor(Math.random()*50)
      }));
      list.push({ id: i, name: n, active, price, oldPrice: promo, stock, image: '', description: 'Description du produit...', otherStocks,
        // initialize extended fields empty so edit works
        category: '', subCategory: '', color: '', weight: '', sizes: []
      });
    }
    return list;
  }

  private storageKey(): string { return `vendor_products_${this.vendorId}`; }

  private loadPersistedProducts(): ProductCard[] {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) { return []; }
      const list = JSON.parse(raw);
      if (Array.isArray(list)) { return list as ProductCard[]; }
    } catch {}
    return [];
  }

  private persistNewProduct(p: ProductCard): void {
    const list = this.loadPersistedProducts();
    list.unshift(p);
    localStorage.setItem(this.storageKey(), JSON.stringify(list));
  }

  private syncPersistedProduct(p: ProductCard): void {
    const list = this.loadPersistedProducts();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p };
    } else {
      list.unshift(p);
    }
    localStorage.setItem(this.storageKey(), JSON.stringify(list));
  }
}