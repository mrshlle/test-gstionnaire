import { UntypedFormGroup, ValidatorFn, ValidationErrors } from "@angular/forms";

export function BetweenDateValidator(dayControlName, monthControlName, yearControlName, minDate, maxDate): ValidatorFn {
	return (formGroup: UntypedFormGroup): ValidationErrors => {
		let dayControl = formGroup.controls[dayControlName];
		let monthControl = formGroup.controls[monthControlName]
		let yearControl = formGroup.controls[yearControlName]
		if (dayControl.errors && !dayControl.errors.betweenDateValidator) {
			return;
		}
		if (monthControl.errors && !monthControl.errors.betweenDateValidator){
			return;
		}
		if (yearControl.errors && !yearControl.errors.betweenDateValidator){
			return;
		}
		if ((Number(monthControl.value) < 1) || (Number(dayControl.value) < 1)) {
			dayControl.setErrors({ betweenDateValidator: true });
		}else{
			if ((Number(monthControl.value) === 2) && (Number(dayControl.value) > 29)) {
				dayControl.setErrors({ betweenDateValidator: true });
			} else {
				if ((Number(yearControl.value) < minDate.year) || (Number(yearControl.value) > maxDate.year)) {
					yearControl.setErrors({ betweenDateValidator: true });
				}else if (((Number(yearControl.value) === minDate.year) && (Number(monthControl.value) < minDate.month)) || ((Number(yearControl.value) === maxDate.year) && (Number(monthControl.value) > maxDate.month))) {
					monthControl.setErrors({ betweenDateValidator: true });
				}else if (((Number(yearControl.value) === minDate.year) && (Number(monthControl.value) === minDate.month) && (Number(dayControl.value) < minDate.day)) || ((Number(yearControl.value) === maxDate.year) && (Number(monthControl.value) === maxDate.month)  && (Number(dayControl.value) > maxDate.day))) {
					dayControl.setErrors({ betweenDateValidator: true });
				}else{
					yearControl.setErrors(null);
					monthControl.setErrors(null);
					dayControl.setErrors(null);
				}
			}
		}
	};
}