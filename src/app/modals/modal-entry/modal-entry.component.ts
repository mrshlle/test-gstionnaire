import { Component, OnInit, Inject, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { DateTime } from 'luxon'

/* -----------------------------------------------------------------------------------------------------------------
Validators imports
----------------------------------------------------------------------------------------------------------------- */
import { BetweenDateValidator } from '../../validators/between-date.validator'

@Component({
    selector: 'app-modal-entry',
    templateUrl: './modal-entry.component.html',
    styleUrls: ['./modal-entry.component.css'],
    standalone: false
})
export class ModalEntryComponent implements OnInit {

	@ViewChildren('dateInput') dateInputs;

	title: string = ''

	today: DateTime = DateTime.local()
	minDate: DateTime

	formEntry: UntypedFormGroup

	constructor(@Inject(MAT_DIALOG_DATA) public data,
				private dialogRef: MatDialogRef<ModalEntryComponent>) {
		dialogRef.disableClose = true;
	}

	ngOnInit(): void {
		this.minDate = this.data.minDate
		this.formEntry = new UntypedFormGroup({
			type: new UntypedFormControl('',Validators.required),
			title: new UntypedFormControl('',Validators.required),
		  	amount: new UntypedFormControl('',Validators.required),
		  	date: new UntypedFormGroup({
		  		day: new UntypedFormControl('',Validators.required),
		  		month: new UntypedFormControl('',Validators.required),
		  		year: new UntypedFormControl('',Validators.required)
		  	}),
		});
		this.formEntry.get('date').setValidators(BetweenDateValidator("day","month","year",this.minDate,DateTime.local()))
		if (this.data.type === 'update'){
			this.title = 'Modification de l\'entrée'
			this.formEntry.get('type').patchValue(this.data.entry.type)
			this.formEntry.get('title').patchValue(this.data.entry.title)
			this.formEntry.get('amount').patchValue(this.data.entry.amount)
			this.formEntry.get('date').get('day').patchValue(this.data.entry.date_entry.day)
			this.formEntry.get('date').get('month').patchValue(this.data.entry.date_entry.month)
			this.formEntry.get('date').get('year').patchValue(this.data.entry.date_entry.year)
		}else{
			this.title = 'Ajout d\'une entrée'
		}
	}

	numberOnly(event): boolean {
		let result = false;
		// Get the ASCII code of the character added
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			if (charCode == 46) {
				result = true
			}else{
				result = false
			}
		}else{
			result = true
		}
		return result;
	}

	numberOnlyWithoutDot(event): boolean {
		let result = false;
		// Get the ASCII code of the character added
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			result = false
		}else{
			result = true
		}
		return result;
	}

	nextInput(event){
		let actualInput = event.srcElement
		let actualIndex = this.dateInputs._results.findIndex(object => object.nativeElement === actualInput)
		let nextInput = this.dateInputs._results[actualIndex + 1].nativeElement

		if(event.target.value.length == 2) {
			nextInput.focus()
		}else if(event.target.value.length > 2) {
			event.target.value = event.target.value.substring(0,2)
			nextInput.focus()
		}
	}

	maxLength(event,length){
		if(event.target.value.length > length) {
			event.target.value = event.target.value.substring(0,length)
		}
	}

	send(){
		if (!this.disabled()) {
			this.dialogRef.close({form:this.formEntry.getRawValue()});
		}
	}

	close(){
		this.dialogRef.close({form:null})
	}

	disabled(){
		return this.formEntry.invalid;
	}
}