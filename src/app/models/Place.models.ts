/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the place model, creating all the attribute of the object
----------------------------*/
export class Place{
	constructor(
		public id_place: number,
		public id_creator: number,
		public id_patient: number,
		public creator_information: any,
		public user_information: any,
		public invoice: boolean,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}