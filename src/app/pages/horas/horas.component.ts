import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
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
  formulario: FormGroup;
  formularioFiltrado: FormGroup;
  usuarios = ['AIE', 'ARB', 'ASE', 'JRG', 'RDM', 'SGP'];
  filaSelec : number = -1;
  horasCalculadas: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(public horasService: HorasService) {
    this.formulario = new FormGroup({
      fecha: new FormControl(null, [Validators.required, Validators.pattern(/[\S]/), Validators.maxLength(15)]),
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
    this.horasService.cargarDatos().subscribe((res: any[]) => {
      // console.log(res);
      this.datosFiltrado = res
      .filter(item => item != null)//para cuando borramos datos, no se vuelvan a añadir
      .map((item, index) => ({
        id: item.ID,
        fecha: new Date(item.FECHA).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        horario: item.HORARIO,
        colaborador: item.COLABORADOR,
        horasRealizadas: item.HORAS_REALIZADAS,
        tarea: item.TAREA,
        horasCompensacion: item.HORAS_COMPENSACION,
        horasCompensadas: item.HORAS_COMPENSADAS,
        compensada: item.COMPENSADAS,
        diaDisfrutado: item.DIAS_DISFRUTADOS,
        comentario: item.COMENTARIO
      }));

      this.datos = this.datosFiltrado;
      console.log(this.datosFiltrado)

      this.horasService.lastIdRegistro = this.datosFiltrado[this.datosFiltrado.length-1].id;
      console.log(this.horasService.lastIdRegistro)

      this.datosFiltrado.reverse();

      this.calculaHorasColaboradores().subscribe(()=>{
        this.horasCalculadas.next(true);
      });
      this.calcularTotales();
    });
  }

  calcularTotales() {
    this.totales.horasCompensacionTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensacion) || 0), 0);
    this.totales.horasCompensadasTotal = this.datosFiltrado.reduce((acc, curr) => acc + (parseFloat(curr.horasCompensadas) || 0), 0);
    this.totales.pendientes = this.totales.horasCompensacionTotal - this.totales.horasCompensadasTotal;
  }

  calculaHorasColaboradores(): BehaviorSubject<boolean>{

    this.horasService.horasTotalesPorColaborador.clear();

    // Calcular las horas totales por colaborador
    this.datosFiltrado.forEach(item => {

      const colaborador = item.colaborador;
      if (!this.horasService.horasTotalesPorColaborador.has(colaborador) && colaborador!= undefined) {
        this.horasService.horasTotalesPorColaborador.set(colaborador, { horasCompensacion: 0, horasCompensadas: 0 });
      }
      const horasColaborador = this.horasService.horasTotalesPorColaborador.get(colaborador);

      if (horasColaborador){
        if (item.horasCompensacion != undefined && item.horasCompensacion != null && item.horasCompensacion != ''){
          horasColaborador.horasCompensacion += parseFloat(item.horasCompensacion);
        }
        if (item.horasCompensadas != undefined && item.horasCompensadas != null && item.horasCompensadas != ''){
          horasColaborador.horasCompensadas += parseFloat(item.horasCompensadas);
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
    datosFormulario.id = this.filaSelec;

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
debugger
    if (horasCompensadas > horasCompensacion){
      this.formulario.get('horasCompensadas')?.setValue(horasCompensacion);
    }
    if (horasCompensadas >= horasCompensacion){
      this.formulario.get('compensada')?.setValue('SI');
    }
    if (horasCompensadas == null ||  horasCompensadas == '' || horasCompensadas == 0){
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
    this.filaSelec = -1;
  }

  borraReg(){
    if (this.filaSelec != undefined && this.filaSelec != -1){
      this.horasService.borrarDatos(''+this.filaSelec).then(() => {
        console.log('Dato eliminado correctamente');
        this.limpiarFiltros();
        this.cargaDatos();
      });
    }
  }


  seleccionarRegistro(item: Registro) {

    const partesFecha = item.fecha.split('/');
    const fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];

    this.filaSelec = item.id;
    console.log(this.filaSelec)
    this.formulario.patchValue({
      id: item.id,
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
    console.log(this.formulario.value)
  }



}
