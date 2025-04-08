/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'count',
    standalone: false
})
export class CountPipe implements PipeTransform {

	transform(ids) {
		let count = 0
		for (var i = 0; i < ids.length; ++i) {
			if (i > 1 && ids[i] !== -1) {
				count += 1
			}
		}
		return count
	}
}