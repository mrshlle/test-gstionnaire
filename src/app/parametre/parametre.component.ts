/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormControl, Validators, FormControl, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { forkJoin } from 'rxjs';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';
import { AuthService } from '../services/auth.service'

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { User } from '../models/User.models';

import { ModalShowDocumentComponent } from '../modals/modal-show-document/modal-show-document.component';

@Component({
    selector: 'app-parametre',
    templateUrl: './parametre.component.html',
    styleUrls: ['./parametre.component.css'],
    standalone: false
})
export class ParametreComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	disabledStamp: boolean = true;
	disabledFee: boolean = true;
	disabledPrice: boolean = true;
	disabledExtra: boolean = true;
	disabledColor: boolean = true;
	disabledFooter: boolean = true;

	editStamp: boolean = false;
	editFee: boolean = false;
	editPrice: boolean = false;
	editExtra: boolean = false;
	editColor: boolean = false;
	editFooter: boolean = false;

	loadingStamp: boolean = false;
	loadingFee: boolean = false;
	loadingPrice: boolean = false;
	loadingExtra: boolean = false;
	loadingColor: boolean = false;
	loadingFooter: boolean = false;

	errorStamp: boolean = false;
	errorFee: boolean = false;
	errorPrice: boolean = false;
	errorExtra: boolean = false;
	errorColor: boolean = false;
	errorFooter: boolean = false;

	successStamp: boolean = false;
	successFee: boolean = false;
	successPrice: boolean = false;
	successExtra: boolean = false;
	successColor: boolean = false;
	successFooter: boolean = false;

	stampForm: UntypedFormGroup;
	feeForm: UntypedFormGroup;
	priceForm: UntypedFormGroup;
	extraForm: UntypedFormGroup;
	footerForm: UntypedFormGroup;

	previousStamp
	previousFee
	previousPrice
	previousExtra
	previousFooter
	
	extraNumber: number = 0
	stampNumber: number = 0

	userColor = 0
	initialColor = 0

	user: User;

	settings: number = 0;
	tab: number = 0;

	stampImage: any = null
	stampImageLoading: boolean = false

	signatureImage: any = null
	signatureImageLoading: boolean = false

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private authService: AuthService,
				private dialog: MatDialog) { }

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get information about user
	----------------------------*/
	ngOnInit() {
		// Initiate the forms, and disable all fields
		this.user = this.patientService.user
		this.userColor = this.user.color
		this.initialColor = this.user.color
		if (this.user.stamp_image) {
			this.stampImage = this.user.stamp_image
			this.stampImage['src'] = 'data:' + this.user.stamp_image.mimetype + ';base64,' + this.user.stamp_image.base64
		}
		if (this.user.signature_image) {
			this.signatureImage = this.user.signature_image
			this.signatureImage['src'] = 'data:' + this.user.signature_image.mimetype + ';base64,' + this.user.signature_image.base64
		}
		// Initiate stamp form
		this.initiateStamp(this.user.stamp_type,this.user.adeli)
		this.previousStamp = this.stampForm.value
		// Initiate fee form
		this.feeForm = new UntypedFormGroup({
			fee: new UntypedFormControl({value:this.user.charge,disabled:true},[Validators.required])
		})
		this.previousFee = this.feeForm.value
		// Initiate price form
		this.priceForm = new UntypedFormGroup({
			price: new UntypedFormControl({value:this.user.prix_normal,disabled:true},[Validators.required])
		})
		this.previousPrice = this.priceForm.value
		// Initiate extra form
		this.initiateExtra(this.user.prix_speciaux)
		this.previousExtra = this.extraForm.value
		this.footerForm = new UntypedFormGroup({
			footer: new UntypedFormControl({value:this.user.footer,disabled:true}),
			footerText: new UntypedFormControl({value:this.user.footer_text,disabled:true})
		})
		this.previousFooter = this.footerForm.value
	}

	ngOnDestroy(){
		this.cancelColor()
	}

	updateDisable(event, type){
		switch(type){
			case 0:
				this.disabledStamp = this.stampForm.invalid
				break
			case 1:
				this.disabledFee = (event.target.value === this.previousFee.fee) || this.feeForm.invalid
				break
			case 2:
				this.disabledPrice = (event.target.value === this.previousPrice.price) || this.priceForm.invalid
				break
			case 3:
				this.disabledExtra = this.extraForm.invalid
				break
			case 4:
				this.disabledFooter = this.footerForm.invalid
				break
		}
	}

	initiateStamp(type,values){
		this.stampForm = new UntypedFormGroup({
			type: new UntypedFormControl({value:type,disabled:true},[Validators.required]),
			stamp: new UntypedFormArray([])
		})
		this.stampNumber = values.length
		for (var i = 0; i < values.length; ++i) {
			let value = new UntypedFormControl(values[i],[Validators.required])
			this.getControl(this.stampForm,'stamp').push(value)
		}
		this.stampForm.get('stamp')['controls'].forEach(control => control.disable())
	}

	initiateExtra(values){
		this.extraForm = new UntypedFormGroup({
			extra: new UntypedFormArray([])
		})
		this.extraNumber = values.length
		for (var i = 0; i < values.length; ++i) {
			let priceGroup = new UntypedFormGroup({
				name: new UntypedFormControl(values[i].name,[Validators.required]),
				price: new UntypedFormControl(values[i].price,[Validators.required]),
			});
			this.getControl(this.extraForm,'extra').push(priceGroup)
		}
		this.extraForm.get('extra')['controls'].forEach(control => control.disable())
	}

	updatePrice(){
		if (!this.loadingPrice){
			if (this.editPrice){
				if (!this.disabledPrice){
					if (this.patientService.demo){
						this.priceForm.get('price').disable()
						this.previousPrice = this.priceForm.value
						this.user.prix_normal = this.priceForm.get('price').value
						this.editPrice = !this.editPrice
					}else{
						this.loadingPrice = true
						this.patientService.updatePrice(this.priceForm.get('price').value).subscribe((data) => {
						},(error) => {
							this.errorPrice = true
							setTimeout(() => {
								this.errorPrice = false
								this.loadingPrice = false
							},1000)
						},() => {
							this.successPrice = true
							setTimeout(() => {
								this.successPrice = false
								this.loadingPrice = false
							},1000)
							this.priceForm.get('price').disable()
							this.previousPrice = this.priceForm.value
							this.user.prix_normal = this.priceForm.get('price').value
							this.authService.storeInLocal(this.user)
							this.disabledPrice = true
							this.editPrice = !this.editPrice
						})
					}
				}
			}else{
				this.priceForm.get('price').enable()
				this.editPrice = !this.editPrice
			}
		}
	}

	updateExtra(){
		if (!this.loadingExtra){
			if (this.editExtra){
				if (!this.disabledExtra){
					let specialPricesLabels = this.extraForm.get('extra').value.map(price => price.name)
					let newConsultationSurvey = JSON.parse(this.user.consultation)
					newConsultationSurvey[0].options = specialPricesLabels
					let sendConsultation = JSON.stringify(newConsultationSurvey).replace(/'/g,"''")
					let observables = [
						this.patientService.updateConsultation(sendConsultation), 
						this.patientService.updateExtra(JSON.stringify(this.extraForm.get('extra').value))
					]
					if (this.patientService.demo){
						this.extraForm.get('extra')['controls'].forEach(control => control.disable())
						this.previousExtra = this.extraForm.value
						this.user.prix_speciaux = this.extraForm.get('extra').value
						this.user.consultation = JSON.stringify(newConsultationSurvey)
						this.editExtra = !this.editExtra
					}else{
						this.loadingExtra = true
						forkJoin(observables).subscribe((data)=>{
						},(error)=>{
							this.errorExtra = true
							setTimeout(() => {
								this.errorExtra = false
								this.loadingExtra = false
							},1000)
						},() => {
							this.successExtra = true
							setTimeout(() => {
								this.successExtra = false
								this.loadingExtra = false
							},1000)
							this.extraForm.get('extra')['controls'].forEach(control => control.disable())
							this.previousExtra = this.extraForm.value
							this.user.prix_speciaux = this.extraForm.get('extra').value
							this.user.consultation = JSON.stringify(newConsultationSurvey)
							this.authService.storeInLocal(this.user)
							this.disabledExtra = true
							this.editExtra = !this.editExtra
						});
					}
				}
			}else{
				this.extraForm.get('extra')['controls'].forEach(control => control.enable())
				this.editExtra = !this.editExtra
			}
		}
	}

	updateStamp(){
		if (!this.loadingStamp){
			if (this.editStamp){
				if (!this.disabledStamp){
					if (this.patientService.demo){
						this.stampForm.get('stamp').disable()
						this.stampForm.get('type').disable()
						this.previousStamp = this.stampForm.value
						this.user.adeli = this.stampForm.get('stamp').value
						this.user.stamp_type = this.stampForm.get('type').value
						this.editStamp = !this.editStamp
					}else{
						this.loadingStamp = true
						this.patientService.updateStamp(this.stampForm.get('type').value,JSON.stringify(this.stampForm.get('stamp').value).replace(/'/g,"''")).subscribe((data) => {
							this.successStamp = true
							setTimeout(() => {
								this.successStamp = false
								this.loadingStamp = false
							},1000)
							this.stampForm.get('stamp').disable()
							this.stampForm.get('type').disable()
							this.previousStamp = this.stampForm.value
							this.user.adeli = this.stampForm.get('stamp').value
							this.user.stamp_type = this.stampForm.get('type').value
							this.authService.storeInLocal(this.user)
							this.disabledStamp = true
							this.editStamp = !this.editStamp
						},(error) => {
							this.errorStamp = true
							setTimeout(() => {
								this.errorStamp = false
								this.loadingStamp = false
							},1000)
						})
					}
				}
			}else{
				this.stampForm.get('stamp').enable()
				this.stampForm.get('type').enable()
				this.editStamp = !this.editStamp
			}
		}
	}

	updateFee(){
		if (!this.loadingFee){
			if (this.editFee) {
				if (!this.disabledFee){
					if (this.patientService.demo){
						this.feeForm.get('fee').disable()
						this.previousFee = this.feeForm.value
						this.user.charge = this.feeForm.get('fee').value
						this.editFee = !this.editFee
					}else{
						this.loadingFee = true
						this.patientService.updateFee(this.feeForm.get('fee').value).subscribe((data) => {
							this.successFee = true
							setTimeout(() => {
								this.successFee = false
								this.loadingFee = false
							},1000)
							this.feeForm.get('fee').disable()
							this.previousFee = this.feeForm.value
							this.user.charge = this.feeForm.get('fee').value
							this.authService.storeInLocal(this.user)
							this.disabledFee = true
							this.editFee = !this.editFee
						},(error) => {
							this.errorFee = true
							setTimeout(() => {
								this.errorFee = false
								this.loadingFee = false
							},1000)
						})
					}
				}
			}else{
				this.feeForm.get('fee').enable()
				this.editFee = !this.editFee
			}
		}
	}

	updateColor(){
		if (!this.loadingColor){
			if (this.editColor) {
				if (!this.disabledColor){
					if (this.patientService.demo){
						this.initialColor = this.userColor
						this.editColor = !this.editColor
					}else{
						this.loadingColor = true
						this.patientService.updateColor(this.userColor).subscribe((data) => {
							this.successColor = true
							setTimeout(() => {
								this.successColor = false
								this.loadingColor = false
							},1000)
							this.initialColor = this.userColor
							this.authService.storeInLocal(this.user)
							this.disabledColor = true
							this.editColor = !this.editColor
						},(error) => {
							this.errorColor = true
							setTimeout(() => {
								this.errorColor = false
								this.loadingColor = false
							},1000)
						})
					}
				}
			}else{
				this.editColor = !this.editColor
			}
		}
	}

	updateFooter(){
		if (!this.loadingFooter){
			if (this.editFooter) {
				if (!this.disabledFooter){
					if (this.patientService.demo){
						this.footerForm.get('footer').disable()
						this.footerForm.get('footerText').disable()
						this.previousFooter = this.footerForm.value
						this.user.footer = this.footerForm.get('footer').value
						this.user.footer_text = this.footerForm.get('footerText').value
						this.editFooter = !this.editFooter
					}else{
						this.loadingFooter = true
						this.patientService.updateFooter(this.footerForm.get('footer').value,this.footerForm.get('footerText').value).subscribe((data) => {
							this.successFooter = true
							setTimeout(() => {
								this.successFooter = false
								this.loadingFooter = false
							},1000)
							this.footerForm.get('footer').disable()
							this.footerForm.get('footerText').disable()
							this.previousFooter = this.footerForm.value
							this.user.footer = this.footerForm.get('footer').value
							this.user.footer_text = this.footerForm.get('footerText').value
							this.authService.storeInLocal(this.user)
							this.disabledFooter = true
							this.editFooter = !this.editFooter
						},(error) => {
							this.errorFooter = true
							setTimeout(() => {
								this.errorFooter = false
								this.loadingFooter = false
							},1000)
						})
					}
				}
			}else{
				this.footerForm.get('footer').enable()
				this.footerForm.get('footerText').enable()
				this.editFooter = !this.editFooter
			}
		}
	}

	cancelPrice(){
		if (!this.loadingPrice){
			this.priceForm.reset(this.previousPrice)
			this.priceForm.get('price').disable();
			this.editPrice = !this.editPrice
			this.disabledPrice = true
		}
	}

	cancelStamp(){
		if (!this.loadingStamp){
			this.initiateStamp(this.previousStamp.type,this.previousStamp.stamp)
			this.editStamp = !this.editStamp
			this.disabledStamp = true
		}
	}

	cancelExtra(){
		if (!this.loadingExtra){
			this.initiateExtra(this.previousExtra.extra)
			this.editExtra = !this.editExtra
			this.disabledExtra = true
		}
	}

	cancelFee(){
		if (!this.loadingFee){
			this.feeForm.reset(this.previousFee)
			this.feeForm.get('fee').disable();
			this.editFee = !this.editFee
			this.disabledFee = true
		}
	}

	cancelColor(){
		if (!this.loadingColor){
			this.userColor = this.initialColor
			this.user.color = this.initialColor
			this.editColor = !this.editColor
			this.disabledColor = true
		}
	}

	cancelFooter(){
		if (!this.loadingFooter){
			this.footerForm.reset(this.previousFooter)
			this.footerForm.get('footer').disable();
			this.footerForm.get('footerText').disable();
			this.editFooter = !this.editFooter
			this.disabledFooter = true
		}
	}

	getControl(form: UntypedFormGroup,name){
		return form.get(name) as UntypedFormArray
	}

	addStampElement(){
		this.stampNumber = this.stampNumber + 1
		let value = new UntypedFormControl('',[Validators.required]);
		this.getControl(this.stampForm,'stamp').push(value)
	}

	setColor(index){
		if (this.editColor) {
			this.userColor = index
			this.user.color = index
			this.disabledColor = this.userColor === this.initialColor
		}
	}

	removeStampElement(index){
		this.stampNumber = this.stampNumber - 1
		this.getControl(this.stampForm,'stamp').removeAt(index)
		if ((this.stampForm.value.stamp.length < this.previousStamp.stamp.length) && (this.stampForm.value.stamp.length > 0) && this.stampForm.valid) {
			this.disabledStamp = false
		}
		if (this.stampForm.value.stamp.length === 0) {
			this.disabledStamp = true
		}
	}

	addSpecialPrice(){
		this.extraNumber = this.extraNumber + 1
		let priceGroup = new UntypedFormGroup({
			name: new UntypedFormControl('',[Validators.required]),
			price: new UntypedFormControl('',[Validators.required]),
		});
		this.getControl(this.extraForm,'extra').push(priceGroup)
	}

	removeSpecialPrice(index){
		this.extraNumber = this.extraNumber - 1;
		this.getControl(this.extraForm,'extra').removeAt(index)
		if ((this.extraForm.value.extra.length < this.previousExtra.extra.length) && (this.extraForm.value.extra.length > 0) && this.extraForm.valid) {
			this.disabledExtra = false
		}
		if (this.extraForm.value.extra.length === 0) {
			this.disabledExtra = true
		}
	}

	/* ---------------------------
	Method to trigger the input writing, to accept only number
	Input
	 - event : the event of the input
	Output
	 - The accepted string, without any non digits characters
	----------------------------*/
	numberOnlyCharge(event): boolean {
		// The numberOnly for charge is different, it accepts only number between 0 and 100 becaue it's a percentage
		const newFee = Number(this.feeForm.get('fee').value.toString() + event.key)
    	const charCode = (event.which) ? event.which : event.keyCode;
    	let result = false
    	const range = newFee <= 100
    	if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      		if (charCode == 46) {
      			result = true && range
      		}else{
      			result = false
      		}
    	}else{
    		result = true && range
    	}
    	return result;
  	}

  	/* ---------------------------
	Method to trigger the input writing, to accept only number
	Input
	 - event : the event of the input
	Output
	 - The accepted string, without any non digits characters
	----------------------------*/
  	numberOnly(event): boolean {
		let result = false;
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

  	addFile(event) {
  		if (this.editStamp && !this.loadingStamp && !this.stampImageLoading) {
	  		this.stampImageLoading = true
	  		let file = event.target.files[0]
	  		if (file.size > 2*1048576) {
	  			this.stampImageLoading = false
	  			this.patientService.showModalInformation({
					'title':'Fichier trop lourd',
					'content':'<p>Le fichier que vous souhaitez utiliser à une taille supérieure à <b>2MB</b>.</p>',
					'cancel':'Ok',
				})
	  		}else{
	  			this.patientService.uploadStampFile(file).subscribe((data: any) => {
	  				this.stampImage = {...data,'src':'data:' + data.mimetype + ';base64,' + data.base64}
	  				this.user.stamp_image = data
	  				this.patientService.storeInLocal(this.user)
	  				this.stampImageLoading = false
	  			},(err) => {
	  				this.stampImageLoading = false
	  				this.patientService.showModalInformation({
						'title':'Importation échouée',
						'content':'<p>Une erreur est survenue lors de l\'importation de votre image.<br>Merci de réessayer ultérieurement.</p>',
						'cancel':'Ok',
					})
	  			})
	  		}
	  	}
  	}

  	addFileSignature(event) {
  		console.log(event)
  		if (!this.signatureImageLoading) {
	  		this.signatureImageLoading = true
	  		let file = event.target.files[0]
	  		if (file.size > 2*1048576) {
	  			this.signatureImageLoading = false
	  			this.patientService.showModalInformation({
					'title':'Fichier trop lourd',
					'content':'<p>Le fichier que vous souhaitez utiliser à une taille supérieure à <b>2MB</b>.</p>',
					'cancel':'Ok',
				})
	  		}else{
	  			this.patientService.uploadSignatureFile(file).subscribe((data: any) => {
	  				this.signatureImage = {...data,'src':'data:' + data.mimetype + ';base64,' + data.base64}
	  				this.user.signature_image = data
	  				this.patientService.storeInLocal(this.user)
	  				this.signatureImageLoading = false
	  			},(err) => {
	  				this.signatureImageLoading = false
	  				this.patientService.showModalInformation({
						'title':'Importation échouée',
						'content':'<p>Une erreur est survenue lors de l\'importation de votre image.<br>Merci de réessayer ultérieurement.</p>',
						'cancel':'Ok',
					})
	  			})
	  		}
	  	}
  	}

  	showStampImage(){
  		if (!this.stampImageLoading) {
			this.dialog.open(ModalShowDocumentComponent,{data:this.stampImage,panelClass:'document'});
		}
  	}

  	showSignatureImage(){
  		if (!this.signatureImageLoading) {
			this.dialog.open(ModalShowDocumentComponent,{data:this.signatureImage,panelClass:'document'});
		}
  	}

  	removeStampImage(){
  		if (!this.stampImageLoading) {
	  		this.stampImageLoading = true
	  		this.patientService.removeStampFile(this.stampImage.id).subscribe((data: any) => {
	  			this.stampImageLoading = false
	  			this.stampImage = null
	  			this.user.stamp_image = null
	  			this.user.stamp_type = "0"
	  			this.previousStamp.type = "0"
	  			this.stampForm.get('type').patchValue('0')
	  			this.disabledStamp = this.stampForm.invalid
	  			this.patientService.storeInLocal(this.user)
	  		},(error) => {
	  			this.stampImageLoading = false
				this.patientService.showModalInformation({
					'title':'Suppression échouée',
					'content':'<p>Une erreur est survenue lors de la suppression de votre image.<br>Merci de réessayer ultérieurement.</p>',
					'cancel':'Ok',
				})
	  		})
	  	}
  	}

  	removeSignatureImage(){
  		if (!this.signatureImageLoading) {
	  		this.signatureImageLoading = true
	  		this.patientService.removeSignatureFile(this.signatureImage.id).subscribe((data: any) => {
	  			this.signatureImageLoading = false
	  			this.signatureImage = null
	  			this.user.signature_image = null
	  			this.patientService.storeInLocal(this.user)
	  		},(error) => {
	  			this.signatureImageLoading = false
				this.patientService.showModalInformation({
					'title':'Suppression échouée',
					'content':'<p>Une erreur est survenue lors de la suppression de votre image.<br>Merci de réessayer ultérieurement.</p>',
					'cancel':'Ok',
				})
	  		})
	  	}
  	}
}