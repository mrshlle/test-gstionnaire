/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Note } from '../models/Note.models';

@Pipe({
    name: 'filternote',
    standalone: false
})
export class FilterNotePipe implements PipeTransform {

	/* ---------------------------
	Filter the notes
	Input
	 - notes : the list to filter
	 - recherche : the filter
	Output
	 - The list filtered
	----------------------------*/
	transform(notes: Note[], recherche: string): any[] {
		if(!notes) return [];
		if(!recherche){
			return notes;
		}
		recherche = recherche.toLowerCase();
		return notes.filter( note => {
			return (note.titre.toLowerCase().includes(recherche));
		});	
	}
}