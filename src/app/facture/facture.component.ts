/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'
import { forkJoin } from 'rxjs'

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { User } from '../models/User.models';
import { Patient } from '../models/Patient.models';
import { Consultation } from '../models/Consultation.models';
import { Facture } from '../models/Facture.models';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service'

/* -----------------------------------------------------------------------------------------------------------------
Components imports
----------------------------------------------------------------------------------------------------------------- */
import { ModalSendInvoiceComponent } from '../modals/modal-send-invoice/modal-send-invoice.component';

// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

registerLocaleData(localeFr, 'fr');

/* ---------------------------
patientFacture creation, object for all factures of a patient
----------------------------*/
export interface patientFacture{
	id_patient: number,
	patient: string,
	factures: Facture[]
}

@Component({
    selector: 'app-facture',
    templateUrl: './facture.component.html',
    styleUrls: ['./facture.component.css'],
    standalone: false
})
export class FactureComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	dateConsultation: DateTime;
	montant: number;
	list: boolean;
	objet: string = '';
	numFacture: string = '';

	today: DateTime = DateTime.local();

	user: User;

	patient: Patient;
	namePatient: string;

	patients: Patient[];
	factures: Facture[];
	shownFactures: Facture[];

	consultationsFacture: Consultation[] = [];

	listPatientFacture: patientFacture[];

	currentConsult: Consultation;

	indexShown = 0;

	show: boolean = false

	dateInvoice: DateTime = null;
	numberInvoice: number = null;
	currentInvoice: Facture = null;

	loading: boolean = false
	error: boolean = false
	success: boolean = false

	filterNom: string = ''
	filterPrenom: string = ''

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private dialog: MatDialog) { }

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get factures and create list of `patientFacture`
	----------------------------*/
	ngOnInit() {
		// Initiate the variables
		this.list = true;
		this.objet = '';
		this.montant = null;
		this.dateConsultation = null;
		this.user = this.patientService.user;
		// Get the patients linked to this user
		if (this.patientService.demo){
			this.patients = this.patientService.dataUser['patients']
		}else{
			if ('patients' in this.patientService.dataUser){
				this.patients = this.patientService.dataUser['patients']
			}else{
				this.patientService.getPatients(this.user.id_user).subscribe((data: any) => {
					this.patients = []
					for (var i = 0; i < data.length; ++i) {
						this.patients.push(this.patientService.instancePatient(data[i]))
					}
					this.patientService.dataUser['patients'] = this.patients
				})
			}
		}
		// Same for the factures
		if (this.patientService.demo){
			this.factures = this.patientService.dataUser['invoices']
			this.shownFactures = [...this.factures]
			this.startGeneration()
		}else{
			if ('invoices' in this.patientService.dataUser){
				this.factures = this.patientService.dataUser['invoices']
				this.shownFactures = [...this.factures]
				this.startGeneration()
			}else{
				this.patientService.getFactures(this.user.id_user).subscribe((data: any) => {
					this.factures = []
					for (var i = 0; i < data.length; ++i) {
						this.factures.push(this.patientService.instanceFacture(data[i]))
					}
					this.shownFactures = [...this.factures]
					this.patientService.dataUser['invoices'] = this.factures
					this.startGeneration()
				},
				(error) => { 
					this.patientService.showModalInformation({
						'title':'Récupération des données impossible',
						'content':'<p>Une erreur est survenue lors de la récupération des données relatives aux factures de vos patients<br>Merci de réessayer ultérieurement</p>',
						'cancel':'Ok',
					})
				})
			}
		}
	}

	startGeneration(){
		// Populate the list of `patientFactures`
		this.listPatientFacture = []
		this.shownFactures.forEach(facture => {
			let indexPatient = this.listPatientFacture.indexOf(this.listPatientFacture.find(objet => objet.id_patient == facture.id_patient))
			// If the patient is already in the list, add a new facture to his factures
			if(indexPatient != -1){
				this.listPatientFacture[indexPatient].factures.push(facture);
			}else{
				let patientFacture: patientFacture = { id_patient: facture.id_patient, patient : facture.nom + ' ' + facture.prenom, factures : [facture] };
				this.listPatientFacture.push(patientFacture);
			}
		})
	}

	onChangeNom(event){
		this.filterNom = event.target.value.toString().toLowerCase();
		this.filter()
	}

	onChangePrenom(event){
		this.filterPrenom = event.target.value.toString().toLowerCase();
		this.filter()
	}

	filter(){
		// Apply a filter on each patient on the list
		this.shownFactures = this.factures.filter(patient => {
			return patient.prenom.toLowerCase().includes(this.filterPrenom) &&
			patient.nom.toLowerCase().includes(this.filterNom)
		});
		this.startGeneration()
	}

	/* ---------------------------
	Method to trigger when the selected patient has changed
	Input
	 - event : the event of the select input
	No output
	----------------------------*/
	onChange(event){
		// Find the new selected patient
		this.patient = this.patients.find(x => x.id_patient == event.value);
		this.namePatient = '';
		if (this.patientService.demo) {
			this.consultationsFacture = this.patientService.dataUser['consultations'].filter(elem => (elem.id_patient === this.patient.id_patient) && (elem.facture == false));
		}else{
			if (this.patient.id_patient.toString() in this.patientService.dataUser){
				let consultations = []
				consultations = this.patientService.dataUser[this.patient.id_patient.toString()].filter(elem => elem.facture == false)
				this.consultationsFacture = consultations;
			}else if ('consultations' in this.patientService.dataUser){
				this.patientService.dataUser[this.patient.id_patient.toString()] = this.patientService.dataUser['consultations'].filter(elem => elem.id_patient === this.patient.id_patient)
				let consultations = []
				consultations = this.patientService.dataUser[this.patient.id_patient.toString()].filter(elem => elem.facture == false)
				this.consultationsFacture = consultations;
			}else{
				this.patientService.getConsultations(this.patient.id_patient).subscribe(
					(data: any) => {
						let consultations = []
						for (var i = 0; i < data.length; ++i) {
							consultations.push(this.patientService.instanceConsultation(data[i]))
						}
						this.patientService.dataUser[this.patient.id_patient.toString()] = JSON.parse(JSON.stringify(consultations))
						// Show only consultations that have not already a facture
						consultations = consultations.filter(consult => consult.facture == false)
						this.consultationsFacture = consultations;
					},(error) => {
						this.patientService.showModalInformation({
							'title':'Récupération des données impossible',
							'content':'<p>Une erreur est survenue lors de la récupération des données relatives aux consultations du patient <b>' + this.patient.prenom + ' ' + this.patient.nom + '</b><br>Merci de réessayer ultérieurement</p>',
							'cancel':'Ok',
						})
					}
				)
			}
		}
		this.objet = ''
		this.currentConsult = null;
	}

	/* ---------------------------
	Method to trigger when the selected consultation has changed
	Input
	 - event : 
	No output
	----------------------------*/
	onChangeConsult(event){
		this.currentConsult = this.consultationsFacture.find(consultation => consultation.id_consultation == event.value);
		// Set the variables to show in the facture
		this.dateConsultation = this.currentConsult.date_consultation;
		this.montant = this.currentConsult.total;
	}

	/* ---------------------------
	Create a new facture
	No input
	No output
	----------------------------*/
	createFacture(){
		if (!this.isDisabledButton()) {
			this.loading = true
			const nomPrenom = this.patient.nom + ' ' + this.patient.prenom;
			// Initiate a new facture
			let facture = new Facture(
				-1,
				this.user.id_user,
				this.patient.nom,
				this.patient.prenom,
				this.objet,
				this.currentConsult.date_consultation,
				this.montant,
				this.today,
				this.today,
				this.user.nbr_facture+1,
				this.currentConsult.id_consultation,
				this.patient.id_patient
			)
			// Copy the facture
			let factureBDD = JSON.parse(JSON.stringify(facture))
			// forkJoin to create the facture and change the status of the consultation
			if (this.patientService.demo){
				facture.id_facture = this.patientService.dataUser['invoices'].length+1
				this.patientService.dataUser['invoices'].push(facture)
				const index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === this.currentConsult.id_consultation)
				this.patientService.dataUser['consultations'][index].facture = true
				this.consultationsFacture = []
				this.loading = false
				this.user.nbr_facture += 1
				// Reset all the variables
				this.objet = ''
				this.currentConsult = null;
				this.dateConsultation = null;
				this.montant = null;
				// Add the new facture to the list of `patientFacture`
				let patientFactures = this.listPatientFacture.find(patientFacture => patientFacture.patient == nomPrenom)
				if (patientFactures) {
					patientFactures.factures.push(facture)
				}else{
					let patientFacture: patientFacture = { id_patient: this.patient.id_patient, patient : nomPrenom, factures : [facture] };
					this.listPatientFacture.push(patientFacture);
				}
				// Change the view to list of patient
				this.list = !this.list;
			}else{
				this.patientService.createFacture(factureBDD).subscribe((data) => {
					facture.id_facture = Number(data[0].createinvoice);
					this.patientService.dataUser['invoices'].push(facture)
					if ('consultations' in this.patientService.dataUser){
						const index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === this.currentConsult.id_consultation)
						this.patientService.dataUser['consultations'][index].facture = true
					}
					this.consultationsFacture = []
					this.loading = false
					this.user.nbr_facture += 1
					this.patientService.storeInLocal(this.user)
					// Reset all the variables
					this.objet = ''
					this.currentConsult = null;
					this.dateConsultation = null;
					this.montant = null;
					// Add the new facture to the list of `patientFacture`
					let patientFactures = this.listPatientFacture.find(patientFacture => patientFacture.patient == nomPrenom)
					if (patientFactures) {
						patientFactures.factures.push(facture)
					}else{
						let patientFacture: patientFacture = { id_patient: this.patient.id_patient, patient : nomPrenom, factures : [facture] };
						this.listPatientFacture.push(patientFacture);
					}
					// Change the view to list of patient
					this.show = true
					this.montant = facture.montant
					this.dateConsultation = facture.date_consultation
					this.patient = this.patients.find(x => x.id_patient == facture.id_patient);
					this.objet = facture.objet
					this.dateInvoice = facture.date_creation
					this.numberInvoice = facture.nbr_facture
					this.currentInvoice = facture
					this.success = true
					setTimeout(() => {
						this.loading = false
						this.success = false
					},2000)
				},(error) => {
					this.error = true
					setTimeout(() => {
						this.loading = false
						this.error = false
					},2000)
				});
			}
		}
	}

	/* ---------------------------
	Go back from facture creation view
	No input
	No output
	----------------------------*/
	back(){
		// Reset all the variables
		this.dateConsultation = null
		this.consultationsFacture = []
		this.objet = ''
		this.currentConsult = null;
		this.montant = null
		this.list = !this.list;
		this.show = false
		this.patient = null
		this.dateInvoice = null
		this.numberInvoice = null
	}

	/* ---------------------------
	Check if the button is disable or not
	No input
	Output
	 - A boolean for the disable attribute
	----------------------------*/
	isDisabledButton(){
		return this.objet == '';
	}

	/* ---------------------------
	Same but for allowing the object input
	No input
	Output
	 - A boolean for the disable attribute
	----------------------------*/
	isDisabledObjet(){
		return this.currentConsult == null;
	}

	/* ---------------------------
	Change the view to creation of facture
	No input
	No output
	----------------------------*/
	newFacture(){
		this.list = !this.list;
	}

	showInvoices(index){
		this.indexShown = index
	}

	downloadPDFFromList(event,invoice){
		event.stopPropagation()
		this.currentInvoice = invoice
		this.downloadPDF()
	}

	createPDFObject(numericStamp){
		let stamp = []
		let imageStamp = {}
		if (numericStamp) {
			if (this.patientService.user.stamp_type === "0") {
				for (var i = 0; i < this.patientService.user.adeli.length; ++i) {
					stamp.push({text:this.patientService.user.adeli[i]})
				}
			}else{
				imageStamp = {
					image: 'data:' + this.patientService.user.stamp_image.mimetype + ';base64,' + this.patientService.user.stamp_image.base64,
					fit: [500,140]
				}
			}
		}
		const appendice = 7-stamp.length
		for (var i = 0; i < appendice; ++i) {
			stamp.push({text:' '})
		}
		let content = [
			{text: this.today.toFormat('dd/MM/yyyy')},
			{
				text: 'Facture # ' + this.currentInvoice.nbr_facture,
				style: 'header',
				alignment: 'center'
			},
			{
				svg: '<svg width="475" height="2" viewBox="0 0 475 1"><line x1="0" y1="0" x2="475" y2="0" style="stroke:#ececec;stroke-width:2"/></svg>',
				height: 2,
				width: 475,
				margin:20
			},
			{
				text: 'De',
				style: 'subHeader'
			},
		]
		if (this.patientService.user.stamp_type === "1" && numericStamp) {
			//content.push(imageStamp as pdfMake.TDocumentDefinitions)
		}else{
			for (var i = 0; i < stamp.length; ++i) {
				//content.push(stamp[i] as pdfMake.TDocumentDefinitions)
			}
		}
		let moreContent = [
			{
				svg: '<svg width="475" height="2" viewBox="0 0 475 1"><line x1="0" y1="0" x2="475" y2="0" style="stroke:#ececec;stroke-width:2"/></svg>',
				height: 2,
				width: 475,
				margin:20
			},
			{
				text: 'Pour',
				style: 'subHeader'
			},
			{
				text: this.currentInvoice.nom + ' ' + this.currentInvoice.prenom
			},
			{
				svg: '<svg width="475" height="2" viewBox="0 0 475 1"><line x1="0" y1="0" x2="475" y2="0" style="stroke:#ececec;stroke-width:2"/></svg>',
				height: 2,
				width: 475,
				margin:20
			},
			{
				table: {
					widths:'*',
					body: [
						[{fillColor: '#ececec',text: 'Objet'},{fillColor: '#ececec',text: 'Date de consultation'},{fillColor: '#ececec',text: "Montant"}],
						[{text: this.currentInvoice.objet},{text: this.currentInvoice.date_consultation.toFormat('dd/MM/yyyy')},{text: this.currentInvoice.montant+"€"}]
					]
				},
				layout: {
					defaultBorder: false,
					paddingLeft: function(i, node) { return 5; },
					paddingRight: function(i, node) { return 5; },
					paddingTop: function(i, node) { return 5; },
					paddingBottom: function(i, node) { return 5; },
				}
			}
		]
		for (var i = 0; i < moreContent.length; ++i) {
			//content.push(moreContent[i] as pdfMake.TDocumentDefinitions)
		}
		if (this.patientService.user.signature_image) {
			// content.push({
			// 	image: 'data:' + this.patientService.user.signature_image.mimetype + ';base64,' + this.patientService.user.signature_image.base64,
			// 	fit: [150,150],
			// 	marginTop: 50,
			// 	alignment: 'right'
			// } as pdfMake.TDocumentDefinitions)
		}
		let styles = {
			header: {
				fontSize: 20,
				bold: true
			},
			subHeader: {
				fontSize:16,
				bold:true,
				margin: [0,0,0,10]
			},
			small: {
				fontSize: 8
			}
		}
		let docDefinition = {content:content,styles:styles}
		if (this.patientService.user.footer) {
			docDefinition['footer'] = {
				text: this.patientService.user.footer_text,
				alignment: 'center',
				style: 'small'
			}
		}
		let title = 'Facture ' + this.currentInvoice.nbr_facture + ' ' + this.currentInvoice.nom + ' ' + this.currentInvoice.prenom + '.pdf'
		title = title.replace(/\s/g,'_')
		return [null/*pdfMake.createPdf(docDefinition)*/, title]
	}

	downloadPDF(){
		this.patientService.showModalInformation({
			'title':'Ajout tampon',
			'content':'<p>Souhaitez-vous ajouter votre tampon numérique lors de la création de la facture ?</p>',
			'confirm':'Oui',
			'cancel':'Non',
		}).subscribe(result => {
			if (result !== undefined) {
				const [pdfObject, title] = this.createPDFObject(result)
				//pdfObject.download(title);
			}
		})
	}

	sendPDF(){
		if (this.patientService.demo){
			this.patientService.showModalInformation({
				'title':'Mode démo',
				'content':'<p>Vous êtes actuellement en mode démo, vous ne pouvez pas envoyer de facture par mail.<br>Si vous souhaitez voir le rendu d\'une facture, vous pouvez tout de même la télécharger</p>',
				'confirm':'Ok'
			})
		}else{
			const dialogRef = this.dialog.open(ModalSendInvoiceComponent,{panelClass:'classic'});
			dialogRef.afterClosed().subscribe(result => {
				if (result !== undefined) {
					const [pdfObject, title] = this.createPDFObject(result.stamp)
					// pdfObject.getBase64((base64Object) => {
					// 	let user = this.user.nom + ' ' + this.user.prenom
					// 	let patient = this.currentInvoice.nom + ' ' + this.currentInvoice.prenom
					// 	this.patientService.sendInvoice(base64Object, title, result.email, user, patient).subscribe((data) => {
					// 		this.patientService.showModalInformation({
					// 			'title':'Mail envoyé',
					// 			'content':'<p>La facture a bien été envoyée par mail</p>',
					// 			'confirm':'Ok'
					// 		}).subscribe(result => {})
					// 	},(error) => {
					// 		this.patientService.showModalInformation({
					// 			'title':'Une erreur est survenue',
					// 			'content':'<p>La facture n\'a pa pu être envoyée par mail, merci de réessayer</p>',
					// 			'confirm':'Ok'
					// 		}).subscribe(result => {})
					// 	})
					// })
				}
			})
		}
	}

	showInvoice(invoice){
		this.list = !this.list
		this.show = true
		this.montant = invoice.montant
		this.dateConsultation = invoice.date_consultation
		this.patient = this.patients.find(x => x.id_patient == invoice.id_patient);
		this.objet = invoice.objet
		this.dateInvoice = invoice.date_creation
		this.numberInvoice = invoice.nbr_facture
		this.currentInvoice = invoice
	}
}