import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Registro } from 'src/app/interfaces/registro.interface';
import { HorasService } from 'src/app/services/horas.service';

@Component({
  selector: 'app-horas',
  templateUrl: './horas.component.html',
  styleUrls: ['./horas.component.css']
})
export class HorasComponent implements OnInit {

  datos: Registro[] = [];
  totales: any = {};
  horasTotalesPorColaborador = new Map<string, { horasCompensacion: number, horasCompensadas: number }>();
  formulario: FormGroup | undefined;


  constructor(private horasService: HorasService) {

  }

  ngOnInit(): void {
    this.horasService.cargarDatos().subscribe((res: any[]) => {
      console.log(res);
      this.datos = res.map(item => ({
        fecha: item.FECHA,
        horario: item.HORARIO,
        colaborador: item.COLABORADOR,
        horasRealizadas: item['HORAS REALIZADAS'],
        tarea: item.TAREA,
        horasCompensacion: item['HORAS DE COMPENSACIÓN'],
        horasCompensadas: item['HORAS COMPENSADAS'],
        compensada: item['¿COMPENSADAS?'],
        diaDisfrutado: item['DIA DISFRUTADO'],
        comentario: item.COMENTARIO
      }));
      this.datos.reverse();
      this.calcularTotales();
      this.calculaHorasColaboradores();
    });
    this.formulario = new FormGroup({
      fecha: new FormControl(''),
      horario: new FormControl(''),
      colaborador: new FormControl(''),
      horasRealizadas: new FormControl(''),
      tarea: new FormControl(''),
      horasCompensacion: new FormControl(''),
      horasCompensadas: new FormControl(''),
      compensada: new FormControl(''),
      diaDisfrutado: new FormControl(''),
      comentario: new FormControl('')
    });
  }

  calcularTotales() {
    this.totales.horasCompensacionTotal = this.datos.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensacion) || 0), 0);
    this.totales.horasCompensadasTotal = this.datos.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensadas) || 0), 0);
    this.totales.pendientes = this.totales.horasCompensacionTotal - this.totales.horasCompensadasTotal;
  }

  calculaHorasColaboradores(){

    // Calcular las horas totales por colaborador
    this.datos.forEach(item => {
      const colaborador = item.colaborador;
      if (!this.horasTotalesPorColaborador.has(colaborador) && colaborador!= undefined) {
        this.horasTotalesPorColaborador.set(colaborador, { horasCompensacion: 0, horasCompensadas: 0 });
      }
      const horasColaborador = this.horasTotalesPorColaborador.get(colaborador);
      if (horasColaborador){
        if (item.horasCompensacion != undefined && item.horasCompensacion != null && item.horasCompensacion != ''){
          horasColaborador.horasCompensacion += parseInt(item.horasCompensacion);
        }
        if (item.horasCompensadas != undefined && item.horasCompensadas != null && item.horasCompensadas != ''){
          horasColaborador.horasCompensadas += parseInt(item.horasCompensadas);
        }
      }

    });

    // Aquí tienes tu mapa con las horas totales por colaborador
    console.log(this.horasTotalesPorColaborador);


  }

  onSubmit() {
    const datosFormulario = this.formulario!.value;
    this.horasService.guardarDatos(datosFormulario).subscribe(respuesta => {
      console.log('Datos guardados correctamente:', respuesta);

      this.formulario!.reset();
    });
  }


}
