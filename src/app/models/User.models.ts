/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { DateTime } from 'luxon'

/* ---------------------------
Exporting the user model, creating all the attribute of the object
----------------------------*/
export class User{
	constructor(
		public id_user: number,
		public nom: string,
		public prenom: string,
		public mail: string,
		public client: boolean,
		public active: boolean,
		public modules: any,
		public adeli: any,
		public stamp_type: string,
		public stamp_image: any,
		public signature_image: any,
		public footer: boolean,
		public footer_text: string,
		public prix_normal: number,
		public prix_speciaux: any,
		public interrogatoire: string,
		public consultation: string,
		public charge: number,
		public nbr_facture: number,
		public color: number,
		public widgets: any,
		public quick_access: any,
		public date_creation: DateTime,
		public date_modification: DateTime
	){}
}