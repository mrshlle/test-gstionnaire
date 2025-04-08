/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Patient } from '../models/Patient.models';

@Pipe({
    name: 'filterliste',
    standalone: false
})
export class FilterListePipe implements PipeTransform {

	/* ---------------------------
	Filter a list
	Input
	 - patients : the list to filter
	 - prenom : first filter
	 - nom : second filter
	 - age : third filter
	Output
	 - The list filtered
	----------------------------*/
	transform(patients: Patient[], prenom: string, nom: string): any[] {

		if(!patients) return [];

		if(!prenom && !nom){
			return patients;
		}

		if(!prenom && nom){
			nom = nom.toLowerCase();
			return patients.filter( patient => {
				return patient.nom.toLowerCase().includes(nom);
			});
		}
		
		if(prenom && !nom){
			prenom = prenom.toLowerCase();
			return patients.filter( patient => {
				return patient.prenom.toLowerCase().includes(prenom);
			})
		}

		if(prenom && nom){
			prenom = prenom.toLowerCase();
			nom = nom.toLowerCase();
			return patients.filter( patient => {
				return (patient.prenom.toLowerCase().includes(prenom) &&
					patient.nom.toLowerCase().includes(nom))
			})
		}

		prenom = prenom.toLowerCase();
		nom = nom.toLowerCase();
		return patients.filter( patient => {
			return (patient.prenom.toLowerCase().includes(prenom) &&
				patient.nom.toLowerCase().includes(nom))
		})
	}
}