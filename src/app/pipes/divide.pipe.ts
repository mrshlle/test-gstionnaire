/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'divide',
    standalone: false
})
export class DividePipe implements PipeTransform {

	transform(event, shownEventsDaysHours) {
		const firstHour = Number(event.heure_debut.split(':')[0])
		const firstHourFirstQuarter = Number(event.heure_debut.split(':')[1])
		const lastHour = Number(event.heure_fin.split(':')[0])
		const lastHourLastQuarter = Number(event.heure_fin.split(':')[1])
		const quarters = [0,15,30,45]
		let hours = []
		for (var i = firstHour; i <= lastHour; ++i) {
			for (var j = 0; j < 4; ++j) {
				const hour = i + ":" + (j === 0 ? "00" : quarters[j])
				if (firstHour === lastHour){
					if (quarters[j] >= firstHourFirstQuarter && quarters[j] <= lastHourLastQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else if (i === firstHour) {
					if (quarters[j] >= firstHourFirstQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else if (i === lastHour){
					if (quarters[j] <= lastHourLastQuarter) {
						hours.push(hour + 'end')
						hours.push(hour + 'start')
					}
				}else{
					hours.push(hour + 'end')
					hours.push(hour + 'start')
				}
			}
		}
		hours.splice(hours.indexOf(firstHour + ':' + (firstHourFirstQuarter === 0 ? "00" : firstHourFirstQuarter) + 'end'),1)
		hours.splice(hours.indexOf(lastHour + ':' + (lastHourLastQuarter === 0 ? "00" : lastHourLastQuarter) + 'start'),1)
		const day = event.date_debut.day.toString() + event.date_debut.month.toString() + event.date_debut.year.toString()
		let maxLength = -1
		for (var i = 0; i < hours.length; ++i) {
			let ids = shownEventsDaysHours[day][hours[i]]
			if (ids.length > maxLength) {
				maxLength = ids.length
			}
		}
		return maxLength
	}

}