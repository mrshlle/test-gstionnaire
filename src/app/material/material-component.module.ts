/* -----------------------------------------------------------------------------------------------------------------
@angular imports
----------------------------------------------------------------------------------------------------------------- */
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule, } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';

/* ---------------------------
Material components variable
----------------------------*/
const MaterialComponentModules = [
	MatTabsModule,
    MatDatepickerModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
	MatSelectModule,
	MatSlideToggleModule,
	MatIconModule,
	MatMenuModule,
	MatButtonModule,
	MatCardModule,
	MatGridListModule,
	MatChipsModule,
	MatCheckboxModule,
	MatDialogModule,
	MatListModule,
	MatTableModule,
	MatPaginatorModule,
	MatExpansionModule,
	MatButtonToggleModule,
	MatDividerModule,
	MatTooltipModule,
	MatSortModule,
	MatProgressSpinnerModule,
	DragDropModule,
	OverlayModule
]

/* ---------------------------
Declaration of all the material modules
----------------------------*/
@NgModule({
  declarations: [],
  imports: [
    MaterialComponentModules
  ],
  exports: [
  	MaterialComponentModules
  ]
})

/* ---------------------------
Exporting the module
----------------------------*/
export class MaterialComponentModule { }