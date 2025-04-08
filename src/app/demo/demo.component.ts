import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon'

import { PatientService } from '../services/patient.service';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css'],
    standalone: false
})
export class DemoComponent implements OnInit {

	constructor(private _patientService: PatientService) {}

	ngOnInit(): void {
		this._patientService.demo = true
		this._patientService.dataUser = {
			"consultations": [],
			"events": [],
			"fees": [],
			"invoices": [],
			"patients": [],
			"notes": [],
			"entries": []
		}
		this._patientService.user = {
			active: true,
			adeli: ["06.06.06.06.06","dupontmartin@gstionnaire.com","8456948100004"],
			charge: 25,
			client: true,
			color: 0,
			consultation: "[{\"questionType\":\"checkbox\",\"entitled\":\"Prix\",\"options\":[\"Week-end\",\"Domicile\",\"Jour férié\"],\"required\":\"true\"},{\"questionType\":\"select\",\"entitled\":\"Règlement\",\"options\":[\"Chèque\",\"Espèce\",\"Carte bancaire\"],\"required\":\"true\"}]",
​			date_creation: DateTime.local(),
​			date_modification: DateTime.local(),
			footer: true,
			footer_text: "TVA non applicable, art. 293 B du CGI",
			id_user: -465,
​			interrogatoire: "[{\"title\":\"Informations personnelles\",\"fields\":[{\"questionType\":\"text\",\"entitled\":\"Nom\",\"required\":\"true\"},{\"questionType\":\"text\",\"entitled\":\"Prénom\",\"required\":\"true\"},{\"questionType\":\"date\",\"entitled\":\"Date de naissance\",\"required\":\"true\"}]}]",
​			mail: "dupontmartin@gstionnaire.com",
​			modules: [
				{id:"0",title:"Facturation",price:3,added:true},
				{id:"1",title:"Comptabilité personnelle",price:3,added:true},
				{id:"2",title:"Importation de fichiers",price:2,added:false},
				{id:"3",title:"Espaces partagés",price:4,added:false},
				{id:"4",title:"Gestion des notes",price:1,added:true},
			],
​			nbr_facture: 465,
​			nom: "Dupont",
​			prenom: "Martin",
​			prix_normal: 50,
​			prix_speciaux: [
				{name:"Week-end",price:"10"},
				{name:"Domicile",price:"5"},
				{name:"Jour férié",price:"10"}
			],
			stamp_type: '0',
			stamp_image: null,
			signature_image: null,
			widgets: [{id:-1,active:true}],
			quick_access: [0,1,2]
		}
		this._patientService.login()
	}
}
