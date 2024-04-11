import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getDatabase, ref, set } from "firebase/database";



import { Observable, map } from 'rxjs';
import { Registro } from '../interfaces/registro.interface';

@Injectable({
  providedIn: 'root'
})


export class HorasService {

  jsonDatos = "https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro.json";
  numRegistros : number = 0;
  registroSeleccionado : string | undefined;
  tablaRegistro = 'https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro/';

  constructor(private http: HttpClient) { }

  public cargarDatos(): Observable<Registro[]>{

    return this.http.get<Registro[]>(this.jsonDatos);

  }

  public guardarDatos(dato: Registro): Promise<void> {

    let fecha = dato.fecha;
    if (fecha.includes('-')){
      fecha = new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const datoMapeado = {
      "FECHA": fecha,
      "HORARIO": dato.horario,
      "COLABORADOR": dato.colaborador,
      "HORAS REALIZADAS": dato.horasRealizadas,
      "HORAS DE COMPENSACIÓN": dato.horasCompensacion,
      "HORAS COMPENSADAS": dato.horasCompensadas,
      "¿COMPENSADAS?": dato.compensada,
      "DIA DISFRUTADO": dato.diaDisfrutado,
      "TAREA": dato.tarea,
      "COMENTARIO": dato.comentario
    }

    //Para actualizar los datos
    let idReg = this.registroSeleccionado;
    if (this.registroSeleccionado == '' || this.registroSeleccionado == undefined || this.registroSeleccionado == null){
      idReg = ''+this.numRegistros;
    }
    debugger
    const url = this.tablaRegistro+idReg+'.json';
    return this.http.put(url, datoMapeado).toPromise()
      .then(() => {
        console.log('Datos guardados exitosamente');
        this.numRegistros++;
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
