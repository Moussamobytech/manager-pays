import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface VendorAddProductDialogData {
  vendorId: number;
  product?: Partial<VendorAddProductFormValue>;
}

export interface VendorAddProductFormValue {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  active: boolean;
  imageUrl?: string;
  images?: any[];
  category?: string;
  subCategory?: string;
  color?: string;
  weight?: string;
  sizes?: string[];
}

@Component({
  selector: 'app-vendor-add-product-dialog',
  templateUrl: './vendor-add-product-dialog.component.html',
  styleUrls: ['./vendor-add-product-dialog.component.scss']
})
export class VendorAddProductDialogComponent {
  form: UntypedFormGroup;
  fileLimitNum: number = 5;

  // helper lists for selects
  categories = ['Vêtements', 'Électronique', 'Maison'];
  subCategoriesMap: Record<string, string[]> = {
    'Vêtements': ['Homme', 'Femme', 'Enfant'],
    'Électronique': ['Téléphones', 'Accessoires', 'Audio'],
    'Maison': ['Cuisine', 'Décoration', 'Meubles']
  };
  colors = ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc'];
  sizesOptions = ['XS','S','M','L','XL','XXL'];

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<VendorAddProductDialogComponent, VendorAddProductFormValue>,
    @Inject(MAT_DIALOG_DATA) public data: VendorAddProductDialogData
  ) {
    const categoryValidators = data && data.product ? [] : [Validators.required];

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      oldPrice: [null, [Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      imageUrl: [''],
      images: [null],

      // new controls
      category: ['', categoryValidators],
      subCategory: [''],
      color: [''],
      weight: [''],
      sizes: [[]]
    });

    if (data?.product) {
      this.form.patchValue({
        name: data.product.name ?? '',
        description: data.product.description ?? '',
        price: data.product.price ?? null,
        oldPrice: data.product.oldPrice ?? null,
        stock: data.product.stock ?? 0,
        active: data.product.active ?? true,
        imageUrl: data.product.imageUrl ?? '',
        category: (data.product as any).category ?? '',
        subCategory: (data.product as any).subCategory ?? '',
        color: (data.product as any).color ?? '',
        weight: (data.product as any).weight ?? '',
        sizes: (data.product as any).sizes ?? []
      });
    }
  }

  // helper to get subcategories for selected category
  get subCategories(): string[] {
    const cat = this.form.get('category')?.value;
    return this.subCategoriesMap[cat] || [];
  }

  get isEditMode(): boolean {
    return !!this.data?.product;
  }

  get isSubmitDisabled(): boolean {
    if (this.isEditMode) {
      // require minimal fields for edit
      const nameInvalid = this.form.get('name')?.invalid;
      const priceInvalid = this.form.get('price')?.invalid;
      const stockInvalid = this.form.get('stock')?.invalid;
      return !!(nameInvalid || priceInvalid || stockInvalid);
    }
    return this.form.invalid;
  }

  save() {
    // in edit mode, ensure minimal required fields are valid; if not, mark touched
    if (this.isEditMode) {
      const required = ['name', 'price', 'stock'];
      let invalid = false;
      required.forEach(k => {
        const c = this.form.get(k);
        if (c) {
          c.markAsTouched();
          if (c.invalid) invalid = true;
        }
      });
      if (invalid) return;
    } else {
      if (this.form.invalid) { return; }
    }

    const value = this.form.value as VendorAddProductFormValue;
    if ((!value.imageUrl || value.imageUrl.trim() === '') && value.images && value.images.length) {
      const first = value.images[0];
      value.imageUrl = first.preview || '';
    }
    this.dialogRef.close(value);
  }

  close() {
    this.dialogRef.close();
  }
}


