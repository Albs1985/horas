import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { HorasComponent } from './pages/horas/horas.component';
import { GraficaComponent } from './pages/grafica/grafica.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'horas', component: HorasComponent },
  { path: 'grafica', component: GraficaComponent },
  { path: '**', pathMatch: 'full', redirectTo : 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
