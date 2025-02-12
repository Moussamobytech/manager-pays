import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormArray, AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { ProductService } from 'src/app/services/product.service';
import { User } from 'src/app/models/user.models';

@Component({
  selector: 'app-add-parrainage',
  templateUrl: './add-parrainage.component.html',
  styleUrl: './add-parrainage.component.scss'
})
export class AddParrainageComponent implements OnInit {
  form: FormGroup;
  private currentUser: User;
  public id: any;
  public products: any = []

  constructor(
    public appService: AppService,
    public formBuilder: UntypedFormBuilder,
    private commonService: CommonMessageService,
    private auth: AuthenticationService,
    private productService: ProductService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.form = this.formBuilder.group({
      'titre': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'images': null,'commission': [null, [Validators.pattern('^[0-9]*$'), Validators.minLength(3)]],
      'montant': [null, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(3)]],
      "description": null,
      "weight": "5",
      "user": this.currentUser.username,
      "produit": [null, Validators.required]
    });



    this.loadData()
  }

  get produits(): FormArray {
    return this.form.get('produits') as FormArray;
  }
  async loadData() {

    let res = await this.productService.productUser(this.currentUser.username)
    this.products = res
  }
  //Controle pour la saisie de 0
  nonZeroValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = parseFloat(control.value);
    if (value === 0) {
      return { nonZero: true };
    }
    return null;
  }

  public getProductById() {
    this.productService.find(this.id).then((data: any) => {
      console.log(data)
      this.form.patchValue(data);
      const images: any[] = [];
      // if (data.image1 != null) {
      //   let image = {link: data.image1, preview: data.image1 }
      //   images.push(image);
      // }
      data.images.forEach(item => {
        let image = {
          link: item,
          preview: item
        }
        images.push(image);
      })
      this.form.controls.images.setValue(images);
    })

    // this.appService.getProductById(this.id).subscribe((data:any)=>{

    //   this.form.patchValue(data);
    //   this.selectedColors = data.color;
    //   const images: any[] = [];
    //   data.images.forEach(item=>{
    //     let image = {
    //       link: item.medium,
    //       preview: item.medium
    //     }
    //     images.push(image);
    //   })
    //   this.form.controls.images.setValue(images);
    // });
  }

  public async onSubmit() {
    console.log(this.form.value);
    if (this.id) {
      this.edit()
    } else {
      this.save()
    }

  }

  async save() {
    let size = 0;
    try {
      if (this.form.valid) {
        var data = new FormData();
        data.append('nom', this.form.value.nom);
        data.append('description', this.form.value.description);
        data.append('priceBasic', this.form.value.priceBasic);
        data.append('pricePromotion', this.form.value.pricePromotion);

        this.form.value.images.forEach(item => {
          // console.log(item)
          // console.log(typeof(item))
          // console.log(item)
          size += item.file.size
          // this.imgCompressService.compressImage(item.file,1200,800,70).then( async (blobImg) => {
          //   const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
          //   let editedImg = new File([blobImg], randomName, { type: blobImg.type });
          //   console.log("editedImg :::::: ",editedImg)
          //   data.append('images', editedImg);
          // });
        })

        if (Number(this.form.value.pricePromotion) > Number(this.form.value.priceBasic)) {
          this.commonService.errorToast("La prix promo ne peut pas être supérieur au prix de base")
          return;
        }
        // data.append('images', this.form.value.images);
        data.append('user', this.form.value.user);
        data.append('categorie', this.form.value.categorie);
        data.append('weight', "5");
        // console.log("images ::: ",this.form.value.images)
        console.log("data ::: ", data)
        let res = await this.productService.add(data);
        console.log("res save product :::::::: ", res)
        if (res != null) {
          this.router.navigate(["/account-seller/products-seller"])
        }
      } else {
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }
    } catch (error) {
      console.log(error)
    }
  }

  async edit() {
    let size = 0;
    try {
      if (this.form.valid) {

        if (size > 8388608) {
          this.commonService.errorToast("La taille totale de l'ensemble des images ne doit pas depasser 8 Mo")
          return;
        }

        // this.form.value.images.forEach(item=>{
        //   this.imgCompressService.compressImage(item.file,1200,800,70).then( async (blobImg) => {
        //     const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
        //     let editedImg = new File([blobImg], randomName, { type: blobImg.type });
        //     data.append('images', editedImg);
        //   });
        //   size += item.file.size
        // })

        if (Number(this.form.value.pricePromotion) > Number(this.form.value.priceBasic)) {
          this.commonService.errorToast("La prix promo ne peut pas être supérieur au prix de base")
          return;
        }
        var data = new FormData();
        data.append('nom', this.form.value.nom);
        data.append('description', this.form.value.description);
        data.append('priceBasic', this.form.value.priceBasic);
        data.append('pricePromotion', this.form.value.pricePromotion);
        // if(this.form.value.images == null){
        //   this.commonService.errorToast("Choississez une image au minimum")
        //   return;
        // }
        let i = 1;
        this.form.value.images.forEach(item => {
          // console.log(item)
          // console.log(typeof(item))
          // if (typeof(item) != "string") {
          if (item.file) {
            data.append('images' + i, item.file);
          }
          // data.append('images', item.file);
          i++;
        })
        // data.append('images', this.form.value.images);
        data.append('user', this.form.value.user);
        data.append('categorie', this.form.value.categorie);
        // data.append('weight', "5");
        // console.log("images ::: ",this.form.value.images)
        console.log("data ::: ", JSON.stringify(data))
        let res = await this.productService.edit(this.id, data);
        console.log("res save product :::::::: ", res)
        if (res != null) {
          this.router.navigate(["/account-seller/products-seller"])
        }
      } else {
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }


    } catch (error) {
      console.log(error)
    }
  }



}
