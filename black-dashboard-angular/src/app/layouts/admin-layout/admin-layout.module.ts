import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
// import { RtlComponent } from "../../pages/rtl/rtl.component";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { MaterialModule } from "../../shared/material.module";

import { HouseholdsComponent } from "../../pages/households/households.component";
import { HouseholdDialogComponent } from "../../pages/households/household-dialog.component";
import { PersonsComponent } from "../../pages/persons/persons.component";
import { PersonDialogComponent } from "../../pages/persons/person-dialog.component";
import { HealthComponent } from "../../pages/health/health.component";
import { HealthDialogComponent } from "../../pages/health/health-dialog.component";
import { UsersComponent } from "../../pages/users/users.component";
import { UserDialogComponent } from "../../pages/users/user-dialog.component";
import { ProfileSettingsComponent } from "../../pages/profile-settings/profile-settings.component";
import { ReportsComponent } from "../../pages/reports/reports.component";
import { RtlComponent } from "../../pages/rtl/rtl.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    MaterialModule,
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    TablesComponent,
    IconsComponent,
    TypographyComponent,
    NotificationsComponent,
    MapComponent,
    HouseholdsComponent,
    HouseholdDialogComponent,
    PersonsComponent,
    PersonDialogComponent,
    HealthComponent,
    HealthDialogComponent,
    UsersComponent,
    UserDialogComponent,
    ProfileSettingsComponent,
    ReportsComponent,
    RtlComponent,
  ]
})
export class AdminLayoutModule {}
