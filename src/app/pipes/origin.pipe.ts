/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'origin',
    pure: false,
    standalone: false
})
export class OriginPipe implements PipeTransform {

	transform(list, origin) {
		return list.filter(elem => elem.origin === origin);
	}

}