import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.models';
import { Category } from 'src/app/models/category.models';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  public form: UntypedFormGroup;
  public colors = ["#5C6BC0","#66BB6A","#EF5350","#BA68C8","#FF4081","#9575CD","#90CAF9","#B2DFDB","#DCE775","#FFD740","#00E676","#FBC02D","#FF7043","#F5F5F5","#696969"];
  public sizes = ["S","M","L","XL","2XL","32", "36","38","46","52","13.3\"","15.4\"","17\"","21\"","23.4\""];
  public selectedColors:string;
  public categories:Category[];
  private sub: any;
  private currentUser: User;
  public id:any;

  constructor(public appService:AppService, public formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute, private commonService: CommonMessageService,
    private category: CategoryService, private auth: AuthenticationService, private productService :  ProductService, private router: Router, private imgCompressService: ImageCompressService ) { }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    // console.log("currentUser :::::::: ",this.currentUser)
    this.form = this.formBuilder.group({
      'nom': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'images': null,
      // priceBasic: ['', [Validators.required, this.nonZeroValidator]],
      // pricePromotion: ['', this.nonZeroValidator],
      'pricePromotion': [null, [Validators.pattern('^[0-9]*$'),Validators.minLength(3)]],
      'priceBasic': [null, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(3)] ],
      "description": null,
      "weight": "5",
      "user": this.currentUser.username,
      "categorie": [null, Validators.required ]
      // "discount": null,
      // "color": null,
      // "size": null,
    });
    this.getCategories();
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.getProductById();
      }
    });
  }
  //Controle pour la saisie de 0
  nonZeroValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = parseFloat(control.value);
    if (value === 0) {
      return { nonZero: true };
    }
    return null;
  }
  public getCategories(){
    this.category.categories().subscribe(data => {
    // this.appService.getCategories().subscribe(data => {
      console.log(data)
      this.categories = data;
      // this.categories.shift();
    });
  }

  public getProductById(){
    this.productService.find(this.id).then((data : any) =>{
      console.log(data)
      this.form.patchValue(data);
      const images: any[] = [];
      // if (data.image1 != null) {
      //   let image = {link: data.image1, preview: data.image1 }
      //   images.push(image);
      // }
      data.images.forEach(item=>{
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

  public  async onSubmit(){
    console.log(this.form.value);
    if (this.id) {
      this.edit()
    }else{
      this.save()
    }

  }

  async save(){
    let size= 0;
    try {
      if (this.form.valid) {
        var data = new FormData();
        data.append('nom', this.form.value.nom);
        data.append('description', this.form.value.description);
        data.append('priceBasic', this.form.value.priceBasic);
        data.append('pricePromotion', this.form.value.pricePromotion);
        if(this.form.value.images == null){
          this.commonService.errorToast("Choississez une image au minimum")
          return;
        }
        this.form.value.images.forEach(item=>{
          // console.log(item)
          // console.log(typeof(item))
          // console.log(item)
          this.imgCompressService.compressImage(item.file,1200,800,70).then( async (blobImg) => {
            const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
            let editedImg = new File([blobImg], randomName, { type: blobImg.type });
            data.append('image', editedImg);
          });
          size += item.file.size
        })
        // console.log("size ::::::: ",size)
        if(size > 8388608){
          this.commonService.errorToast("La taille totale de l'ensemble des images ne doit pas depasser 8 Mo")
          return;
        }

        if(Number(this.form.value.pricePromotion) > Number(this.form.value.priceBasic) ){
          this.commonService.errorToast("La prix promo ne peut pas être supérieur au prix de base")
          return;
        }
        // data.append('images', this.form.value.images);
        data.append('user', this.form.value.user);
        data.append('categorie', this.form.value.categorie);
        data.append('weight', "5");
        // console.log("images ::: ",this.form.value.images)
        console.log("data ::: ",data)
        let res = await this.productService.add(data);
        console.log("res save product :::::::: ",res)
        if (res != null) {
          this.router.navigate(["/account/products-seller"])
        }
      }else{
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }
    } catch (error) {
      console.log(error)
    }
  }

  async edit(){
    let size= 0;
    try {
      if (this.form.valid) {

        if(size > 8388608){
          this.commonService.errorToast("La taille totale de l'ensemble des images ne doit pas depasser 8 Mo")
          return;
        }


        if(Number(this.form.value.pricePromotion) > Number(this.form.value.priceBasic) ){
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
        this.form.value.images.forEach(item=>{
          // console.log(item)
          // console.log(typeof(item))
          // if (typeof(item) != "string") {
          if (item.file) {
            data.append('image'+i, item.file);
          }
          // data.append('images', item.file);
          i++;
        })
        // data.append('images', this.form.value.images);
        data.append('user', this.form.value.user);
        data.append('categorie', this.form.value.categorie);
        // data.append('weight', "5");
        // console.log("images ::: ",this.form.value.images)
        console.log("data ::: ",JSON.stringify(data))
        let res = await this.productService.edit(this.id,data);
        console.log("res save product :::::::: ",res)
        if (res != null) {
          this.router.navigate(["/account/products-seller"])
        }
      }else{
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }


    } catch (error) {
      console.log(error)
    }
  }

  public onColorSelectionChange(event:any){
    if(event.value){
      this.selectedColors = event.value.join();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
