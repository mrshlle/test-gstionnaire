import { FormGroup, ValidatorFn, ValidationErrors } from "@angular/forms";
import { DateTime } from "luxon"

export function SuperiorDateValidator(superiorDateControlName, inferiorDateControlName): ValidatorFn {
	return (formGroup: FormGroup): ValidationErrors => {
		let superiorDate = DateTime.fromObject({
			'day':Number(formGroup.get(superiorDateControlName).get('day').value),
			'month':Number(formGroup.get(superiorDateControlName).get('month').value),
			'year':Number(formGroup.get(superiorDateControlName).get('year').value)
		})
		let inferiorDate = DateTime.fromObject({
			'day':Number(formGroup.get(inferiorDateControlName).get('day').value),
			'month':Number(formGroup.get(inferiorDateControlName).get('month').value),
			'year':Number(formGroup.get(inferiorDateControlName).get('year').value)
		})
		if (superiorDate.toMillis() < inferiorDate.toMillis()) {
			formGroup.get(superiorDateControlName).setErrors({superiorDateValidator:true})
		}else{
			formGroup.get(superiorDateControlName).setErrors(null)
		}
		return;
	};
}