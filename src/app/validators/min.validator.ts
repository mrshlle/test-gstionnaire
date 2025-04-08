import { FormGroup, ValidatorFn, ValidationErrors } from "@angular/forms";

export function MinValidator(controlName): ValidatorFn {
	return (formGroup: FormGroup): ValidationErrors => {
		const control = formGroup.controls[controlName]
		if (control.value < 1) {
			control.setErrors({minValidator:true})
		}else{
			control.setErrors(null)
		}
		return
	};
}