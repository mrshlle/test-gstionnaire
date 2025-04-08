/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Component, OnInit, OnDestroy, ViewChildren, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime, Interval, Duration } from 'luxon'
import { interval } from 'rxjs';

/* -----------------------------------------------------------------------------------------------------------------
Validators imports
----------------------------------------------------------------------------------------------------------------- */
import { DateValidator } from '../validators/date.validator'
import { SuperiorDateValidator } from '../validators/superior-date.validator'

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from '../services/patient.service';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Evenement } from '../models/Evenement.models';
import { Patient } from '../models/Patient.models';

import { ModalUpdateRecurrenceComponent } from '../modals/modal-update-recurrence/modal-update-recurrence.component'

/* ---------------------------
CalendarDay creation, object for days shown in calendar
----------------------------*/
export interface CalendarDay{
	day: number;
	month: number;
	year: number;
	dayOfWeek: number;
	dayOfMonth: boolean;
	weekEnd: boolean;
	today: boolean;
	selected: boolean;
	events: boolean;
}

@Component({
    selector: 'app-accueil',
    templateUrl: './accueil.component.html',
    styleUrls: ['./accueil.component.css'],
    standalone: false
})
export class AccueilComponent implements OnInit, OnDestroy{

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	@ViewChildren('dateInput') dateInputs;
	@ViewChild('hours') hours;

	clickListener

	dateToday = DateTime.local()

	currentDate = DateTime.local();
	currentSelectedDay: number = -1;

	days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
	fullDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
	months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
	year: number;

	date: CalendarDay[] = [];
	week: CalendarDay[] = [];
	yearDate: CalendarDay[][] = [];
	evenements: Evenement[] = [];
	evenementsWithoutRecurrence: Evenement[] = []
	dayEvent: Evenement[] = [];
	weekEvent: Evenement[][] = [];
	patients: Patient[];

	newEvent: boolean = false
	updateEventElement: boolean = false

	formEvent: FormGroup;

	heures:string[] = [];
	heuresFin:string[] = [];

	tempForm = null

	currentEvent = null

	loading: boolean = false
	error: boolean = false

	namePatient = ""

	disableRemove: boolean = true

	type: string = "weeks"

	shownDays: any[] = [];
	shownEvents: any[] = [];
	shownEvent: any = null;
	shownEventsDaysHours: any = {}
	expandedDay: number = -1

	shownEventsMultipleDays: any[] = [];
	shownEventsMultipleDaysDays: any = {}
	shownEventsMultipleDaysDaysMaxLength: number = -1

	shownEventsMonth: any[] = []
	shownEventsMonthDays: any[] = []
	shownEventsMonthDaysMaxLength: number[] = []
	shownEventsPreviewMonth: any[] = []
	shownEventsPreviewMonthI:number = -1
	shownEventsPreviewMonthJ:number = -1

	collapseMultiple: boolean = false

	recurrence: boolean = false
	ending: string = "0"

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(public patientService: PatientService,
				private renderer: Renderer2,
				private dialog: MatDialog){
		this.clickListener = this.renderer.listen('window','click',(e) => {
			if (this.shownEvent) {
				if (e.target.id !== 'shown-event-element' && 
					e.target.id !== 'event-element' && 
					e.target.id !== 'sub-shown-event-element' && 
					e.target.id !== 'sub-event-element' &&
					e.target.id !== 'preview-month-events sub-event-element'
				) {
					this.shownEvent = null
				}
			}
			if (this.shownEventsPreviewMonth.length > 0) {
				if (e.target.id !== 'preview-month-events' && e.target.id !== 'preview-month-events sub-event-element') {
					this.shownEventsPreviewMonth = []
				}
			}
		})
	}

	ngOnDestroy(){
		this.clickListener()
	}

	/* ---------------------------

	**Angular lifecycle hook method**

	Do stuff when component is load
	Get notes and events of user, then initiate the calendar
	----------------------------*/
	ngOnInit(){

		setInterval(() => {
			this.dateToday = DateTime.local()
		},1)
		this.formEvent = new FormGroup({
			patient: new FormControl(''),
			entitled: new FormControl('',Validators.required),
		  	start: new FormControl('',Validators.required),
		  	end: new FormControl('',Validators.required),
		  	date: new FormGroup({
		  		day: new FormControl('',Validators.required),
		  		month: new FormControl('',Validators.required),
		  		year: new FormControl('',Validators.required)
		  	}),
		  	end_date: new FormGroup({
		  		day: new FormControl('',Validators.required),
		  		month: new FormControl('',Validators.required),
		  		year: new FormControl('',Validators.required)
		  	}),
		  	description: new FormControl(''),
		  	recurrence: new FormControl(false),
		  	repeat_number: new FormControl({value:1,disabled:true},Validators.min(1)),
		  	repeat_period: new FormControl({value:"0",disabled:true}),
		  	end_recurrence: new FormControl({value:"0",disabled:true}),
		  	value_date: new FormGroup({
		  		day: new FormControl({value:'',disabled:true}),
		  		month: new FormControl({value:'',disabled:true}),
		  		year: new FormControl({value:'',disabled:true})
		  	}),
		  	occurrence: new FormControl({value:1,disabled:true}, Validators.min(1))
		});
		this.formEvent.get('date').setValidators(DateValidator("day","month","year",true))
		this.formEvent.get('end_date').setValidators(DateValidator("day","month","year",true))
		this.formEvent.setValidators(SuperiorDateValidator("end_date","date"))
		// Generate all the period between 0 and 24, with an interval of 15 minutes
	  	for(var i=0; i<24; i++) {
			for(var j=0; j<4; j++) {
		  		this.heures.push(i + ":" + (j===0 ? "00" : 15*j) );
			}
	  	}
		this.heures.push("24:00")
		this.heuresFin = [].concat.apply([],this.heures);
		// Get events from database
		if (this.patientService.demo){
			this.evenements = this.patientService.dataUser['events']
			this.patients = this.patientService.dataUser['patients']
			this.generateCalendar();
		}else{
			if ('events' in this.patientService.dataUser){
				this.evenements = this.patientService.dataUser['events']
				this.generateCalendar();
			}else{
				this.patientService.getEvenements(this.patientService.user.id_user).subscribe(
					(data: any) => {
						for (var i = 0; i < data.length; ++i) {
							this.evenements.push(this.patientService.instanceEvenement(data[i]))
						}
						this.patientService.dataUser['events'] = this.evenements
					},
					(error) => { 
						this.patientService.showModalInformation({
							'title':'Erreur lors de la récupération',
							'content':'<p>Impossible de récupérer vos évènements<br>Merci de réessayez ultérieurement</p>',
							'cancel':'Ok',
						})
					},
					() => {
						// Once it's finished, generate the calendar
						this.generateCalendar();
					}
				);
			}
			// Get the patients linked to this user
			if ('patients' in this.patientService.dataUser){
				this.patients = this.patientService.dataUser['patients']
			}else{
				this.patientService.getPatients(this.patientService.user.id_user).subscribe((data: any) => {
					this.patients = []
					for (var i = 0; i < data.length; ++i) {
						this.patients.push(this.patientService.instancePatient(data[i]))
					}
					this.patientService.dataUser['patients'] = this.patients
				})
			}
		}
		let interval = setInterval(() => {
    		if (this.hours) {
      			clearInterval(interval);
				this.hours.nativeElement.scrollTop = this.dateToday.hour*100 + (100/60)*this.dateToday.minute + 10 - (this.hours.nativeElement.clientHeight/2);
    		}
  		}, 200);
	}

