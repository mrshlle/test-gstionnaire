/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* -----------------------------------------------------------------------------------------------------------------
Components imports
----------------------------------------------------------------------------------------------------------------- */
import { ConnexionComponent } from './connexion/connexion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccueilComponent } from './accueil/accueil.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { ListeComponent } from './liste/liste.component';
import { FactureComponent } from './facture/facture.component';
import { ComptaComponent } from './compta/compta.component';
import { ModificationComponent } from './modification/modification.component';
import { InformationsConsultationComponent } from './informations-consultation/informations-consultation.component';
import { ParametreComponent } from './parametre/parametre.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DemoComponent } from './demo/demo.component';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { AuthGuard } from './services/auth-guard.service';
import { ModuleGuard } from './services/module-guard.service';

/* ---------------------------
Creation of the routes
Add 'canActivate: [AuthGuard]' on every routes that need to be logged to be used
----------------------------*/
const routes: Routes = [
	{ path: 'login', component: ConnexionComponent },
	{ path: 'dashboard',canActivate: [AuthGuard], component: DashboardComponent },
	{ path: 'accueil',canActivate: [AuthGuard], component: AccueilComponent },
	{ path: 'nouveau',canActivate: [AuthGuard], component: NouveauComponent },
	{ path: 'liste',canActivate: [AuthGuard], component: ListeComponent },
	{ path: 'facture',canActivate: [AuthGuard, ModuleGuard], component: FactureComponent },
	{ path: 'compta',canActivate: [AuthGuard, ModuleGuard], component: ComptaComponent },
	{ path: 'modification',canActivate: [AuthGuard, ModuleGuard], component: ModificationComponent },
	{ path: 'informations-consultation',canActivate: [AuthGuard, ModuleGuard], component: InformationsConsultationComponent },
	{ path: 'parametre',canActivate: [AuthGuard], component: ParametreComponent },
	{ path: 'demo', component: DemoComponent },
  	{ path: '', component: ConnexionComponent },
  	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}