import {Injectable} from "@angular/core";
import {ToastrService} from "ngx-toastr";
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

}
