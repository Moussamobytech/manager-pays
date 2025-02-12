import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { id } from '@swimlane/ngx-charts';
import { CommandeService } from 'src/app/services/commande.service';

@Component({
  selector: 'app-commande-add-note',
  //standalone: true,
  // imports: [],
  templateUrl: './commande-add-note.component.html',
  styleUrl: './commande-add-note.component.scss'
})
export class CommandeAddNoteComponent implements OnInit {

  public form: UntypedFormGroup;
  constructor(
    public formBuilder: UntypedFormBuilder, 
    public dialogRef: MatDialogRef<CommandeAddNoteComponent>,
    private commandeService:CommandeService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
    id:string
  ngOnInit(): void {
    this.id = this.data.order.id
    this.form = this.formBuilder.group({
      note: [''],

    });
    this.initData()

  }

  initData() {
    if (this.data.order && this.data.order.note) {
      this.form.patchValue({ note: this.data.order.note });
    }
  }
  
  onSubmit() {    
    this.commandeService.setNote(this.id,this.form.value.note).subscribe(data =>{        
    })
    
    }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
