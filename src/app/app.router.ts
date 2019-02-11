import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";

export const APP_ROUTE: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "**",
    redirectTo: "home"
  }
];

export const appRouter: ModuleWithProviders = RouterModule.forRoot(APP_ROUTE);
