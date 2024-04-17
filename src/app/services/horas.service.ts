import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { getDatabase, ref, set } from "firebase/database";



import { Observable, map } from 'rxjs';
import { Registro } from '../interfaces/registro.interface';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})


export class HorasService {

  //BBDD EN FIREBASE:
  // jsonDatos = "https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro.json";
  // tablaRegistro = 'https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro/';

  //BBDD EN LOCAL
  jsonDatos = "assets/data/Horas.json";

  // BBDD EN NODE SERVER:
  // rutaApi = "http://localhost:3000/nodeServer/api/";
  rutaApi = "http://iv1io0003.itg.mercadona.com:3000/nodeServer/api/";
  getRegistros = "registros";
  tabla = "registro";
  lastIdRegistro : number = 0;

  horasTotalesPorColaborador = new Map<string, { horasCompensacion: number, horasCompensadas: number }>();

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public cargarDatos(): Observable<Registro[]>{

    return this.http.get<any[]>(this.rutaApi+this.getRegistros);

  }

  public guardarDatos(dato: any): Promise<any> {

    let reg : Registro = {
      ID: dato.id,
      FECHA: dato.fecha,
      HORARIO: dato.horario,
      COLABORADOR: dato.colaborador,
      HORAS_REALIZADAS: dato.horasRealizadas,
      TAREA: dato.tarea,
      HORAS_COMPENSACION: dato.horasCompensacion,
      HORAS_COMPENSADAS: dato.horasCompensadas,
      COMPENSADAS: dato.compensada,
      DIAS_DISFRUTADOS: dato.diaDisfrutado,
      COMENTARIO: dato.comentario
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

    const datoMapeado = {
      "ID": idReg,
      "FECHA": fecha,
      "HORARIO": reg.HORARIO,
      "COLABORADOR": reg.COLABORADOR,
      "HORAS_REALIZADAS": reg.HORAS_REALIZADAS,
      "HORAS_COMPENSACION": reg.HORAS_COMPENSACION,
      "HORAS_COMPENSADAS": reg.HORAS_COMPENSADAS,
      "COMPENSADAS": reg.COMPENSADAS,
      "DIAS_DISFRUTADOS": reg.DIAS_DISFRUTADOS,
      "TAREA": reg.TAREA,
      "COMENTARIO": reg.COMENTARIO
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    if (insertar){

      return this.http.post(this.rutaApi+this.tabla, datoMapeado, { headers }).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
      })
      .catch(error => console.error('Error al guardar datos:', error));

    }else{//ACTUALIZAR

      return this.http.put(this.rutaApi+this.tabla+'/'+idReg, datoMapeado, { headers }).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
      })
      .catch(error => console.error('Error al guardar datos:', error));

    }


  }


  public borrarDatos(id: string): Promise<void> {
    const url = this.rutaApi+this.tabla+'/'+id;
    return this.http.delete(url).toPromise()
      .then(() => {
        console.log('Dato borrado exitosamente');
      })
      .catch(error => console.error('Error al borrar dato:', error));
  }


}
