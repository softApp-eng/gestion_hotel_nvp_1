import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiAuditService
{

    private readonly API_URL = `${environment.solidarityApi}/v1/audit/logs`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    search(key='',usernames=[],targets=[],operations=[],start = '',end = '',page=0,size=20): Observable<any>{
        let params = new HttpParams()
            .set('key', key)
            .set('start', start)
            .set('end', end)
            .set('page', page)
            .set('size', size);
        if (targets && targets.length > 0) {
            targets.forEach(s => {
                params = params.append('targets', s);
            });
        }
        if (usernames && usernames.length > 0) {
            usernames.forEach(s => {
                params = params.append('usernames', s);
            });
        }
        if (operations && operations.length > 0) {
            operations.forEach(s => {
                params = params.append('operations', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    getActionTargets(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/targets`);
    }

    getActionOperations(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/operations`);
    }

    getAccounts(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/accounts`);
    }

}