	/* -------------------------------------------------------------
	Calendar methods
	------------------------------------------------------------- */

	/* ---------------------------
	Create all the days of the month
	No input
	No output
	----------------------------*/
	generateCalendar(){
		this.checkRecurrences()
		// Reset the year in case it changed
		this.year = this.currentDate.year;
		let date: CalendarDay[] = [];
		// Get the first day (Mon, Tue, Wed ...) from 1 to 7
		let firstOfMonth = this.currentDate.startOf('month').weekday-1;
		if (firstOfMonth === 0) {
			firstOfMonth = 7
		}
		// Get the first day that should be shown on the first monday of the first row, even if it's from previous month
		const firstDayOfGrid = this.currentDate.startOf('month').minus({days:firstOfMonth});
		// Acc is used to know if it's the week-end
		let acc = 1;
		// Go from 0 to 42 because the grid is 6 rows of 7 days
		for (var i = 0; i < 42; i++) {
			// Initiate the i th day
			let calendarDay: CalendarDay = { day: null, month: null, year: null, dayOfWeek: null, dayOfMonth: null, weekEnd: null, today: null, selected: null, events: false};
			// Add to the start of the grid, the i th number, corresponding of the current day
			const day = firstDayOfGrid.plus({days:i});
			// Interval allows to know if the day is in the current month
			const interval = Interval.fromDateTimes(this.currentDate.startOf('month'), this.currentDate.endOf('month'))
			const dayOfMonth = interval.contains(day)
			const weekEnd = (((acc+1)%7 == 0) || (acc%7 == 0))
			// Set all the day values
			calendarDay.day = day.day;
			calendarDay.month = day.month;
			calendarDay.year = day.year;
			calendarDay.dayOfWeek = (acc-1)%7;
			calendarDay.dayOfMonth = dayOfMonth;
			calendarDay.weekEnd = weekEnd;
			calendarDay.today = ((this.dateToday.day == day.day) && (this.dateToday.month == day.month) && (this.dateToday.year == day.year));
			calendarDay.selected = false;
			// Check for the events to see if there is some for the day
			if(this.evenements.find(event => {
				let eventDays = []
				let eventDay = event.date_debut
				while (eventDay.toMillis() !== event.end_date.toMillis()) {
					eventDays.push(eventDay.day + '-' + eventDay.month + '-' + eventDay.year)
					eventDay = eventDay.plus({day:1})
				}
				eventDays.push(eventDay.day + '-' + eventDay.month + '-' + eventDay.year)
				return eventDays.includes(day.day + '-' + day.month + '-' + day.year)
			})){
				calendarDay.events = true;
			}
			date.push(calendarDay);
			acc += 1;
		}
		this.date = date;
		// Reset the selected day with the current one selected, but in the month shown 
		let index = this.date.findIndex(day => (day.day == this.currentDate.day) && (day.dayOfMonth))
		this.selectDay(index)
	}

