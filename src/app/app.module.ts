/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DatePipe } from '@angular/common';

/* -----------------------------------------------------------------------------------------------------------------
@angular imports
For parameters
----------------------------------------------------------------------------------------------------------------- */
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_BOTTOM_SHEET_DEFAULT_OPTIONS } from '@angular/material/bottom-sheet';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

/* -----------------------------------------------------------------------------------------------------------------
Extarna libraries imports
----------------------------------------------------------------------------------------------------------------- */
//import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

/* -----------------------------------------------------------------------------------------------------------------
Modules imports
----------------------------------------------------------------------------------------------------------------- */
import { AppRoutingModule } from './app-routing.module';
import { MaterialComponentModule }from './material/material-component.module';

/* -----------------------------------------------------------------------------------------------------------------
Components imports
----------------------------------------------------------------------------------------------------------------- */
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { AccueilComponent } from './accueil/accueil.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { ListeComponent } from './liste/liste.component';
import { FactureComponent } from './facture/facture.component';
import { ComptaComponent } from './compta/compta.component';
import { ModificationComponent } from './modification/modification.component';
import { ParametreComponent } from './parametre/parametre.component';
import { InformationsConsultationComponent } from './informations-consultation/informations-consultation.component';
import { NoteComponent } from './note/note.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DemoComponent } from './demo/demo.component';
import { NotificationComponent } from './notification/notification.component';

/* -----------------------------------------------------------------------------------------------------------------
Modal components imports
----------------------------------------------------------------------------------------------------------------- */
import { ModalCreationFactureComponent } from './modals/modal-creation-facture/modal-creation-facture.component';
import { ModalInformationComponent } from './modals/modal-information/modal-information.component';
import { ModalSendInvoiceComponent } from './modals/modal-send-invoice/modal-send-invoice.component'
import { ModalEntryComponent } from './modals/modal-entry/modal-entry.component';
import { ModalShowDocumentComponent } from './modals/modal-show-document/modal-show-document.component';
import { ModalUpdateRecurrenceComponent } from './modals/modal-update-recurrence/modal-update-recurrence.component';

/* -----------------------------------------------------------------------------------------------------------------
Services imports
----------------------------------------------------------------------------------------------------------------- */
import { PatientService } from './services/patient.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { ModuleGuard } from './services/module-guard.service';

/* -----------------------------------------------------------------------------------------------------------------
Pipes imports
----------------------------------------------------------------------------------------------------------------- */
import { KeysPipe } from './pipes/keys.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { FilterListePipe } from './pipes/filter-liste.pipe';
import { DescInfoPipe } from './pipes/desc-info.pipe'; 
import { FilterPatientPipe } from './pipes/filter-patient.pipe';
import { FilterNotePipe } from './pipes/filter-note.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { CheckedPipe } from './pipes/checked.pipe';
import { PercentPipe } from './pipes/percent.pipe';
import { PaymentPipe } from './pipes/payment.pipe';
import { DividePipe } from './pipes/divide.pipe';
import { XPointPipe } from './pipes/xpoint.pipe';
import { OriginPipe } from './pipes/origin.pipe';
import { CountPipe } from './pipes/count.pipe';

/* -----------------------------------------------------------------------------------------------------------------
Interceptors imports
----------------------------------------------------------------------------------------------------------------- */
import { AuthInterceptor } from './interceptors/auth.interceptor';

//const socketConfig: SocketIoConfig = { url: 'https://api.gstionnaire.com', options: {} };

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        DashboardComponent,
        ConnexionComponent,
        AccueilComponent,
        NouveauComponent,
        ListeComponent,
        FactureComponent,
        ComptaComponent,
        ModificationComponent,
        ParametreComponent,
        InformationsConsultationComponent,
        NoteComponent,
        ModalCreationFactureComponent,
        ModalInformationComponent,
        ModalSendInvoiceComponent,
        KeysPipe,
        SafePipe,
        FilterPipe,
        FilterListePipe,
        DescInfoPipe,
        FilterPatientPipe,
        FilterNotePipe,
        SumPipe,
        CheckedPipe,
        PercentPipe,
        PaymentPipe,
        DividePipe,
        XPointPipe,
        OriginPipe,
        CountPipe,
        NotFoundComponent,
        DemoComponent,
        ModalEntryComponent,
        ModalShowDocumentComponent,
        NotificationComponent,
        ModalUpdateRecurrenceComponent,
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        MaterialComponentModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatNativeDateModule], providers: [
        PatientService,
        AuthService,
        AuthGuard,
        ModuleGuard,
        DatePipe,
        SumPipe,
        CheckedPipe,
        PercentPipe,
        PaymentPipe,
        DividePipe,
        XPointPipe,
        OriginPipe,
        CountPipe,
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, direction: 'ltr' } },
        { provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
        // Parameters for the datepickers
        { provide: LOCALE_ID, useValue: "fr-FR" },
        { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
        // Add HTTP interceptor, to change request
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })

export class AppModule {}