/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sum',
    pure: false,
    standalone: false
})
export class SumPipe implements PipeTransform {

	/* ---------------------------
	Make an addition to all prices of consultation
	Input
	 - consultations : list of consultations
	 - charge : the fee to apply to the result
	 - espece : first boolean filter
	 - cheque : second boolean filter
	 - credit : third boolean filter
	Output
	 - The result of all the prices
	----------------------------*/
	transform(consultations: any[], charge, espece, cheque, credit, conslt, entry, after){
		let newConsultations:any[] = []
		if (conslt){
			if (espece || espece == undefined) newConsultations = newConsultations.concat(consultations.filter(elem => elem.reglement == 'Espèce'))
			if (cheque || cheque == undefined) newConsultations = newConsultations.concat(consultations.filter(elem => elem.reglement == 'Chèque'))
			if (credit || credit == undefined) newConsultations = newConsultations.concat(consultations.filter(elem => elem.reglement == 'Carte bancaire'))
		}
		if (entry) newConsultations = newConsultations.concat(consultations.filter(elem => elem.origin === 'entry' && elem.type === 'plus'))
		let result = newConsultations.reduce((accumulator, consultation) => {
			if (consultation.origin === 'consultation') {
				return accumulator + Number(consultation.total)
			}else{
				return accumulator + Number(consultation.amount)
			}
		},0);
		if (charge) result -= result * (charge/100)
		if (after && entry) {
			const costs = consultations.filter(elem => elem.origin === 'entry' && elem.type === 'minus')
			result -= costs.reduce((accumulator, cost) => accumulator + Number(cost.amount),0);
		}
		return result
	}
}