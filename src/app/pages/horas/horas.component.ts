import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
  formulario: FormGroup;
  usuarios = ['AIE', 'ARB', 'ASE', 'JRG', 'RDM', 'SGP'];


  constructor(public horasService: HorasService) {
    this.formulario = new FormGroup({
      fecha: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
      horario: new FormControl(''),
      colaborador: new FormControl('Colaborador',[Validators.required, Validators.pattern(/^(?!Colaborador$).*/), Validators.maxLength(15)]),
      horasRealizadas: new FormControl(null,[Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
      tarea: new FormControl(null,[Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(200)]),
      horasCompensacion: new FormControl([Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]), //{ value: null, disabled: true }
      horasCompensadas: new FormControl(''),
      compensada: new FormControl('NO'),
      diaDisfrutado: new FormControl(''),
      comentario: new FormControl('', [Validators.maxLength(255)])
    });
  }

  ngOnInit(): void {
    this.cargaDatos();
  }

  cargaDatos(){
    this.horasService.cargarDatos().subscribe((res: any[]) => {
      // console.log(res);
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
      this.horasService.numRegistros = this.datos.length;

      this.calcularTotales();
      this.calculaHorasColaboradores();
    });
  }

  calcularTotales() {
    this.totales.horasCompensacionTotal = this.datos.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensacion) || 0), 0);
    this.totales.horasCompensadasTotal = this.datos.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensadas) || 0), 0);
    this.totales.pendientes = this.totales.horasCompensacionTotal - this.totales.horasCompensadasTotal;
  }

  calculaHorasColaboradores(){

    this.horasTotalesPorColaborador.clear();

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
    // console.log(this.horasTotalesPorColaborador);


  }

  onSubmit() {
    const datosFormulario = this.formulario!.value;
    const formInvalid = this.formulario!.invalid;
    debugger
    if (!formInvalid){
      this.horasService.guardarDatos(datosFormulario).then(() => {
        console.log('Datos guardados correctamente');
        this.cargaDatos();
        this.formulario!.reset();
      });
    }

  }

  calcularHorasCompensacion() {
    const horasRealizadas = this.formulario?.get('horasRealizadas')?.value;
    if (horasRealizadas != null){
      const fechaForm = this.formulario?.get('fecha')?.value;
      const fecha = new Date(fechaForm);

      let compensacionExtra = false;
      if (fecha.getDay() === 0) {
        console.log('La fecha es domingo.');
        compensacionExtra =true;
      }

      if (compensacionExtra){
        this.formulario.get('horasCompensacion')?.setValue(parseInt(horasRealizadas)*2);
      }else{
        this.formulario.get('horasCompensacion')?.setValue(horasRealizadas);
      }
    }

  }

  cleanForm(){
    this.formulario!.reset();
    this.horasService.registroSeleccionado = undefined;
  }


  seleccionarRegistro(item: Registro) {

    const partesFecha = item.fecha.split('/');
    const fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];

    const datosAlReves = [...this.datos];//Creamos una copia
    this.horasService.registroSeleccionado = ''+datosAlReves.reverse().indexOf(item);
    debugger
    this.formulario.patchValue({
      fecha: fechaFormateada,
      horario: item.horario,
      colaborador: item.colaborador,
      horasRealizadas: item.horasRealizadas,
      tarea: item.tarea,
      horasCompensacion: item.horasCompensacion,
      horasCompensadas: item.horasCompensadas,
      compensada: item.compensada || 'NO',
      diaDisfrutado: item.diaDisfrutado,
      comentario: item.comentario
    });
  }



}
