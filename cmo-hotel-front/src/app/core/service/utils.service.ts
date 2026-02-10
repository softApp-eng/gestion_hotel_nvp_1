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
