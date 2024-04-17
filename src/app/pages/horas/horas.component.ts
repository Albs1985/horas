import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { Registro } from 'src/app/interfaces/registro.interface';
import { HorasService } from 'src/app/services/horas.service';
declare var $: any; // Declara la variable jQuery
@Component({
  selector: 'app-horas',
  templateUrl: './horas.component.html',
  styleUrls: ['./horas.component.css']
})
export class HorasComponent implements OnInit {

  mesSeleccionado : string = 'Enero';
  datos: Registro[] = [];
  datosFiltrado: Registro[] = [];
  totales: any = {};
  formulario: FormGroup;
  formularioFiltrado: FormGroup;
  usuarios = ['AIE', 'ARB', 'ASE', 'JRG', 'RDM', 'SGP'];
  // meses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  mesesNom = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  datoSelec : number = -1;
  filaSeleccionada : number = -1;
  horasCalculadas: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // verNocturnidad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);



  constructor(public horasService: HorasService) {
    this.formulario = new FormGroup({
      fecha: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
      esFestivo: new FormControl(''),
      horario: new FormControl(''),
      colaborador: new FormControl('Colaborador',[Validators.required, Validators.pattern(/^(?!Colaborador$).*/), Validators.maxLength(15)]),
      horasRealizadas: new FormControl(null,[Validators.required, Validators.pattern(/^\d*\.?\d{0,1}$/)]),
      tarea: new FormControl(null,[Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(200)]),
      horasCompensacion: new FormControl({ value: null, disabled: true }),
      horasCompensadas: new FormControl(null, [Validators.pattern(/^\d*\.?\d{0,1}$/)]),
      compensada: new FormControl('NO'),
      diaDisfrutado: new FormControl(''),
      comentario: new FormControl('', [Validators.maxLength(255)])
    });
    this.formularioFiltrado = new FormGroup({
      fechaFiltrado: new FormControl(''),
      colaboradorFiltrado: new FormControl('--Vacío--'),
      tareaFiltrado: new FormControl(''),
      compensadaFiltrado: new FormControl('--Vacío--'),
      comentarioFiltrado: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.cargaDatos();
  }

  cargaDatos(){
    this.horasService.cargarDatos().subscribe((res: any) => {
      console.log(res);
      this.datosFiltrado = (res.registro as Registro[])
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
        COMPENSADA: item.COMPENSADA,
        DIAS_DISFRUTADOS: item.DIAS_DISFRUTADOS,
        COMENTARIO: item.COMENTARIO
      }));

      this.datos = this.datosFiltrado;
      // console.log(this.datosFiltrado)

      this.horasService.lastIdRegistro = this.datosFiltrado[this.datosFiltrado.length-1].ID;
      // console.log(this.horasService.lastIdRegistro)

      this.datosFiltrado.reverse();

      this.calculaHorasColaboradores().subscribe(()=>{
        this.horasCalculadas.next(true);
      });
      this.calcularTotales();
    });
  }

  calcularTotales() {
    this.totales.horasCompensacionTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.HORAS_COMPENSACION) || 0), 0);
    this.totales.horasCompensadasTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.HORAS_COMPENSADAS) || 0), 0);
    this.totales.pendientes = this.totales.horasCompensacionTotal - this.totales.horasCompensadasTotal;
  }

  calculaHorasColaboradores(): BehaviorSubject<boolean>{

    this.horasService.horasTotalesPorColaborador.clear();

    // Calcular las horas totales por colaborador
    this.datosFiltrado.forEach(item => {

      const colaborador = item.COLABORADOR;
      if (!this.horasService.horasTotalesPorColaborador.has(colaborador) && colaborador!= undefined) {
        this.horasService.horasTotalesPorColaborador.set(colaborador, { horasCompensacion: 0, horasCompensadas: 0 });
      }
      const horasColaborador = this.horasService.horasTotalesPorColaborador.get(colaborador);

      if (horasColaborador){
        if (item.HORAS_COMPENSACION != undefined && item.HORAS_COMPENSACION != null && item.HORAS_COMPENSACION != ''){
          horasColaborador.horasCompensacion += parseFloat(item.HORAS_COMPENSACION);
        }
        if (item.HORAS_COMPENSADAS != undefined && item.HORAS_COMPENSADAS != null && item.HORAS_COMPENSADAS != ''){
          horasColaborador.horasCompensadas += parseFloat(item.HORAS_COMPENSADAS);
        }
      }

    });

    const finCalculo = new BehaviorSubject<boolean>(true);
    return finCalculo;
  }

  onSubmit() {
    let datosFormulario = this.formulario!.value;
    const formInvalid = this.formulario!.invalid;

    //Añadimos este a mano ya que al estar disabled no se añade al form.
    datosFormulario.horasCompensacion = this.formulario.controls['horasCompensacion'].value;
    datosFormulario.id = this.datoSelec;

    if (!formInvalid){
      this.horasService.guardarDatos(datosFormulario).then(() => {
        console.log('Datos guardados correctamente');
        this.cargaDatos();
        this.limpiarFiltros();
      });
    }

  }

  filtrar() {
    let fechaFiltrado = this.formularioFiltrado.controls['fechaFiltrado'].value;
    let colaboradorFiltrado = this.formularioFiltrado.controls['colaboradorFiltrado'].value;
    let compensadaFiltrado = this.formularioFiltrado.controls['compensadaFiltrado'].value;
    let tareaFiltrado = this.formularioFiltrado.controls['tareaFiltrado'].value;
    let comentarioFiltrado = this.formularioFiltrado.controls['comentarioFiltrado'].value;

    if (tareaFiltrado){
      tareaFiltrado = tareaFiltrado.toUpperCase()
    }
    if (comentarioFiltrado){
      comentarioFiltrado = comentarioFiltrado.toUpperCase()
    }
    if (colaboradorFiltrado != null && colaboradorFiltrado == '--Vacío--'){
      colaboradorFiltrado = '';
    }
    if (fechaFiltrado != null && fechaFiltrado != ''){
      if (fechaFiltrado.includes('-')){
        fechaFiltrado = new Date(fechaFiltrado).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    if (compensadaFiltrado != null && compensadaFiltrado == '--Vacío--' ){
      compensadaFiltrado = '';
    }

    this.cleanFormPrincipal();

    this.datosFiltrado = this.datos.filter(registro => {
        let fechaOK = true;
        let colaboradorOK = true;
        let compensadaOK = true;
        let tareaOK = true;
        let comentarioOK = true;

        if (fechaFiltrado !== null && fechaFiltrado !== '') {
            fechaOK = (registro.FECHA!=null && registro.FECHA!=undefined && registro.FECHA!='' && registro.FECHA == fechaFiltrado);
        }

        if (colaboradorFiltrado !== null && colaboradorFiltrado !== '') {
            colaboradorOK = (registro.COLABORADOR!=null && registro.COLABORADOR!=undefined && registro.COLABORADOR!='' &&  registro.COLABORADOR == colaboradorFiltrado);
        }

        if (compensadaFiltrado !== null && compensadaFiltrado !== '') {
          if (compensadaFiltrado == 'NO'){
            compensadaOK = false;
            compensadaOK = (registro.COMPENSADA==null || registro.COMPENSADA==undefined || registro.COMPENSADA=='' || registro.COMPENSADA == compensadaFiltrado);
          }else{//SI
            compensadaOK = (registro.COMPENSADA!=null && registro.COMPENSADA!=undefined && registro.COMPENSADA!='' && registro.COMPENSADA == compensadaFiltrado);
          }

        }

        if (tareaFiltrado !== null && tareaFiltrado !== '') {
            tareaOK = (registro.TAREA!=null && registro.TAREA!=undefined && registro.TAREA!='' && registro.TAREA.toUpperCase().includes(tareaFiltrado));
        }

        if (comentarioFiltrado !== null && comentarioFiltrado !== '') {
            comentarioOK = (registro.COMENTARIO!=null && registro.COMENTARIO!=undefined && registro.COMENTARIO!='' && registro.COMENTARIO.toUpperCase().includes(comentarioFiltrado));
        }

        return fechaOK && colaboradorOK && compensadaOK && tareaOK && comentarioOK;
    });
  }


  calcularHorasCompensacion() {
    const horasRealizadas = this.formulario?.get('horasRealizadas')?.value;

    if (horasRealizadas != null){
      const fechaForm = this.formulario?.get('fecha')?.value;
      const fecha = new Date(fechaForm);

      let compensacionExtra = false;
      if (fecha.getDay() === 0 || this.formulario?.get('esFestivo')?.value) {
        console.log('La fecha es domingo o es festivo.');
        compensacionExtra =true;
      }

      if (compensacionExtra){
        this.formulario.get('horasCompensacion')?.setValue(parseFloat(horasRealizadas)*2);
      }else{
        this.formulario.get('horasCompensacion')?.setValue(horasRealizadas);
      }
    }
  }

  calcularHorasRealizadas(){
    const regex = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;
    const horario = this.formulario?.get('horario')?.value;
    console.log(horario)
    const match = regex.exec(horario);
    if (match) {
      // Extraer las horas y minutos de inicio y fin
      const [, inicioHora, inicioMinuto, finHora, finMinuto] = regex.exec(horario)!;
      // const [, finHora, finMinuto] = regex.exec(horaFin)!;

      // Convertir las horas y minutos a minutos
      const inicioTotalMinutos = parseInt(inicioHora) * 60 + parseInt(inicioMinuto);
      const finTotalMinutos = parseInt(finHora) * 60 + parseInt(finMinuto);

      // Calcular la diferencia en minutos
      const diferenciaMinutos = finTotalMinutos - inicioTotalMinutos;

      // Convertir la diferencia a horas con decimales
      const diferenciaHoras = Math.ceil(diferenciaMinutos / 60 * 10) / 10;

      console.log(diferenciaHoras);
      if (diferenciaHoras > 0){
        this.formulario?.get('horasRealizadas')?.setValue(diferenciaHoras);
        this.calcularHorasCompensacion();
      }else{
        if (diferenciaHoras < 0 && diferenciaHoras > -25){//Para cuando pasamos de día haciendo horas
          this.formulario?.get('horasRealizadas')?.setValue(diferenciaHoras+24);
          this.calcularHorasCompensacion();
        }
      }

    }
  }

  validarHorasCompensadas(){
    debugger
    const horasCompensacion = this.formulario?.get('horasCompensacion')?.value;
    const horasCompensadas = this.formulario?.get('horasCompensadas')?.value;

    if (parseFloat(horasCompensadas) > parseFloat(horasCompensacion)){
      this.formulario.get('horasCompensadas')?.setValue(horasCompensacion);
    }
    if (parseFloat(horasCompensadas) >= parseFloat(horasCompensacion)){
      this.formulario.get('compensada')?.setValue('SI');
    }
    if (horasCompensadas == null ||  horasCompensadas == '' || parseFloat(horasCompensadas) == 0){
      this.formulario.get('compensada')?.setValue('NO');
    }

  }

  cleanFormPrincipal(){
    this.formulario!.reset();
    this.formulario!.controls['colaborador'].setValue('Colaborador');
    this.formulario!.controls['compensada'].setValue('NO');
    this.limpiaRegistroSelec();
  }

  limpiarFiltros(){
    this.formularioFiltrado.reset();
    this.formularioFiltrado.controls['colaboradorFiltrado'].setValue('--Vacío--');
    this.formularioFiltrado.controls['compensadaFiltrado'].setValue('--Vacío--');
    this.cleanFormPrincipal();
    this.datosFiltrado = this.datos;
  }

  limpiaRegistroSelec(){
    // this.horasService.registroSeleccionado = undefined;
    this.datoSelec = -1;
    this.filaSeleccionada = -1;
  }

  borraReg(){
    // if (window.confirm("¿Estás seguro de que quieres borrar este registro?")) {
      if (this.datoSelec != undefined && this.datoSelec != -1){
        this.horasService.borrarDatos(''+this.datoSelec).then(() => {
          console.log('Dato eliminado correctamente');
          this.limpiarFiltros();
          this.cargaDatos();
          $('#confirmacionBorrado').modal('hide');
        });
      }
    // }
  }

  confirmarBorrado() {
    $('#confirmacionBorrado').modal('show');
  }

  cancelaBorrado(){
    this.limpiarFiltros();
  }


  seleccionarRegistro(item: Registro) {

    const partesFecha = item.FECHA.split('/');
    const fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];

    const obtenerFila = [...this.datosFiltrado];
    this.filaSeleccionada = obtenerFila.indexOf(item);

    this.datoSelec = item.ID;
    // console.log(this.filaSeleccionada);
    // console.log(this.datoSelec);

    this.formulario.patchValue({
      id: item.ID,
      fecha: fechaFormateada,
      horario: item.HORARIO,
      colaborador: item.COLABORADOR,
      horasRealizadas: item.HORAS_REALIZADAS,
      tarea: item.TAREA,
      horasCompensacion: item.HORAS_COMPENSACION,
      horasCompensadas: item.HORAS_COMPENSADAS,
      compensada: item.COMPENSADA || 'NO',
      diaDisfrutado: item.DIAS_DISFRUTADOS,
      comentario: item.COMENTARIO
    });
    console.log(this.formulario.value)
  }

  // seleccionarMes(event: Event){
  //   const mesSelec = (event.target as HTMLSelectElement).value;
  //   if (mesSelec){
  //     this.mesSeleccionado = mesSelec;
  //     this.verNocturnidad.next(false);
  //     this.horasNocturnasPorColaborador.clear();
  //   }
  // }



}
