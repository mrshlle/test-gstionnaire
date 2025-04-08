/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime, Interval } from 'luxon'

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Note } from '../models/Note.models';

@Component({
    selector: 'app-note',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.css'],
    standalone: false
})
export class NoteComponent implements OnInit {

	today = DateTime.local()

	displayNotes: boolean = false
	notes: Note[] = []
	edits: boolean[] = []
	errors: boolean[] = []
	success: boolean[] = []
	loadings: boolean[] = []
	initialNotes: Note[] = []

	constructor(public patientService: PatientService) {}

	ngOnInit(): void {
		if (this.patientService.demo){
			this.notes = this.patientService.dataUser['notes']
			this.startGeneration()
		}else{
			this.patientService.getNotes(this.patientService.user.id_user).subscribe(
				(data: any) => {
					for (var i = 0; i < data.length; ++i) {
						this.notes.push(this.patientService.instanceNote(data[i]))
					}
				},
				(error) => {
					this.patientService.showModalInformation({
						'title':'Erreur lors de la récupération',
						'content':'<p>Une erreur est survenue lors de la récupération de vos notes<br>Merci de réessayer</p>',
						'cancel':'Ok',
					})
				},
				() => {
					this.startGeneration()
				}
			);
		}
	}

	startGeneration(){
		this.initialNotes = JSON.parse(JSON.stringify(this.notes))
		for (var i = 0; i < this.notes.length; ++i) {
			this.edits.push(false)
			this.errors.push(false)
			this.success.push(false)
			this.loadings.push(false)
		}
	}

	showNotes(){
		this.displayNotes = true
	}

	hiddenNotes(){
		this.displayNotes = false
	}

	edit(index){
		if (!this.loadings[index]) {
			if (this.edits[index]) {
				if (this.notes[index].id_note == -1){
					this.saveNote(index)
				}else{
					if (this.patientService.demo){
						this.initialNotes[index] = JSON.parse(JSON.stringify(this.notes[index]))
						this.edits[index] = false
					}else{
						this.loadings[index] = true
						this.patientService.updateNote(this.notes[index]).subscribe((data)=>{
							this.edits[index] = false
							this.success[index] = true
							setTimeout(() => {
								this.success[index] = false
								this.loadings[index] = false
							},1000)
							this.initialNotes[index] = JSON.parse(JSON.stringify(this.notes[index]))
						},(error)=>{
							this.errors[index] = true
							setTimeout(() => {
								this.errors[index] = false
								this.loadings[index] = false
							},1000)
						})
					}
				}
			}else{
				this.edits[index] = true
			}
		}
	}

	saveNote(index){
		this.loadings[index] = true
		if (this.patientService.demo){
			this.notes[index].id_note = this.notes.length+1
		}else{
			this.patientService.createNote(this.notes[index]).subscribe((data) => {
				this.notes[index].id_note = data[0].id_note
				this.edits[index] = false
				this.success[index] = true
				setTimeout(() => {
					this.success[index] = false
					this.loadings[index] = false
				},1000)
				this.initialNotes[index] = JSON.parse(JSON.stringify(this.notes[index]))
			},(error) => {
				this.errors[index] = true
				setTimeout(() => {
					this.errors[index] = false
					this.loadings[index] = false
				},1000)
			})
		}
	}

	/* ---------------------------
	Create a new note
	No input
	No output
	----------------------------*/
	addNote(){
		const note = new Note(
			// The query returns the id of the new note
			-1,
			this.patientService.user.id_user,
			'',
			'',
			this.today,
			this.today
		)
		this.notes.push(note)
		this.initialNotes.push(JSON.parse(JSON.stringify(note)))
		this.edits.push(true)
		this.errors.push(false)
		this.success.push(false)
		this.loadings.push(false)
	}

	delete(index){
		if (this.patientService.demo){
			this.notes.splice(index,1)
			this.initialNotes.splice(index,1)
			this.edits.splice(index,1)
			this.errors.splice(index,1)
			this.success.splice(index,1)
			this.loadings.splice(index,1)
		}else{
			this.patientService.supprimerNote(this.notes[index]).subscribe((data) => {
				this.notes.splice(index,1)
				this.initialNotes.splice(index,1)
				this.edits.splice(index,1)
				this.errors.splice(index,1)
				this.success.splice(index,1)
				this.loadings.splice(index,1)
			},(error) => {
				this.patientService.showModalInformation({
					'title':'Erreur lors de la suppression',
					'content':'<p>Une erreur est survenue lors de la suppression de la note<br>Merci de réessayer</p>',
					'cancel':'Ok',
				})
			});
		}
	}

	reset(index){
		if (!this.loadings[index]){
			if (this.notes[index].id_note == -1){
				this.notes.splice(index,1)
				this.initialNotes.splice(index,1)
				this.edits.splice(index,1)
				this.errors.splice(index,1)
				this.success.splice(index,1)
				this.loadings.splice(index,1)
			}else{
				this.notes[index] = JSON.parse(JSON.stringify(this.initialNotes[index]))
				this.edits[index] = false
			}
		}
	}
}