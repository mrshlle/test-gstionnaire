/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

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
import { Consultation } from '../models/Consultation.models';
import { Charge } from '../models/Charge.models';
import { Entry } from '../models/Entry.models';

/* -----------------------------------------------------------------------------------------------------------------
Pipes imports
----------------------------------------------------------------------------------------------------------------- */
import { SumPipe } from '../pipes/sum.pipe'

import { ModalEntryComponent } from '../modals/modal-entry/modal-entry.component'

@Component({
    selector: 'app-compta',
    templateUrl: './compta.component.html',
    styleUrls: ['./compta.component.css'],
    standalone: false
})
export class ComptaComponent implements OnInit {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	shownMonths = []

	shownConsultations = []
	shownElements = []

	monthsName: string[] = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

	consultations: Consultation[]
	entries: Entry[]

	today = DateTime.local();

	charge: number;

	years = []

	shownTitle = ''

	currentShownYear = this.today.year
	currentShownMonths = []

	consultationShow = false

	disabledRight = true
	disabledLeft = true
	disabledFee = true

	espece = true
	cheque = true
	credit = true

	conslt = true
	entry = true

	specialFees: Charge[]
	actualMonth = null
	actualIndex = -1
	actualFee = 0
	previousFee = 0

	currentYearTotal = 0
	currentYearMax = 0

	error: boolean = false
	success: boolean = false
	loading: boolean = false

	expand: boolean = true

	facture: boolean = false

	moreMenu: boolean[][] = []

