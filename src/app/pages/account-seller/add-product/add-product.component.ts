import { Component, HostListener, OnInit } from '@angular/core';
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
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ImgImproveDialogComponent } from './img-improve-dialog/img-improve-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageProcessingService } from 'src/app/services/img-processing.service';

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
  private sub1: any;
  private sub2: any;
  private currentUser: User;
  public id:any;
  isImproveBtnDisabled:boolean=true;
  inputFileFlex:string= '';
  reponseBgLessImgs: any[] = [];

  constructor(public appService:AppService, public formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute, private commonService: CommonMessageService,
    private category: CategoryService, private auth: AuthenticationService, private productService :  ProductService, private router: Router,
    private imgCompressService: ImageCompressService, private dialog: MatDialog, private imgProcessing:ImageProcessingService ) { }

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
      "color": null,
      "weight": null,
      "size": null,
      "user": this.currentUser.username,
      "categorie": [null, Validators.required ]
    });
    this.getCategories();
    this.sub1 = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.getProductById();
      }
    });

    this.sub2 = this.form.controls.images.valueChanges.subscribe(value => {
      this.isImproveBtnDisabled = !value || value.length === 0;
    });
    this.inputFileFlex = (window.innerWidth <= 960&&window.innerWidth >= 600) ? '25' : '33.33';
  }

  //Controle pour la saisie de 0
  // nonZeroValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   const value = parseFloat(control.value);
  //   if (value === 0) {
  //     return { nonZero: true };
  //   }
  //   return null;
  // }
  public getCategories(){
    this.category.categories().subscribe(data => {
      console.log(data)
      this.categories = data;
    });
  }

  public getProductById(){
    this.productService.find(this.id).then((data : any) =>{
      console.log(data)
      this.form.patchValue(data);
      const images: any[] = [];
      data.images.forEach(item=>{
        let image = {
          link: item,
          preview: item
        }
        images.push(image);
      })
      this.form.controls.images.setValue(images);
    })
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

        await this.compressAndPrepareImages().then((compressedFiles) => {
          compressedFiles.forEach((file) => {
            console.log("images before adding: ",file);
            data.append('images', file);
            size += file.size;
          });
        });

        // console.log("size ::::::: ",size)
        if(size > 8388608){
          this.commonService.errorToast("La taille totale de l'ensemble des images ne doit pas depasser 8 Mo")
          return;
        }

        if(Number(this.form.value.pricePromotion) > Number(this.form.value.priceBasic) ){
          this.commonService.errorToast("Le prix promo ne peut pas être supérieur au prix de base")
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
          this.router.navigate(["/account-seller/products-seller"])
        }
      }else{
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }
    } catch (error) {
      console.log(error)
    }
  }

  compressAndPrepareImages () {
    const compressedImagePromises = this.form.value.images.map(async (item: { file: File }) => {
      const compressedBlob = await this.imgCompressService.compressImage(item.file, 1200, 800, 70);
      const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
      const compressedFile = new File([compressedBlob], randomName, { type: compressedBlob.type });
      return compressedFile;
    });

    return Promise.all(compressedImagePromises);
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
        let i = 1;
        this.form.value.images.forEach(item=>{
          if (item.file) {
            data.append('image'+i, item.file);
          }
          i++;
        })
        data.append('user', this.form.value.user);
        data.append('categorie', this.form.value.categorie);
        // data.append('weight', "5");
        console.log("images ::: ",this.form.value.images)
        console.log("data ::: ",JSON.stringify(data))
        let res = await this.productService.edit(this.id,data);
        console.log("res save product :::::::: ",res)
        if (res != null) {
          this.router.navigate(["/account-seller/products-seller"])
        }
      }else{
        this.commonService.warnToast("Merci de vérifier si les champs sont toutes remplis")
      }


    } catch (error) {
      console.log(error)
    }
  }

  async openImageImproveDialog() {
    const images = this.form.value.images;
    const files: File[] = await Promise.all(
      images.map((image) => {
        if (image.link) {
          return this.convertUrlToFile(image.link);
        } else {
          return image.file;
        }
      })
    );
    // let files:File[] =  this.form.value.images.map((image) => this.convertUrlToFile(image.link)) : this.form.value.images.map((image) => image.file);

    console.log("files ::: ",files);
    this.imgProcessing.removeBackground(files).subscribe(
      (response) => {
        console.log('Background removal successful:', response);
        this.reponseBgLessImgs = response.results.map((result) => result.output);

        const dialogRef = this.dialog.open(ImgImproveDialogComponent, {
          width: '80%',
          maxWidth: '600px',
          data: {
            images: this.reponseBgLessImgs,
          }
        });

        dialogRef.afterClosed().subscribe((imgs) => {
          if (imgs) {
                this.form.controls.images.setValue(imgs);
          } else {
            console.log('Dialog was closed without applying any change.');
          }
        });
      },
      (error) => {
        console.error('Error during background removal:', error);
      }
    );
  }

  public onColorSelectionChange(event:any){
    if(event.value){
      this.selectedColors = event.value.join();
    }
  }

  async convertUrlToFile(imageUrl: string): Promise<File> {
    const lastSlash = imageUrl.lastIndexOf('/');
    const lastEqual = imageUrl.lastIndexOf('=');
    const slicePosition = Math.max(lastSlash, lastEqual) + 1;
    const imageName = imageUrl.slice(slicePosition);
    const response = await fetch('https://thingproxy.freeboard.io/fetch/'+imageUrl);
    const blob = await response.blob();
    const randomName = `img-${Math.random().toString(36).substring(2, 15)}.webp`;
    const file = new File([blob], imageName||randomName, { type: blob.type });
    return file;
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }

}