	checkRecurrences(){
		this.evenements = this.evenements.filter(elem => {
			if (!elem['id_rec']) {
				return elem
			}else{
				if (elem['id_rec'] === -1){
					return elem
				}
			}
		})
		let recurrenceEvents = []
		for (var i = 0; i < this.evenements.length; ++i) {
			if (this.evenements[i].recurrence) {
				recurrenceEvents.push(this.evenements[i])
			}
		}
		for (var i = 0; i < recurrenceEvents.length; ++i) {
			recurrenceEvents[i]['id_rec'] = -1
			let endDate = DateTime.local()
			const duration = {}
			const periods = ['days','weeks','months','years']
			duration[periods[Number(recurrenceEvents[i].repeat_period)]] = Number(recurrenceEvents[i].repeat_number)
			if (recurrenceEvents[i].end_recurrence === "0"){
				endDate = this.currentDate.plus({month:2})
			}else if (recurrenceEvents[i].end_recurrence === "1"){
				endDate = recurrenceEvents[i].until_date
			}else if (recurrenceEvents[i].end_recurrence === "2"){
				const endDuration = {}
				endDuration[periods[Number(recurrenceEvents[i].repeat_period)]] = recurrenceEvents[i].occurrence*Number(recurrenceEvents[i].repeat_number)
				endDate = recurrenceEvents[i].date_debut.plus(Duration.fromObject(endDuration))
			}
			let nextEventDate = recurrenceEvents[i].date_debut.plus(Duration.fromObject(duration))
			let nextEventEndDate = recurrenceEvents[i].end_date.plus(Duration.fromObject(duration))
			while (nextEventDate.toMillis() <= endDate.toMillis()) {
				let recEvent = {...recurrenceEvents[i]}
				recEvent.date_debut = nextEventDate
				recEvent.end_date = nextEventEndDate
				recEvent['id_rec'] = recEvent.id_evenement + '-' + nextEventDate.toMillis()
				const indexSpecial = recurrenceEvents[i].special_date.findIndex(elem => elem['id_rec'] === recEvent['id_rec'])
				if (indexSpecial !== -1) {
					let recurrentEvent = recurrenceEvents[i].special_date[indexSpecial]
					recurrentEvent.date_debut = DateTime.fromISO(recurrentEvent.date_debut)
					recurrentEvent.end_date = DateTime.fromISO(recurrentEvent.end_date)
					recurrentEvent.until_date = DateTime.fromISO(recurrentEvent.until_date)
					this.evenements.push(recurrentEvent)
				}else{
					const index = this.evenements.findIndex(elem => elem['id_rec'] === recEvent['id_rec'])
					if (index === -1){
						this.evenements.push(recEvent)
					}
				}
				nextEventDate = nextEventDate.plus(Duration.fromObject(duration))
				nextEventEndDate = nextEventEndDate.plus(Duration.fromObject(duration))
			}
		}
	}

	toggle(){
		this.collapseMultiple = !this.collapseMultiple
	}

	/* ---------------------------
	Add a duration to the calendar
	No input
	No output
	----------------------------*/
	next(type){
		const duration = {}
		duration[type] = 1
		this.currentDate = this.currentDate.plus(Duration.fromObject(duration));
		this.generateCalendar();
	}

	/* ---------------------------
	Exactly same as `next()` but removing
	No input
	No output
	----------------------------*/
	prev(type){
		const duration = {}
		duration[type] = 1
		this.currentDate = this.currentDate.minus(Duration.fromObject(duration));
		this.generateCalendar();
	}

	/* ---------------------------
	Set the day to today
	No input
	No output
	----------------------------*/
	today(){
		if (!(this.currentDate.day === this.dateToday.day && this.currentDate.month === this.dateToday.month && this.currentDate.year === this.dateToday.year)) {
			this.currentDate = DateTime.local();
			// Regenerate the calendar in case the month has changed
			this.generateCalendar();
		}
	}

	setType(type){
		this.type = type
		this.generateShownDays()
	}

	/* ---------------------------
	Set the day to the day that is selected in the calendar
	Input 
	 - index : the index of the day in the array of `this.date` created in `this.generateCalendar()`
	No output
	----------------------------*/
	selectDay(index){
		if (!this.date[index].dayOfMonth){
			let select = this.date[index].year+'-'+(this.date[index].month)+'-'+this.date[index].day;
			this.date[index].selected = true;
			this.currentDate = DateTime.fromFormat(select,"yyyy-M-d")
			this.generateCalendar()
		}else{
			this.currentSelectedDay = index;
			let indexTest = -1;
			// Check if a day is already selected to change it's value
			indexTest = this.date.findIndex(day => day.selected);
			if(indexTest != -1){
				this.date.find(day => day.selected).selected = false;
			}
			// Create date of selected day, in good format
			let select = this.date[index].year+'-'+(this.date[index].month)+'-'+this.date[index].day;
			this.date[index].selected = true;
			this.currentDate = DateTime.fromFormat(select,"yyyy-M-d")
			this.formEvent.get('date').get('day').patchValue(this.currentDate.day)
			this.formEvent.get('date').get('month').patchValue(this.currentDate.month)
			this.formEvent.get('date').get('year').patchValue(this.currentDate.year)
			this.formEvent.get('end_date').get('day').patchValue(this.currentDate.day)
			this.formEvent.get('end_date').get('month').patchValue(this.currentDate.month)
			this.formEvent.get('end_date').get('year').patchValue(this.currentDate.year)
			this.formEvent.get('value_date').get('day').patchValue(this.currentDate.day)
			this.formEvent.get('value_date').get('month').patchValue(this.currentDate.month)
			this.formEvent.get('value_date').get('year').patchValue(this.currentDate.year)
		}
		this.generateShownDays()
	}

	expandDay(index){
		this.expandedDay = index
	}

	collapseDay(event){
		event.target.parentElement.scrollTop = 0
		this.expandedDay = -1
	}

