import {Injectable} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiCommonService
{
    private readonly API_URL = `${environment.solidarityApi}/v1/common`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    grades(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/grades`);
    }

    getEnumsData(target : 'grade-categories'|'guest-roles'|'relationships'|'reservation-categories'|'reservation-status'|'meal-types'|'invoice-status'|'payment-mode'): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/enums/${target}`);
    }

}
