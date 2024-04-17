import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Registro } from 'src/app/interfaces/registro.interface';
import { HorasService } from 'src/app/services/horas.service';

@Component({
  selector: 'app-nocturnidad',
  templateUrl: './nocturnidad.component.html',
  styleUrls: ['./nocturnidad.component.css']
})
export class NocturnidadComponent implements OnInit {

  datos: Registro[] = [];
  datosFiltrados: Registro[] = [];
  formulario: FormGroup;
  horasNocturnasPorColaborador = new Map<string, number>();
  fechasIncorrectas: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  sinRegistros: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public horasService: HorasService){

    this.formulario = new FormGroup({
      fechaIni: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/)]),
      fechaFin: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/)])
    });
  }
  ngOnInit(): void {
    this.cargaDatos();
  }


  cargaDatos(){
    this.horasService.cargarDatos().subscribe((res: any) => {
      // console.log(res);
      this.datos = (res.registro as Registro[])
      .filter(item => item != null)//para cuando borramos datos, no se vuelvan a añadir
      .map((item, index) => ({
        ID: item.ID,
        FECHA: new Date(item.FECHA).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        HORARIO: item.HORARIO,
        COLABORADOR: item.COLABORADOR,
        HORAS_REALIZADAS: item.HORAS_REALIZADAS,
        TAREA: item.TAREA,
        HORAS_COMPENSACION: item.HORAS_COMPENSACION,
        HORAS_COMPENSADAS: item.HORAS_COMPENSADAS,
        COMPENSADAS: item.COMPENSADAS,
        DIAS_DISFRUTADOS: item.DIAS_DISFRUTADOS,
        COMENTARIO: item.COMENTARIO
      }));
      console.log(this.datos);
    });
  }

  extraerNocturnidades(): void {

    this.horasNocturnasPorColaborador.clear();

    const fecIniFiltro = new Date(this.formulario.controls['fechaIni'].value);
    const fecFinFiltro = new Date(this.formulario.controls['fechaFin'].value);

    if (fecIniFiltro < fecFinFiltro){
      this.fechasIncorrectas.next(false);
      this.datosFiltrados = this.datos.filter(dato => {
        const fechaString = dato.FECHA; // "dd/mm/yyyy"
        const partes = fechaString.split("/"); // Dividir la cadena en partes usando "/"
        const fecha = new Date(parseInt(partes[2]), parseInt(partes[1])-1, parseInt(partes[0])); // Crear el objeto Date
        const horario = dato.HORARIO;
        const horasRealizadas = dato.HORAS_REALIZADAS;

        if (fecha >= fecIniFiltro && fecha <= fecFinFiltro && this.esHorarioNocturno(horario)) {
            const colaborador = dato.COLABORADOR;
            const horasNocturnas = this.horasNocturnasPorColaborador.get(colaborador) || 0;
            this.horasNocturnasPorColaborador.set(colaborador, parseFloat(horasNocturnas + horasRealizadas));
            return true; // Mantenemos el dato en datosFiltrados
        } else {
            return false; // Descartamos el dato de datosFiltrados
        }
      });
    }else{
      this.fechasIncorrectas.next(true);
      this.datosFiltrados = [];
    }

    if (this.horasNocturnasPorColaborador.size === 0){
      this.sinRegistros.next(true);
    }else{
      this.sinRegistros.next(false);
    }

    console.log(this.horasNocturnasPorColaborador);
  }

  private esHorarioNocturno(horario: string): boolean {

    const horaInicioNocturna = 22;
    const horaFinNocturna = 6;

    const hora = parseInt(horario.split(':')[0]);
    return hora >= horaInicioNocturna || hora < horaFinNocturna;
  }
}
