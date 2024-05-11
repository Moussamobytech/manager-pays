import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Newsletter } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.scss'
})
export class NewsletterComponent implements OnInit {
  public newsletter : Newsletter[];
 public page: any;
 public count = 5;
 public viewCol: number = 25;
 constructor(public formBuilder: UntypedFormBuilder, public appService : AppService,public domHandlerService: DomHandlerService){}
  ngOnInit(): void {
    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };
    this.getNewsletter();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public getNewsletter(){
    this.appService.getNewsletter().subscribe(data =>{
      this.newsletter = data;
      console.log("newsletter :"+ this.newsletter);
    })
  }

  setStatus(id: string, event: MatSlideToggleChange): void {
    // Trouver le newsletter correspondante dans la liste
    const newsletter = this.newsletter.find(c => c.id === id);
    if (newsletter) {
      // Mettre à jour l'état de newsletter
      newsletter.etat = event.checked;
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.appService.setStatusNewsletter(id, event.checked).subscribe(
        () => {
          console.log(`Statut de newsletter ${id} modifié avec succès à ${event.checked}.`);
          // Mettre à jour l'état de newsletter dans votre application si nécessaire
        },
        error => {
          console.error("Erreur lors du réglage du statut de newsletter:", error);
          // Traiter les erreurs éventuelles lors de la modification du statut de newsletter
        }
      );
    }
  }

}
