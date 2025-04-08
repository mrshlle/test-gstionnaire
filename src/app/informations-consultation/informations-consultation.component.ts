/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, UntypedFormControl, Validators, FormBuilder } from '@angular/forms';
import { ENTER, TAB } from '@angular/cdk/keycodes';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-informations-consultation',
    templateUrl: './informations-consultation.component.html',
    styleUrls: ['./informations-consultation.component.css'],
    standalone: false
})
export class InformationsConsultationComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	// This is the array with the key to separate the different options if the quesition is a select, checkbox or radio button
	readonly separatorKeysCodes: number[] = [ENTER, TAB];

	consultationJSON: Array<any>

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
				private authService: AuthService) { }

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Initiation of the survey for the consultations
	----------------------------*/
	ngOnInit() {
		this.demo = this.patientService.demo
		this.files = this.patientService.user.modules.find(element => element.id === "2").added
		this.consultationJSON = JSON.parse(this.patientService.user.consultation)
		this.survey = new UntypedFormGroup({
			questions: new UntypedFormArray([])
		})
		// For each question in the survey, initiate it
		for (var i = 0; i < this.consultationJSON.length; ++i) {
			(<UntypedFormArray>this.survey.get('questions')).push(this.initQuestion(this.consultationJSON[i]))
		}
	}

	/* ---------------------------
	Initiate the questions for the survey
	Input
	 - question : the question object to initiate
	Output
	 - The question as a formGroup object
	----------------------------*/
	initQuestion(question){
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
				(<UntypedFormArray>questionGroup.get('options')).push(new UntypedFormControl({value:question.options[i],disabled:disable}))
			}
		}
		return questionGroup;
	}	

	/* ---------------------------
	Add a new question to the survey
	No input
	No output
	----------------------------*/
	addQuestion() {
		if (!this.loading) {
			(<UntypedFormArray>this.survey.get('questions')).push(this.initQuestion({questionType:"text",entitled:"",required:false}));
		}
	}

	/* ---------------------------
	Get all the questions
	No input
	Output
	 - All the controls corresponding to the questions
	----------------------------*/
	getQuestions() {
		return (<UntypedFormArray>this.survey.get('questions')).controls;
	}

	/* ---------------------------
	Get all the options of a select, checkbox or radio button question
	Input
	 - question : the question that contains all the options
	Output
	 - All the options of the question
	----------------------------*/
	getOptions(question) {
		return (<UntypedFormArray>question.get('options')).controls;
	}

	/* ---------------------------
	Remove a question from the survey
	Input
	 - indexQuestion : the index of the question to remove
	No output
	----------------------------*/
	removeQuestion(indexQuestion){
		if (!this.loading) {
			(<UntypedFormArray>this.survey.get('questions')).removeAt(indexQuestion);
		}
	}

	/* ---------------------------
	Method to trigger when the question type has changed
	Input
	 - event : the select event
	 - question : the question formGroup
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
		// Reset the value of the input
		event.input.value = ''
	}

	/* ---------------------------
	Method to know if the question is disabled or not
	Input
	 - question : the question to check
	Output
	 - A boolean about the disabled status
	----------------------------*/
	disabled(question){
		return question.get('entitled').status == 'DISABLED'
	}

	/* ---------------------------
	Save the new consultation survey
	No input
	No output
	----------------------------*/
	saveConsult(){
		if (!this.loading) {
			this.loading = true
			// Get a JSON from the fomGroup object
			const JSONconsultation = this.survey.getRawValue().questions
			// Set all the field required to false except the two first, which are the price and the payment method
			JSONconsultation.forEach((field) => {
				field.required = "false"
			})
			JSONconsultation[0].required = "true"
			JSONconsultation[1].required = "true"
			const JSONStringConsultation = JSON.stringify(JSONconsultation).replace(/'/g,"''")
			if (this.patientService.demo){
				this.patientService.user.consultation = JSONStringConsultation;
				this.loading = false
			}else{
				this.patientService.updateConsultation(JSONStringConsultation).subscribe((data)=>{
					this.patientService.user.consultation = JSONStringConsultation;
					this.success = true
					setTimeout(() => {
						this.success = false
						this.loading = false
					}, 2000)
					this.authService.storeInLocal(this.patientService.user)
				},(error)=>{
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
