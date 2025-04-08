/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safe',
    standalone: false
})
export class SafePipe implements PipeTransform {

	/* ---------------------------
	Instanciate components, libraries, ...
	----------------------------*/
	constructor(private sanitizer: DomSanitizer){}

	/* ---------------------------
	Sanitize the url
	Input
	 - url : url to sanitize
	Output
	 - The url sanitized
	----------------------------*/
	transform(url) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

}