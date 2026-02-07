import {Injectable} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class ApiGlobalService
{

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    listNatures(){
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/natures/list`
        );
    }
}
