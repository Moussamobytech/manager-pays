import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { Category } from 'src/app/app.models';
import { ActivatedRoute } from '@angular/router';

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
  public id:any;

  constructor(public appService:AppService, public formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      'nom': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'images': null,
      "oldPrice": null,
      "newPrice": [null, Validators.required ],
      "discount": null,
      "description": null,
      "pricePromotion": [null, Validators.required ],
      "priceBasic": [null, Validators.required ],
      "user": [null, Validators.required ],
      "availibilityCount": null,
      "color": null,
      "size": null,
      "weight": null,
      "categorie": [null, Validators.required ]
    });
    this.getCategories();
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.getProductById();
      }
    });
  }

  public getCategories(){
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      this.categories.shift();
    });
  }

  public getProductById(){
    this.appService.getProductById(this.id).subscribe((data:any)=>{
      this.form.patchValue(data);
      this.selectedColors = data.color;
      const images: any[] = [];
      data.images.forEach(item=>{
        let image = {
          link: item.medium,
          preview: item.medium
        }
        images.push(image);
      })
      this.form.controls.images.setValue(images);
    });
  }
  public onSubmit() {
    // Récupérer l'objet produit depuis le formulaire
    const produit = this.form.value;

    // Récupérer le fichier image à partir de la valeur du champ "images"
    const imageFile: File = this.form.get('images').value;

    // Vérifier si un fichier image a été sélectionné
    if (imageFile) {
        // Appeler la fonction addProduit avec l'objet produit et le fichier image
        this.appService.addProduit(produit, imageFile).subscribe(() => {
            alert("Le produit a été ajouté avec succès");
            // this._router.navigate(['/products']);
        }, err => alert('Erreur :' + err));
    } else {
        // Gérer le cas où aucun fichier image n'a été sélectionné
        alert("Veuillez sélectionner une image pour le produit.");
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
