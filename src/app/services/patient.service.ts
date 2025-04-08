/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { Observable, Subject } from 'rxjs';
import { DateTime } from 'luxon'

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { User } from '../models/User.models';
import { Patient } from '../models/Patient.models';
import { Evenement } from '../models/Evenement.models';
import { Consultation } from '../models/Consultation.models';
import { Info } from '../models/Info.models';
import { Note } from '../models/Note.models';
import { Facture } from '../models/Facture.models';
import { Charge } from '../models/Charge.models';
import { Entry } from '../models/Entry.models';
import { Place } from '../models/Place.models';
import { ShareUser } from '../models/ShareUser.models';

/* -----------------------------------------------------------------------------------------------------------------
Components imports
----------------------------------------------------------------------------------------------------------------- */
import { ModalInformationComponent } from '../modals/modal-information/modal-information.component'

import { url } from '../config';

// Declaration of the API uri
const LOCATION_API = url

@Injectable({
	providedIn: 'root'
})
export class PatientService {

	/* ---------------------------
	Instanciate variables
	----------------------------*/
	today = DateTime.local();

	demo: boolean = false;

	currentPatient: Patient;

	user: User;

	typeInfos: string;

	duplicate: boolean;

	route: string = 'home'

	modalQueue: number[] = []

	key: string = 'b2ff93ba15e43260b2ad34f4efb0b789'

	dataUser: any = {}

	textColors: string[] = ['white','white','white','white','white','white','white','white','white','black','black','white']
	
	mainColors: string[] = ['#14A084','#2255A6','#382AAE','#761DA7','#C7197F','#F81F25','#FA861F','#FAB11F','#FAD61F','#F7FA1F','#A5EA1D','#22CB19']
	
	subColors: string[] = ['#1BBC9B','#2971BD','#5343D4','#A13BD9','#ED38A2','#FF3F44','#FF9D46','#FFC95C','#FFE149','#FDFF68','#C1FB50','#45ED3C']
	rgbColors: string[] = ['27, 188, 155','41, 113, 189','83, 67, 212','161, 59, 217','237, 56, 162','255, 63, 68','255, 157, 70','255, 201, 92','255, 225, 73','253, 255, 104','193, 251, 80','69, 237, 60']
	
	svgColors: string[] = ['#E2FEED','#DCE8FC','#E3DFFF','#F3DCFF','#FED8EE','#FFD7D8','#FFE6D0','#FFF0D3','#FFF5C3','#FEFFD2','#EFFFCE','#CEFFCB']
	
	supColors: string[] = ['#0D725E','#173B75','#271D7D','#521275','#A01767','#B90F13','#C36B1C','#BC820D','#CBAC0E','#CACD10','#82B915','#0F9208']
	
	backgroundColors: string[] = ['#F9FFFE','#F8FAFF','#F7F6FF','#FDF9FF','#FFF6FB','#FFF4F5','#FFFAF5','#FFFBF2','#FFFCEF','#FFFFF9','#FBFFF3','#F8FFF8']
	
	supAlphaColors: string[] = ['#0D725EC2','#173B75C2','#271D7DC2','#521275C2','#A01767C2','#B90F13C2','#C36B1CC2','#BC820DC2','#CBAC0EC2','#CACD10C2','#82B915C2','#0F9208C2']

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(private router: Router,
				private httpClient: HttpClient,
				private dialog: MatDialog) {
	}

	showModalInformation(data){
		const dialogRef = this.dialog.open(ModalInformationComponent,{data:data,panelClass:'classic'});
		return dialogRef.afterClosed();
	}

