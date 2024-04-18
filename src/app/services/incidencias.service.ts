import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { getDatabase, ref, set } from "firebase/database";



import { Observable, map } from 'rxjs';
import { Registro } from '../interfaces/registro.interface';
import { DatePipe } from '@angular/common';
import { Incidencia } from '../interfaces/incidencia.interface';

@Injectable({
  providedIn: 'root'
})


export class IncidenciasService {

  //BBDD EN FIREBASE:
  // jsonDatos = "https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro.json";
  // tablaRegistro = 'https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro/';

  //BBDD EN LOCAL
  // jsonDatos = "assets/data/incidencias.json";

  // BBDD EN NODE SERVER:
  rutaApi = "http://localhost:3000/nodeServer/api/";
  // rutaApi = "http://iv1io0003.itg.mercadona.com:3000/nodeServer/api/";
  // getRegistros = "registros";
  // tabla = "registro";
  tablaIncidencias = 'incidencias';
  lastIdRegistro : number = 0;

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public cargarDatos(): Observable<Incidencia[]>{

    return this.http.get<any[]>(this.rutaApi+this.tablaIncidencias);

  }

  public guardarDatos(item: any): Promise<any> {

    let reg : Incidencia = {
      ID: item.id,
      FECHA: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      APP: item.app,
      PROCESO: item.proceso,
      RELANZABLE: item.relanzable,
      COLABORADOR: item.colaborador,
      RESUELTO: item.resuelto,
      SOLUCION: item.solucion,
      OBSERVACIONES: item.observaciones,
      TRAZAS: item.trazas
    }

    let fecha = reg.FECHA;
    if (fecha.includes('-')){
      fecha = this.datePipe.transform(fecha, 'MM/dd/yyyy')!;
    }
    let insertar = false;
    let idReg = reg.ID;
    if (idReg == undefined || idReg == null ||idReg == -1){
      idReg = ++this.lastIdRegistro;
      insertar = true;
    }

    reg.FECHA = fecha;
    reg.ID = idReg;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    if (insertar){

      return this.http.post(this.rutaApi+this.tablaIncidencias, reg, { headers }).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
      })
      .catch(error => console.error('Error al guardar datos:', error));

    }else{//ACTUALIZAR

      return this.http.put(this.rutaApi+this.tablaIncidencias+'/'+idReg, reg, { headers }).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
      })
      .catch(error => console.error('Error al guardar datos:', error));

    }


  }


  public borrarDatos(id: string): Promise<void> {
    const url = this.rutaApi+this.tablaIncidencias+'/'+id;
    return this.http.delete(url).toPromise()
      .then(() => {
        console.log('Dato borrado exitosamente');
      })
      .catch(error => console.error('Error al borrar dato:', error));
  }


}
