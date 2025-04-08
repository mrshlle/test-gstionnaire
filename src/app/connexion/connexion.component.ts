/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

/* -----------------------------------------------------------------------------------------------------------------
Validators imports
----------------------------------------------------------------------------------------------------------------- */
import { PatternValidator } from '../validators/pattern.validator'

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { AuthService } from '../services/auth.service';
import { PatientService } from '../services/patient.service'

@Component({
    selector: 'app-connexion',
    templateUrl: './connexion.component.html',
    styleUrls: ['./connexion.component.css'],
    standalone: false
})

export class ConnexionComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	formConnexion: UntypedFormGroup;

	loading: boolean = false;

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public authService: AuthService,
				public patientService: PatientService){
	}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Initiate the form of the connection information
	----------------------------*/
	ngOnInit() {
		let email = ''
		let password = ''
		if (this.patientService.demo) {
			email = "dupontmartin@gstionnaire.com"
			password = "2QX5v+1'PUPGS-8($#w%'0iOOE`kO"
		}
		this.formConnexion = new UntypedFormGroup({
			email: new UntypedFormControl(email, [Validators.required, Validators.email]),
			password: new UntypedFormControl(password, [Validators.required]),
			stayConnected: new UntypedFormControl(false)
		});
	}

	isDisabled(){
		return !this.formConnexion.valid
	}

	/* ---------------------------
	Send the connection information if the form is valid
	No input
	No output
	----------------------------*/
	submit(){
		if (this.patientService.demo){
			this.authService.logIn(null)
		}else{
			if (!this.loading && this.formConnexion.valid) {
				this.loading = true
				let email = this.formConnexion.get('email').value
				let password = this.formConnexion.get('password').value
				let stayConnected = this.formConnexion.get('stayConnected').value
				localStorage.setItem('keep-user',stayConnected)
				this.authService.checkUser(email,password).subscribe(async (data) => {
					let error = await this.authService.logIn(data)
					if (error !== -1) {
						this.loading = false
					}
				},(error) => {
					this.loading = false
					if (error.status === 400) {
						this.patientService.showModalInformation({
							'title':'Problème de connexion',
							'content':'<p>Le mail ou le mot de passe semble incorrect.</p>',
							'cancel':'Ok',
						})
					}else if (error.status === 500) {
						this.patientService.showModalInformation({
							'title':'Problème de connexion',
							'content':'<p>Un problème est survenue lors de la connexion, merci de réessayer.</p>',
							'cancel':'Ok',
						})
					}else{
						this.patientService.showModalInformation({
							'title':'Problème de connexion',
							'content':"<p>Ce compte n'existe pas.</p>",
							'cancel':'Ok',
						})
					}
				})
			}
		}
	}
}
	