/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent {

	facture: boolean = false
	accountancy: boolean = false
	interrogatory: boolean = false
	share: boolean = false
	consultation: boolean = false
	show: boolean = false

	quickAccess: number[] = []
	previousQuickAccess: number[] = []

	showModules: boolean = false

	edit: boolean = false
	loading: boolean = false

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				public authService: AuthService,
				private router: Router) { }

	ngOnInit(){
		const modules = this.patientService.user.modules
		this.facture = modules.find(element => element.id === "0").added
		this.accountancy = modules.find(element => element.id === "1").added
		this.share = modules.find(element => element.id === "3").added
		this.quickAccess = this.patientService.user.quick_access
		this.previousQuickAccess = JSON.parse(JSON.stringify(this.quickAccess))
	}

	/* ---------------------------
	Sign out the user
	No input
	No output
	----------------------------*/
	toDeconnexion(){
		this.authService.signOut();
	}

	move(routeName,routeURL){
		this.patientService.route = routeName
		this.router.navigateByUrl('/').then(()=>
			this.router.navigateByUrl('/' + routeURL, { skipLocationChange: true })
		)
		this.show = false
		this.showModules = false
	}

	toggleMenu(){
		this.show = !this.show
	}

	toggleModules(){
		this.showModules = !this.showModules
	}

	configureQuickAccess(){
		this.edit = !this.edit
	}

	saveQuickAccess(){
		if (!this.loading) {
			this.loading = true
			if (this.patientService.demo) {
				this.loading = false
				this.edit = false
				this.patientService.user.quick_access = this.quickAccess
				this.previousQuickAccess = JSON.parse(JSON.stringify(this.quickAccess))
			}
			this.patientService.updateQuickAccess(JSON.stringify(this.quickAccess)).subscribe((data) => {
				this.loading = false
				this.edit = false
				this.patientService.user.quick_access = this.quickAccess
				this.patientService.storeInLocal(this.patientService.user)
				this.previousQuickAccess = JSON.parse(JSON.stringify(this.quickAccess))
			},(error) => {
				this.loading = false
				this.patientService.showModalInformation({
					'title':'Erreur de modification',
					'content':'<p>Une erreur est survenue lors de la modification de vos accès rapide.<br>Merci de réessayez ultérieurement</p>',
					'cancel':'Ok',
				})
			})
		}
	}

	cancel(){
		if (!this.loading) {
			this.quickAccess = JSON.parse(JSON.stringify(this.previousQuickAccess))
			this.edit =! this.edit
		}
	}

	checkAccess(moduleNumber,event){
		if (!this.loading) {
			if (event.checked){
				this.quickAccess.push(moduleNumber)
			}else{
				this.quickAccess.splice(this.quickAccess.indexOf(moduleNumber),1)
			}
		}
	}
}