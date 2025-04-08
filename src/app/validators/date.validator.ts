import { FormGroup, ValidatorFn, ValidationErrors } from "@angular/forms";

export function DateValidator(dayControlName, monthControlName, yearControlName, required): ValidatorFn {
	return (formGroup: FormGroup): ValidationErrors => {
		let dayControl = formGroup.controls[dayControlName];
		let monthControl = formGroup.controls[monthControlName]
		let yearControl = formGroup.controls[yearControlName]
		if (dayControl.errors && !dayControl.errors.dateValidator) {
			return;
		}
		if (monthControl.errors && !monthControl.errors.dateValidator){
			return
		}
		if (required && ((dayControl.value === '') || (monthControl.value === '') || (yearControl.value === ''))){
			dayControl.setErrors({ dateValidator: true})
		}else{
			dayControl.setErrors(null)
		}
		if ((Number(monthControl.value) < 1) || (Number(dayControl.value) < 1) || (Number(yearControl.value) < 1)) {
			if (required) {
				dayControl.setErrors({ dateValidator: true })
			}
		}else{
			if ((Number(monthControl.value) === 2) && (Number(dayControl.value) > 29)) {
				dayControl.setErrors({ dateValidator: true });
			} else {
				if (Number(dayControl.value) > 31) {
					dayControl.setErrors({dateValidator: true})
				}else{
					dayControl.setErrors(null);
				}
			}
		}
	};
}