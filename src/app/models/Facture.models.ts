/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the facture model, creating all the attribute of the object
----------------------------*/
export class Facture{
	constructor(
		public id_facture: number,
		public id_user: number,
		public nom: string,
		public prenom: string,
		public objet: string,
		public date_consultation: DateTime,
		public montant: number,
		public date_creation: DateTime,
		public date_modification: DateTime,
		public nbr_facture: number,
		public id_consultation: number,
		public id_patient: number
	){}
}