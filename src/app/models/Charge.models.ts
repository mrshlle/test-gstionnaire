/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the charge model, creating all the attribute of the object
----------------------------*/
export class Charge{
	constructor(
		public id_user: number,
		public mois: string,
		public charge: number,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}