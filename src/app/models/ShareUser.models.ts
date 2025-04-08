/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

export class ShareUser{
	constructor(
		public id_user: number,
		public id_places: number[],
		public id_patient: number,
		public updated: boolean,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}