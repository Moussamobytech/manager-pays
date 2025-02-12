import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from 'express';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-commande-dialog',
  templateUrl: './commande-dialog.component.html',
  styleUrl: './commande-dialog.component.scss'
})
export class CommandeDialogComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<CommandeDialogComponent>, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: UntypedFormBuilder, public appService: AppService,) { }


  ngOnInit(): void {

    console.log("DATA :::::::::::::::::::: ", JSON.stringify(this.data));

  }

  public Status(key) {
    let res = ""
    switch (key) {
      case "DELIVERED":
        res = "Livrer"
        break;

      case "CANCEL":
        res = "Annuler"
        break;

      case "PENDING":
        res = "En attente"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }
}
