import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { PatientService } from '../services/patient.service';
//import { Socket } from 'ngx-socket-io';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
    standalone: false
})
export class NotificationComponent implements OnInit {

	@ViewChild('toggleElement') toggleElement;
	@ViewChild('updateElement') updateElement;
	@ViewChild('textareaElement') textareaElement;

	updateEvent = null//this.socket.fromEvent<any>('update');
	update: boolean = false
	title: string = ''
	description: string = ''
	active: boolean = false
	version: string = ''
	data = null
	releases = []

	constructor(public patientService: PatientService,
				//private socket: Socket,
				private renderer: Renderer2) {
		this.renderer.listen('window', 'click',(event)=>{
			if(this.active && event.target !== this.toggleElement._elementRef.nativeElement && event.target!==this.updateElement.nativeElement){
				this.active=false
			}
		});
	}

	ngOnInit(): void {
		if (this.patientService.demo) {
			this.update = true
			this.title = 'v6.5 - Ajout de x fonctionnalités'
			this.description = 'Nouvelles fonctionnalités pour améliorer votre confort et la gestion de votre cabinet'
			this.version = 'v6.4.12'
		}else{
			this.getReleases()
			//this.updateEvent.subscribe((data) => {
			//	this.resetReleases()
			///	this.getReleases()
			//})
		}
	}

	resetReleases(){
		this.update = false
		this.title = ''
		this.description = ''
		this.data = null
	}

	getReleases(){
		this.patientService.getIncomingUpdate().subscribe((data) => {
			this.data = data
		},(error) => {
			this.patientService.showModalInformation({
				'title':'Vérification de mises à jour',
				'content':'<p>Impossible de vérifier si une mise à jour est à venir</p>',
				'cancel':'Ok',
			})
		},() => {
			this.setData()
		})
	}

	setData(){
		for (var i = 0; i < this.data.length; ++i) {
			if (this.data[i].status === 'ACTIVE') {
				this.version = this.data[i].version_number
			}else if (this.data[i].status === 'INCOMING') {
				this.update = true
				this.description = this.data[i].description.split('\n').join('<br>')
				this.title = this.data[i].version_number
				if (this.data[i].title !== ''){
					this.title += ' - ' + this.data[i].title
				}
			}else{
				this.releases.push(this.data[i])
			}
		}
	}

	toggleUpdate(){
		this.active = !this.active
	}
}