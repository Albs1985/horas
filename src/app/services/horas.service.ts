import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getDatabase, ref, set } from "firebase/database";



import { Observable, map } from 'rxjs';
import { Registro } from '../interfaces/registro.interface';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})


export class HorasService {

  jsonDatos = "https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro.json";
  lastIdRegistro : number = 0;
  // registroSeleccionado : string | undefined;
  tablaRegistro = 'https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro/';
  horasTotalesPorColaborador = new Map<string, { horasCompensacion: number, horasCompensadas: number }>();

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public cargarDatos(): Observable<Registro[]>{

    return this.http.get<Registro[]>(this.jsonDatos);

  }

  public guardarDatos(dato: Registro): Promise<void> {

    let fecha = dato.fecha;
    if (fecha.includes('-')){
      fecha = this.datePipe.transform(fecha, 'MM/dd/yyyy')!;
      // fecha = new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let idReg = dato.id;
    if (idReg == undefined || idReg == null ||idReg == -1){
      idReg = ++this.lastIdRegistro;
    }

    const datoMapeado = {
      "ID": idReg,
      "FECHA": fecha,
      "HORARIO": dato.horario,
      "COLABORADOR": dato.colaborador,
      "HORAS_REALIZADAS": dato.horasRealizadas,
      "HORAS_COMPENSACION": dato.horasCompensacion,
      "HORAS_COMPENSADAS": dato.horasCompensadas,
      "COMPENSADAS": dato.compensada,
      "DIAS_DISFRUTADOS": dato.diaDisfrutado,
      "TAREA": dato.tarea,
      "COMENTARIO": dato.comentario
    }

    //Para actualizar los datos
    const url = this.tablaRegistro+idReg+'.json';
    return this.http.put(url, datoMapeado).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
      })
      .catch(error => console.error('Error al guardar datos:', error));
  }


  public borrarDatos(id: string): Promise<void> {
    const url = this.tablaRegistro + id + '.json';
    return this.http.delete(url).toPromise()
      .then(() => {
        console.log('Dato borrado exitosamente');
      })
      .catch(error => console.error('Error al borrar dato:', error));
  }


}