	/* ---------------------------
	Go to login page
	No input
	No output
	----------------------------*/
	login(){
		this.route = 'login'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/login', { skipLocationChange: true })
		)
	}

	dashboard(){
		this.route = 'dashboard'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/dashboard', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to home page
	No input
	No output
	----------------------------*/
	accueil(){
		this.route = 'home'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/accueil', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to new patient page
	No input
	No output
	----------------------------*/
	nouveauPatient(){
		this.route = 'patient'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/nouveau', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to list page
	No input
	No output
	----------------------------*/
	listePatient(){
		this.route = 'list'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/liste', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to facture page
	No input
	No output
	----------------------------*/
	facture(){
		this.route = 'invoice'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/facture', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to compta page
	No input
	No output
	----------------------------*/
	compta(){
		this.route = 'compta'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/compta', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to modification page
	No input
	No output
	----------------------------*/
	modification(){
		this.route = 'modif'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/modification', { skipLocationChange: true })
		)
	}

	/* ---------------------------
	Go to settings page
	No input
	No output
	----------------------------*/
	parametre(){
		this.route = 'param'
		this.router.navigateByUrl('/').then(() => 
			this.router.navigateByUrl('/parametre', { skipLocationChange: true })
		)
	}

	storeInLocal(user){
		if (localStorage.getItem('keep-user') === 'true') {
			localStorage.setItem('user',JSON.stringify(user))
		}
	}

    /* ---------------------------
    All those functions are to instance an object as a model definition
    ----------------------------*/

	instanceUser(userObject, data): User{
		const user = new User(
			userObject.id_user,
			userObject.lastname,
			userObject.firstname, 
			userObject.email,
			data.client,
			data.active,
			JSON.parse(data.modules),
			JSON.parse(data.stamp),
			data.stamp_type,
			JSON.parse(data.stamp_image),
			JSON.parse(data.invoice_signature),
			data.footer === "true",
			data.footer_text,
			data.default_price,
			JSON.parse(data.special_price),
			data.patient_survey,
			data.consultation_survey,
			data.fee,
			data.invoice_number,
			data.color,
			JSON.parse(data.widgets),
			JSON.parse(data.quick_access),
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return user;
	}

	instanceInfo(data): Info{
		const info = new Info(
			data.id_info,
			data.type,
			data.entitled,
			data.description,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return info;
	}

	instancePatient(data): Patient{
		let datesConsultations = []
		if (data.dates_consultations) {
			const dates_consultations = JSON.parse(data.dates_consultations)
			for (var i = 0; i < dates_consultations.length; ++i) {
				datesConsultations.push(DateTime.fromISO(dates_consultations[i]))
			}
		}
		const patient = new Patient(
			data.id_patient,
			data.id_user,
			data.lastname,
			data.firstname,
			data.important,
			data.warning,
			data.questions,
			datesConsultations,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification),
			data.id_files
		)
		return patient;
	}

	instanceConsultation(data){
		const consultation = new Consultation(
			data.id_consultation,
			data.id_patient,
			data.price,
			data.payment,
			data.invoice,
			DateTime.fromISO(data.date_consultation),
			data.questions,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification),
			data.id_files
		)
		return consultation;
	}

	instanceEvenement(data): Evenement{
		const evenement = new Evenement(
			data.id_event,
			data.id_user,
			data.id_patient,
			data.pid_patient,
			data.entitled,
			data.subject,
			data.start_hour,
			data.end_hour,
			DateTime.fromISO(data.start_date),
			DateTime.fromISO(data.end_date),
			data.recurrence === "true",
			Number(data.repeat_number),
			data.repeat_period,
			JSON.parse(data.special_date),
			data.end_recurrence,
			DateTime.fromISO(data.until_date),
			Number(data.occurrence),
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return evenement;
	}

	instanceNote(data): Note{
		const note = new Note(
			data.id_note,
			data.id_user,
			data.description,
			data.entitled,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return note;
	}

	instanceFacture(data): Facture{
		const facture = new Facture(
			data.id_invoice,
			data.id_user,
			data.lastname,
			data.firstname,
			data.subject,
			DateTime.fromISO(data.date_consultation),
			data.price,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification),
			data.invoice_number,
			data.id_consultation,
			data.id_patient
		)
		return facture;
	}

	instanceCharge(data): Charge{
		const charge = new Charge(
			data.id_user,
			data.month,
			data.fee,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return charge;
	}

	instanceEntry(data): Entry{
		const entry = new Entry(
			data.id_entry,
			data.id_user,
			data.type,
			data.title,
			data.amount,
			DateTime.fromISO(data.date_entry),
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return entry;
	}

	instancePlace(data): Place{
		const place = new Place(
			data.id_place,
			data.id_creator,
			data.id_patient,
			JSON.parse(data.creator_information),
			JSON.parse(data.user_information),
			data.invoice,
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return place;
	}

	instanceShareUser(data): ShareUser{
		const shareUser = new ShareUser(
			data.id_user,
			JSON.parse(data.id_places),
			data.id_patient,
			data.updated === 'true',
			DateTime.fromISO(data.date_creation),
			DateTime.fromISO(data.date_modification)
		)
		return shareUser;
	}

	/* ---------------------------
	All those functions are here to get data from database, then to emit, add and instance them
	----------------------------*/

	getIncomingUpdate(){
		return this.httpClient.get(LOCATION_API + '82075592dc8bffdb')
	}

	getChargesCompta(){
		return this.httpClient.get(LOCATION_API + '475186c4b4175f03')
	}

	getPatients(id_user){
		return this.httpClient.get(LOCATION_API + 'd3178ec4c1b15729')
	}

	getPatient(id_patient){
		return this.httpClient.get(LOCATION_API + '96293a63c1f5081d/' + id_patient)
	}

	getNotes(id_user){
		return this.httpClient.get(LOCATION_API + '13c31fd6f9d193b5')
	}

	getEvenements(id_user){
		return this.httpClient.get(LOCATION_API + '14b7fa60a36f2094')
	}

	getFactures(id_user){
		return this.httpClient.get(LOCATION_API + '75442336083e70e5')
	}

	getConsultationsCompta(){
		return this.httpClient.get(LOCATION_API + '0d950344b93fa8cb')
	}

	getConsultations(id_patient){
		return this.httpClient.get(LOCATION_API + '79a686afe02f0f37/' + id_patient)
	}

	getEntries(){
		return this.httpClient.get(LOCATION_API + 'f2360df8c90667d0')
	}

	getPlaces(){
		return this.httpClient.get(LOCATION_API + 'f8190b8d4b376df7')
	}

	getPlaceById(id_place,id_patient){
		return this.httpClient.get(LOCATION_API + '9c469079b809ee11/' + id_place + "/" + id_patient)
	}

	// getIdFilesConsultation(id_patient){
	// 	return this.httpClient.get(LOCATION_API + 'id-files-consultation/' + id_patient)
	// }

	resetJWT(){
		const id_user = this.user.id_user
		return this.httpClient.post(LOCATION_API + '6824a2013ceb7c5c',id_user)
	}

	getDocumentUrl(data){
		if (data.source === 'local') {
			return this.httpClient.get(LOCATION_API + '59875638d6fce4fa/' + data.id)
		}else{
			// There is a little difference in routes
			if ('user' in data){
				return this.httpClient.get(LOCATION_API + 'd4bcce0b51c5dcf2/' + data.id_place + '/' + data.id)
			}else{
				return this.httpClient.get(LOCATION_API + 'd4bcce0b51c5dbf2/' + data.id_place + '/' + data.id)
			}
		}
	}

	getAccountancyDash(){
		return this.httpClient.get(LOCATION_API + '10a469dc7b91348b')
	}

	getDateCreation(){
		return this.httpClient.get(LOCATION_API + '4a4cbbf96d9501ba')
	}

	/* ---------------------------
	All those functions are here to create a new element into the database
	----------------------------*/

	createEvenement(evenement){
		if (evenement.note === null) evenement.note = ''
		return this.httpClient.post(LOCATION_API + '0d8e7589311f9e1b',evenement)
	}

	createPatient(patient){
		return this.httpClient.post(LOCATION_API + 'a31e3a1169441f58',patient)
	}

	createConsultation(consultation): Observable<any>{
		return this.httpClient.post(LOCATION_API + 'aa44c0e31601cafb',consultation)
	}

	createFacture(facture): Observable<any>{
		return this.httpClient.post(LOCATION_API + '99f78589eb9ac620',facture)
	}

	createNote(note){
		return this.httpClient.post(LOCATION_API + '28364e2b168deb4e',note)
	}

	async uploadFiles(files){
		let formData = new FormData()
		for (var i = 0; i < files.length; ++i) {
			formData.append('files',files[i])
		}
		return await this.httpClient.post(LOCATION_API + 'b6608af07375f2f9', formData).toPromise()
	}

	createCharge(charge){
		return this.httpClient.post(LOCATION_API + '6bd24222967f654c', charge)
	}

	sendInvoice(pdf,title,email,user,patient){
		return this.httpClient.post(LOCATION_API + 'fb1b3963f15c3aa5', {pdf:pdf,title:title,email:email,user:user,patient:patient})
	}

	createEntry(entry){
		return this.httpClient.post(LOCATION_API + '677bf6b7de664045', entry)
	}

	createPlace(id_patient,email){
		return this.httpClient.post(LOCATION_API + '258165b30b3d6c7a', {id_patient:id_patient,email:email})
	}

	async uploadShareFiles(files,place){
		let formData = new FormData()
		for (var i = 0; i < files.length; ++i) {
			formData.append('files',files[i])
		}
		formData.append('place',JSON.stringify(place))
		return await this.httpClient.post(LOCATION_API + 'bf3080f64d3e9eda', formData).toPromise()
	}

	async uploadShareFilesFrom(files,place){
		let formData = new FormData()
		for (var i = 0; i < files.length; ++i) {
			formData.append('files',files[i])
		}
		formData.append('place',JSON.stringify(place))
		return await this.httpClient.post(LOCATION_API + 'bf3080f64d3e9edb', formData).toPromise()
	}

	logSharedUser(logInformation){
		return this.httpClient.post(LOCATION_API + 'ceca93bb8c5434bd', logInformation)
	}

	uploadStampFile(file){
		let formData = new FormData()
		formData.append('files',file)
		return this.httpClient.post(LOCATION_API + '93d6f9339cf2326f', formData)
	}

	uploadSignatureFile(file){
		console.log(file)
		let formData = new FormData()
		formData.append('files',file)
		return this.httpClient.post(LOCATION_API + 'ed416430a8c133c6', formData)
	}

	/* ---------------------------
	All those functions are here to update an element in the database
	----------------------------*/

	updateInterrogatory(JSONinterrogatory){
		const id_user = this.user.id_user;
		return this.httpClient.put(LOCATION_API + '7fed6f1c96f5bb7c', {JSONinterrogatory, id_user})
	}

	updateConsultation(JSONconsultation){
		const id_user = this.user.id_user;
		return this.httpClient.put(LOCATION_API + '7df2e00276bd58da', {JSONconsultation, id_user})
	}

	updateNote(note){
		return this.httpClient.put(LOCATION_API + '08b3ebd34a7fb2af',note)
	}

	updateEvenement(evenement){
		return this.httpClient.put(LOCATION_API + '7eb97f33458545d4',evenement)
	}
	
	updatePatient(patient){
		return this.httpClient.put(LOCATION_API + 'b03480fa8ee94ad3',patient)
	}

	setTrueConsultation(consultation){
		const id_consultation = consultation.id_consultation
		return this.httpClient.put(LOCATION_API + '3b4596213c7c424f', {id_consultation})
	}

	updatePatientConsultation(id_patient,dates,id_files){
		dates = JSON.stringify(dates.map(date => date.toString())).replace(/'/g,"''")
		return this.httpClient.put(LOCATION_API + '33d6d2c8668b5f0a', {id_patient,dates,id_files})
	}

	updateCharge(charge){
		return this.httpClient.put(LOCATION_API + 'd1b02f72339a6c69', charge)
	}

	modifFacture(format){
		const id = this.user.id_user
		return this.httpClient.put(LOCATION_API + '01a050d08506c94a',{format,id})
	}

	updatePrice(price){
		const id = this.user.id_user;
		return this.httpClient.put(LOCATION_API + '3709124eb1203be7',{price,id})
	}

	updateExtra(extra){
		const id = this.user.id_user
		return this.httpClient.put(LOCATION_API + '02998ec52a87005c',{extra,id})
	}

	updateStamp(type,stamp){
		const id = this.user.id_user
		return this.httpClient.put(LOCATION_API + '9c705149dfd3a44e',{type,stamp,id})
	}

	updateFee(fee){
		const id = this.user.id_user
		return this.httpClient.put(LOCATION_API + '7869b87a90f6c868',{fee,id})
	}

	updateColor(color){
		const id = this.user.id_user
		return this.httpClient.put(LOCATION_API + 'b16ae17b7eddbecc',{color,id})
	}

	updateEntry(entry){
		return this.httpClient.put(LOCATION_API + 'ece42fcf2360df8d', entry)
	}

	updateShareInvoice(id_place,invoice){
		return this.httpClient.put(LOCATION_API + '20560548befa83c4',{id_place,invoice})
	}

	updateShareText(id_place,creator_information,text){
		return this.httpClient.put(LOCATION_API + '5677e037763230c8',{id_place,creator_information,text})
	}

	updateSharedPassword(password){
		return this.httpClient.put(LOCATION_API + 'b0d5fa6ae750a84e',{password:password})
	}

	updateShareTextFrom(id_place,user_information,id_creator,text){
		return this.httpClient.put(LOCATION_API + '5677e037763230d8',{id_place,user_information,id_creator,text})
	}

	updateWidgets(widgets){
		return this.httpClient.put(LOCATION_API + '66a7897980cca4cb',{widgets:widgets})
	}

	updateQuickAccess(quickAccess){
		return this.httpClient.put(LOCATION_API + '1d7e1847627d1aaa',{quick_access:quickAccess})
	}

	updateFooter(footer,footerText){
		return this.httpClient.put(LOCATION_API + '9825efcd11ecfb9d',{footer:footer,footer_text:footerText})
	}

	/* ---------------------------
	All those functions are here to remove an element from database
	----------------------------*/

	supprimerPatient(patient){
		return this.httpClient.delete(LOCATION_API + 'b984564e11acde6b/' + patient.id_patient)
	}

	supprimerNote(note){
		return this.httpClient.delete(LOCATION_API + '14b24c549d293603/' + note.id_note)
	}

	supprimerEvent(event){
		return this.httpClient.delete(LOCATION_API + 'd639738a819eff1b/' + event.id_evenement)
	}

	supprimerConsultations(id_patient){
		return this.httpClient.delete(LOCATION_API + '3ef6f6087b8534e9/' + id_patient)
	}

	supprimerFactures(id_patient){
		return this.httpClient.delete(LOCATION_API + '862cd25d6859b7e5/' + id_patient)
	}

	supprimerConsultation(consultation){
		return this.httpClient.delete(LOCATION_API + 'f13658ebf7b14afc/' + consultation.id_consultation)
	}

	supprimerFacture(id_consultation){
		return this.httpClient.delete(LOCATION_API + 'e496208b10a6e7e7/' + id_consultation)
	}

	deleteEntry(id_entry){
		return this.httpClient.delete(LOCATION_API + 'ed62c11b2cf22f50/' + id_entry)
	}

	deleteFileById(id_document){
		return this.httpClient.delete(LOCATION_API + '1138d008bd547b8d/' + id_document)
	}

	deleteDocumentShareByIdCreator(id_document,id_place){
		return this.httpClient.delete(LOCATION_API + '7a02802fc8ede6e0/' + id_place + "/" + id_document)
	}

	deleteDocumentShareById(id_document,id_place){
		return this.httpClient.delete(LOCATION_API + '62f97c38657ad62f/' + id_place + "/" + id_document)
	}

	removeStampFile(id_document){
		return this.httpClient.delete(LOCATION_API + 'ebbc8ba31589452e/' + id_document)
	}

	removeSignatureFile(id_document){
		return this.httpClient.delete(LOCATION_API + '2ecf8a8f5f3730ac/' + id_document)
	}

	removeSharePlace(sharePlace){
		return this.httpClient.post(LOCATION_API + '85d9120cdaf1aaa8', sharePlace)
	}
}