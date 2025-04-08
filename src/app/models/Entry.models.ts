/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the evenement model, creating all the attribute of the object
----------------------------*/
export class Entry{
	constructor(
		public id_entry: number,
		public id_user: number,
		public type: string,
		public title: string,
		public amount: number,
		public date_entry: DateTime,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}