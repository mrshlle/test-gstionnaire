// Drag-n-drop part of code from https://stackoverflow.com/questions/53675661/angular-material-7-use-grid-with-drag-and-drop
// Records chart from https://codepen.io/rami/pen/dyXEzrw
// Clock from https://codepen.io/MyXoToD/pen/nmXgeV

import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CdkDropList, CdkDragEnter, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/overlay';
import { PatientService } from '../services/patient.service'

import { DateTime } from 'luxon'
import { forkJoin } from 'rxjs'

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

	@ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
	@ViewChild(CdkDropList) placeholder: CdkDropList;

	today: DateTime = DateTime.local()

	target: CdkDropList;
	targetIndex: number;
	source: CdkDropList;
	sourceIndex: number;
	activeContainer;

	availableWidgets = [{id:-1,active:false},{id:1,active:false}]
	widgets = []
	historyWidgets = []

	edit: boolean = false
	loading: boolean = false

	monthNames: string[] = ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juill.','Août','Sept.','Oct.','Nov.','Déc.']
	monthNamesMini: string[] = ['J','F','M','A','M','J','J','A','S','O','N','D']
	allMonths: any[] = [{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0},{value:0}]
	yearMax: number = 0

	allConsultations: any[][] = [[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}]]
	allRecords: any[][] = [[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}],[{value:0},{value:0}]]
	recordsConsultationsMax: number = 0

	totalRecords: number = 0
	monthRecords: number = 0
	totalConsultations: number = 0
	monthConsultations: number = 0
	totalTurnover: number = 0
	monthTurnover: number = 0

	second: number = 0
	minute: number = 0
	hour: number = 0
	shownHour: number = 0

	items: Array<number> = Array(10).fill(0).map((_, i) => i + 1);

	constructor(public patientService: PatientService,
				private viewportRuler: ViewportRuler) {
		this.target = null;
		this.source = null;
	}

	ngOnInit(): void {
		if (this.patientService.demo){
			this.startGeneration(this.patientService.dataUser['patients'],this.setAccountancy())
		}else{
			if (('consultations' in this.patientService.dataUser) && ('entries' in this.patientService.dataUser) && ('patients' in this.patientService.dataUser)){
				this.startGeneration(this.patientService.dataUser['patients'],this.setAccountancy())
			}else{
				forkJoin([
					this.patientService.getAccountancyDash(),
					this.patientService.getDateCreation()
				]).subscribe((result: any) => {
					for (var i = 0; i < result[0].length; ++i) {
						result[0][i].date_consultation = DateTime.fromISO(result[0][i].date_consultation)
					}
					for (var i = 0; i < result[1].length; ++i) {
						result[1][i].date_creation = DateTime.fromISO(result[1][i].date_creation)
					}
					this.startGeneration(result[1],result[0])
				},(error) => {
					this.patientService.showModalInformation({
						'title':'Erreur de récupération',
						'content':'<p>Une erreur est survenue lors de la récupération de vos différentes informations.<br>Merci de réessayez ultérieurement</p>',
						'cancel':'Ok',
					})
				})
			}
		}
		this.setClock()
		const userWidgets = this.patientService.user.widgets
		const userWidgetsIds = userWidgets.map(elem => elem.id)
		const modules = this.patientService.user.modules
		let modulesIds = ['-1']
		for (var i = 0; i < modules.length; ++i) {
			if (modules[i].added) {
				modulesIds.push(modules[i].id)
			}
		}
		this.widgets = userWidgets
		for (var i = 0; i < this.availableWidgets.length; ++i) {
			if (!userWidgetsIds.includes(this.availableWidgets[i].id)){
				if (modulesIds.includes(this.availableWidgets[i].id.toString())) {
					this.widgets.push(this.availableWidgets[i])
				}
			}
		}
		let toRemove = []
		for (var i = 0; i < this.widgets.length; ++i) {
			if (!modulesIds.includes(this.widgets[i].id.toString())) {
				toRemove.push(i)
			}
		}
		toRemove.reverse()
		for (var i = 0; i < toRemove.length; ++i) {
			this.widgets.splice(toRemove[i],1)
		}
		this.historyWidgets = JSON.parse(JSON.stringify(this.widgets))
	}

	setAccountancy(){
		let accountancy = []
		for (var i = 0; i < this.patientService.dataUser['consultations'].length; ++i) {
			accountancy.push({
				'price':this.patientService.dataUser['consultations'][i].total,
				'date_consultation':this.patientService.dataUser['consultations'][i].date_consultation,
				'type':null
			})
		}
		for (var i = 0; i < this.patientService.dataUser['entries'].length; ++i) {
			accountancy.push({
				'price':this.patientService.dataUser['entries'][i].amount,
				'date_consultation':this.patientService.dataUser['entries'][i].date_entry,
				'type':this.patientService.dataUser['entries'][i].type
			})
		}
		return accountancy
	}

	startGeneration(records,accountancy){
		this.calculateTotals(accountancy)
		this.calculateRecords(records)
		this.calculateConsultations(accountancy)
	}

	newRecord(){
		this.patientService.nouveauPatient()
	}

	list(){
		this.patientService.listePatient()
	}

	account(){
		this.patientService.compta()
	}

	setClock(){
		this.second = this.today.second
		this.minute = this.today.minute
		const hour = this.today.hour
		if (hour > 12){
			this.hour = hour-12
		}else{
			this.hour = hour
		}
		this.shownHour = this.today.hour
		setInterval(() => {
			if (this.second === 59) {
				if (this.minute === 59) {
					if (this.hour === 24) {
						this.hour = 0
						this.shownHour = 0
					}else{
						this.hour += 1
						this.shownHour += 1
					}
					this.minute = 0
				}else{
					this.minute += 1
				}
				this.second = 0
			}else{
				this.second += 1
			}
			if (this.hour > 12) {
				this.hour -= 12
			}
		},1000)
	}

	calculateTotals(consultations){
		for (var i = 0; i < consultations.length; ++i) {
			let sign = consultations[i].type ? (consultations[i].type === 'minus' ? -1 : 1) : 1
			this.totalTurnover += (Number(consultations[i].price)*sign)
			this.allMonths[consultations[i].date_consultation.month-1].value += (Number(consultations[i].price)*sign)
		}
		this.monthTurnover = this.allMonths[DateTime.local().month-1].value
		for (var i = 0; i < this.allMonths.length; ++i) {
			if (this.allMonths[i].value > this.yearMax) {
				this.yearMax = this.allMonths[i].value
			}
		}
	}

	calculateRecords(records){
		this.totalRecords = records.length
		for (var i = 0; i < records.length; ++i) {
			let date = records[i].date_creation
			if (date.month === 1) {
				this.allRecords[0][0].value += 1
			}else if (date.month === 12) {
				this.allRecords[10][1].value += 1
			}else{
				this.allRecords[date.month-2][1].value += 1
				this.allRecords[date.month-1][0].value += 1
			}
		}
		let date = DateTime.local()
		if (date.month === 1) {
			this.monthRecords = this.allRecords[0][0].value
		}else if (date.month === 12) {
			this.monthRecords = this.allRecords[10][1].value
		}else{
			this.monthRecords = this.allRecords[date.month-2][1].value
		}
		for (var i = 0; i < this.allRecords.length; ++i) {
			if (this.allRecords[i][0].value > this.recordsConsultationsMax) {
				this.recordsConsultationsMax = this.allRecords[i][0].value
			}
			if (this.allRecords[i][1].value > this.recordsConsultationsMax) {
				this.recordsConsultationsMax = this.allRecords[i][1].value
			}
		}
	}

	calculateConsultations(consultations){
		const justConsultations = consultations.filter(element => element.type === null)
		this.totalConsultations = justConsultations.length
		for (var i = 0; i < justConsultations.length; ++i) {
			let date = justConsultations[i].date_consultation
			if (date.month === 1) {
				this.allConsultations[0][0].value += 1
			}else if (date.month === 12) {
				this.allConsultations[10][1].value += 1
			}else{
				this.allConsultations[date.month-2][1].value += 1
				this.allConsultations[date.month-1][0].value += 1
			}
		}
		let date = DateTime.local()
		if (date.month === 1) {
			this.monthConsultations = this.allConsultations[0][0].value
		}else if (date.month === 12) {
			this.monthConsultations = this.allConsultations[10][1].value
		}else{
			this.monthConsultations = this.allConsultations[date.month-2][1].value
		}
		for (var i = 0; i < this.allConsultations.length; ++i) {
			if (this.allConsultations[i][0].value > this.recordsConsultationsMax) {
				this.recordsConsultationsMax = this.allConsultations[i][0].value
			}
			if (this.allConsultations[i][1].value > this.recordsConsultationsMax) {
				this.recordsConsultationsMax = this.allConsultations[i][1].value
			}
		}
	}

	saveWidgets(){
		if (!this.loading) {
			this.loading = true
			if (this.patientService.demo){
				this.loading = false
				this.historyWidgets = JSON.parse(JSON.stringify(this.widgets))
				this.edit = false
			}else{
				this.patientService.updateWidgets(JSON.stringify(this.widgets)).subscribe((data) => {
					this.loading = false
					this.historyWidgets = JSON.parse(JSON.stringify(this.widgets))
					this.patientService.storeInLocal(this.patientService.user)
					this.edit = false
				},(error) => {
					this.loading = false
					this.patientService.showModalInformation({
						'title':'Erreur de modification',
						'content':'<p>Une erreur est survenue lors de la modification de votre tableau de bord.<br>Merci de réessayez ultérieurement</p>',
						'cancel':'Ok',
					})
				})
			}
		}
	}

	configureWidgets(){
		this.edit = true
	}

	ngAfterViewInit() {
		const phElement = this.placeholder.element.nativeElement;

		phElement.style.display = 'none';
		phElement.parentElement.removeChild(phElement);
	}

	dropListDropped() {
		if (!this.loading) {
			if (!this.target) {
				return;
			}

			const phElement = this.placeholder.element.nativeElement;
			const parent = phElement.parentElement;

			phElement.style.display = 'none';

			parent.removeChild(phElement);
			parent.appendChild(phElement);
			parent.insertBefore(
				this.source.element.nativeElement,
				parent.children[this.sourceIndex]
			);

			this.target = null;
			this.source = null;
			this.activeContainer = null;

			if (this.sourceIndex !== this.targetIndex) {
				moveItemInArray(this.widgets, this.sourceIndex, this.targetIndex);
			}
		}
	}

	cdkDropListEntered(e: CdkDragEnter) {
		if (!this.loading) {
			const drag = e.item;
			const drop = e.container;

			if (drop === this.placeholder) {
				return true;
			}

			const phElement = this.placeholder.element.nativeElement;
			const sourceElement = drag.dropContainer.element.nativeElement;
			const dropElement = drop.element.nativeElement;

			const dragIndex = __indexOf(
				dropElement.parentElement.children,
				this.source ? phElement : sourceElement
			);
			const dropIndex = __indexOf(
				dropElement.parentElement.children,
				dropElement
			);
			if (!this.source) {
				this.sourceIndex = dragIndex;
				this.source = drag.dropContainer;

				sourceElement.parentElement.removeChild(sourceElement);
			}

			this.targetIndex = dropIndex;
			this.target = drop;

			phElement.style.display = '';
			dropElement.parentElement.insertBefore(
				phElement,
				dropIndex > dragIndex ? dropElement.nextSibling : dropElement
			);

			requestAnimationFrame(() => {
				this.placeholder._dropListRef.enter(
					drag._dragRef,
					drag.element.nativeElement.offsetLeft,
					drag.element.nativeElement.offsetTop
				);
			});
		}
	}

	toggleActive(index){
		if (!this.loading){
			this.widgets[index].active = !this.widgets[index].active
		}
	}

	cancel(){
		if (!this.loading) {
			this.widgets = JSON.parse(JSON.stringify(this.historyWidgets))
			this.edit = false
		}
	}
}

function __indexOf(collection, node) {
	return Array.prototype.indexOf.call(collection, node);
}