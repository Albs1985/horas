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
  hoy = new Date();

  constructor(public horasService: HorasService){

    this.formulario = new FormGroup({
      fechaIni: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/)]),
      fechaFin: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/)])
    });
  }
  ngOnInit(): void {
    this.cargaDatos();
    this.cargaFechaActual();
  }

  agregarCeros(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  cargaFechaActual(){
    const hoy = new Date();
    const fechaFormateada = hoy.getFullYear() + '-' + this.agregarCeros(hoy.getMonth()+1) + '-' + this.agregarCeros(hoy.getDate());
    this.formulario.get('fechaFin')!.setValue(fechaFormateada);
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
        const horasRealizadas = parseFloat(dato.HORAS_REALIZADAS);

        if (fecha >= fecIniFiltro && fecha <= fecFinFiltro && this.esHorarioNocturno(horario)) {
            const colaborador = dato.COLABORADOR;
            const horasNocturnas = this.horasNocturnasPorColaborador.get(colaborador) || 0;
            let horasCalculadas = 0;
            //Si la hora de fin es mayor que la de inicio de la nocturnidad

            if (parseFloat(horario.split('-')[1].split(':')[0]) >= 22){
              horasCalculadas = this.calcularHorasNocturnas(horario);
            }else{
              horasCalculadas = horasRealizadas;
            }

            this.horasNocturnasPorColaborador.set(colaborador, (horasNocturnas + horasCalculadas));
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

    const horaIni = parseInt(horario.split(':')[0]);
    const horaFin = parseInt(horario.split('-')[1]);
    return horaIni >= horaInicioNocturna || horaIni < horaFinNocturna || horaFin >= horaInicioNocturna || horaFin <= horaFinNocturna;
  }

  calcularHorasNocturnas(horario:string) {

    const horari = horario.split('-');
    const horaInicioParts = horari[0].split(':');
    const horaFinParts = horari[1].split(':');

    let horaInicio = parseInt(horaInicioParts[0], 10);
    let minutoInicio = parseInt(horaInicioParts[1], 10);
    let horaFin = parseInt(horaFinParts[0], 10);
    let minutoFin = parseInt(horaFinParts[1], 10);

    if (horaFin < horaInicio || (horaFin === horaInicio && minutoFin <= minutoInicio)) {
      // Si la hora de fin es antes de la hora de inicio, significa que la hora de fin es del día siguiente
      horaFin += 24; // Sumamos 24 horas
    }

    if (horaFin < 6) {
      // Si la hora de fin es antes de las 6 AM, ajustamos la hora de inicio para calcular correctamente
      horaInicio -= 24;
    }

    let totalMinutosNocturnos = 0;

    if (horaInicio < 22) {
      // Si la hora de inicio es antes de las 22:00, calculamos las horas entre la hora de inicio y las 22:00
      totalMinutosNocturnos += (22 - horaInicio) * 60 - minutoInicio;
      horaInicio = 22;
      minutoInicio = 0;
    }

    if (horaFin >= 6) {
      // Si la hora de fin es después de las 6:00, calculamos las horas entre las 6:00 y la hora de fin
      totalMinutosNocturnos += horaFin * 60 + minutoFin;
    }

    // Convertir los minutos nocturnos a horas
    return (totalMinutosNocturnos / 60) - 24;
  }
}
