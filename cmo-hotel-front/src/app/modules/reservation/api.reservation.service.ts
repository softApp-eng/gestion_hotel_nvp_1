import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiReservationService {

    private readonly API_URL = `${environment.solidarityApi}/v1/reservations`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

  /*
      @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size
   */

    search(key='',page=0,size=20): Observable<any>{
        let params = new HttpParams()
            .set('key', key)
            .set('page', page)
            .set('size', size);
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

}
