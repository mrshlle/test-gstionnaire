import { UntypedFormGroup, ValidatorFn, ValidationErrors } from "@angular/forms";

export function ConfirmPasswordValidator(controlName, matchingControlName): ValidatorFn {
	return (formGroup: UntypedFormGroup): ValidationErrors => {
		let control = formGroup.controls[controlName];
		let matchingControl = formGroup.controls[matchingControlName]
		if (matchingControl.errors && !matchingControl.errors.confirmPasswordValidator) {
			return;
		}
		if (control.value !== matchingControl.value) {
			matchingControl.setErrors({ confirmPasswordValidator: true });
		} else {
			matchingControl.setErrors(null);
		}
	};
}