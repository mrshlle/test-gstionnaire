import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-update-recurrence',
    templateUrl: './modal-update-recurrence.component.html',
    styleUrls: ['./modal-update-recurrence.component.css'],
    standalone: false
})
export class ModalUpdateRecurrenceComponent {

	update: string = "0"

	constructor(private dialogRef: MatDialogRef<ModalUpdateRecurrenceComponent>) {
		dialogRef.disableClose = true
	}

	close(){
		this.dialogRef.close()
	}

	confirmAndClose(){
		this.dialogRef.close(this.update)
	}
}



// import { Component, OnInit, Inject } from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';

// @Component({
// 	selector: 'app-modal-information',
// 	templateUrl: './modal-information.component.html',
// 	styleUrls: ['./modal-information.component.css']
// })
// export class ModalInformationComponent implements OnInit {

// 	title: string = "Titre de l'information"
// 	content: string = "Attention, une erreur est survenue lors de la récupération de vos données<br>réessayez ultérieurement"
// 	cancel: string = "Annuler"
// 	confirm: string = "Confirmer"

// 	constructor(@Inject(MAT_DIALOG_DATA) public data,
// 				private sanitizer:DomSanitizer,
// 				private dialogRef: MatDialogRef<ModalInformationComponent>) {
// 		dialogRef.disableClose = true
// 	}

// 	ngOnInit(): void {
// 		this.title = this.data.title
// 		this.content = this.sanitizer.bypassSecurityTrustHtml(this.data.content) as string;
// 		this.cancel = this.data.cancel
// 		this.confirm = this.data.confirm
// 	}

// 	crossClose(){
// 		this.dialogRef.close()
// 	}

// 	close(){
// 		this.dialogRef.close(false)
// 	}

// 	confirmAndClose(){
// 		this.dialogRef.close(true)
// 	}
// }