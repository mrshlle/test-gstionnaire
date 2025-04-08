/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

/* -----------------------------------------------------------------------------------------------------------------
External libraries imports
----------------------------------------------------------------------------------------------------------------- */
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private _authService: AuthService) {}

  	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  		// Get token from localStorage
  		const idToken = localStorage.getItem("id_token");
		const encrypted = localStorage.getItem('x-qwemp-data');

		if (idToken) {
			// If token is stored, add it to the header of the HTTP request
			const cloned = req.clone({
				headers: req.headers.set("Authorization", "Bearer " + idToken)
									.set("X-QWEMP-data", encrypted)
			});
			req = cloned
		}
		return next.handle(req).pipe(
      		catchError((requestError) => {
        		if (requestError.status === 401) {
          			this._authService.expirationSignOut()
        		}
       			return throwError(requestError);
      		})
      	)
	}
}