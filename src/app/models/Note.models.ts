/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the note model, creating all the attribute of the object
----------------------------*/
export class Note{
	constructor(
		public id_note: number,
		public id_user: number,
		public note: string,
		public titre: string,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}