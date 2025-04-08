/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, UntypedFormControl, Validators, FormBuilder } from '@angular/forms';
import { ENTER, TAB } from '@angular/cdk/keycodes';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';
import { AuthService } from '../services/auth.service'

@Component({
    selector: 'app-modification',
    templateUrl: './modification.component.html',
    styleUrls: ['./modification.component.css'],
    standalone: false
})
export class ModificationComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	// This is the array with the key to separate the different options if the quesition is a select, checkbox or radio button
	readonly separatorKeysCodes: number[] = [ENTER, TAB];

	survey: UntypedFormGroup;
	optionsType: string[] = ['select','checkbox','radio']

	loading: boolean = false
	success: boolean = false
	error:boolean = false

	files: boolean = false

	demo: boolean = false

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private authService: AuthService){}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Initiation of the survey for the patient creation
	----------------------------*/
	ngOnInit() {
		this.demo = this.patientService.demo
		this.files = this.patientService.user.modules.find(element => element.id === "2").added
		let interrogatoireJSON = JSON.parse(this.patientService.user.interrogatoire);
		this.survey = new UntypedFormGroup({
			sections: new UntypedFormArray([]),
		});
		// For each section in the survey, initiate it
		for (var i = 0; i < interrogatoireJSON.length; ++i) {
			(<UntypedFormArray>this.survey.get('sections')).push(this.initSection(interrogatoireJSON[i]))
		}
	}

	/* ---------------------------
	Initiate a section
	Input
	 - section : the section to add to the form
	Output
	 - The section as formGroup
	----------------------------*/
	initSection(section) {
		let sectionGroup = new UntypedFormGroup({
			title: new UntypedFormControl(section.title),
			fields: new UntypedFormArray([])
		});
		// For each question in the section, initiate it
		for (var i = 0; i < section.fields.length; ++i) {
			(<UntypedFormArray>sectionGroup.get('fields')).push(this.initQuestion(section.fields[i]))
		}
		return sectionGroup;
	}

	/* ---------------------------
	Initiate a question
	Input
	 - question : the question object to initiate
	Output
	 - the question as formGroup
	----------------------------*/
	initQuestion(question) {
		const disable = JSON.parse(question.required)
		// Create the question formGroup
		let questionGroup = new UntypedFormGroup({
			questionType: new UntypedFormControl({value:question.questionType,disabled:disable}),
			entitled: new UntypedFormControl({value:question.entitled,disabled:disable}),
		});
		// Only if the question is one of the `optionsType`
		if (this.optionsType.includes(question.questionType)) {
			questionGroup.addControl('options', new UntypedFormArray([]))
			for (var i = 0; i < question.options.length; ++i) {
				(<UntypedFormArray>questionGroup.get('options')).push(new UntypedFormControl(question.options[i]))
			}
		}
		return questionGroup;
	}

	/* ---------------------------
	Add a new section
	No input
	No output
	----------------------------*/
	addSection() {
		if (!this.loading) {
			(<UntypedFormArray>this.survey.get('sections')).push(this.initSection({title:"",fields:[]}));
		}
	}

	/* ---------------------------
	Add a new question
	Input
	 - section : the section to add a new question in
	No output
	----------------------------*/
	addQuestion(section) {
		if (!this.loading) {
			(<UntypedFormArray>section.get('fields')).push(this.initQuestion({questionType:"text",entitled:"",required:false}));
		}
	}

	/* ---------------------------
	Get the sections of the survey
	No input
	Output
	 - All the sections of the survey as controls
	----------------------------*/
	getSections() {
		return (<UntypedFormArray>this.survey.get('sections')).controls;
	}
  
  	/* ---------------------------
  	Get all the questions of a given section
  	Input
  	 - section : the section to get all the questions from
  	Output
  	 - All the questions of the section as controls
  	----------------------------*/
	getQuestions(section) {
		return (<UntypedFormArray>section.get('fields')).controls;
	}
  
  	/* ---------------------------
  	Get the options of a question
  	Input
  	 - question : question to get the options from
  	Output
  	 - The options for the given question
  	----------------------------*/
	getOptions(question) {
		return (<UntypedFormArray>question.get('options')).controls;
	}

	/* ---------------------------
	Remove a question from a section
	Input
	 - indexSection : the index of the section where need to remove a question
	 - indexQuestion : the index of the question to remove
	No output
	----------------------------*/
	removeQuestion(indexSection,indexQuestion){
		if (!this.loading) {
			(<UntypedFormArray>(<UntypedFormArray>this.survey.get('sections')).controls[indexSection].get('fields')).removeAt(indexQuestion);
		}
	}

	/* ---------------------------
	Remove a section from the survey
	Input
	 - indexSection : the index of the section to remove
	No output
	----------------------------*/
	removeSection(indexSection){
		if (!this.loading) {
			(<UntypedFormArray>this.survey.get('sections')).removeAt(indexSection);
		}
	}

	/* ---------------------------
	Method to trigger the selected type of a question
	Input
	 - event : the event of the select input
	 - question : the question as formGroup
	No output
	----------------------------*/
	onChange(event,question){
		if(this.optionsType.includes(event.value)){
			question.addControl('options', new UntypedFormArray([]));
		}else{
			question.removeControl('options');
		}
	}

	/* ---------------------------
	Return true if the question can contain options
	Input
	 - question : the question we need to check
	Output
	 - A boolean to know if the options input can be shown
	----------------------------*/
	matChip(question){
		const questionType = question.get('questionType').value;
		return this.optionsType.includes(questionType);
	}

	/* ---------------------------
	Remove an option
	Input
	 - question : the question formGroup
	 - indexOption : the index of the option to remove
	No output
	----------------------------*/
	removeOption(question,indexOption){
		if (!this.loading) {
			(<UntypedFormArray>question.get('options')).removeAt(indexOption);
		}
	}

	/* ---------------------------
	Add an option
	Input
	 - event : the event of the input
	 - question : the question formGroup
	No output
	----------------------------*/
	addOption(event,question){
		if (!this.loading) {
			(<UntypedFormArray>question.get('options')).push(new UntypedFormControl(event.value));
		}
		event.input.value = ''
	}

	/* ---------------------------
	Save the new survey for patient creation
	No input
	No output
	----------------------------*/
	saveInterro(){
		if (!this.loading) {
			this.loading = true
			// Get a JSON object from formGroup survey
			let JSONinterrogatory = this.survey.getRawValue().sections
			// Set all the required field as false, except the three first which are firstname lastname and birthdate
			JSONinterrogatory.forEach((section) => {
				section.fields.forEach((field) => {
					field.required = "false"
				})
			})
			JSONinterrogatory[0].fields[0].required = "true"
			JSONinterrogatory[0].fields[1].required = "true"
			const JSONStringInterrogatory = JSON.stringify(JSONinterrogatory).replace(/'/g,"''")
			if (this.patientService.demo){
				this.patientService.user.interrogatoire = JSONStringInterrogatory;
				this.loading = false
			}else{
				this.patientService.updateInterrogatory(JSONStringInterrogatory).subscribe((data) => {
					this.patientService.user.interrogatoire = JSONStringInterrogatory;
					this.success = true
					setTimeout(() => {
						this.success = false
						this.loading = false
					}, 2000)
					this.authService.storeInLocal(this.patientService.user)
				},(error) => {
					this.error = true
					setTimeout(() => {
						this.error = false
						this.loading = false
					}, 2000)
				})
			}
		}
	}
}