/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component,ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { AuthService } from './services/auth.service';
import { PatientService } from './services/patient.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	note: boolean = false;

	demo: boolean = false;

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				public authService: AuthService){
	}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Subscribe the router event and check the internet connection
	----------------------------*/
	ngOnInit() {
		this.waitForUser(() => {
			this.note = this.patientService.user.modules.find(element => element.id === "4").added
			this.demo = this.patientService.demo
		})
		// Check the connection
		// In the future, this will help to manage the storage (local on sqlite db, or online on pgsql db)
		this.checkConnection().subscribe(isOnline => {
			if (!isOnline) {
				this.patientService.showModalInformation({
					'title':'Acces internet',
					'content':'<p>Vous n\'êtes actuellement pas connecté à internet<br>Vous ne pouvez récupérer aucune information si vous n\'êtes pas connecté à internet</p>'
				})
			}
		});
	}

	waitForUser(callback) {
  		let interval = setInterval(() => {
    		if (this.patientService.user) {
      			clearInterval(interval);
      			callback();
    		}
  		}, 200);
	}

	openDemoModal(){
		this.patientService.showModalInformation({
			'title': 'Mode démonstration',
			'content':'<p>En mode démonstration, vous avez accès à toutes les fonctionnalités proposée par le logiciel.<br>Aucune des données que vous entrerez n\'est sauvegardée, une fois que vous aurez quitté le logiciel, tout sera effacé.</p>'
		})
	}

	/* ---------------------------
	Check connectivity, from https://stackoverflow.com/questions/46598777/check-internet-connection-in-web-using-angular-4
	No input
	Return the status of the connection
	----------------------------*/
	checkConnection() {
		return merge<boolean>(
			fromEvent(window, 'offline').pipe(map(() => false)),
			fromEvent(window, 'online').pipe(map(() => true)),
			new Observable((sub: Observer<boolean>) => {
				sub.next(navigator.onLine);
				sub.complete();
			})
		);
	}
}