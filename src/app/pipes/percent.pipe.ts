/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'percent',
    standalone: false
})
export class PercentPipe implements PipeTransform {

	transform(amount, maxAmount) {
		if (maxAmount > 0) {
			return amount/maxAmount*100;
		}else{
			return 0
		}
	}

}