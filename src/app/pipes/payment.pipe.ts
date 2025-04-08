/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'payment',
    standalone: false
})
export class PaymentPipe implements PipeTransform {

	transform(list, payment) {
		return list.filter(elem => elem.reglement === payment);
	}

}