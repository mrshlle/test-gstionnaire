/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'
import { forkJoin } from 'rxjs'

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Patient } from '../models/Patient.models';

@Component({
    selector: 'app-liste',
    templateUrl: './liste.component.html',
    styleUrls: ['./liste.component.css'],
    standalone: false
})
export class ListeComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	@ViewChildren('dateInput') dateInputs;
	@ViewChildren('checkbox') checkboxes;

	patients: Patient[];
	shownPatients: any[];
	filterPrenom: string = "";
	filterNom: string = "";
	filterText: string = "";
	filterDate: DateTime = null;

	displayedColumns: string[] = ['select', 'nom', 'prénom', 'consultations', 'détails'];
  	dataSource;

  	indeterminate: boolean = false;
  	checked: boolean = false;

  	show: boolean = false;
  	
	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService) {}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get all patients and add them to the datasource of the table
	----------------------------*/
	ngOnInit() {
		if (this.patientService.demo){
			this.patients = this.patientService.dataUser['patients']
			this.orderList();
			this.shownPatients = [...this.patients]
			this.setList()
		}else{
			if ('patients' in this.patientService.dataUser){
				this.patients = this.patientService.dataUser['patients']
				this.orderList();
				this.shownPatients = [...this.patients]
				this.setList()
			}else{
				this.patientService.getPatients(this.patientService.user.id_user).subscribe(
					(data: any) => {
						this.patients = []
						for (var i = 0; i < data.length; ++i) {
							this.patients.push(this.patientService.instancePatient(data[i]))
						}
						this.patientService.dataUser['patients'] = this.patients
					},
				    (error) => { 
				    	this.patientService.showModalInformation({
							'title':'Erreur lors de la récupération',
							'content':'<p>Impossible de récupérer la liste de vos fiches.<br>Merci de réessayez ultérieurement</p>',
							'cancel':'Ok',
						})
				    },
				    () => {
				    	// Sort the patients by alphabetic order
				    	this.orderList();
				    	this.shownPatients = [...this.patients]
						this.setList()
					}
				);
			}
		}
	}

	/* ---------------------------
	Sort the list of patients
	No input
	No output
	----------------------------*/
	orderList() {
		this.patients = this.patients.sort(function (a, b){
			var aNom = a.nom;
			var bNom = b.nom;
			var aPrenom = a.prenom;
			var bPrenom = b.prenom;

			// Sort them by lastname, then by firstname, and if all is equal, by date of birth
			// The addition of those three variable must be unique, so it will be possible to sort them with this only three variables
			if(aNom == bNom){
				return (aPrenom < bPrenom) ? -1 : 1;
			}else{
				return (aNom < bNom) ? -1 : 1;
			}
		})
	}

	expand(){
		this.show = !this.show
	}

	onChangeEverything(checked){
		this.checked = checked
		for (var i = 0; i < this.shownPatients.length; ++i) {
			this.shownPatients[i].checked = checked
		}
	}

	someComplete(){
		return this.shownPatients.some(elem => elem.checked) && !this.checked
	}

	onChangeCheckbox(){
		this.checked = this.shownPatients.every(elem => elem.checked)
	}

	/* ---------------------------
	When lastname filter is changed, apply the filter
	Input
	 - event : the event of the lastname input
	No output
	----------------------------*/
	onChangeNom(event){
		this.filterNom = event.target.value.toString().toLowerCase();
		this.filter();
	}

	/* ---------------------------
	When firstname filter is changed, apply the filter
	Input
	 - event : the event of the firstname input
	No output
	----------------------------*/
	onChangePrenom(event){
		this.filterPrenom = event.target.value.toString().toLowerCase();
		this.filter();
	}

	/* ---------------------------
	When text filter is changed, apply the filter
	Input
	 - event : the event of the text input
	No output
	----------------------------*/
	onChangeText(event){
		this.filterText = event.target.value.toString().toLowerCase();
		this.filter()
	}

	/* ---------------------------
	When date filter is changed, apply the filter
	Input
	 - event : the event of the date input
	No output
	----------------------------*/
	onChangeDate(event){
		this.filterDate = DateTime.fromJSDate(event.value)
		this.filter()
	}

	setList(){
		for (var i = 0; i < this.shownPatients.length; ++i) {
			this.shownPatients[i]['checked'] = false
		}
		this.checked = false
		this.indeterminate = false
		this.dataSource = this.shownPatients
	}

	/* ---------------------------
	The filter applied on all the list of patients
	No input
	No output
	----------------------------*/
	filter(){
		// Apply a filter on each patient on the list
		this.shownPatients = this.patients.filter(patient => {
			let fullText = ''
			// Get all the text that is in all the answers of the survey for the patient, for the filter by text
			let allQuestions = JSON.parse(patient.section_information)
			for (var i = 0; i < allQuestions.length; ++i) {
				for (var j = 0; j < allQuestions[i].fields.length; ++j) {
					if (allQuestions[i].fields[j].questionType == 'date') {
						let dateQuestion = DateTime.fromISO(allQuestions[i].fields[j].value)
						fullText += ' ' + dateQuestion.year + ' ' + dateQuestion.month + ' ' + dateQuestion.day
					}else if (allQuestions[i].fields[j].questionType !== 'file'){
						fullText += ' ' + allQuestions[i].fields[j].value.toLowerCase()
					}
				}
			}
			let dateBool = true
			// If a filter by date exists, map each date to modify them to be like the format of the filtered date
			if (this.filterDate) {
				dateBool = patient.dates_consultations.map(date => {
					let dateConsultation = date
					return dateConsultation.year + '-' + dateConsultation.month + '-' + dateConsultation.day
				}).includes(this.filterDate.year + '-' + this.filterDate.month + '-' + this.filterDate.day)
			}
			// Return the boolean corresponding on all the different filter booleans
			return patient.prenom.toLowerCase().includes(this.filterPrenom) &&
			patient.nom.toLowerCase().includes(this.filterNom) && 
			fullText.includes(this.filterText) &&
			dateBool
		});
		this.setList()
	}

	/* ---------------------------
	Show a patient
	Input
	 - patient : the patient to show
	No output
	----------------------------*/
	afficher(patient: Patient){
		this.patientService.currentPatient = patient;
		this.patientService.nouveauPatient();
	}

	removeRecords(){
		const records = this.shownPatients.filter(elem => elem.checked)
		let htmlRecords = ''
		if (records.length > 1){
			htmlRecords += 'Êtes-vous sûr de vouloir supprimer les fiches sélectionnées ? <br> Une fois supprimées, il ne sera pas possible de revenir en arrière.'
		}else{
			htmlRecords += 'Êtes-vous sûr de vouloir supprimer la fiche sélectionnée ? <br> Une fois supprimée, il ne sera pas possible de revenir en arrière.'
		}
		this.patientService.showModalInformation({
			'title':'Suppression fiches',
			'content':'<p>' + htmlRecords + '</p>',
			'confirm':'Confirmer',
			'cancel':'Annuler',
		}).subscribe(result => {
			if (result) {
				for (var i = 0; i < records.length; ++i) {
					this.supprimer(records[i])
				}
			}
		})
	}

	/* ---------------------------
	Delete a patient
	Input
	 - event : the event of the row clicked
	 - patient : the patient to delete
	No output
	----------------------------*/
	supprimer(patient: Patient){
		// Initiate an array of observables to subscribe in forkJoin
		let observables = [
			this.patientService.supprimerPatient(patient)
		]
		// If the patient got consultations, we need to delete them also, and the factures so
		if (patient.dates_consultations.length > 0) {
			observables.push(this.patientService.supprimerConsultations(patient.id_patient))
			observables.push(this.patientService.supprimerFactures(patient.id_patient))
		}
		// Get all the files that are linked to the patient to delete them also
		let listIds = JSON.parse(patient.id_files)
		for (var i = 0; i < listIds.length; ++i) {
			observables.push(this.patientService.deleteFileById(listIds[i]))
		}
		// Subscribe to all the observables
		if (this.patientService.demo) {
			if (patient.dates_consultations.length > 0) {
				this.patientService.dataUser['consultations'] = this.patientService.dataUser['consultations'].filter(elem => elem.id_patient !== patient.id_patient)
				this.patientService.dataUser['invoices'] = this.patientService.dataUser['invoices'].filter(elem => elem.id_patient !== patient.id_patient)
			}
			// Splice the patient list to remove the one which is deleted
			this.patients.splice(this.patients.findIndex(pat => pat.id_patient == patient.id_patient),1)
			this.filter()
		}else{
			forkJoin(observables).subscribe((result) => {
			},(error) => {
				this.patientService.showModalInformation({
					'title':'Erreur lors de la suppression',
					'content':'<p>Une erreur est survenue lors de la suppression du patient ou des éléments qui lui sont liés tels que ses consultations ou ses factures<br>Merci de réessayez ultérieurement</p>',
					'cancel':'Ok',
				})
			},() => {
				if (patient.dates_consultations.length > 0) {
					if ('consultations' in this.patientService.dataUser){
						this.patientService.dataUser['consultations'] = this.patientService.dataUser['consultations'].filter(elem => elem.id_patient !== patient.id_patient)
					}
					if ('invoices' in this.patientService.dataUser){
						this.patientService.dataUser['invoices'] = this.patientService.dataUser['invoices'].filter(elem => elem.id_patient !== patient.id_patient)
					}
				}
				// Splice the patient list to remove the one which is deleted
				this.patients.splice(this.patients.findIndex(pat => pat.id_patient == patient.id_patient),1)
				this.filter()
			});
		}
	}

	dateInputDay(event){
		let actualInput = event.srcElement
		let actualIndex = this.dateInputs._results.findIndex(object => object.nativeElement === actualInput)
		let monthInput = this.dateInputs._results[actualIndex + 1].nativeElement
		let yearInput = this.dateInputs._results[actualIndex + 2].nativeElement

		if(event.target.value.length == 2) {
			monthInput.focus()
		}else if(event.target.value.length > 2) {
			event.target.value = event.target.value.substring(0,2)
			monthInput.focus()
		}

		if (actualInput.value !== '' && monthInput.value !== '' && yearInput.value !== '') {
			this.filterDate = DateTime.fromObject({
				day: actualInput.value,
				month: monthInput.value,
				year: yearInput.value
			});
		}else{
			this.filterDate = null
		}
		this.filter()
	}

	dateInputMonth(event){
		let actualInput = event.srcElement
		let actualIndex = this.dateInputs._results.findIndex(object => object.nativeElement === actualInput)
		let dayInput = this.dateInputs._results[actualIndex - 1].nativeElement
		let yearInput = this.dateInputs._results[actualIndex + 1].nativeElement

		if(event.target.value.length == 2) {
			yearInput.focus()
		}else if(event.target.value.length > 2) {
			event.target.value = event.target.value.substring(0,2)
			yearInput.focus()
		}

		if (dayInput.value !== '' && actualInput.value !== '' && yearInput.value !== '') {
			this.filterDate = DateTime.fromObject({
				day: dayInput.value,
				month: actualInput.value,
				year: yearInput.value
			});
		}else{
			this.filterDate = null
		}
		this.filter()
	}

	dateInputYear(event){
		let actualInput = event.srcElement
		let actualIndex = this.dateInputs._results.findIndex(object => object.nativeElement === actualInput)
		let dayInput = this.dateInputs._results[actualIndex - 2].nativeElement
		let monthInput = this.dateInputs._results[actualIndex - 1].nativeElement

		if(event.target.value.length > 4) {
			event.target.value = event.target.value.substring(0,4)
		}

		if (dayInput.value !== '' && monthInput.value !== '' && actualInput.value !== '') {
			this.filterDate = DateTime.fromObject({
				day: dayInput.value,
				month: monthInput.value,
				year: actualInput.value
			});
		}else{
			this.filterDate = null
		}
		this.filter()
	}

	numberOnlyWithoutDot(event): boolean {
		let result = false;
		// Get the ASCII code of the character added
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			result = false
		}else{
			result = true
		}
		return result;
	}
}