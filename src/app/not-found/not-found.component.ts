import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service'

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.css'],
    standalone: false
})
export class NotFoundComponent implements OnInit {

	constructor(public _authService: AuthService,
				private router: Router) { }

	ngOnInit(): void {
	}

	connect(){
		this.router.navigateByUrl('/')
	}

}