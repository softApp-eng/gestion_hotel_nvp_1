import {
    HttpEvent, HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from '../../../environments/environment';

export const LanguageInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    if (req.url.startsWith(environment.solidarityApi)){
        const language = localStorage.getItem('lang') || 'en';
        const modifiedReq = req.clone({
            setHeaders: {
                'Accept-Language': language
            }
        });

        return next(modifiedReq);
    }
    else
        return next(req);





};
