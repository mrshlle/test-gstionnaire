/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'keys',
    standalone: false
})
export class KeysPipe implements PipeTransform {

	/* ---------------------------
	Change an object to his keys
	Input
	 - value : the object to change
	Output
	 - The keys of the object
	----------------------------*/
	transform(value) : any {
		return Object.keys(value)
	}
}