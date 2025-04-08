/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'xpoint',
    standalone: false
})
export class XPointPipe implements PipeTransform {

	transform(value) {
		// return Math.floor(value)
		return Number((value/7).toString().split('.')[0])
	}

}