/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the consultation model, creating all the attribute of the object
----------------------------*/
export class Consultation{
	constructor(
		public id_consultation: number,
		public id_patient: number,
		public total: number,
		public reglement: string,
		public facture: boolean,
		public date_consultation: DateTime,
		public questions: string,
		public date_creation: DateTime,
		public date_modification: DateTime,
		public id_files: string
	){}
}