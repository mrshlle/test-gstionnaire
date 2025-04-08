/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the patient model, creating all the attribute of the object
----------------------------*/
export class Patient{
	constructor(
		public id_patient: number,
		public id_user: number,
		public nom: string,
		public prenom: string,
		public important: string,
		public alerte: boolean,
		public section_information: string,
		public dates_consultations: DateTime[],
		public date_creation: DateTime,
		public date_modification: DateTime,
		public id_files: string
	){}
}