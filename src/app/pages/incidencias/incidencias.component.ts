import { Component, OnInit } from '@angular/core';
import { IncidenciasService } from '../../services/incidencias.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Registro } from 'src/app/interfaces/registro.interface';
import { Incidencia } from 'src/app/interfaces/incidencia.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_CIPHERS } from 'tls';
declare var $: any; // Declara la variable jQuery
@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css']
})
export class IncidenciasComponent implements OnInit{

  datosFiltrado: Incidencia[] = [];
  datos: Incidencia[] = [];
  totales: any = {};
  formularioDato: FormGroup;
  formularioFiltrado: FormGroup;
  usuarios = ['AIE', 'ARB', 'ASE', 'JRG', 'RDM', 'SGP'];
  apps = ['SCS', 'INTIE', 'Inputs SA', 'CONTACT'];
  datoSelec : number = -1;
  filaSeleccionada : number = -1;
  mostrarAltaModif: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(public incidenciasService: IncidenciasService){

    this.formularioDato = new FormGroup({
      fecha:  new FormControl(''),
      app: new FormControl(''),
      proceso: new FormControl(''),
      colaborador:  new FormControl(''),
      relanzable:  new FormControl(''),
      resuelto:  new FormControl(''),
      solucion:  new FormControl(''),
      observaciones: new FormControl(''),
      trazas: new FormControl(''),
    });
    this.formularioFiltrado = new FormGroup({
      appFiltrado: new FormControl('--Vacío--'),
      procesoFiltrado: new FormControl(''),
      textoFiltrado: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.cargaIncidencias();
  }

  cargaIncidencias(){
    this.incidenciasService.cargarDatos().subscribe((res:any)=>{
      console.log(res);
      this.datosFiltrado = (res.Incidencias as Incidencia[])
      .filter(item => item != null)//para cuando borramos datos, no se vuelvan a añadir
      .map((item, index) => ({
        ID: item.ID,
        FECHA: new Date(item.FECHA).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        APP: item.APP,
        PROCESO: item.PROCESO,
        RELANZABLE: item.RELANZABLE,
        COLABORADOR: item.COLABORADOR,
        RESUELTO: item.RESUELTO,
        SOLUCION: item.SOLUCION,
        OBSERVACIONES: item.OBSERVACIONES,
        TRAZAS: item.TRAZAS
      }));
      this.datos = this.datosFiltrado;
      let reverseData = [...this.datosFiltrado].reverse();
      this.incidenciasService.lastIdRegistro = reverseData[reverseData.length-1].ID;

      console.log('this.incidenciasService.lastIdRegistro='+ this.incidenciasService.lastIdRegistro);
    });
  }

  filtrar(){
    let appFiltrado = this.formularioFiltrado.controls['appFiltrado'].value;
    let procesoFiltrado = this.formularioFiltrado.controls['procesoFiltrado'].value;
    let textoFiltrado = this.formularioFiltrado.controls['textoFiltrado'].value;

    if (appFiltrado && appFiltrado == '--Vacío--'){
      appFiltrado = '';
    }
    if (procesoFiltrado != null && procesoFiltrado != ''){
      procesoFiltrado = procesoFiltrado.toUpperCase()
    }
    if (textoFiltrado != null && textoFiltrado != ''){
      textoFiltrado = textoFiltrado.toUpperCase()
    }

    this.limpiarFiltros();

    this.datosFiltrado = this.datos.filter(registro => {
        let appOK = true;
        let procesoOK = true;
        let textoOK = true;



        if (appFiltrado !== null && appFiltrado !== '') {
          appOK = (registro.APP!=null && registro.APP!=undefined && registro.APP!='' && registro.APP.includes(appFiltrado));
        }

        if (procesoFiltrado !== null && procesoFiltrado !== '') {
          procesoOK = (registro.PROCESO!=null && registro.PROCESO!=undefined && registro.PROCESO!='' && registro.PROCESO.toUpperCase().includes(procesoFiltrado));
        }

        if (textoFiltrado !== null && textoFiltrado !== '') {
          textoOK = (registro.SOLUCION!=null && registro.SOLUCION!=undefined && registro.SOLUCION!='' && registro.SOLUCION.toUpperCase().includes(textoFiltrado)) ||
                    (registro.OBSERVACIONES!=null && registro.OBSERVACIONES!=undefined && registro.OBSERVACIONES!='' && registro.OBSERVACIONES.toUpperCase().includes(textoFiltrado)) ||
                    (registro.TRAZAS!=null && registro.TRAZAS!=undefined && registro.TRAZAS!='' && registro.TRAZAS.toUpperCase().includes(textoFiltrado))
        }

        return appOK && procesoOK && textoOK;
    });
  }


  seleccionarRegistro(item: Incidencia) {

    const partesFecha = item.FECHA.split('/');
    const fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];

    const obtenerFila = [...this.datosFiltrado];
    this.filaSeleccionada = obtenerFila.indexOf(item);

    this.datoSelec = item.ID;
    console.log(this.filaSeleccionada);
    console.log(this.datoSelec);


    this.formularioDato.patchValue({
      id: item.ID,
      fecha: fechaFormateada,
      app: item.APP,
      proceso: item.PROCESO,
      relanzable: item.RELANZABLE,
      colaborador: item.COLABORADOR,
      resuelto: item.RESUELTO,
      solucion: item.SOLUCION,
      observaciones: item.OBSERVACIONES,
      trazas: item.TRAZAS
    });
    console.log(this.formularioDato.value)
  }


  limpiarFiltros(){
    this.formularioFiltrado.reset();
    this.formularioDato.reset();
    this.formularioFiltrado.controls['appFiltrado'].setValue('--Vacío--');
    this.datosFiltrado = this.datos;
    this.filaSeleccionada = -1;
  }

  mostrarDialog(){
    this.mostrarAltaModif.next(true);
  }

  guardar(){

    let datosFormulario = this.formularioDato!.value;
    const formInvalid = this.formularioDato!.invalid;

    //Añadimos este a mano ya que al estar disabled no se añade al form.
    datosFormulario.id = this.datoSelec;

    if (!formInvalid){
      this.incidenciasService.guardarDatos(datosFormulario).then(() => {
        console.log('Datos guardados correctamente');
        this.cargaIncidencias();
        this.limpiarFiltros();
      });
    }

    this.cerrarDialog();
  }

  cerrarDialog(){
    this.mostrarAltaModif.next(false);
    this.formularioDato.reset();
  }

  borrar(){
    if (this.datoSelec != undefined && this.datoSelec != -1){
      this.incidenciasService.borrarDatos(''+this.datoSelec).then(() => {
        console.log('Dato eliminado correctamente');
        this.limpiarFiltros();
        this.cargaIncidencias();
        $('#confirmacionBorrado').modal('hide');
      });
    }
  }

  confirmarBorrado() {
    $('#confirmacionBorrado').modal('show');
  }

  cancelaBorrado(){
    this.limpiarFiltros();
  }
}
