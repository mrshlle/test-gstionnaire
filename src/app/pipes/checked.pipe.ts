/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checked',
    pure: false,
    standalone: false
})
export class CheckedPipe implements PipeTransform {

	transform(list) {
		return list.filter(elem => elem.checked);
	}

}