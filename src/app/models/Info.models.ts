/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the info model, creating all the attribute of the object
----------------------------*/
export class Info{
	constructor(
		public id_info: number,
		public type_info: string,
		public nom: string,
		public description: string,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}