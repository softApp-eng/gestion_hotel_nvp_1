import {inject} from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent, HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError} from 'rxjs';
import {AuthService} from "./auth.service";
import { environment } from '../../../environments/environment';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    if ( !req.url.startsWith(environment.solidarityApi) )
        return next(req);

    //if public endpoints then do nothing
    if ( req.url.startsWith('public') )
        return next(req);

    const _authService = inject(AuthService);
    let isRefreshing = false;

    // Clone the request object
    let newReq = req.clone();

    if ( _authService.accessToken) {
        newReq = _authService.addTokenHeader(req);
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            console.log('intercepter');
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse && !newReq.url.includes('auth/login') && !newReq.url.includes('auth/refreshtoken') && (error.status == 403 || error.status == 401 )) {

                if (!isRefreshing) {
                    isRefreshing = true;
                    console.log('.......refreshing token')
                    const refreshtoken = _authService.refreshToken;
                    if (refreshtoken)
                        return _authService.signInUsingRefreshToken().pipe(
                            switchMap((status: any) => {
                                console.log('.......new refresh generated')
                                isRefreshing = false;
                                newReq = _authService.addTokenHeader(req);
                                return next(newReq);
                            }),
                            catchError((err) => {
                                console.log('.......REFRESH IS EXPIRED, log out')
                                if (err instanceof HttpErrorResponse && (err.status == 403 || err.status == 401 )) {
                                    isRefreshing = false;
                                    _authService.signOut();
                                }
                                return throwError(err);
                            })
                        );
                }
            }

            return throwError(error);
        })
    );
};
