/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

/* -----------------------------------------------------------------------------------------------------------------
Models imports
----------------------------------------------------------------------------------------------------------------- */
import { Info } from '../models/Info.models';

@Pipe({
    name: 'descinfo',
    standalone: false
})
export class DescInfoPipe implements PipeTransform {

	/* ---------------------------
	Transform the description if it's longer than 40 characters
	Input
	 - description : the string of the description
	Output
	 - The new description with ... instead of the rest of the text
	----------------------------*/
	transform(description: string): any{
		let desc = "";
		if(description.length>40){
			desc = description.substring(0,40) + "...";
		}else{
			desc = description;
		}
		return desc;
	}
}