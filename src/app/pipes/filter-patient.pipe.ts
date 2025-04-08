/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Patient } from '../models/Patient.models';

@Pipe({
    name: 'filterpatient',
    standalone: false
})
export class FilterPatientPipe implements PipeTransform {

	/* ---------------------------
	Filter a list
	Input
	 - patients : list to filter
	 - nomPrenom : the filter
	Output
	 - The list filtered
	----------------------------*/
	transform(patients: Patient[], nomPrenom: string): any[] {
		if(!patients) return [];
		if(!nomPrenom){
			return patients;
		}
		nomPrenom = nomPrenom.toLowerCase();
		return patients.filter( patient => {
			let nomPrenomPatient = patient.nom + " " + patient.prenom
			return (nomPrenomPatient.toLowerCase().includes(nomPrenom));
		});	
	}
}
