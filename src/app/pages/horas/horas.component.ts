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
  datosFiltrado: Registro[] = [];
  totales: any = {};
  horasTotalesPorColaborador = new Map<string, { horasCompensacion: number, horasCompensadas: number }>();
  formulario: FormGroup;
  formularioFiltrado: FormGroup;
  usuarios = ['AIE', 'ARB', 'ASE', 'JRG', 'RDM', 'SGP'];
  filaSelec : number = -1;


  constructor(public horasService: HorasService) {
    this.formulario = new FormGroup({
      fecha: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
      horario: new FormControl(''),
      colaborador: new FormControl('Colaborador',[Validators.required, Validators.pattern(/^(?!Colaborador$).*/), Validators.maxLength(15)]),
      horasRealizadas: new FormControl(null,[Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
      tarea: new FormControl(null,[Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(200)]),
      horasCompensacion: new FormControl({ value: null, disabled: true }),
      horasCompensadas: new FormControl(''),
      compensada: new FormControl('NO'),
      diaDisfrutado: new FormControl(''),
      comentario: new FormControl('', [Validators.maxLength(255)])
    });
    this.formularioFiltrado = new FormGroup({
      fechaFiltrado: new FormControl(''),
      colaboradorFiltrado: new FormControl('Colaborador'),
      tareaFiltrado: new FormControl(''),
      compensadaFiltrado: new FormControl('NO'),
      comentarioFiltrado: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.cargaDatos();
  }

  cargaDatos(){
    this.horasService.cargarDatos().subscribe((res: any[]) => {
      // console.log(res);
      this.datosFiltrado = res
      .filter(item => item != null)//para cuando borramos datos, no se vuelvan a añadir
      .map((item, index) => ({
        id: index,
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

      this.datos = this.datosFiltrado;
      // console.log(this.datosFiltrado)

      this.datosFiltrado.reverse();
      this.horasService.numRegistros = this.datosFiltrado.length;

      this.calcularTotales();
      this.calculaHorasColaboradores();
    });
  }

  calcularTotales() {
    this.totales.horasCompensacionTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensacion) || 0), 0);
    this.totales.horasCompensadasTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensadas) || 0), 0);
    this.totales.pendientes = this.totales.horasCompensacionTotal - this.totales.horasCompensadasTotal;
  }

  calculaHorasColaboradores(){

    this.horasTotalesPorColaborador.clear();

    // Calcular las horas totales por colaborador
    this.datosFiltrado.forEach(item => {
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
    let datosFormulario = this.formulario!.value;
    const formInvalid = this.formulario!.invalid;

    //Añadimos este a mano ya que al estar disabled no se añade al form.
    datosFormulario.horasCompensacion = this.formulario.controls['horasCompensacion'].value;
    debugger
    if (!formInvalid){
      this.horasService.guardarDatos(datosFormulario).then(() => {
        console.log('Datos guardados correctamente');
        this.cargaDatos();
        this.limpiarFiltros();
      });
    }

  }

  filtrar() {
    const fechaFiltrado = this.formularioFiltrado.controls['fechaFiltrado'].value;
    let colaboradorFiltrado = this.formularioFiltrado.controls['colaboradorFiltrado'].value;
    const compensadaFiltrado = this.formularioFiltrado.controls['compensadaFiltrado'].value;
    let tareaFiltrado = this.formularioFiltrado.controls['tareaFiltrado'].value;
    let comentarioFiltrado = this.formularioFiltrado.controls['comentarioFiltrado'].value;

    if (tareaFiltrado){
      tareaFiltrado = tareaFiltrado.toUpperCase()
    }
    if (comentarioFiltrado){
      comentarioFiltrado = comentarioFiltrado.toUpperCase()
    }
    if (colaboradorFiltrado == 'Colaborador'){
      colaboradorFiltrado = '';
    }

    this.cleanFormPrincipal();

    this.datosFiltrado = this.datos.filter(registro => {
        let fechaOK = true;
        let colaboradorOK = true;
        let compensadaOK = true;
        let tareaOK = true;
        let comentarioOK = true;

        if (fechaFiltrado !== null && fechaFiltrado !== '') {
            fechaOK = (registro.fecha!=null && registro.fecha!=undefined && registro.fecha!='' && registro.fecha == fechaFiltrado);
        }

        if (colaboradorFiltrado !== null && colaboradorFiltrado !== '') {
            colaboradorOK = (registro.colaborador!=null && registro.colaborador!=undefined && registro.colaborador!='' &&  registro.colaborador == colaboradorFiltrado);
        }

        if (compensadaFiltrado !== null && compensadaFiltrado !== '') {
          if (compensadaFiltrado == 'NO'){
            compensadaOK = false;
            compensadaOK = (registro.compensada==null || registro.compensada==undefined || registro.compensada=='' || registro.compensada == compensadaFiltrado);
          }else{//SI
            compensadaOK = (registro.compensada!=null && registro.compensada!=undefined && registro.compensada!='' && registro.compensada == compensadaFiltrado);
          }

        }

        if (tareaFiltrado !== null && tareaFiltrado !== '') {
            tareaOK = (registro.tarea!=null && registro.tarea!=undefined && registro.tarea!='' && registro.tarea.toUpperCase().includes(tareaFiltrado));
        }

        if (comentarioFiltrado !== null && comentarioFiltrado !== '') {
            comentarioOK = (registro.comentario!=null && registro.comentario!=undefined && registro.comentario!='' && registro.comentario.toUpperCase().includes(comentarioFiltrado));
        }

        return fechaOK && colaboradorOK && compensadaOK && tareaOK && comentarioOK;
    });
  }


  limpiarFiltros(){
    this.formularioFiltrado.reset();
    this.cleanFormPrincipal();
    this.datosFiltrado = this.datos;
  }

  limpiaRegistroSelec(){
    this.horasService.registroSeleccionado = undefined;
    this.filaSelec = -1;
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

  validarHorasCompensadas(){
    const horasCompensacion = this.formulario?.get('horasCompensacion')?.value;
    const horasCompensadas = this.formulario?.get('horasCompensadas')?.value;

    if (horasCompensadas > horasCompensacion){
      this.formulario.get('horasCompensadas')?.setValue(horasCompensacion);
    }
    if (horasCompensadas >= horasCompensacion){
      this.formulario.get('compensada')?.setValue('SI');
    }
    if (horasCompensadas == null ||  horasCompensadas === ''){
      this.formulario.get('compensada')?.setValue('NO');
    }

  }

  cleanFormPrincipal(){
    this.formulario!.reset();
    this.limpiaRegistroSelec();
  }

  borraReg(){
    if (this.horasService.registroSeleccionado != undefined){
      this.horasService.borrarDatos(''+this.horasService.registroSeleccionado).then(() => {
        console.log('Dato eliminado correctamente');
        this.limpiarFiltros();
        this.cargaDatos();
      });
    }
  }


  seleccionarRegistro(item: Registro) {

    const partesFecha = item.fecha.split('/');
    const fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];

    // const datosAlReves = [...this.datosFiltrado];//Creamos una copia
    this.horasService.registroSeleccionado = ''+item.id;
    this.filaSelec = this.datosFiltrado.indexOf(item);

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
