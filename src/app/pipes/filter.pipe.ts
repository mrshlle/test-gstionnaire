/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Evenement } from '../models/Evenement.models';

@Pipe({
    name: 'filter',
    pure: false,
    standalone: false
})
export class FilterPipe implements PipeTransform {

	transform(events: Evenement[], day): Evenement[] {
		let dayEvents = events.filter(event => event.date_debut.day === day.day && event.date_debut.month === day.month && event.date_debut.year === day.year);
		dayEvents.sort((a, b) => {
		    if (a.heure_debut < b.heure_debut) return -1;
		    else if (a.heure_debut > b.heure_debut) return 1;
		    else return 0;
		});
		return dayEvents
	}
}