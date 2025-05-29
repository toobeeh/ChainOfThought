import { Routes } from '@angular/router';
import {LandingComponent} from "./pages/landing/landing.component";
import {UserHomeComponent} from "./pages/user-home/user-home.component";
import {authGuard} from "./guards/auth.guard";

export const routes: Routes = [
    {
        path: "",
        component: LandingComponent
    },
    {
        path: "home",
        component: UserHomeComponent,
        canActivate: [authGuard]
    }
];
