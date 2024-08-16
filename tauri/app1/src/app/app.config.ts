import { ApplicationConfig } from "@angular/core";
import { provideRouter, withDebugTracing } from "@angular/router";

import { routes } from "./app.routes";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withDebugTracing()), 
    provideAnimationsAsync(), 
    provideAnimationsAsync()],
};
