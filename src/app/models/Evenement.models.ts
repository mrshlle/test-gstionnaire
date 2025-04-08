/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the evenement model, creating all the attribute of the object
----------------------------*/
export class Evenement{
	constructor(
		public id_evenement: number,
		public id_user: number,
		public id_patient: number,
		public pid_patient: number,
		public titre: string,
		public note: string,
		public heure_debut: string,
		public heure_fin: string,
		public date_debut: DateTime,
		public end_date: DateTime,
		public recurrence: boolean,
		public repeat_number: number,
		public repeat_period: string,
		public special_date: any[],
		public end_recurrence: string,
		public until_date: DateTime,
		public occurrence: number,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}