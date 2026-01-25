import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
// import { RtlComponent } from "../../pages/rtl/rtl.component";

// Smart Village pages
import { HouseholdsComponent } from "../../pages/households/households.component";
import { PersonsComponent } from "../../pages/persons/persons.component";
import { HealthComponent } from "../../pages/health/health.component";
import { UsersComponent } from "../../pages/users/users.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "icons", component: IconsComponent },
  { path: "maps", component: MapComponent },
  { path: "notifications", component: NotificationsComponent },
  { path: "user", component: UserComponent },
  { path: "tables", component: TablesComponent },
  { path: "typography", component: TypographyComponent },
  // Smart Village
  { path: "households", component: HouseholdsComponent },
  { path: "persons", component: PersonsComponent },
  { path: "health", component: HealthComponent },
  { path: "users", component: UsersComponent },
  // { path: "rtl", component: RtlComponent }
];