	generateShownDays(){
		const index = this.date.findIndex(day => (day.day == this.currentDate.day) && (day.dayOfMonth))
		if (this.type === 'weeks') {
			this.shownEvents = []
			this.shownEventsMultipleDays = []
			this.shownDays = []
			this.shownEventsDaysHours = {}
			this.shownEventsMultipleDaysDays = {}
			this.shownEventsMultipleDaysDaysMaxLength = 0
			const weekDay = this.currentDate.weekday
			const first = index-weekDay+1
			const last = first+7
			let days = []
			let months = []
			let years = []
			for (var i = first; i < last; ++i) {
				this.shownDays.push(this.date[i])
				days.push(this.date[i].day)
				months.push(this.date[i].month)
				years.push(this.date[i].year)
				const day = this.date[i].day.toString() + this.date[i].month.toString() + this.date[i].year.toString()
				let hoursObject = {}
				for(var k=0; k<24; k++) {
					for(var j=0; j<4; j++) {
						const hour = k + ":" + (j===0 ? "00" : 15*j)
				  		hoursObject[hour + 'end'] = [-1]
				  		hoursObject[hour + 'start'] = [-1]
					}
			  	}
			  	delete hoursObject['0:00end']
				hoursObject['24:00end'] = [-1]
				this.shownEventsDaysHours[day] = hoursObject
			}
			let clearDays = []
			for (var i = 0; i < days.length; ++i) {
				clearDays.push(days[i] + '-' + months[i] + '-' + years[i])
				this.shownEventsMultipleDaysDays[days[i].toString() + months[i].toString() + years[i].toString()] = [-1]
			}
			const usedEvents = this.evenements.filter(event =>
				clearDays.includes(event.date_debut.day + '-' + event.date_debut.month + '-' + event.date_debut.year) && (event.date_debut.toMillis() === event.end_date.toMillis())
			)
			const usedEventsMultipleDays = this.evenements.filter(event => {
				if (event.date_debut.toMillis() !== event.end_date.toMillis()){
					let eventDays = []
					let day = event.date_debut
					while (day.toMillis() !== event.end_date.toMillis()) {
						eventDays.push(day.day + '-' + day.month + '-' + day.year)
						day = day.plus({day:1})
					}
					eventDays.push(day.day + '-' + day.month + '-' + day.year)
					for (var i = 0; i < clearDays.length; ++i) {
						if (eventDays.includes(clearDays[i])) {
							return true
						}
					}
					return false
				}else{
					return false
				}	
			})
			for (var i = 0; i < usedEventsMultipleDays.length; ++i) {
				const indexEvent = this.generateDayEvents(usedEventsMultipleDays[i],this.shownEventsMultipleDaysDays)
				if (indexEvent > this.shownEventsMultipleDaysDaysMaxLength) {
					this.shownEventsMultipleDaysDaysMaxLength = indexEvent
				}
				this.shownEventsMultipleDays.push({...this.generateDataForMultipleEvent(usedEventsMultipleDays[i],clearDays),'eventIndex':indexEvent})
			}
			for (var i = 0; i < usedEvents.length; ++i) {
				const indexEvent = this.generateHourEvents(usedEvents[i])
				this.shownEvents.push({...this.generateDataForEvent(usedEvents[i]),'eventIndex':indexEvent})
			}
		}else{
			this.shownEventsMonthDays = []
			this.shownEventsMonth = []
			for (var i = 0; i < 6; ++i) {
				this.shownEventsMonthDays.push({})
				this.shownEventsMonth.push([])
				let allDays = []
				for (var j = 0; j < 7; ++j) {
					allDays.push(this.date[i*7+j].day + '-' + this.date[i*7+j].month + '-' + this.date[i*7+j].year)
					this.shownEventsMonthDays[i][this.date[i*7+j].day.toString() + this.date[i*7+j].month.toString() + this.date[i*7+j].year.toString()] = [-1]
				}
				const usedEvents = this.evenements.filter(event => {
					if (event.date_debut.toMillis() !== event.end_date.toMillis()){
						let eventDays = []
						let day = event.date_debut
						while (day.toMillis() !== event.end_date.toMillis()) {
							eventDays.push(day.day + '-' + day.month + '-' + day.year)
							day = day.plus({day:1})
						}
						eventDays.push(day.day + '-' + day.month + '-' + day.year)
						for (var j = 0; j < allDays.length; ++j) {
							if (eventDays.includes(allDays[j])) {
								return true
							}
						}
						return false
					}else{
						return allDays.includes(event.date_debut.day + '-' + event.date_debut.month + '-' + event.date_debut.year)
					}	
				})
				for (var j = 0; j < usedEvents.length; ++j) {
					const indexEvent = this.generateDayEvents(usedEvents[j],this.shownEventsMonthDays[i])
					this.shownEventsMonth[i].push({...this.generateDataForMultipleEvent(usedEvents[j],allDays),'eventIndex':indexEvent})
				}
			}
		}
	}

	generateHourEvents(event){
		let found = false
		let finalId = -1
		const [hours, maxLength] = this.getEventHours(event)
		const day = event.date_debut.day.toString() + event.date_debut.month.toString() + event.date_debut.year.toString()
		for (var i = 0; i < maxLength; ++i) {
			if (found) break;
			for (var j = 0; j < hours.length; ++j) {
				if (this.shownEventsDaysHours[day][hours[j]].length >= i) {
					if (this.shownEventsDaysHours[day][hours[j]][i] !== -1) break;
				}else{
					for (var k = this.shownEventsDaysHours[day][hours[j]].length; k < i; ++k) {
						this.shownEventsDaysHours[day][hours[j]].push(-1)
					}
				}
				if (j === hours.length-1) {
					for (var l = 0; l < hours.length; ++l) {
						this.shownEventsDaysHours[day][hours[l]][i] = event.id_evenement
					}
					found = true
					finalId = i
				}
			}
		}
		if (!found) {
			for (var i = 0; i < hours.length; ++i) {
				if (this.shownEventsDaysHours[day][hours[i]].length !== maxLength) {
					for (var m = this.shownEventsDaysHours[day][hours[i]].length; m < maxLength; ++m) {
						this.shownEventsDaysHours[day][hours[i]].push(-1)
					}
				}
				this.shownEventsDaysHours[day][hours[i]].push(event.id_evenement)
			}
			finalId = maxLength
		}
		return finalId
	}

	generateDayEvents(event,listEventsDays){
		let found = false
		let finalId = -1
		const [days, maxLength] = this.getEventDays(event,listEventsDays)
		for (var i = 0; i < maxLength; ++i) {
			if (found) break;
			for (var j = 0; j < days.length; ++j) {
				if (listEventsDays[days[j]].length >= i) {
					if (listEventsDays[days[j]][i] !== -1) break;
				}else{
					for (var k = listEventsDays[days[j]].length; k < i; ++k) {
						listEventsDays[days[j]].push(-1)
					}
				}
				if (j === days.length-1) {
					for (var l = 0; l < days.length; ++l) {
						listEventsDays[days[l]][i] = {id:event.id_evenement,rec:event.recurrence,id_rec:event['id_rec']}
					}
					found = true
					finalId = i
				}
			}
		}
		if (!found) {
			for (var i = 0; i < days.length; ++i) {
				if (listEventsDays[days[i]].length !== maxLength) {
					for (var m = listEventsDays[days[i]].length; m < maxLength; ++m) {
						listEventsDays[days[i]].push(-1)
					}
				}
				listEventsDays[days[i]].push({id:event.id_evenement,rec:event.recurrence,id_rec:event['id_rec']})
			}
			finalId = maxLength
		}
		return finalId
	}

