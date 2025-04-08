/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Injectable, RendererFactory2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { Observable, Subject } from 'rxjs';
import { DateTime } from 'luxon';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { User } from '../models/User.models';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from './patient.service';

import { url } from '../config';

const API_URL = url

@Injectable({
  providedIn: 'root'
})
export class AuthService {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	isAuth = false;

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(private ps: PatientService,
				private httpClient: HttpClient,
				private router: Router,
				private rendererFactory: RendererFactory2){
		const connectedUser = localStorage.getItem('user')
		if (connectedUser !== null) {
			const expiration = this.getTimeOut()
			if (expiration < 0) {
				this.signOut()
			}else{
				const data = {expiresIn:localStorage.getItem('expires_at'),idToken:localStorage.getItem('id_token'),user:JSON.parse(connectedUser)}
				data.user.date_creation = DateTime.fromISO(data.user.date_creation)
				data.user.date_modification = DateTime.fromISO(data.user.date_modification)
				this.setUser(data,true)
			}
		}
	}

	checkUser(email,password) {
		let user = {'email':email,'password':password}
		return this.httpClient.post(API_URL + 'df07181b1b049b01',user)
	}

	async logIn(userInformation) {
		if (this.ps.demo){
			this.isAuth = true
			this.ps.dashboard()
		}else{
			let userObject = {
				id_user: userInformation.user.id_user,
				firstname: userInformation.user.firstname,
				lastname: userInformation.user.lastname,
				email: userInformation.user.email,
				today: DateTime.local()
			}
			let error = -1
			// Those two localstorage settings are mandatory for the next http request 
			// even if we also set them in setUser()
			localStorage.setItem('id_token', userInformation.idToken);
			localStorage.setItem('x-qwemp-data', userInformation.user.id_user)
			await this.httpClient.post(API_URL + '136a15cf72ff1f80', userObject).subscribe((data) => {
				const type = userInformation.user.type
				userInformation.user = this.ps.instanceUser(userObject, data)
				userInformation.user.id_user = userObject.id_user
				if (type === 1 || type === 3){
					this.setUser(userInformation,false)
				}else{
					if (!userInformation.user.client) {
						error = 0
						localStorage.clear()
						this.ps.showModalInformation({
							'title':'Pas encore client',
							'content':'<p>Pour utiliser le logiciel, tu dois d\'abord mettre en place un abonnement.<br>Rend toi sur le site pour le faire.</p>',
							'cancel':'Ok',
						})
					}else if (!userInformation.user.active) {
						error = 1
						localStorage.clear()
						this.ps.showModalInformation({
							'title':'Compte désactivé',
							'content':'<p>Ton compte est désactivé.<br>Soit tu as mit en pause ton abonnement, soit un paiement à échoué, rend toi sur ton profil pour le réactiver.</p>',
							'cancel':'Ok',
						})
					}else{
						this.setUser(userInformation,false)
					}
				}
			},(error) => {
				error = 2
				this.ps.showModalInformation({
					'title':'Problème',
					'content':'<p>Une erreur est survenue lors de la récupération des informations de ton compte. Merci de réessayer.</p>',
					'cancel':'Ok',
				})
				this.signOut()
			})
			return error
		}
	}

  	storeInLocal(user){
		if (localStorage.getItem('keep-user') === 'true') {
			localStorage.setItem('user',JSON.stringify(user))
		}
	}

	setUser(userInformation,reload){
		this.isAuth = true
		this.storeInLocal(userInformation.user)
		let expiresAt = null
		if (reload) {
			expiresAt = JSON.parse(userInformation.expiresIn)
		}else{
			expiresAt = DateTime.local().plus({'seconds':userInformation.expiresIn}).valueOf();
		}
		userInformation.expiresIn = expiresAt
		this.setSession(userInformation.idToken,userInformation.expiresIn,userInformation.user.id_user)
		this.ps.user = userInformation.user
		this.ps.dashboard()
	}

	/* ---------------------------
	Sign out from the software
	No input
	No output
	----------------------------*/
	signOut(){
		this.isAuth = false;
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/login',{skipLocationChange:true})
		)
		localStorage.clear()
		if (!this.ps.demo) {
			this.ps.dataUser = {}
		}
	}

	expirationSignOut(){
		this.signOut()
		this.ps.showModalInformation({
			'title':'Session expirée',
			'content':'<p>Votre session a expiré<br>Merci de vous reconnecter</p>',
			'cancel':'Ok',
		})
	}

	/* ---------------------------
	Set the session information for the user
	Input
	 - authResult : the result of the API response for the authentication
	No output
	----------------------------*/
	setSession(idToken,expiresIn,idUser){
		localStorage.setItem('id_token', idToken);
		localStorage.setItem("expires_at", JSON.stringify(expiresIn));
		localStorage.setItem('x-qwemp-data', idUser)

		let timeout = this.getTimeOut()

		setTimeout(() => {
			this.ps.showModalInformation({
				'title':'La session va expirer',
				'content':'<p>Votre session arrive à expiration dans 10 minutes</p>',
				'cancel':'Se déconnecter',
				'confirm':'Rester connecté'
			}).subscribe((reset) => {
				if (reset) {
					this.ps.resetJWT().subscribe((data:any) => {
						this.setSession(data.idToken,DateTime.local().plus({'seconds':data.expiresIn}).valueOf(),localStorage.getItem("x-qwemp-data"))
					},(error) => {
						this.signOut()
						this.ps.showModalInformation({
							'title':'Probleme',
							'content':'<p>Une erreur est survenue<br>Merci de vous reconncter</p>',
							'cancel':'Ok'
						})
					})
				}else{
					this.signOut()
				}
			})
		},timeout-600000)

		// this.checkExpiration.subscribe((result) => {
		// 	// reset JWT if inactivity is false
		// 	// else signout and show modal
		// 	if (!this.inactivity) {
		// 		this.ps.resetJWT().subscribe((data:any) => {
		// 			this.setSession(data.idToken,DateTime.local().plus({'seconds':data.expiresIn}).valueOf(),localStorage.getItem("x-qwemp-data"))
		// 		},(error) => {
		// 			this.expirationSignOut()
		// 		})
		// 	}else{
		// 		if (this.isAuth) {
		// 			this.expirationSignOut()
		// 		}
		// 	}
		// })
	}

	/* ---------------------------
	Get the actual time remaining
	No input
	Output
	 - The time in milliseconds
	----------------------------*/
	getTimeOut(){
		return this.getExpiration().diff(DateTime.local()).milliseconds
	}

	/* ---------------------------
	Get the expiration stored in localStorage
	No input
	Output
	 - The expiration in Date object
	----------------------------*/
	getExpiration(){
		const expiration = localStorage.getItem("expires_at");
		const expiresAt = JSON.parse(expiration);
		return DateTime.fromMillis(expiresAt);
	}
}