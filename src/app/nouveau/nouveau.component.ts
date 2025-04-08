/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { forkJoin } from 'rxjs';
import { DateTime } from 'luxon'

/* -----------------------------------------------------------------------------------------------------------------
Validators imports
----------------------------------------------------------------------------------------------------------------- */
import { DateValidator } from '../validators/date.validator'

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Patient } from '../models/Patient.models';
import { Consultation } from '../models/Consultation.models';
import { Facture } from '../models/Facture.models';

/* -----------------------------------------------------------------------------------------------------------------
Components imports
----------------------------------------------------------------------------------------------------------------- */
import { ModalCreationFactureComponent } from '../modals/modal-creation-facture/modal-creation-facture.component';
import { ModalShowDocumentComponent } from '../modals/modal-show-document/modal-show-document.component';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';

import * as fs from 'fs';

@Component({
    selector: 'app-nouveau',
    templateUrl: './nouveau.component.html',
    styleUrls: ['./nouveau.component.css'],
    standalone: false
})

export class NouveauComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	@ViewChildren('dateInput') dateInputs;
	@ViewChildren('panel') panels;
	@ViewChildren('wrapper') wrappers;
	@ViewChildren('wrapperConsult') wrappersConsult;
	@ViewChildren('consultation') consultationPanels;

	invoiceModule: boolean = false;

	show: boolean = false;
	justCreated: boolean = false;

	today = DateTime.local();

	shownConsultations: any[] = [];

	consultationsOuvertes: number[] = [];
	openedPanels: boolean[] = [];
	openedConsultations: boolean[] = [];

	newConsult: boolean;

	selected: number = 0;

	consultations: Consultation[];

	edit: boolean = false;

	survey: FormGroup;
	warningForm: FormGroup;
	importantForm: FormGroup;
	surveyConsultation: FormGroup;
	formPrice: FormGroup;

	previousSurvey
	previousWarning
	previousImportant

	interrogatoireJSON: Array<any>;
	consultationJSON: Array<any>;

	paymentConsultation: Array<any> = [];

	disabled: boolean = false
	loading: boolean = false
	error: boolean = false
	success: boolean = false

	main: boolean = true

	selectedFiles = []
	previousSelectedFiles = []
	selectedFilesConsult = []
	filesConsultations = []

	fileModule: boolean = false

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private dialog: MatDialog,
				private datePipe: DatePipe,
				private router: Router){}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get the consultation and patient creation surveys, and initiate them
	----------------------------*/
	ngOnInit() {
		this.consultationJSON = JSON.parse(this.patientService.user.consultation)
		this.invoiceModule = this.patientService.user.modules.find(element => element.id === "0").added
		this.fileModule = this.patientService.user.modules.find(element => element.id === "2").added
		// Thos two questions are related to the price and the supplements of the price
		this.paymentConsultation = this.consultationJSON.splice(0,2)
		// Initiate the payment part of the form
		let formPrice = new FormGroup({
			price: new FormControl(this.patientService.user.prix_normal, Validators.required),
			supp: new FormArray([]),
			payment: new FormControl('',[Validators.required])
		})
		for (var i = 0; i < this.patientService.user.prix_speciaux.length; ++i) {
			(<FormArray>formPrice.get('supp')).push(new FormGroup({value: new FormControl(false)}))
		}
		// Initiate the consultation survey and attach the payment one to it
		this.surveyConsultation = this.initSurveyConsultation()
		this.surveyConsultation.addControl('formPrice',formPrice);
		// If there is a patient in the service, show the informations of this patient
		if(this.patientService.currentPatient){
			this.show = true
			this.warningForm = new FormGroup({
				warning: new FormControl(this.patientService.currentPatient.alerte)
			})
			this.importantForm = new FormGroup({
				important: new FormControl(this.patientService.currentPatient.important)
			})
			// Each patient has them own survey, because a survey can be modified after a patient was created
			this.interrogatoireJSON = JSON.parse(this.patientService.currentPatient.section_information)
			this.survey = this.initSurvey()
			this.previousSelectedFiles = this.copyFiles(this.selectedFiles)
			// First we just show, so it's not possible to modify the information
			this.disableSurvey()
			if (this.patientService.demo){
				this.consultations = this.patientService.dataUser['consultations'].filter(elem => elem.id_patient === this.patientService.currentPatient.id_patient)
				this.initiateConsultations()
			}else{
				if (this.patientService.currentPatient.id_patient.toString() in this.patientService.dataUser){
					this.consultations = this.patientService.dataUser[this.patientService.currentPatient.id_patient.toString()]
					this.initiateConsultations()
				}else if ('consultations' in this.patientService.dataUser){
					this.patientService.dataUser[this.patientService.currentPatient.id_patient.toString()] = this.patientService.dataUser['consultations'].filter(elem => elem.id_patient === this.patientService.currentPatient.id_patient)
					this.consultations = this.patientService.dataUser[this.patientService.currentPatient.id_patient.toString()]
					this.initiateConsultations()
				}else{
					this.patientService.getConsultations(this.patientService.currentPatient.id_patient).subscribe((data: any) => {
							this.consultations = []
							for (var i = 0; i < data.length; ++i) {
								this.consultations.push(this.patientService.instanceConsultation(data[i]))
							}
							this.patientService.dataUser[this.patientService.currentPatient.id_patient.toString()] = this.consultations
							this.initiateConsultations()
						},
						(error) => { 
							this.patientService.showModalInformation({
								'title':'Erreur lors de la récupération',
								'content':'<p>Une erreur est survenue lors de la récupération des consultations du patient<br>Merci de réessayer ultérieurement</p>',
								'cancel':'Ok',
							})
						}
					)
				}
			}
		}else{
			// We get the survey of the user, because no patient is shown
			this.edit = true
			this.interrogatoireJSON = JSON.parse(this.patientService.user.interrogatoire)
			this.survey = this.initSurvey()
			this.warningForm = new FormGroup({
				warning: new FormControl(false)
			})
			this.importantForm = new FormGroup({
				important: new FormControl('')
			})
		}
		this.previousWarning = this.warningForm.value
		this.previousImportant = this.importantForm.value
		this.previousSurvey = this.survey.value
	}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is destroyed
	Reinitiate the patient
	----------------------------*/
	ngOnDestroy(){
		this.patientService.currentPatient = null;
		this.justCreated = false;
	}

	/* ---------------------------
	Initiate the survey of the patient
	No input
	Output
	 - The survey as a formGroup
	----------------------------*/
	initSurvey(){
		let survey = new FormGroup({
			sections: new FormArray([])
		});
		// For each section, initiate it
		for (var i = 0; i < this.interrogatoireJSON.length; ++i) {
			this.openedPanels.push(false);
			(<FormArray>survey.get('sections')).push(this.initSection(this.interrogatoireJSON[i],i))
		}
		return survey
	}

	/* ---------------------------
	Initiate the survey for the consultation
	No input
	Output
	 - The survey as formGroup
	----------------------------*/
	initSurveyConsultation(){
		let surveyConsultation = new FormGroup({
			date: new FormGroup({
				day: new FormControl(this.today.day,Validators.required),
				month: new FormControl(this.today.month,Validators.required),
				year: new FormControl(this.today.year,Validators.required)
			}),
			questions: new FormArray([])
		})
		surveyConsultation.get('date').setValidators(DateValidator("day","month","year",true))
		// For each questions in the survey, initiate it
		for (var i = 0; i < this.consultationJSON.length; ++i) {
			(<FormArray>surveyConsultation.get('questions')).push(this.initQuestionConsultation(this.consultationJSON[i]))
		}
		return surveyConsultation
	}

	/* ---------------------------
	Initiate a section
	Input
	 - section : the section to create
	 - indexSection : the index of the section to add
	Output
	 - The section as formGroup
	----------------------------*/
	initSection(section,indexSection) {
		let sectionGroup = new FormGroup({
			fields: new FormArray([])
		});
		// For each question, initiate it
		for (var i = 0; i < section.fields.length; ++i) {
			(<FormArray>sectionGroup.get('fields')).push(this.initQuestion(section.fields[i],indexSection,i))
		}
		return sectionGroup;
	}

	/* ---------------------------
	Initiate a question
	Input
	 - questoin : the question to initiate
	 - indexSection : the index of the section where the question is
	 - indexQuestion : the index of the question in the section
	Output
	 - The question as formGroup
	----------------------------*/
	initQuestion(question,indexSection,indexQuestion){
		let value = ''
		// Check if the question was already answered, when it's a patient that is shown
		if (question.hasOwnProperty("value")) {
			value = question.value
			// If the question is type file, all the files needs to be added to the principal array
			if (question.questionType === 'file') {
				let files = []
				if (question.value){
					files = question.value
				}
				let filesQuestion = {'indexSection':indexSection,'indexQuestion':indexQuestion,'files':files,'preview':false}
				this.selectedFiles.push(filesQuestion)
			}
		}
		let questionGroup = null
		if (question.questionType === 'date') {
			let day = ''
			let month = ''
			let year = ''
			if (question.hasOwnProperty('value')) {
				const dateValue = JSON.parse(question.value)
				day = dateValue[0]
				month = dateValue[1]
				year = dateValue[2]
			}
			questionGroup = new FormGroup({
				day: new FormControl(day),
				month: new FormControl(month),
				year: new FormControl(year)
			})
			questionGroup.get('day').setValidators([Validators.min(0),Validators.max(31)])
			questionGroup.get('month').setValidators([Validators.min(0),Validators.max(12)])
			questionGroup.setValidators(DateValidator("day","month","year",false))
		}else{
			questionGroup = new FormGroup({
				value: new FormControl(value)
			});
			if(question.required == "true"){
				questionGroup.get('value').setValidators([Validators.required])
			}
		}
		return questionGroup;
	}

	/* ---------------------------
	Initiate a question for the consultation survey
	Input
	 - question : the question to initiate
	Output
	 - The question as formGroup
	----------------------------*/
	initQuestionConsultation(question){
		let questionGroup = new FormGroup({})
		if(question.questionType == "checkbox"){
			questionGroup.addControl('values',new FormArray([]))
			for (var i = 0; i < question.options.length; ++i) {
				(<FormArray>(<any>questionGroup.get('values'))).push(new FormGroup({value:new FormControl(false)}))
			}
		}else if (question.questionType === "date") {
			questionGroup.addControl('day', new FormControl('',[Validators.min(0),Validators.max(31)]))
			questionGroup.addControl('month', new FormControl('',[Validators.min(0),Validators.max(12)]))
			questionGroup.addControl('year', new FormControl(''))
			questionGroup.setValidators(DateValidator("day","month","year",false))
		}else{
			questionGroup.addControl('value',new FormControl(''))
			if (question.required == "true") {
				questionGroup.get('value').setValidators([Validators.required])
			}
		}
		return questionGroup;
	}

	/* ---------------------------
	Get all the sections of the survey
	No input
	Output
	 - The sections as controls
	----------------------------*/
	getSections() {
		return (<FormArray>this.survey.get('sections')).controls;
	}

	/* ---------------------------
	Get all the questions of a section
	Input
	 - section : the section we want the questions from
	Output
	 - The questions as controls
	----------------------------*/
	getQuestions(section){
		return (<FormArray>section.get('fields')).controls;
	}

	/* ---------------------------
	Get all the questions of the consultation survey
	No input
	Output
	 - The questions as controls
	----------------------------*/
	getQuestionsConsultation(){
		return (<FormArray>this.surveyConsultation.get('questions')).controls;
	}

	/* ---------------------------
	Check the type of question
	Input
	 - i : index of the section
	 - j : index of the question
	 - type : type of question to check
	Output
	 - A boolean depending on the type of the question
	----------------------------*/
	checkType(i, j, type): boolean{
		return this.interrogatoireJSON[i].fields[j].questionType == type;
	}

	/* ---------------------------
	Check the type of question for the consultation
	Input
	 - i : index of the question
	 - type : type of the question to check
	Output
	 - A boolean depending on the type of the question
	----------------------------*/
	checkTypeNewConsultation(i, type): boolean{
		return this.consultationJSON[i].questionType == type;
	}

	/* ---------------------------
	Get all the options of the question, if it's a question of type checkbox, select or radio button
	Input
	 - i : index of the section
	 - j : index of the question
	Output
	 - All the options of the question
	----------------------------*/
	getOptions(i,j){
		return this.interrogatoireJSON[i].fields[j].options;
	}

	/* ---------------------------
	Get the title of a certain tab
	Input
	 - i : the index of the tab
	Output
	 - The title of the tab
	----------------------------*/
	getTabTitle(i){
		return this.interrogatoireJSON[i].title;
	}

	/* ---------------------------
	Get the text of a certain label
	Input
	 - i : index of the section
	 - j : index of the question
	Output
	 - The text of the label
	----------------------------*/
	getLabelTitle(i,j){
		return this.interrogatoireJSON[i].fields[j].entitled;
	}

	/* ---------------------------
	Get the text of a certain label of consultation
	Input
	 - i : index of the question
	Output
	 - The text of the label
	----------------------------*/
	getLabelTitleNewConsultation(i){
		return this.consultationJSON[i].entitled;
	}

	/* ---------------------------
	Get the options of a question for the consultation
	Input
	 - i : index of the question
	Output
	 - The options of the question
	----------------------------*/
	getOptionsNewConsultation(i){
		return this.consultationJSON[i].options;
	}

	/* ---------------------------
	Add the new files to the list of files
	Input
	 - event : the event of the file input
	 - i : index of the section
	 - j : index of the question
	No output
	----------------------------*/
	selectFilesSurvey(event,i,j) {
		let actualFiles = event.target.files;
		let arrayFiles = []
		let errorsFiles = []
		if (actualFiles.length > 5) {
			this.patientService.showModalInformation({
				'title':'Trop de fichiers',
				'content':'<p>Vous ne pouvez pas importer plus de 5 fichiers à la fois.<br>Si vous souhaitez en rajouter, créez un nouveau champ de type "Ajout de fichier".</p>',
				'cancel':'Ok',
			})
		}else{
			// Get only the files object
			for (var k = 0; k < actualFiles.length; ++k) {
				if (actualFiles[k].size <= 2*1048576){
					arrayFiles.push(actualFiles[k])
				}else{
					errorsFiles.push(actualFiles[k])
				}
			}
			// If the question was already answered with files, replace them
			// preview is set as true because nothing is stored in the database
			const index = this.selectedFiles.findIndex(obj => obj.indexSection == i && obj.indexQuestion == j)
			if (index > -1) {
				this.selectedFiles[index].files = arrayFiles
				this.selectedFiles[index].preview = true
			}else{
				let filesQuestion = {'indexSection':i,'indexQuestion':j,'files':arrayFiles,'preview':true}
				this.selectedFiles.push(filesQuestion)
			}
			if (errorsFiles.length > 0){
				if (errorsFiles.length === 1) {
					this.patientService.showModalInformation({
						'title':'Fichier trop lourd',
						'content':'<p>Le fichier <b>' + errorsFiles[0].name + '</b> à une taille supérieure à <b>2MB</b>.</p>',
						'cancel':'Ok',
					})
				}else{
					let li = ''
					for (var k = 0; k < errorsFiles.length; ++k) {
						li += '<li><b>' + errorsFiles[k].name + '</b></li>'
					}
					this.patientService.showModalInformation({
						'title':'Fichiers trop lourds',
						'content':'<div>Les fichiers suivants ont une taille supérieure à <b>2MB</b> : <ul>' + li + '</ul></div>',
						'cancel':'Ok',
					})
				}
			}
		}
	}

	/*----------------------------
	Show a document
	Input
	 - document : the document to show
	No output
	----------------------------*/
	showDoc(document) {
		this.dialog.open(ModalShowDocumentComponent,{data:{...document,'source':'local'},panelClass:'document'});
	}

	downloadDoc(documentElement){
		this.patientService.getDocumentUrl({...documentElement,'source':'local'}).subscribe((data) => {
			let url = 'data:' + documentElement.mimetype + ';base64,' + data
	  		let downloadLink = document.createElement('a');
	  		downloadLink.download = documentElement.name
	  		downloadLink.href = url
	  		downloadLink.style.display = 'none'
	  		document.body.appendChild(downloadLink)
	  		downloadLink.click()
	  		downloadLink.remove()
		},(error) => {
			this.patientService.showModalInformation({
				'title':'Impossible de télécharger',
				'content':'<p>Une erreur est survenue lors du téléchargement du document, merci de réessayer plus tard.</p>',
				'cancel':'Ok',
			})
		})
	}

	/* ---------------------------
	Get the files for a given question
	Input
	 - i : index of the section
	 - j : index of the question
	Output
	 - A list of files for the input file
	----------------------------*/
	getSpecifiedFiles(i,j){
		const index = this.selectedFiles.findIndex(obj => obj.indexSection == i && obj.indexQuestion == j)
		let result = []
		if (index > -1) {
			if (this.selectedFiles[index].preview) {
				result = this.selectedFiles[index].files.map(elem => elem = {'name':elem.name,'file':elem,'preview':true})
			}else{
				result = this.selectedFiles[index].files.map(elem => elem = {'name':elem.name,'id':elem.id,'mimetype':elem.mimetype,'preview':false})
			}
		}
		return result
	}

	/* ---------------------------
	Add the new files to the list of files for the consultation
	Input
	 - event : the event of the file input
	 - i : index of the question
	No output
	----------------------------*/
	selectFilesConsult(event,i) {
		let actualFiles = event.target.files;
		let arrayFiles = []
		let errorsFiles = []
		if (actualFiles.length > 5) {
			this.patientService.showModalInformation({
				'title':'Trop de fichiers',
				'content':'<p>Vous ne pouvez pas importer plus de 5 fichiers à la fois.<br>Si vous souhaitez en rajouter, créez un nouveau champ de type "Ajout de fichier".</p>',
				'cancel':'Ok',
			})
		}else{
			// Get only the files object
			for (var k = 0; k < actualFiles.length; ++k) {
				if (actualFiles[k].size <= 2*1048576){
					arrayFiles.push(actualFiles[k])
				}else{
					errorsFiles.push(actualFiles[k])
				}
			}
			// If the question was already answered with files, replace them
			// preview is set as true because nothing is stored in the database
			const index = this.selectedFilesConsult.findIndex(obj => obj.indexQuestion == i)
			if (index > -1) {
				this.selectedFilesConsult[index].files = arrayFiles
				this.selectedFilesConsult[index].preview = true
			}else{
				let filesQuestion = {'indexQuestion':i,'files':arrayFiles,'preview':true}
				this.selectedFilesConsult.push(filesQuestion)
			}
			if (errorsFiles.length > 0){
				if (errorsFiles.length === 1) {
					this.patientService.showModalInformation({
						'title':'Fichier trop lourd',
						'content':'<p>Le fichier <b>' + errorsFiles[0].name + '</b> à une taille supérieure à <b>2MB</b>.</p>',
						'cancel':'Ok',
					})
				}else{
					let li = ''
					for (var k = 0; k < errorsFiles.length; ++k) {
						li += '<li><b>' + errorsFiles[k].name + '</b></li>'
					}
					this.patientService.showModalInformation({
						'title':'Fichiers trop lourds',
						'content':'<div>Les fichiers suivants ont une taille supérieure à <b>2MB</b> : <ul>' + li + '</ul></div>',
						'cancel':'Ok',
					})
				}
			}
		}
	}

	/* ---------------------------
	Get the files for a given file input
	Input
	 - i : index of the question
	Output
	 - A list of files for the input file
	----------------------------*/
	getSpecifiedFilesConsult(i){
		const index = this.selectedFilesConsult.findIndex(obj => obj.indexQuestion == i)
		let result = []
		if (index > -1) {
			if (this.selectedFilesConsult[index].preview) {
				result = this.selectedFilesConsult[index].files.map(elem => elem = {'name':elem.name,'file':elem,'preview':true})
			}else{
				result = this.selectedFilesConsult[index].files.map(elem => elem = {'name':elem.name,'id':elem.id,'mimetype':elem.mimetype,'preview':false})
			}
		}
		return result
	}

	/* ---------------------------
	Get the information from the survey
	No input
	Output
	 - The date of the day
	 - The lastname of the patient
	 - The firstname of the patient
	 - The JSON object of the patient
	----------------------------*/
	getSurveyInformation(): [DateTime, string, string, Array<any>]{
		const today = DateTime.local();

		let surveyJSON = this.survey.getRawValue()
		
		let nom: string = surveyJSON.sections[0].fields[0].value;
		let prenom: string = surveyJSON.sections[0].fields[1].value;

		let patientJSON = this.interrogatoireJSON

		// Add all the answers to the JSON
		for (var i = 0; i < surveyJSON.sections.length; ++i) {
			for (var j = 0; j < surveyJSON.sections[i].fields.length; ++j) {
				if (patientJSON[i].fields[j].questionType === 'date') {
					patientJSON[i].fields[j].value = JSON.stringify([surveyJSON.sections[i].fields[j].day,surveyJSON.sections[i].fields[j].month,surveyJSON.sections[i].fields[j].year])
				}else{
					patientJSON[i].fields[j].value = surveyJSON.sections[i].fields[j].value
				}
			}
		}

		return [today, nom, prenom, patientJSON]
	}

	/* ---------------------------
	Create a new patient
	No input
	No output
	----------------------------*/
	async submitPatient(){
		if (!this.isDisabled()) {
			this.disableSurvey()
			this.disabled = true
			this.loading = true
			// Get information about survey and patient
			let [today, nom, prenom, patientJSON] = this.getSurveyInformation()

			let idFiles = []

			let error = false

			// Upload all the files that was added to the inputs
			for (var i = 0; i < this.selectedFiles.length; ++i) {
				const indexSection = this.selectedFiles[i].indexSection
				const indexQuestion = this.selectedFiles[i].indexQuestion
				let files = this.selectedFiles[i].files
				await this.patientService.uploadFiles(files).then((data: any[]) => {
					let result = []
					for (var j = 0; j < data.length; ++j) {
						const dataObject = data[j][0].rows[0]
						idFiles.push(dataObject.id_document)
						// Create an object for each file uploaded
						result.push({'id':dataObject.id_document,'name':dataObject.original_name,'mimetype':dataObject.mimetype})
					}
					patientJSON[indexSection].fields[indexQuestion].value = result
				})
				.catch((error) => {
					error = true
				})
			}

			this.previousSelectedFiles = this.copyFiles(this.selectedFiles)

			if (error) {
				this.enableSurvey()
				this.disabled = false
				this.error = true
				setTimeout(() => {
					this.loading = false
					this.error = false
				},1000)
			}else{
				let patient = new Patient(
					-1,
					this.patientService.user.id_user,
					nom,
					prenom,
					this.importantForm.get('important').value,
					this.warningForm.get('warning').value,
					JSON.stringify(patientJSON),
					[],
					this.today,
					this.today,
					JSON.stringify(idFiles)
				)
				if (this.patientService.demo){
					this.submitPatientResult(patient,this.patientService.dataUser['patients'].length+1,nom,prenom,patientJSON)
				}else{
					this.patientService.createPatient(patient).subscribe((data)=>{
						// Add the id_patient to the patient object and set some variables
						this.submitPatientResult(patient,data[0].id_patient,nom,prenom,patientJSON)
					},(error)=>{
						this.enableSurvey()
						this.disabled = false
						this.error = true
						setTimeout(() => {
							this.loading = false
							this.error = false
						},1000)
					});
				}
			}
		}
	}

	submitPatientResult(patient,id_patient,nom,prenom,patientJSON){
		patient.id_patient = id_patient
		if ('patients' in this.patientService.dataUser){
			this.patientService.dataUser['patients'].push(patient)
		}
		this.patientService.currentPatient = patient
		this.patientService.currentPatient.nom = nom
		this.patientService.currentPatient.prenom = prenom
		this.patientService.currentPatient.section_information = JSON.stringify(patientJSON)
		this.justCreated = true
		this.edit = false
		this.show = true
		this.consultations = []
		this.disabled = false
		this.loading = false
	}

	/* ---------------------------
	Disable all the fields of the form
	No input
	No output
	----------------------------*/
	disableSurvey(){
		this.survey.disable()
		this.importantForm.disable()
		this.warningForm.disable()
	}

	/* ---------------------------
	Enable all the fields of the form
	No input
	No output
	----------------------------*/
	enableSurvey(){
		this.survey.enable()
		this.importantForm.enable()
		this.warningForm.enable()
	}

	/* ---------------------------
	Create a new consultation
	No input
	No output
	----------------------------*/
	async createConsultation(){
		if (!this.isDisabledNewConsult()) {
			this.surveyConsultation.disable()
			this.loading = true
			this.disabled = true
			// Get all the fields of the consultation survey as JSON object
			let surveyConsultationJSON = this.surveyConsultation.getRawValue()

			const dateConsult = DateTime.fromFormat(surveyConsultationJSON.date.day + '-' + surveyConsultationJSON.date.month + '-' + surveyConsultationJSON.date.year,'d-M-yyyy')

			let consultationJSON = this.consultationJSON

			// Extract the parameters of price in the form
			this.paymentConsultation[0].values = surveyConsultationJSON.formPrice.supp.map(object => object.value)
			this.paymentConsultation[1].value = surveyConsultationJSON.formPrice.payment

			// For each value in the JSON object, add the result in the custom object
			for (var i = 0; i < surveyConsultationJSON.questions.length; ++i) {
				if (consultationJSON[i].questionType == "checkbox") {
					consultationJSON[i].values = surveyConsultationJSON.questions[i].values
					consultationJSON[i].values = consultationJSON[i].values.map(object => object.value)
				}else if(consultationJSON[i].questionType === 'date') {
					consultationJSON[i].value = JSON.stringify([surveyConsultationJSON.questions[i].day,surveyConsultationJSON.questions[i].month,surveyConsultationJSON.questions[i].year])
				}else{
					consultationJSON[i].value = surveyConsultationJSON.questions[i].value
				}
			}

			let idFiles = []

			// Upload all the files that was added to the inputs
			for (var i = 0; i < this.selectedFilesConsult.length; ++i) {
				let files = this.selectedFilesConsult[i].files
				await this.patientService.uploadFiles(files).then((data: any[])=> {
					let result = []
					for (var j = 0; j < data.length; ++j) {
						const dataObject = data[j][0].rows[0]
						idFiles.push(dataObject.id_document)
						// Create an object for each file uploaded
						result.push({'id':dataObject.id_document,'name':dataObject.original_name,'mimetype':dataObject.mimetype})
					}
					consultationJSON[this.selectedFilesConsult[i].indexQuestion].value = result
				})
			}

			// Add at the op of the JSON, the infomations for the price and payment
			consultationJSON = this.paymentConsultation.concat(consultationJSON)

			const id_patient = this.patientService.currentPatient.id_patient;

			let consultation = new Consultation(
				-1,
				id_patient,
				surveyConsultationJSON.formPrice.price,
				surveyConsultationJSON.formPrice.payment,
				false,
				dateConsult,
				JSON.stringify(consultationJSON).split("'").join("''"),
				this.today,
				this.today,
				JSON.stringify(idFiles)
			)

			const data = {
				'title': "Création automatique de facture",
				'content': "Souhaitez-vous créer une facture automatiquement pour cette nouvelle consultation ?<br>Si oui, merci de renseigner l'objet de la facture ci-dessous",
				'confirm': "Oui",
				'cancel': "Non"
			}

			let invoiceResult = {'facture':false,'data':''}

			if (this.invoiceModule){
				// Open a dialog to know if the user wants to create a facture with the consultation
				const dialogRef = this.dialog.open(ModalCreationFactureComponent,{data:data,panelClass:'classic'});

				await dialogRef.afterClosed().toPromise().then(result => {
			    	invoiceResult = result
				});
			}
			// Directly set the facture attribute to true
			if (invoiceResult.facture) {
				consultation.facture = true;
			}
			if (this.patientService.demo){
				this.surveyConsultation.enable()
				this.loading = false
				this.disabled = false
				consultation.id_consultation = this.patientService.dataUser['consultations'].length+1
				if(invoiceResult.facture){
					let facture = new Facture(
						this.patientService.dataUser['invoices'].length+1,
						this.patientService.user.id_user,
						this.patientService.currentPatient.nom,
						this.patientService.currentPatient.prenom,
						invoiceResult.data,
						dateConsult,
						surveyConsultationJSON.formPrice.price,
						this.today,
						this.today,
						-1,
						this.patientService.dataUser['consultations'].length+1,
						this.patientService.currentPatient.id_patient
					)
					this.patientService.dataUser['invoices'].push(facture)
				}
				this.consultations.push(consultation);
				this.initiateConsultations()
				this.patientService.dataUser['consultations'].push(consultation)
				const newDatesConsultations = this.patientService.currentPatient.dates_consultations.concat(this.today)
				const index = this.patientService.dataUser['patients'].findIndex(elem => elem.id_patient === id_patient)
				this.patientService.dataUser['patients'][index].dates_consultations = [].concat(newDatesConsultations)
			}else{
				this.patientService.createConsultation(consultation).subscribe((data) => {
					this.surveyConsultation.enable()
					this.loading = false
					this.disabled = false
					consultation.id_consultation = data[0].id_consultation;

					if(invoiceResult.facture){
						let facture = new Facture(
							-1,
							this.patientService.user.id_user,
							this.patientService.currentPatient.nom,
							this.patientService.currentPatient.prenom,
							invoiceResult.data,
							dateConsult,
							surveyConsultationJSON.formPrice.price,
							this.today,
							this.today,
							this.patientService.user.nbr_facture+1,
							data[0].id_consultation,
							this.patientService.currentPatient.id_patient
						)
						this.patientService.createFacture(facture).subscribe((data) => {
							this.patientService.user.nbr_facture += 1
							this.patientService.storeInLocal(this.patientService.user)
							facture.id_facture = data[0].id_facture;
							if ('invoices' in this.patientService.dataUser){
								this.patientService.dataUser['invoices'].push(facture)
							}
						},(error) => {
							this.patientService.showModalInformation({
								'title':'Erreur lors de la création',
								'content':'<p>Une erreur est survenue lors de la création de la facture<br>Merci de réessayez ultérieurement</p>',
								'cancel':'Ok',
							})
						});
					}
				},(error)=> {
					this.surveyConsultation.enable()
					this.loading = false
					this.disabled = false
					this.error = true
					setTimeout(() => {
						this.error = false
					},1000)
				}, ()=> {
					this.consultations.push(consultation);
					this.initiateConsultations()
					if ('consultations' in this.patientService.dataUser){
						this.patientService.dataUser['consultations'].push(consultation)
					}
					this.selectedFilesConsult = []
					const newDatesConsultations = this.patientService.currentPatient.dates_consultations.concat(dateConsult)
					this.patientService.updatePatientConsultation(id_patient, newDatesConsultations, JSON.stringify(JSON.parse(this.patientService.currentPatient.id_files).concat(idFiles)))
					.subscribe((data) => {
						if ('patients' in this.patientService.dataUser){
							const index = this.patientService.dataUser['patients'].findIndex(elem => elem.id_patient === id_patient)
							this.patientService.dataUser['patients'][index].dates_consultations = [].concat(newDatesConsultations)
						}
					},(error) => {
						this.patientService.showModalInformation({
							'title':'Erreur',
							'content':'<p>Une erreur est survenue lors de la création de la consultation<br>Merci de réessayez ultérieurement</p>',
							'cancel':'Ok',
						})
					})
				});
			}
		}
	}

	/* ---------------------------
	Check if the consultation is valid
	No input
	Output
	 - A boolean to check if everything is ok to create the consultation
	----------------------------*/
	isDisabledNewConsult(){
		return (this.surveyConsultation.status == 'INVALID' || this.patientService.currentPatient == undefined);
	}

	/* ---------------------------
	Check if the patient is valid
	No input
	Output
	 - A boolean to check if everything is ok to create the patient
	----------------------------*/
	isDisabled(){
		return this.survey.status == 'INVALID';
	}

	/* ---------------------------
	Update the price when a supplement is added or removed
	Input
	 - event : the event of the checkbox
	 - index : the index of the checkbox
	No output
	----------------------------*/
	changePrix(event,element){
		// Get the actual price
		let price = Number(this.surveyConsultation.get('formPrice').get('price').value)
		// Add or remove the price of the supp depending on the checkbox
		if(event.checked){
			this.surveyConsultation.get('formPrice').get('price').setValue(price + Number(this.patientService.user.prix_speciaux.find(price => price.name === element).price))
		}else{
			this.surveyConsultation.get('formPrice').get('price').setValue(price - Number(this.patientService.user.prix_speciaux.find(price => price.name === element).price))
		}
	}

	initiateConsultations(){
		this.shownConsultations = []
		this.surveyConsultation.reset()
		this.surveyConsultation.get('date').get('day').patchValue(this.today.day)
		this.surveyConsultation.get('date').get('month').patchValue(this.today.month)
		this.surveyConsultation.get('date').get('year').patchValue(this.today.year)
		this.surveyConsultation.get('formPrice').get('price').patchValue(this.patientService.user.prix_normal)
		this.newConsult = false
		this.consultations = this.consultations.sort(function (a, b){
			return a.date_consultation > b.date_consultation ? -1 : a.date_consultation < b.date_consultation ? 1 : 0;
		})
		this.openedConsultations.push(false)
		for (var i = 0; i < this.consultations.length; ++i) {
			this.filesConsultations.push([])
			let questions = JSON.parse(this.consultations[i].questions)
			let questionsPrice = questions.splice(0,2)
			for (var j = 0; j < questions.length; ++j) {
				if (questions[j].questionType === 'date') {
					questions[j].value = JSON.parse(questions[j].value)
				}
			}
			const showConsultation = {'consultation':this.consultations[i],'questions':questions,'questionsPrice':questionsPrice}
			this.shownConsultations.push(showConsultation)
			this.openedConsultations.push(false)
		}
	}

	/* ---------------------------
	Update the files 
	Input
	 - arrayOfFiles : a list of files to check
	 - previousArrayOfFile : the previous files that was added by the user
	Output
	 - The objects to add to the final patient JSON
	 - The id of the files to add to the patient to know which files are linked to the patient
	----------------------------*/
	async updateFiles(arrayOfFiles, previousArrayOfFile){
		let toAddJSON = []
		let toDelete = []
		let idFiles = []
		let error = false
		for (var i = 0; i < arrayOfFiles.length; ++i) {
			let lastElements = []
			let result = []
			// Create a list of just ids of the previous files
			for (var j = 0; j < previousArrayOfFile[i].files.length; ++j) {
				lastElements.push({'file':previousArrayOfFile[i].files[j],'indexSection':arrayOfFiles[i].indexSection,'indexQuestion':arrayOfFiles[i].indexQuestion})
			}
			for (var j = 0; j < arrayOfFiles[i].files.length; ++j) {
				// If a file is instance of File, this means that it is recently added by the user, it's object of Javascript for files
				if (arrayOfFiles[i].files[j] instanceof File) {
					// In this case, automatically upload the file
					await this.patientService.uploadFiles([arrayOfFiles[i].files[j]]).then((data: any[])=> {
						const dataObject = data[0][0].rows[0]
						result.push({'id':dataObject.id_document,'name':dataObject.original_name,'mimetype':dataObject.mimetype})
						idFiles.push(dataObject.id_document)
					})
				}else{
					// Else, this means that the file is already uploaded, so no need to do it again, remove it from lastElements, and add it to the result
					lastElements.splice(lastElements.findIndex(elem => elem.file.id === arrayOfFiles[i].files[j].id),1)
					result.push(arrayOfFiles[i].files[j])
					idFiles.push(arrayOfFiles[i].files[j].id)
				}
			}
			toDelete = toDelete.concat(lastElements)
			toAddJSON.push({'files':result,'indexSection':arrayOfFiles[i].indexSection,'indexQuestion':arrayOfFiles[i].indexQuestion})
		}
		// All the files that was nor File, neither already uploaded, needs to be deleted
		for (var i = 0; i < toDelete.length; ++i) {
			await this.patientService.deleteFileById(toDelete[i].file.id).subscribe((data) => {
			},(error) => {
				idFiles.push(toDelete[i].file.id)
				toAddJSON[toAddJSON.findIndex(elem => elem.indexSection === toDelete[i].indexSection && elem.indexQuestion === toDelete[i].indexQuestion)].files.push(toDelete[i].file)
				if (!error) {
					error = true
					this.patientService.showModalInformation({
						'title':'Erreur',
						'content':'<p>Des fichiers n\'ont pas pu être supprimés</p>',
						'cancel':'Ok',
					})
				}
			});
		}
		return [toAddJSON, idFiles]
	}

	/* ---------------------------
	Delete a file from the patient file list
	Input
	 - indexDocument : the index of the document to delete
	 - i : the index of the section
	 - j : the index of the question
	No output
	----------------------------*/
	deleteFileSurvey(event,indexDocument,i,j){
		event.preventDefault()
		let files = this.selectedFiles[this.selectedFiles.findIndex(obj => obj.indexSection == i && obj.indexQuestion == j)].files
		files.splice(indexDocument,1)
	}

	/* ---------------------------
	Delete a file from the consultation file list
	Input
	 - indexDocument : the index of the document to delete
	 - i : the index of the question
	No output
	----------------------------*/
	deleteFileSurveyConsult(event,indexDocument,i){
		event.preventDefault()
		let files = this.selectedFilesConsult[this.selectedFilesConsult.findIndex(obj => obj.indexQuestion == i)].files
		files.splice(indexDocument,1)
	}

	/* ---------------------------
	Update the patient
	No input
	No output
	----------------------------*/
	async modifyPatient(){
		if(this.edit){
			if (!this.isDisabled()) {
				this.loading = true
				this.disableSurvey()

				// Get information of the survey and the patient
				let [today, nom, prenom, patientJSON] = this.getSurveyInformation()

				// Get information about the files
				let [toAddJSON, idFiles] = await this.updateFiles(this.selectedFiles,this.previousSelectedFiles)

				this.previousSelectedFiles = this.copyFiles(toAddJSON)

				for (var i = 0; i < toAddJSON.length; ++i) {
					patientJSON[toAddJSON[i].indexSection].fields[toAddJSON[i].indexQuestion].value = toAddJSON[i].files
				}

				let patient = new Patient(
					this.patientService.currentPatient.id_patient,
					this.patientService.user.id_user,
					nom,
					prenom,
					this.importantForm.get('important').value,
					this.warningForm.get('warning').value,
					JSON.stringify(patientJSON),
					this.patientService.currentPatient.dates_consultations,
					this.today,
					this.today,
					JSON.stringify(idFiles)
				)
				if (this.patientService.demo){
					this.modifyPatientResult(patient,nom,prenom,patientJSON)
				}else{
					this.patientService.updatePatient(patient).subscribe((data) =>{
						this.modifyPatientResult(patient,nom,prenom,patientJSON)
					},(error)=>{
						this.enableSurvey()
						this.error = true
						setTimeout(() => {
							this.loading = false
							this.error = false
						},1000)
					})
				}
			}
		}else{
			// If the mode is readonly, change it to update and enable the survey
			this.enableSurvey()
			this.edit = !this.edit
		}
	}

	modifyPatientResult(patient,nom,prenom,patientJSON){
		if ('patients' in this.patientService.dataUser){
			const index = this.patientService.dataUser['patients'].findIndex(elem => elem.id_patient === this.patientService.currentPatient.id_patient)
			this.patientService.dataUser['patients'][index] = patient
		}
		this.patientService.currentPatient = patient;
		this.patientService.currentPatient.nom = nom;
		this.patientService.currentPatient.prenom = prenom
		this.patientService.currentPatient.section_information = JSON.stringify(patientJSON)
		this.edit = !this.edit
		this.previousSurvey = this.survey.value
		this.previousImportant = this.importantForm.value
		this.previousWarning = this.warningForm.value
		this.success = true
		setTimeout(() => {
			this.loading = false
			this.success = false
		},1000)
	}

	cancel(){
		this.selectedFiles = this.copyFiles(this.previousSelectedFiles)
		this.survey.reset(this.previousSurvey)
		this.warningForm.reset(this.previousWarning)
		this.importantForm.reset(this.previousImportant)
		this.disableSurvey()
		this.edit = !this.edit
	}

	/* ---------------------------
	Go back from the shown patient
	No input
	No output
	----------------------------*/
	back(){
		// If justCreated is true, this means that before looking at the patient we were on the new patient page
		// So if we go back, we need to go to create a new patient
		if(this.justCreated){
			this.router.navigateByUrl('/').then(()=>
				this.router.navigateByUrl('/nouveau', { skipLocationChange: true })
			);
		}else{
			// Else we move to the list of the patient
			this.patientService.listePatient()
		}
	}

	/* --------------------------- 
	Create a facture for a given consultation
	Input
	 - consultation : the consultation to create a facture for
	No output
	----------------------------*/
	addConsultFacture(consultation){
		if (!consultation.consultation.facture) {
			const data = {
				'title':"Création de facture",
				'content':"Afin de créer une facture pour cette consultation, merci de renseigner ci-dessous l'objet de la consultation",
				'confirm':"Confirmer",
				'cancel':"Annuler"
			}
			// Opend the dialog for the facture
			const dialogRef = this.dialog.open(ModalCreationFactureComponent,{data:data,panelClass:'classic'});

			dialogRef.afterClosed().subscribe(result => {
				if(result.facture){
					let facture = new Facture(
						-1,
						this.patientService.user.id_user,
						this.patientService.currentPatient.nom,
						this.patientService.currentPatient.prenom,
						result.data,
						consultation.consultation.date_consultation,
						consultation.consultation.total,
						this.today,
						this.today,
						this.patientService.user.nbr_facture + 1,
						consultation.consultation.id_consultation,
						this.patientService.currentPatient.id_patient
					)
					if (this.patientService.demo){
						this.patientService.user.nbr_facture += 1
						this.patientService.dataUser['invoices'].push(facture)
						const index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === consultation.consultation.id_consultation)
						this.patientService.dataUser['consultations'][index].facture = true
						consultation.consultation.facture = true;
					}else{
						this.patientService.createFacture(facture).subscribe((dataInvoice) => {
							this.patientService.user.nbr_facture += 1
							this.patientService.storeInLocal(this.patientService.user)
							facture.id_facture = Number(dataInvoice[0].createinvoice)
							if ('invoices' in this.patientService.dataUser){
								this.patientService.dataUser['invoices'].push(facture)
							}
							if ('consultations' in this.patientService.dataUser){
								const index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === consultation.consultation.id_consultation)
								this.patientService.dataUser['consultations'][index].facture = true
							}
							consultation.consultation.facture = true;
						},(error) => {
							this.patientService.showModalInformation({
								'title':'Erreur lors de la création',
								'content':'<p>Une erreur est survenue lors de la création de la facture<br>Merci de réessayez ultérieurement</p>',
								'cancel':'Ok',
							})
						})
					}
				}
			});
		}
	}

	/* ---------------------------
	Delete a consultation
	Input
	 - event : the event of the row click
	 - consultation : the consultation to delte
	Output
	----------------------------*/
	supprimer(event, consultation){
		// When click on the row of a consultation, this one is shown, but event.stopPropagation() allows the click to not trigger the show event, only the delete one
		event.stopPropagation()
		// Open the dialog to confirm
		this.patientService.showModalInformation({
			'title':'Suppression consultation',
			'content':'<p>Êtes-vous sûr de vouloir supprimer la consultation du <b>' + consultation.date_consultation.day + '/' + consultation.date_consultation.month + '/' + consultation.date_consultation.year + '</b> ?</p>',
			'confirm':'Confirmer',
			'cancel':'Annuler',
		}).subscribe(result => {
			if (result) {
				let datesConsultations = this.patientService.currentPatient.dates_consultations.map(date => {
					let dateConsultation = date
					return dateConsultation.year + '-' + dateConsultation.month + '-' + dateConsultation.day
				})
				// Remove the date of the deleted consultation from the list of all the dates
				datesConsultations.splice(datesConsultations.indexOf(consultation.date_consultation.year + '-' + consultation.date_consultation.month + '-' + consultation.date_consultation.day),1)
				let idFilesPatient = JSON.parse(this.patientService.currentPatient.id_files)
				let idFilesConsult = JSON.parse(consultation.id_files)
				idFilesPatient = idFilesPatient.filter((id) => !idFilesConsult.includes(id));
				let newDatesConsultations = []
				for (var i = 0; i < datesConsultations.length; ++i) {
					newDatesConsultations.push(DateTime.fromFormat(datesConsultations[i],'yyyy-M-d'))
				}
				// Observable to update information for the patient
				let observables = [
					this.patientService.updatePatientConsultation(this.patientService.currentPatient.id_patient,newDatesConsultations,JSON.stringify(idFilesPatient)), 
					this.patientService.supprimerConsultation(consultation)
				]
				for (var i = 0; i < idFilesConsult.length; ++i) {
					observables.push(this.patientService.deleteFileById(idFilesConsult[i]))
				}
				// Add an observable if there is a facture
				if (consultation.facture) {
					observables.push(this.patientService.supprimerFacture(consultation.id_consultation))
				}
				if (this.patientService.demo){
					let index = this.patientService.dataUser['patients'].findIndex(elem => elem.id_patient === this.patientService.currentPatient.id_patient)
					this.patientService.dataUser['patients'][index].dates_consultations = newDatesConsultations
					index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === consultation.id_consultation)
					this.patientService.dataUser['consultations'].splice(index,1)
					if (consultation.facture){
						index = this.patientService.dataUser['invoices'].findIndex(elem => elem.id_consultation === consultation.id_consultation)
						this.patientService.dataUser['invoices'].splice(index,1)
					}
					index = this.shownConsultations.findIndex(obj => obj.consultation.id_consultation === consultation.id_consultation)
					if (index !== -1) {
						this.shownConsultations.splice(index,1)
					}
					this.consultations.splice(this.consultations.findIndex(consult => consult.id_patient === consultation.id_patient),1)
				}else{
					// Subscribe to all the observables at once
					forkJoin(observables).subscribe((result) => {
					},(error) => {
						this.patientService.showModalInformation({
							'title':'Erreur lors de la suppression',
							'content':'<p>Une erreur est survenue lors de la suppression de la consultation<br>Merci de réessayez ultérieurement</p>',
							'cancel':'Ok',
						})
					},() => {
						if ('patients' in this.patientService.dataUser){
							const index = this.patientService.dataUser['patients'].findIndex(elem => elem.id_patient === this.patientService.currentPatient.id_patient)
							this.patientService.dataUser['patients'][index].dates_consultations = newDatesConsultations
						}
						if ('consultations' in this.patientService.dataUser){
							const index = this.patientService.dataUser['consultations'].findIndex(elem => elem.id_consultation === consultation.id_consultation)
							this.patientService.dataUser['consultations'].splice(index,1)
						}
						if (consultation.facture){
							if ('invoices' in this.patientService.dataUser){
								const index = this.patientService.dataUser['invoices'].findIndex(elem => elem.id_consultation === consultation.id_consultation)
								this.patientService.dataUser['invoices'].splice(index,1)
							}
						}
						// Check if the consultation if shown, if yes, remove it
						let index = this.shownConsultations.findIndex(obj => obj.consultation.id_consultation === consultation.id_consultation)
						if (index !== -1) {
							this.shownConsultations.splice(index,1)
						}	
						this.consultations.splice(this.consultations.findIndex(consult => consult.id_patient === consultation.id_patient),1)
					});
				}
			}
		});
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
		// Get the ASCII code of the character added
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

	nextInput(event){
		let actualInput = event.srcElement
		let actualIndex = this.dateInputs._results.findIndex(object => object.nativeElement === actualInput)
		let nextInput = this.dateInputs._results[actualIndex + 1].nativeElement

		if(event.target.value.length == 2) {
			nextInput.focus()
		}else if(event.target.value.length > 2) {
			event.target.value = event.target.value.substring(0,2)
			nextInput.focus()
		}
	}

	maxLength(event,length){
		if(event.target.value.length > length) {
			event.target.value = event.target.value.substring(0,length)
		}
	}
	copyFiles(filesElements){
		let copy = []
		for (var i = 0; i < filesElements.length; ++i) {
			copy.push(JSON.parse(JSON.stringify(filesElements[i])))
			if (filesElements[i].preview) {
				for (var j = 0; j < filesElements[i].files.length; ++j) {
					let currentFile = filesElements[i].files[j]
					copy[i].files[j] = new File([currentFile],currentFile.name,{type:currentFile.type})
				}
			}
		}
		return copy
	}
}