	loadingEntry: boolean = false
	errorEntry: boolean = false
	successEntry: boolean = false

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private sumPipe: SumPipe,
				private dialog: MatDialog) { }

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get fees and consultations, then initiate the years array
	----------------------------*/
	ngOnInit() {
		this.facture = this.patientService.user.modules.find(element => element.id === "0").added
		// Usage of `forkJoin` to be sure that we start everything with all data ready
		if (this.patientService.demo){
			this.specialFees = this.patientService.dataUser['fees']
			this.consultations = this.patientService.dataUser['consultations']
			this.entries = this.patientService.dataUser['entries']
			this.startGeneration()
		}else{
			if ('fees' in this.patientService.dataUser){
				this.specialFees = this.patientService.dataUser['fees']
				this.consultations = this.patientService.dataUser['consultations']
				this.entries = this.patientService.dataUser['entries']
				this.startGeneration()
			}else{
				forkJoin([
					this.patientService.getChargesCompta(),
					this.patientService.getConsultationsCompta(),
					this.patientService.getEntries()
				]).subscribe((result: any) => {
					this.specialFees = []
					for (var i = 0; i < result[0].length; ++i) {
						this.specialFees.push(this.patientService.instanceCharge(result[0][i]))
					}
					this.patientService.dataUser['fees'] = this.specialFees
					this.consultations = []
					for (var i = 0; i < result[1].length; ++i) {
						this.consultations.push(this.patientService.instanceConsultation(result[1][i]))
					}
					this.patientService.dataUser['consultations'] = this.consultations
					this.entries = []
					for (var i = 0; i < result[2].length; ++i) {
						this.entries.push(this.patientService.instanceEntry(result[2][i]))
					}
					this.patientService.dataUser['entries'] = this.entries
				},(error) => {
					this.patientService.showModalInformation({
						'title':'Erreur lors de la récupération',
						'content':'<p>Impossible de récupérer les informations relatives à vos chiffres d\'affaires<br>Merci de réessayez ultérieurement</p>',
						'cancel':'Ok',
					})
				},() => {
					this.startGeneration()
				})
			}
		}
	}

	startGeneration(){
		// Check if we got something
		// Create a list of years, months and consultation called `this.years`
		this.createList()
		let actualYear = this.today.year
		// Get the 'page' corresponding of the actual year
		let index = this.years.findIndex(elem => elem.year == actualYear)
		// Get the last index possible of all the pages of year
		let lastIndex = this.years.length-1
		// Disable or not the right and left button if the actual page is the first or the last of the years
		this.disabledRight = (index == lastIndex)
		this.disabledLeft = (index == 0)
		if (index != -1) {
			this.shownMonths = this.years[index].months
			this.shownTitle = actualYear.toString()
			this.currentShownYear = actualYear
			this.calculateYearTotal()
		}else{
			// This part is reached if the currently year is not found on the `this.years` list
			if (actualYear > this.years[lastIndex]) {
				this.shownMonths = this.years[lastIndex].months
				this.shownTitle = this.years[lastIndex].year
				this.currentShownYear = this.years[lastIndex].year
				this.disabledLeft = (lastIndex == 0)
				this.disabledRight = true
				this.calculateYearTotal()
			}else{
				this.shownMonths = this.years[0].months
				this.shownTitle = this.years[0].year
				this.currentShownYear = this.years[0].year
				this.disabledLeft = true
				this.disabledRight = (lastIndex == 0)
				this.calculateYearTotal()
			}
		}
		let actualMonth = this.today.month
		// Get the 'page' corresponding of the actual year
		let indexMonth = this.shownMonths.findIndex(elem => elem.monthNumber == actualMonth)
		this.showDetails(indexMonth)
	}

	/* ---------------------------
	Calculate the amount done in the year, with and without the fees
	No input
	No output
	----------------------------*/
	calculateYearTotal(){
		// Get the array of months that is currently shown
		const months = this.shownMonths
		let totalYear = 0
		let yearMaxMonth = 0
		// For each month, reduce the consultations to the total amount of the month
		for (var i = 0; i < months.length; ++i) {
			for (var j = 0; j < months[i].consultations.length; ++j) {
				('id_entry' in months[i].consultations[j]) ? months[i].consultations[j] = {...months[i].consultations[j],'origin':'entry'} : months[i].consultations[j] = {...months[i].consultations[j],'origin':'consultation'}
			}
			const totalMonth = this.sumPipe.transform(months[i].consultations,0,true,true,true,true,true,false);
			if (totalMonth > yearMaxMonth) {
				yearMaxMonth = totalMonth
			}
			// Add the amount of the month to the total one
			totalYear += totalMonth
		}
		this.currentYearTotal = totalYear
		this.currentYearMax = yearMaxMonth
	}

	/* ---------------------------
	Year methods
	----------------------------*/

	/* ---------------------------
	Create the principal list of years, months, and consultations
	This is used as 'pages' of years, where there is all the months, and in each months, we got all the consultations
	No input
	No output
	----------------------------*/
	createList() {
		let minYear = this.patientService.user.date_creation.year
		let maxYear = this.today.year
		// For each consultation, check if the year is bigger than the max one, or lower than the min one
		for (var i = 0; i < this.consultations.length; ++i) {
			let dateConsultation = this.consultations[i].date_consultation
			let year = dateConsultation.year
			if (year < minYear) minYear = year
			if (year > maxYear) maxYear = year
		}
		// Create an interval between the min and max years
		for (var i = 0; i < maxYear-minYear+1; ++i) {
			let months = []
			// For each month 
			for (var j = 0; j < 12; ++j) {
				let fee = 0
				// Check if a fee exists for this month
				const testMonth = (j+1).toString() + '-' + (minYear+i).toString()
				const indexTest = this.specialFees.findIndex(element => element.mois == testMonth)
				if (indexTest != -1) {
					fee = this.specialFees[indexTest].charge
				}else{
					// If it doesn't exists, create one
					const charge = new Charge(
						this.patientService.user.id_user,
						testMonth,
						this.patientService.user.charge,
						this.today,
						this.today,
					)
					// Add the fee to all fees once subscribe successfully finish
					if (this.patientService.demo){
						this.specialFees.push(charge)
						fee = this.patientService.user.charge
					}else{
						this.patientService.createCharge(charge).subscribe((data) => {
							this.specialFees.push(charge)
							fee = this.patientService.user.charge
						},(error) => {
							this.patientService.showModalInformation({
								'title':'Erreur lors de la création',
								'content':'<p>Une erreur est survenue lors de la génération de vos chiffres d\'affaires<br>Merci de réessayez ultérieurement</p>',
								'cancel':'Ok',
							})
						})
					}
				}
				const userCreationYear = this.patientService.user.date_creation.year
				const userCreationMonth = this.patientService.user.date_creation.month
				let disabled = (userCreationYear >= minYear+i && userCreationMonth > j+1) || (minYear+i >= this.today.year && j+1 > this.today.month)
				// Add the new month to the array of months
				months.push({"year":minYear+i,"monthNumber":j+1,"monthName":this.monthsName[j],"consultations":[],"fee":Number(fee),"disabled":disabled,"difference":null})
			}
			// Add all th emonths to the array of years
			this.years.push({"year":minYear+i,"months":months})
		}
		// For each consultation, push it to the month that correspond
		for (var i = 0; i < this.consultations.length; ++i) {
			let dateConsultation = this.consultations[i].date_consultation
			let year = dateConsultation.year
			let month = dateConsultation.month
			let indexYear = this.years.findIndex(element => element.year == year)
			let indexMonth = this.years[indexYear].months.findIndex(element => element.monthNumber == month)
			this.years[indexYear].months[indexMonth].consultations.push({...this.consultations[i],'origin':'consultation'})
		}
		// For each entry, push it to the month that correspond
		for (var i = 0; i < this.entries.length; ++i) {
			let dateEntry = this.entries[i].date_entry
			let year = dateEntry.year
			let month = dateEntry.month
			let indexYear = this.years.findIndex(element => element.year == year)
			let indexMonth = this.years[indexYear].months.findIndex(element => element.monthNumber == month)
			this.years[indexYear].months[indexMonth].consultations.push({...this.entries[i],'origin':'entry'})
		}
	}

	/* ---------------------------
	Show previous year
	No input
	No output
	----------------------------*/
	prevYear(){
		if (!this.disabledLeft) {
			this.currentShownYear -= 1
			let index = this.years.findIndex(elem => elem.year == this.currentShownYear)
			this.shownMonths = this.years[index].months
			this.shownTitle = this.currentShownYear.toString()
			if (this.shownMonths[this.actualIndex].disabled) {
				this.actualIndex = this.shownMonths.findIndex(elem => !elem.disabled)
			}
			this.showDetails(this.actualIndex)
			this.disabledRight = false
			this.disabledLeft = (index == 0)
			// Recalculate the total
			this.calculateYearTotal()
		}
	}

	/* ---------------------------
	Show next year
	No input
	No output
	----------------------------*/
	nextYear(){
		if (!this.disabledRight) {
			this.currentShownYear += 1
			let index = this.years.findIndex(elem => elem.year == this.currentShownYear)
			this.shownMonths = this.years[index].months
			if (this.shownMonths[this.actualIndex].disabled) {
				const reversedShownMonths = JSON.parse(JSON.stringify(this.shownMonths)).reverse()
				let index = reversedShownMonths.findIndex(elem => !elem.disabled)
				index = reversedShownMonths.length - index - 1 
				this.actualIndex = index
			}
			this.showDetails(this.actualIndex)
			this.shownTitle = this.currentShownYear.toString()
			this.disabledRight = (index == this.years.length-1)
			this.disabledLeft = false
			// Recalculate the total
			this.calculateYearTotal()
		}
	}

	/* ---------------------------
	Month methods
	----------------------------*/

	/* ---------------------------
	Show a month consultation page
	Input
	 - month : the month to show
	No output
	----------------------------*/
	showDetails(index){
		if (this.shownMonths.length > 0){
			const month = this.shownMonths[index]
			if (!month.disabled) {
				this.consultationShow = true
				this.shownTitle = month.monthName + ' ' + month.year
				this.shownConsultations = [...month.consultations]
				// this.shownConsultations = month.consultations.map(consult => {return {...consult, 'origin': 'consultation'}})
				// const monthEntries = this.entries.filter(entry => entry.date_entry.month === month.monthNumber && entry.date_entry.year === month.year).map(entry => {return {...entry, 'origin': 'entry'}})
				// this.shownConsultations = this.shownConsultations.concat(monthEntries)
				this.sortShown()
				this.moreMenu = []
				for (var i = 0; i < this.shownElements.length; ++i) {
					this.moreMenu.push([])
					for (var j = 0; j < this.shownElements[i].values.length; ++j) {
						this.moreMenu[i].push(false)
					}
				}
				this.actualMonth = month
				this.actualIndex = index
				this.actualFee = month.fee
				this.previousFee = month.fee
			}
		}
	}

	expandFilter(){
		this.expand = !this.expand
	}


	/* ---------------------------
	Input method to accept only number and dot
	Input
	 - event : the event fired by the input
	Output
	 - The result changed if a character was not allowed
	----------------------------*/
	numberOnly(event): boolean {
		// Add the new character to a temp variable
		const newFee = Number(this.actualFee.toString() + event.key)
    	const charCode = (event.which) ? event.which : event.keyCode;
    	let result = false
    	// Check if this the temp variable is lower than 100
    	const range = newFee <= 100
    	if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      		if (charCode == 46) {
      			result = true && range
      		}else{
      			result = false
      		}
    	}else{
    		result = true && range
    	}
    	return result;
  	}

  	cancel(){
  		if (!this.loading){
  			this.actualFee = this.previousFee
  			this.disabledFee = !this.disabledFee
  		}
  	}

  	/* ---------------------------
  	Update the fee of the current month shown
  	No input
  	No output
  	----------------------------*/
  	changeFee(){
  		if (!this.loading){
	  		if (this.disabledFee) {
	  			this.disabledFee = !this.disabledFee
	  		}else{
		  		const testMonth = this.actualMonth.monthNumber.toString() + '-' + this.actualMonth.year.toString()
				const index = this.specialFees.findIndex(element => element.mois == testMonth)
				const charge = new Charge(
					this.patientService.user.id_user,
					testMonth,
					this.actualFee,
					this.today,
					this.today
				)
				if (this.patientService.demo){
					// Update where fee is located
					this.specialFees[index] = charge
			  		this.actualMonth.fee = this.actualFee
			  		this.previousFee = this.actualFee
			  		// Recalculate the total
			  		this.calculateYearTotal()
			  		this.disabledFee = !this.disabledFee
				}else{
		  			this.loading = true
					this.patientService.updateCharge(charge).subscribe((data) => {
						// Update where fee is located
						this.specialFees[index] = charge
				  		this.actualMonth.fee = this.actualFee
				  		this.previousFee = this.actualFee
				  		// Recalculate the total
				  		this.calculateYearTotal()
				  		this.success = true
				  		setTimeout(() => {
				  			this.success = false
				  			this.loading = false
				  		},1000)
				  		this.disabledFee = !this.disabledFee
					},(error) => {
				  		this.error = true
				  		setTimeout(() => {
				  			this.error = false
							this.loading = false
				  		},1000)
					})
				}
			}
  		}
  	}

  	addEntry(){
  		const dialogRef = this.dialog.open(ModalEntryComponent,{data:{'type':'create','minDate':this.patientService.user.date_creation},panelClass:'classic'});

		dialogRef.afterClosed().subscribe(result => {
			if (result.form) {
				this.loadingEntry = true
				let entry = new Entry(
					-1,
					this.patientService.user.id_user,
					result.form.type,
					result.form.title,
					Number(result.form.amount),
					DateTime.fromObject(result.form.date),
					DateTime.local(),
					DateTime.local()
				)
				if (this.patientService.demo) {
					this.addEntryResult(entry,this.patientService.dataUser['entries'].length + 1)
				}else{
					this.patientService.createEntry(entry).subscribe((data) => {
						this.addEntryResult(entry,data[0].id_entry)
					},(error) => {
						this.errorEntry = true
						setTimeout(() => {
							this.loadingEntry = false
							this.errorEntry = false
						},1000)
					})
				}
			}
		})
  	}

  	addEntryResult(entry,id_entry){
  		entry.id_entry = id_entry
		this.entries.push(entry)
		const month = entry.date_entry.month
		const year = entry.date_entry.year
		const indexYear = this.years.findIndex(element => element.year == year)
		const indexMonth = this.years[indexYear].months.findIndex(element => element.monthNumber == month)
		this.years[indexYear].months[indexMonth].consultations.push({...entry,'origin':'entry'})
		if (month === this.actualMonth.monthNumber && year === this.actualMonth.year) {
			this.shownConsultations.push({...entry,'origin':'entry'})
			const date = entry.date_entry.toFormat('dd-MM-yyyy')
			const index = this.shownElements.findIndex(elem => elem.date === date)
			if (index !== -1){
				this.moreMenu[index].push(false)
				this.shownElements[index].values.push({...entry,'origin':'entry'})
			}else{
				this.moreMenu.push([false])
				this.shownElements.push({'date':date,'values':[{...entry,'origin':'entry'}]})
			}
		}
  		this.successEntry = true
  		this.calculateYearTotal()
		setTimeout(() => {
			this.loadingEntry = false
			this.successEntry = false
		},1000)
  	}

  	sortShown(){
  		this.shownElements = []
  		for (var i = 0; i < this.shownConsultations.length; ++i) {
  			let date = null
  			if (this.shownConsultations[i].origin === 'consultation') {
  				date = this.shownConsultations[i].date_consultation
  			}else{
  				date = this.shownConsultations[i].date_entry
  			}
  			date = date.toFormat('dd-MM-yyyy')
  			const index = this.shownElements.findIndex(elem => elem.date === date)
  			if (index !== -1){
  				this.shownElements[index].values.push(this.shownConsultations[i])
  			}else{
  				this.shownElements.push({'date':date,'values':[this.shownConsultations[i]]})
  			}
  		}
  		this.shownElements = this.shownElements.sort((a,b) => {
  			return DateTime.fromFormat(a.date,'dd-MM-yyyy').toMillis() - DateTime.fromFormat(b.date,'dd-MM-yyyy').toMillis()
  		})
  	}

  	toggleMenu(indexi,indexj){
  		this.moreMenu[indexi][indexj] = !this.moreMenu[indexi][indexj]
  	}

  	updateEntry(entry,indexi,indexj){
  		this.moreMenu[indexi][indexj] = false
  		const dialogRef = this.dialog.open(ModalEntryComponent,{data:{'type':'update','minDate':this.patientService.user.date_creation,'entry':entry},panelClass:'classic'});
		dialogRef.afterClosed().subscribe(result => {
			if (result.form) {
				this.loadingEntry = true
				let entryResult = new Entry(
					entry.id_entry,
					this.patientService.user.id_user,
					result.form.type,
					result.form.title,
					Number(result.form.amount),
					DateTime.fromObject(result.form.date),
					DateTime.local(),
					DateTime.local()
				)
				if (this.patientService.demo) {
					this.updateEntryResult(entryResult)
				}else{
					this.patientService.updateEntry(entryResult).subscribe((data) => {
						this.updateEntryResult(entryResult)
					},(error) => {
						this.errorEntry = true
						setTimeout(() => {
							this.loadingEntry = false
							this.errorEntry = false
						},1000)
					})
				}
			}
		})
  	}

  	updateEntryResult(entry){
  		const index = this.entries.findIndex(element => element.id_entry === entry.id_entry)
  		this.entries[index] = entry
  		const indexShownConsultations = this.shownConsultations.findIndex(element => element.origin === 'entry' && element.id_entry === entry.id_entry)
  		this.shownConsultations[indexShownConsultations] = {...entry,'origin':'entry'}
  		const month = entry.date_entry.month
		const year = entry.date_entry.year
		const indexYear = this.years.findIndex(element => element.year == year)
		const indexMonth = this.years[indexYear].months.findIndex(element => element.monthNumber == month)
		const indexConsultation = this.years[indexYear].months[indexMonth].consultations.findIndex(element => element.id_entry === entry.id_entry)
		this.years[indexYear].months[indexMonth].consultations[indexConsultation] = {...entry,'origin':'entry'}
  		this.sortShown()
  		this.successEntry = true
  		this.calculateYearTotal()
		setTimeout(() => {
			this.loadingEntry = false
			this.successEntry = false
		},1000)
  	}

  	deleteEntry(entry,indexi,indexj){
  		this.loadingEntry = true
  		this.moreMenu[indexi][indexj] = false
  		this.patientService.showModalInformation({
			'title':'Suppression entrée',
			'content':'<p>Êtes-vous sûr de vouloir supprimer l\'entrée ?</p>',
			'confirm':'Confirmer',
			'cancel':'Annuler',
		}).subscribe(result => {
			if (result) {
		  		if (this.patientService.demo) {
					this.deleteEntryResult(entry)
				}else{
					this.patientService.deleteEntry(entry.id_entry).subscribe((data) => {
						this.deleteEntryResult(entry)
					},(error) => {
						this.loadingEntry = false
						this.patientService.showModalInformation({
							'title':'Erreur',
							'content':'<p>Une erreur est survenue lors de la suppression</p>',
							'cancel':'Ok',
						})
					})
				}
			}else{
				this.loadingEntry = false
			}
		})
  	}

  	deleteEntryResult(entry){
  		this.loadingEntry = false
  		const date = entry.date_entry.toFormat('dd-MM-yyyy')
  		const indexShownConsultations = this.shownConsultations.findIndex(element => {if (element.origin === 'entry') element.id_entry === entry.id_entry})
  		this.shownConsultations.splice(indexShownConsultations,1)
		const index = this.shownElements.findIndex(elem => elem.date === date)
		if (this.shownElements[index].values.length > 1){
			const indexElement = this.shownElements[index].values.findIndex(elem => elem.id_entry === entry.id_entry)
			this.shownElements[index].values.splice(indexElement,1)
		}else{
			this.shownElements.splice(index,1)
		}
  		const indexEntry = this.entries.findIndex(element => element.id_entry === entry.id_entry)
  		this.entries.splice(indexEntry,1)
  		this.calculateYearTotal()
  	}

  	downloadCSV(){
  		let csv = ["Date,Objet,Débit,Crédit"]

  		for (var i = 0; i < this.shownElements.length; ++i) {
  			for (var j = 0; j < this.shownElements[i].values.length; ++j) {
  				let row = [this.shownElements[i].date]
  				if (this.shownElements[i].values[j].origin === 'entry') {
  					row.push(this.shownElements[i].values[j].title)
  					if (this.shownElements[i].values[j].type === 'minus') {
  						row.push(this.shownElements[i].values[j].amount)
  						row.push('')
  					}
  				}else{
  					row.push('Consultation')
  					row.push('')
  					row.push(this.shownElements[i].values[j].total)
  				}
  				csv.push(row.join(','))
  			}
  		}

  		const BOM = new Uint8Array([0xEF,0xBB,0xBF]);
  		let csvFile = new Blob([BOM,csv.join('\n')],{type: 'text/csv'})
  		let downloadLink = document.createElement('a');
  		downloadLink.download = this.actualMonth.monthNumber + '_' + this.actualMonth.year + '.csv'
  		downloadLink.href = window.URL.createObjectURL(csvFile)
  		downloadLink.style.display = 'none'
  		document.body.appendChild(downloadLink)
  		downloadLink.click()
  		downloadLink.remove()
  	}
}