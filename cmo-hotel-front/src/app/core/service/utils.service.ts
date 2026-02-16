import {Injectable} from "@angular/core";
import { DateTime } from 'luxon';

@Injectable({providedIn:'root'})
export class UtilsService {
  /**
   * Constructor
   */
  constructor( ) {
  }


  convertToDate(date){
      if (DateTime.isDateTime(date)) {
          return date.toFormat('dd/MM/yyyy');
      } else {
          // Fallback if it's still a native Date object
          return  DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
      }
  }

    convertToLocalDateTime(date, time) {
        let dt;

        // 1. On récupère la base de la date
        if (DateTime.isDateTime(date)) {
            dt = date;
        } else {
            dt = DateTime.fromJSDate(date);
        }

        // 2. On extrait les heures et minutes de la chaîne "HH:mm"
        const [hours, minutes] = time.split(':').map(Number);

        // 3. On applique l'heure à la date et on formate
        return dt.set({
            hour: hours,
            minute: minutes,
            second: 0,
            millisecond: 0
        }).toFormat('dd/MM/yyyy HH:mm');
    }

    calculateDuration(startAt,endAt) {
        if (startAt && endAt) {
            const start = new Date(startAt);
            const end = new Date(endAt);
            const diffInMs = end.getTime() - start.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
            return  Math.round(diffInDays) + 1;
        } else {
            return  null;
        }
    }

}
