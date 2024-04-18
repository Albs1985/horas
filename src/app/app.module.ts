import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { HorasComponent } from './pages/horas/horas.component';
import { HttpClientModule } from '@angular/common/http';
import { HorasService } from './services/horas.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraficaComponent } from './pages/grafica/grafica.component';
import { DatePipe } from '@angular/common';
import { NocturnidadComponent } from './pages/nocturnidad/nocturnidad.component';
import { GuardiasComponent } from './pages/guardias/guardias.component';
import { IncidenciasComponent } from './pages/incidencias/incidencias.component';
import { IncidenciasService } from './services/incidencias.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    HorasComponent,
    GraficaComponent,
    NocturnidadComponent,
    GuardiasComponent,
    IncidenciasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [HorasService, IncidenciasService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