	getEventHours(event): [any[], number] {
		const firstHour = Number(event.heure_debut.split(':')[0])
		const firstHourFirstQuarter = Number(event.heure_debut.split(':')[1])
		const lastHour = Number(event.heure_fin.split(':')[0])
		const lastHourLastQuarter = Number(event.heure_fin.split(':')[1])
		const quarters = [0,15,30,45]
		let hours = []
		for (var i = firstHour; i <= lastHour; ++i) {
			for (var j = 0; j < 4; ++j) {
				const hour = i + ":" + (j === 0 ? "00" : quarters[j])
				if (firstHour === lastHour){
					if (quarters[j] >= firstHourFirstQuarter && quarters[j] <= lastHourLastQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else if (i === firstHour) {
					if (quarters[j] >= firstHourFirstQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else if (i === lastHour){
					if (quarters[j] <= lastHourLastQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else{
					hours.push(hour + 'end')
					hours.push(hour + 'start')
				}
			}
		}
		hours.splice(hours.indexOf(firstHour + ':' + (firstHourFirstQuarter === 0 ? "00" : firstHourFirstQuarter) + 'end'),1)
		hours.splice(hours.indexOf(lastHour + ':' + (lastHourLastQuarter === 0 ? "00" : lastHourLastQuarter) + 'start'),1)
		const day = event.date_debut.day.toString() + event.date_debut.month.toString() + event.date_debut.year.toString()
		let maxLength = -1
		for (var i = 0; i < hours.length; ++i) {
			let ids = this.shownEventsDaysHours[day][hours[i]]
			if (ids.length > maxLength) {
				maxLength = ids.length
			}
		}
		return [hours, maxLength]
	}

	getEventDays(event,listEventsDays): [any[], number] {
		let days = []
		let day = event.date_debut
		while (day.toMillis() !== event.end_date.toMillis()) {
			const stringDay = day.day.toString() + day.month.toString() + day.year.toString()
			if (stringDay in listEventsDays){
				days.push(day.day.toString() + day.month.toString() + day.year.toString())
			}
			day = day.plus({day:1})
		}
		const stringDay = day.day.toString() + day.month.toString() + day.year.toString()
		if (stringDay in listEventsDays){
			days.push(day.day.toString() + day.month.toString() + day.year.toString())
		}
		let maxLength = -1
		for (var i = 0; i < days.length; ++i) {
			let ids = listEventsDays[days[i]]
			if (ids.length > maxLength) {
				maxLength = ids.length
			}
		}
		return [days, maxLength]
	}

	generateDataForEvent(event){
		const eventDay = event.date_debut.weekday-1
		const eventStartHour = parseFloat(event.heure_debut.replace(/.15/g,'.25').replace(/.30/g,'.50').replace(/.45/g,'.75').replace(':','.'))
		const eventEndHour = parseFloat(event.heure_fin.replace(/.15/g,'.25').replace(/.30/g,'.50').replace(/.45/g,'.75').replace(':','.'))
		const height = eventEndHour-eventStartHour
		return {...event,'eventDay':eventDay,'eventStartHour':eventStartHour,'eventHeight':height,'multiple':false}
	}

	generateDataForMultipleEvent(event,days){
		let startingDay = event.date_debut.weekday-1
		let endingDay = event.end_date.weekday-1
		const includingStart = days.includes(event.date_debut.day + '-' + event.date_debut.month + '-' + event.date_debut.year)
		const includingEnd = days.includes(event.end_date.day + '-' + event.end_date.month + '-' + event.end_date.year)
		let width = 7
		if (includingStart && includingEnd){
			width = endingDay - startingDay + 1
		}else if (includingStart && !includingEnd) {
			width = 7 - startingDay
		}else if (!includingStart && includingEnd) {
			width = endingDay + 1
		}
		if (!includingStart) {
			startingDay = 0
		}
		if (!includingEnd) {
			endingDay = 6
		}
		return {...event, 'startingDay': startingDay, 'endingDay': endingDay, 'includingStart': includingStart, 'includingEnd': includingEnd, 'width': width, 'multiple': true}
	}

	showMonthEvents(i,j){
		this.shownEventsPreviewMonth = []
		this.shownEventsPreviewMonthI = i
		this.shownEventsPreviewMonthJ = j
		const ids = this.shownEventsMonthDays[i][this.date[i*7+j].day.toString() + this.date[i*7+j].month.toString() + this.date[i*7+j].year.toString()]
		for (var k = 0; k < ids.length; ++k) {
			if (ids[k] !== -1) {
				if (ids[k].rec){
					this.shownEventsPreviewMonth.push(this.evenements.find(event => event.id_evenement === ids[k].id && event['id_rec'] === ids[k].id_rec))
				}else{
					this.shownEventsPreviewMonth.push(this.evenements.find(event => event.id_evenement === ids[k].id))
				}
			}
		}
	}

	previewEvent(event,element,type){
		let newEvent = {...event}
		if (event.pid_patient && event.id_patient) {
			newEvent['record'] = this.patients.find(elem => elem.id_patient === event.pid_patient)
		}
		if (type === 0) {
			this.shownEvent = {...newEvent,type:0,clientX:element.clientX.toString() + 'px',clientY:element.clientY.toString() + 'px'}
		}else if (type === 1) {
			this.shownEvent = {...newEvent,type:1,clientX:element.clientX.toString() + 'px',clientY:element.clientY.toString() + 'px'}
		}else if (type === 2) {
			const startDate = newEvent.date_debut.toMillis()
			const endDate = newEvent.end_date.toMillis()
			this.shownEvent = {...newEvent,type:(startDate === endDate ? 0 : 1),clientX:element.clientX.toString() + 'px',clientY:element.clientY.toString() + 'px'}
		}
	}

	cancelPreview(){
		this.shownEvent = null
	}

	/* -------------------------------------------------------------
	Events methods
	------------------------------------------------------------- */

	addEvent(){
		this.newEvent = true
	}

	cancelEvent(){
		this.newEvent = false
		this.updateEventElement = false
		this.loading = false
		this.ending = "0"
		this.formEvent.reset()
		this.formEvent.get('date').get('day').patchValue(this.currentDate.day)
		this.formEvent.get('date').get('month').patchValue(this.currentDate.month)
		this.formEvent.get('date').get('year').patchValue(this.currentDate.year)
		this.formEvent.get('end_date').get('day').patchValue(this.currentDate.day)
		this.formEvent.get('end_date').get('month').patchValue(this.currentDate.month)
		this.formEvent.get('end_date').get('year').patchValue(this.currentDate.year)
		this.formEvent.get('recurrence').patchValue(false)
		this.formEvent.get('repeat_number').patchValue(1)
		this.formEvent.get('repeat_period').patchValue("0")
		this.formEvent.get('end_recurrence').patchValue("0")
		this.formEvent.get('value_date').get('day').patchValue(this.currentDate.day)
		this.formEvent.get('value_date').get('month').patchValue(this.currentDate.month)
		this.formEvent.get('value_date').get('year').patchValue(this.currentDate.year)
		this.formEvent.get('occurrence').patchValue(1)
		this.formEvent.get('repeat_number').disable();
		this.formEvent.get('repeat_period').disable();
		this.formEvent.get('end_recurrence').disable();
		this.formEvent.get('value_date').get('day').disable();
		this.formEvent.get('value_date').get('month').disable();
		this.formEvent.get('value_date').get('year').disable();
		this.formEvent.get('occurrence').disable();
	}

	createEvent(){
		if (this.formEvent.valid) {
			this.loading = true
	  		let id = -1
	  		const recurrence = this.formEvent.get('recurrence').value
	  		const end_recurrence = this.formEvent.get('end_recurrence').value
	  		let until_date = DateTime.local()
	  		if (recurrence && end_recurrence === '1'){
	  			until_date = DateTime.fromObject({
					'day':this.formEvent.get('value_date').get('day').value,
					'month':this.formEvent.get('value_date').get('month').value,
					'year':this.formEvent.get('value_date').get('year').value
				})
	  		}
			let event = new Evenement(
				id,
				this.patientService.user.id_user,
				Number(this.formEvent.get('patient').value),
				Number(this.formEvent.get('patient').value),
				this.formEvent.get('entitled').value,
				this.formEvent.get('description').value,
				this.formEvent.get('start').value,
				this.formEvent.get('end').value,
				DateTime.fromObject({
					'day':this.formEvent.get('date').get('day').value,
					'month':this.formEvent.get('date').get('month').value,
					'year':this.formEvent.get('date').get('year').value
				}),
				DateTime.fromObject({
					'day':this.formEvent.get('end_date').get('day').value,
					'month':this.formEvent.get('end_date').get('month').value,
					'year':this.formEvent.get('end_date').get('year').value
				}),
				recurrence,
				this.formEvent.get('repeat_number').value,
				this.formEvent.get('repeat_period').value,
				[],
				end_recurrence,
				until_date,
				this.formEvent.get('occurrence').value,
				this.dateToday,
				this.dateToday
			)
			if (this.patientService.demo){
				this.createEvenementResult(event,this.patientService.dataUser['events'].length+1)
			}else{
				this.patientService.createEvenement(event).subscribe((data)=>{
					this.createEvenementResult(event,data[0].id_event)
					this.loading = false
				},(error)=>{
					this.error = true
					setTimeout(() => {
						this.loading = false
						this.error = false
					},2000)
				})
			}
		}
	}

	createEvenementResult(event,id_event){
		// The query returns the id of the created event
		event.id_evenement = id_event
		let days = []
		let months = []
		let years = []
		this.evenements.push(event)
		this.patientService.dataUser['events'] = this.evenements
		this.generateCalendar()      	
		this.cancelEvent()
	}

	showEvent(event){
		this.shownEvent = null
		this.newEvent = true
		this.updateEventElement = true
		this.currentEvent = event
		this.disableRemove = (event.pid_patient === null || event.id_patient === null || event.id_patient === '')
		if (event.pid_patient) {
			this.formEvent.get('patient').patchValue(event.id_patient.toString())
		}else{
			this.formEvent.get('patient').patchValue(null)
		}
		this.formEvent.get('entitled').patchValue(event.titre)
		this.formEvent.get('description').patchValue(event.note)
		this.formEvent.get('start').patchValue(event.heure_debut)
		this.formEvent.get('end').patchValue(event.heure_fin)
		this.formEvent.get('date').get('day').patchValue(event.date_debut.day)
		this.formEvent.get('date').get('month').patchValue(event.date_debut.month)
		this.formEvent.get('date').get('year').patchValue(event.date_debut.year)
		this.formEvent.get('end_date').get('day').patchValue(event.end_date.day)
		this.formEvent.get('end_date').get('month').patchValue(event.end_date.month)
		this.formEvent.get('end_date').get('year').patchValue(event.end_date.year)
		this.formEvent.get('recurrence').patchValue(event.recurrence)
		this.formEvent.get('repeat_number').patchValue(event.repeat_number)
		this.formEvent.get('repeat_period').patchValue(event.repeat_period)
		this.formEvent.get('end_recurrence').patchValue(event.end_recurrence)
		this.formEvent.get('value_date').get('day').patchValue(event.until_date.day)
		this.formEvent.get('value_date').get('month').patchValue(event.until_date.month)
		this.formEvent.get('value_date').get('year').patchValue(event.until_date.year)
		this.formEvent.get('occurrence').patchValue(event.occurrence)
		this.ending = event.end_recurrence
		this.toggleRecurrence({checked:event.recurrence})
		this.tempForm = JSON.parse(JSON.stringify(this.formEvent.value))
	}

	findDifferences(){
		let result = false
		const pidPatient = (this.formEvent.get('patient').value ? Number(this.formEvent.get('patient').value) : null)
		result = result || (this.currentEvent.id_patient !== pidPatient)
		result = result || (this.currentEvent.pid_patient !== pidPatient)
		result = result || (this.currentEvent.titre !== this.formEvent.get('entitled').value)
		result = result || (this.currentEvent.note !== this.formEvent.get('description').value)
		result = result || (this.currentEvent.heure_debut !== this.formEvent.get('start').value)
		result = result || (this.currentEvent.heure_fin !== this.formEvent.get('end').value)
		const date = DateTime.fromObject({
			'day':this.formEvent.get('date').get('day').value,
			'month':this.formEvent.get('date').get('month').value,
			'year':this.formEvent.get('date').get('year').value
		})
		result = result || (this.currentEvent.date_debut.toMillis() !== date.toMillis())
		const end_date = DateTime.fromObject({
			'day':this.formEvent.get('end_date').get('day').value,
			'month':this.formEvent.get('end_date').get('month').value,
			'year':this.formEvent.get('end_date').get('year').value
		})
		result = result || (this.currentEvent.end_date.toMillis() !== end_date.toMillis())
		return result
	}

	async updateEventValue(){
		if (this.formEvent.valid && this.formEvent.dirty) {
			this.loading = true
			let currentEventId = this.currentEvent.id_evenement
			const recurrence = this.formEvent.get('recurrence').value
	  		const end_recurrence = this.formEvent.get('end_recurrence').value
	  		let until_date = DateTime.local()
	  		if (recurrence && end_recurrence === '1'){
	  			until_date = DateTime.fromObject({
					'day':this.formEvent.get('value_date').get('day').value,
					'month':this.formEvent.get('value_date').get('month').value,
					'year':this.formEvent.get('value_date').get('year').value
				})
	  		}
			let event = new Evenement(
				currentEventId,
				this.patientService.user.id_user,
				Number(this.formEvent.get('patient').value),
				Number(this.formEvent.get('patient').value),
				this.formEvent.get('entitled').value,
				this.formEvent.get('description').value,
				this.formEvent.get('start').value,
				this.formEvent.get('end').value,
				DateTime.fromObject({
					'day':this.formEvent.get('date').get('day').value,
					'month':this.formEvent.get('date').get('month').value,
					'year':this.formEvent.get('date').get('year').value
				}),
				DateTime.fromObject({
					'day':this.formEvent.get('end_date').get('day').value,
					'month':this.formEvent.get('end_date').get('month').value,
					'year':this.formEvent.get('end_date').get('year').value
				}),
				recurrence,
				this.formEvent.get('repeat_number').value,
				this.formEvent.get('repeat_period').value,
				[],
				end_recurrence,
				until_date,
				this.formEvent.get('occurrence').value,
				this.dateToday,
				this.dateToday
			)
			if (this.currentEvent.id_rec){
				let originEvent = this.evenements.find(elem => (elem.id_evenement === currentEventId) && (elem['id_rec'] === -1))
				originEvent.recurrence = event.recurrence
				originEvent.repeat_number = event.repeat_number
				originEvent.repeat_period = event.repeat_period
				originEvent.end_recurrence = event.end_recurrence
				originEvent.until_date = event.until_date
				originEvent.occurrence = event.occurrence
				if (this.findDifferences()) {
					const dialogRef = this.dialog.open(ModalUpdateRecurrenceComponent,{panelClass:'classic'});
					let exit = false
					await dialogRef.afterClosed().toPromise().then((data) => {
						if (data) {
							if (data === "0") {
								const indexSpe = originEvent.special_date.findIndex(elem => elem['id_rec'] === this.currentEvent['id_rec'])
								if (indexSpe === -1) {
									originEvent.special_date.push({...event,id_rec:this.currentEvent['id_rec']})
								}else{
									originEvent.special_date[indexSpe] = {...event,id_rec:this.currentEvent['id_rec']}
								}
							}else if (data === "1"){
								originEvent.special_date = []
								originEvent.id_patient = Number(this.formEvent.get('patient').value)
								originEvent.pid_patient = Number(this.formEvent.get('patient').value),
								originEvent.titre = this.formEvent.get('entitled').value
								originEvent.note = this.formEvent.get('description').value
								originEvent.heure_debut = this.formEvent.get('start').value
								originEvent.heure_fin = this.formEvent.get('end').value
							}
							event = originEvent
						}else{
							exit = true
						}
					})
					if (exit) {
						this.loading = false
						return;
					}
				}else{
					event = originEvent
				}
			}
			if (this.patientService.demo){
				this.updateEventResult(event)
			}else{
				this.patientService.updateEvenement(event).subscribe((data) => {
					this.updateEventResult(event)
				},(error) => {
					this.loading = false
					this.error = true
					setTimeout(() => {
						this.error = false
					},1000)
				});
			}
		}
	}

	updateEventResult(event){
		// Update the event in the array of all events
		const index = this.evenements.findIndex(evnt => evnt.id_evenement === event.id_evenement)
		this.evenements[index] = event
		this.patientService.dataUser['events'] = this.evenements
		// If the selected day includes the updated event, update it in the array
		let days = []
		let months = []
		let years = []
		for (var i = 0; i < this.shownDays.length; ++i) {
			days.push(this.shownDays[i].day)
			months.push(this.shownDays[i].month)
			years.push(this.shownDays[i].year)
		}
		this.generateCalendar()
		this.shownEvent = null
		this.cancelEvent()
	}

	/* ---------------------------
	Remove an event
	Input
	 - event : the event to remove
	No output
	----------------------------*/
	delEvent(event){
		this.patientService.showModalInformation({
			'title':'Suppression évènement',
			'content':'<p>Êtes-vous sûr de vouloir supprimer l\'évènement suivant : <b>' + event.titre + '</b> ?</p>',
			'confirm':'Confirmer',
			'cancel':'Annuler',
		}).subscribe(result => {
			if (result) {
				if (this.patientService.demo){
					this.delEventResult(event)
				}else{
					this.patientService.supprimerEvent(event).subscribe((data) => {
						this.delEventResult(event)
					},(error) => {
						this.patientService.showModalInformation({
							'title':'Erreur lors de la suppression',
							'content':'<p>Une erreur est survenue lors de la suppression<br>Merci de réessayer ultérieurement</p>',
							'cancel':'Ok',
						})
					});
				}
			}
		})
	}

	delEventResult(event){
		let days = []
		let months = []
		let years = []
		for (var i = 0; i < this.shownDays.length; ++i) {
			days.push(this.shownDays[i].day)
			months.push(this.shownDays[i].month)
			years.push(this.shownDays[i].year)
		}
		if ((days.includes(event.date_debut.day)) 
			&& (months.includes(event.date_debut.month))
			&& (years.includes(event.date_debut.year))) {
			if (this.shownEvent) {
				if (this.shownEvent.id_evenement === event.id_evenement) {
					this.shownEvent = null
				}
			}
			const indexEvent = this.shownEvents.findIndex(evnt => evnt.id_evenement === event.id_evenement)
			if (indexEvent !== -1) {
				this.shownEvents.splice(indexEvent,1)
			}
			const indexEventMultiple = this.shownEventsMultipleDays.findIndex(evnt => evnt.id_evenement === event.id_evenement)
			if (indexEventMultiple !== -1) {
				this.shownEventsMultipleDays.splice(indexEventMultiple,1)
			}
		}
		this.evenements.splice(this.evenements.findIndex(evente => evente.id_evenement == event.id_evenement),1)
		if(!this.evenements.find(evnt => (evnt.date_debut.day == event.date_debut.day) 
			&& (evnt.date_debut.month == event.date_debut.month) 
			&& (evnt.date_debut.year == event.date_debut.year))){
			const index = this.date.findIndex(evnt => evnt.day === event.date_debut.day && evnt.month === event.date_debut.month && evnt.year === event.date_debut.year)
			if (index != -1) {
				this.date[index].events = false
			}
		}
		this.patientService.dataUser['events'] = this.evenements
		this.generateCalendar()
	}

	/* ---------------------------
	Method to trigger when the started hour has changed
	Input
	 - heureDebut : the starting hour of the event
	No output
	----------------------------*/
	hourTrigger(heureDebut){
		const ind = this.heures.findIndex(heure => heure == heureDebut)
		this.heuresFin = [].concat.apply([],this.heures);
		// Don't allow the hours that are before the one which is selected for the started hour
		this.heuresFin.splice(0,ind+1)
		this.formEvent.get('end').patchValue('')
	}

	numberOnly(event): boolean {
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

	onChange(event){
		this.namePatient = '';
		this.disableRemove = false
	}

	removePatient(){
		if (!this.disableRemove){
			this.formEvent.get('patient').patchValue(null)
			this.formEvent.markAsDirty()
			this.disableRemove = true
		}
	}

	showLink(event){
		if (('patients' in this.patientService.dataUser) || (this.patientService.demo)){
			this.patientService.currentPatient = this.patientService.dataUser['patients'].find(elem => Number(elem.id_patient) === event.id_patient)
			this.patientService.nouveauPatient();
		}else{
			this.patientService.getPatient(event.id_patient).subscribe((data:any) => {
				this.patientService.currentPatient = this.patientService.instancePatient(data);
				this.patientService.nouveauPatient();
			},(error) => {
				this.patientService.showModalInformation({
					'title':'Patient introuvable',
					'content':'<p>Le patient lié à cet évènement n\'a pas été trouvé.</p>',
					'cancel':'Ok',
				})
			})
		}
	}

	toggleRecurrence(event){
		this.recurrence = event.checked
		if (event.checked) {
			this.formEvent.get('repeat_number').enable();
			this.formEvent.get('repeat_period').enable();
			this.formEvent.get('end_recurrence').enable();
			this.formEvent.get('value_date').get('day').enable();
			this.formEvent.get('value_date').get('month').enable();
			this.formEvent.get('value_date').get('year').enable();
			this.formEvent.get('occurrence').enable();
			this.formEvent.get('repeat_number').addValidators(Validators.required)
			if (this.ending === "1"){
				this.formEvent.get('value_date').addValidators(DateValidator("day","month","year",true))
			}
			if (this.ending === "2"){
				this.formEvent.get('occurrence').addValidators(Validators.required)
			}
		}else{
			this.formEvent.get('repeat_number').disable();
			this.formEvent.get('repeat_period').disable();
			this.formEvent.get('end_recurrence').disable();
			this.formEvent.get('value_date').get('day').disable();
			this.formEvent.get('value_date').get('month').disable();
			this.formEvent.get('value_date').get('year').disable();
			this.formEvent.get('occurrence').disable();
			this.formEvent.get('repeat_number').removeValidators(Validators.required)
			this.formEvent.get('occurrence').removeValidators(Validators.required)
			this.formEvent.get('value_date').removeValidators(DateValidator("day","month","year",true))
		}
	}

	updateRecurrence(event){
		this.formEvent.get('occurrence').removeValidators(Validators.required)
		this.formEvent.get('value_date').removeValidators(DateValidator("day","month","year",true))
		this.ending = event.value
		if (event.value === "1"){
			this.formEvent.get('value_date').addValidators(DateValidator("day","month","year",true))
		}
		if (event.value === "2"){
			this.formEvent.get('occurrence').addValidators(Validators.required)
		}
	}
}