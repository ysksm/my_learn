import { Routes } from "@angular/router";
import { ConfigProjectComponent } from "./contents/config-project/config-project.component";
import { HomeComponent } from "./contents/home/home.component";


export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },    
    {
        path: 'settings',
        component: ConfigProjectComponent
    },
    {
        path: 'google',
        redirectTo: 'https:////www.google.com',
    },
    {
        path: '**',
        component: HomeComponent
    },    
];
