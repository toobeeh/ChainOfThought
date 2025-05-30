import { Routes } from '@angular/router';
import {LandingComponent} from "./pages/landing/landing.component";
import {UserHomeComponent} from "./pages/user-home/user-home.component";
import {authGuard} from "./guards/auth.guard";
import {BuyComponent} from "./pages/buy/buy.component";
import {AliasComponent} from "./pages/alias/alias.component";
import {RewardComponent} from "./pages/reward/reward.component";
import {AboutComponent} from "./pages/about/about.component";
import {WriteComponent} from "./pages/write/write.component";

export const routes: Routes = [
    {
        path: "",
        component: LandingComponent
    },
    {
        path: "home",
        component: UserHomeComponent,
        canActivate: [authGuard]
    },
    {
        path: "buy",
        component: BuyComponent,
        canActivate: [authGuard]
    },
    {
        path: "alias",
        component: AliasComponent,
        canActivate: [authGuard]
    },
    {
        path: "reward",
        component: RewardComponent,
        canActivate: [authGuard]
    },
    {
        path: "about",
        component: AboutComponent,
        canActivate: [authGuard]
    },
    {
        path: "write",
        component: WriteComponent,
        canActivate: [authGuard]
    }
];
