import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PatientService } from './patient.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ModuleGuard  {

	constructor(private patientService: PatientService,
				private router: Router){}

	canActivate(
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		let allModules = this.patientService.user.modules.filter(element => element.added).map(element => {
			if (element.id === '0') return 'facture'
			if (element.id === '1') return 'compta'
			if (element.id === '3') return 'share-place'
		})
		if (allModules.includes(route.routeConfig.path)) {
			return true
		}else{
			this.patientService.showModalInformation({
				'title':'Acces interdit',
				'content':'<p>Vous n\'avez pas acces à ce module.<br>Si vous souhaitez l\'utiliser, merci de vous rendre sur le site pour l\'ajouter</p>',
				'cancel':'Ok',
			})
			this.patientService.route = 'home'
			this.router.navigateByUrl('/accueil',{skipLocationChange:true})
		}
	}
}