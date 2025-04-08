import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-send-invoice',
    templateUrl: './modal-send-invoice.component.html',
    styleUrls: ['./modal-send-invoice.component.css'],
    standalone: false
})
export class ModalSendInvoiceComponent implements OnInit {

	mailForm: UntypedFormGroup

	constructor(@Inject(MAT_DIALOG_DATA) public data,
				private dialogRef: MatDialogRef<ModalSendInvoiceComponent>) { 
		// Disable the possibility to close the dialog by clicking outside of it
		dialogRef.disableClose = true;
	}

	ngOnInit() {
		this.mailForm = new UntypedFormGroup({
			stamp: new UntypedFormControl(false),
			email: new UntypedFormControl('', [Validators.required, Validators.email])
		})
	}

	close(){
		this.dialogRef.close()
	}

	confirmAndClose(){
	  	if(this.mailForm.valid){
	  		const mailInfo = this.mailForm.value
			this.dialogRef.close(mailInfo);
	  	}
	}
}