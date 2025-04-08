/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-creation-facture',
    templateUrl: './modal-creation-facture.component.html',
    styleUrls: ['./modal-creation-facture.component.css'],
    standalone: false
})
export class ModalCreationFactureComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	title: string = ''
	objet: string = '';
	content: string = '';
	confirm: string = '';
	cancel: string = ''

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(@Inject(MAT_DIALOG_DATA) public data,
				private sanitizer:DomSanitizer,
				private dialogRef: MatDialogRef<ModalCreationFactureComponent>) {
		// Disable the possibility to close the dialog by clicking outside of it
		dialogRef.disableClose = true;
	}

	ngOnInit(): void {
		this.title = this.data.title
		this.content = this.sanitizer.bypassSecurityTrustHtml(this.data.content) as string;
		this.confirm = this.data.confirm
		this.cancel = this.data.cancel
	}

	/* ---------------------------
	Create the facture
	Input
	- value : the object of the facture
	No output
	----------------------------*/
	creerFacture(value){
		if (!this.disableOui()) {
			this.dialogRef.close({facture:value, data:this.objet});
		}
	}

	close(){
		this.dialogRef.close({facture:false})
	}

	/* ---------------------------
	Disable the yes button if no object was provided
	No input
	Output
	- A boolean depending on the object
	----------------------------*/
	disableOui(){
		return (this.objet == '' || this.objet == undefined);
	}
}