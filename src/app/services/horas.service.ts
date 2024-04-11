import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { AngularFireDatabase } from '@angular/fire/database';
// import { AngularFireDatabase } from '@angular/fire/compat/database';
import 'firebase/database';
import { Observable, map } from 'rxjs';
// import * as XLSX from 'xlsx';
import { Registro } from '../interfaces/registro.interface';

@Injectable({
  providedIn: 'root'
})
export class HorasService {

  jsonDatos = "https://horas-7a288-default-rtdb.europe-west1.firebasedatabase.app/registro.json";

  //, @Inject(AngularFireDatabase) private db: AngularFireDatabase
  constructor(private http: HttpClient) { }

  public cargarDatos(): Observable<Registro[]>{

    return this.http.get<Registro[]>(this.jsonDatos);

  }

  guardarDatos(datos: any): Observable<any> {
    // return this.db.list('registro').push(datos);
    return this.http.get<Registro[]>(this.jsonDatos);
  }



  // public cargarInformacionDesdeFicheroExcel(archivo: File): any[] {
  //   const reader: FileReader = new FileReader();
  //   const resultados: any[] = [];

  //   reader.onload = (e: any) => {
  //     const datos: ArrayBuffer = e.target.result;
  //     const workbook: XLSX.WorkBook = XLSX.read(datos, { type: 'array' });
  //     const hojaNombre: string = workbook.SheetNames[0];
  //     const hoja: XLSX.WorkSheet = workbook.Sheets[hojaNombre];
  //     resultados.push(XLSX.utils.sheet_to_json(hoja, { header: 1 }));
  //   };

  //   reader.readAsArrayBuffer(archivo);

  //   return resultados;
  // }

  // public cargarInformacionDesdeRutaExcel(rutaArchivo: string): any[] {
  //   debugger
  //   const resultados: any[] = [];
  //   const datos = XLSX.readFile(rutaArchivo);
  //   const hoja = datos.Sheets[datos.SheetNames[0]];
  //   resultados.push(XLSX.utils.sheet_to_json(hoja, { header: 1 }));
  //   return resultados;
  // }



}
