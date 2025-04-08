import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService } from '../../services/patient.service'

@Component({
    selector: 'app-modal-show-document',
    templateUrl: './modal-show-document.component.html',
    styleUrls: ['./modal-show-document.component.css'],
    standalone: false
})
export class ModalShowDocumentComponent implements OnInit {

	error: boolean = false
	url: string = ''
	type: string = ''
	title: string = ''
	loading: boolean = true

	constructor(@Inject(MAT_DIALOG_DATA) private data,
				private dialogRef: MatDialogRef<ModalShowDocumentComponent>,
				private patientService: PatientService) {}

	ngOnInit(): void {
		if ('base64' in this.data){
			this.loading = false
			this.url = this.data.src
			this.type = this.data.mimetype
		}else{
			if (!this.data.preview) {
				if (this.data.mimetype === 'application/pdf' || (this.data.mimetype.startsWith('image/') && !this.data.mimetype.includes('svg'))) {
					this.title = this.data.name
					this.patientService.getDocumentUrl(this.data).subscribe((data) => {
						this.loading = false
						this.url = 'data:' + this.data.mimetype + ';base64,' + data
					},(error) => {
						this.loading = false
						this.error = true
					})
					this.type = this.data.mimetype
				}else{
					this.error = true
				}
			}else{
				if (this.data.file.type === 'application/pdf' || (this.data.file.type.startsWith('image/') && !this.data.file.type.includes('svg'))) {
					let reader = new FileReader();
					reader.readAsDataURL(this.data.file); 
					reader.onload = () => { 
						this.loading = false
						this.url = reader.result.toString()
					}
					this.type = this.data.file.type
				}else{
					this.error = true
				}
			}
		}
	}

	crossClose(){
		this.dialogRef.close()
	}

}