import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  cambioFotos: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  habilitaCambiosFotos: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  cambia: boolean = false;
  imagenASE: string = '';
  imagenSGP: string = '';
  imagenRDM: string = '';
  imagenAIE: string = '';
  imagenJRG: string = '';
  imagenARB: string = '';
  imagenSBN: string = '';

  imagenASE_M: string = 'assets/images/ase.jpg';
  imagenSGP_M: string = 'assets/images/sgp.jpg';
  imagenRDM_M: string = 'assets/images/rdm.jpg';
  imagenAIE_M: string = 'assets/images/aie.jpg';
  imagenJRG_M: string = 'assets/images/jrg.jpg';
  imagenARB_M: string = 'assets/images/arb.jpg';
  imagenSBN_M: string = 'assets/images/sbn.jpg';

  imagenASE_W: string = 'assets/images/ASE_W.jpg';
  imagenSGP_W: string = 'assets/images/SGP_W.jpg';
  imagenRDM_W: string = 'assets/images/RDM_W.jpg';
  imagenAIE_W: string = 'assets/images/AIE_W.jpg';
  imagenJRG_W: string = 'assets/images/JRG_W.jpg';
  imagenARB_W: string = 'assets/images/ARB_W.jpg';
  imagenSBN_W: string = 'assets/images/SBN_W.jpg';

  nomASE: string = '';
  nomSGP: string = '';
  nomRDM: string = '';
  nomAIE: string = '';
  nomJRG: string = '';
  nomARB: string = '';
  nomSBN: string = '';

  nomASE_M: string = 'Albert Serrador Sánchez';
  nomSGP_M: string = 'Salva Gómez Pérez';
  nomRDM_M: string = 'Rubén Diab Martínez';
  nomAIE_M: string = 'Adolfo Tomás Iglesias Expósito';
  nomJRG_M: string = 'José Ramón Gabaldón López';
  nomARB_M: string = 'Alberto Ruiz Beneyto';
  nomSBN_M: string = 'Sergio Bellido Nieto';

  nomASE_W: string = 'Alberta Serradora Sánchez';
  nomSGP_W: string = 'Salvadora Gómez Pérez';
  nomRDM_W: string = 'Rubí Diab Martínez';
  nomAIE_W: string = 'Adelfa Tomasa Iglesias Expósito';
  nomJRG_W: string = 'Josefa Ramona Gabaldón López';
  nomARB_W: string = 'Albertina Ruiz Beneyto';
  nomSBN_W: string = 'Sergia Bellido Nieto';

  constructor(){
    this.cambioFotos.subscribe((hayQUeCambiarFoto)=>{
      if (hayQUeCambiarFoto && this.habilitaCambiosFotos.value == true){
        this.imagenASE = this.imagenASE_W;
        this.imagenSGP = this.imagenSGP_W;
        this.imagenRDM = this.imagenRDM_W;
        this.imagenAIE = this.imagenAIE_W;
        this.imagenJRG = this.imagenJRG_W;
        this.imagenARB = this.imagenARB_W;
        this.imagenSBN = this.imagenSBN_W;

        this.nomASE = this.nomASE_W;
        this.nomSGP = this.nomSGP_W;
        this.nomRDM = this.nomRDM_W;
        this.nomAIE = this.nomAIE_W;
        this.nomJRG = this.nomJRG_W;
        this.nomARB = this.nomARB_W;
        this.nomSBN = this.nomSBN_W;
      }else{
        this.imagenASE = this.imagenASE_M;
        this.imagenSGP = this.imagenSGP_M;
        this.imagenRDM = this.imagenRDM_M;
        this.imagenAIE = this.imagenAIE_M;
        this.imagenJRG = this.imagenJRG_M;
        this.imagenARB = this.imagenARB_M;
        this.imagenSBN = this.imagenSBN_M;

        this.nomASE = this.nomASE_M;
        this.nomSGP = this.nomSGP_M;
        this.nomRDM = this.nomRDM_M;
        this.nomAIE = this.nomAIE_M;
        this.nomJRG = this.nomJRG_M;
        this.nomARB = this.nomARB_M;
        this.nomSBN = this.nomSBN_M;
      }
    });
  }

  ngOnInit(): void {

  }

  cambiaFotos(){
    this.cambioFotos.next(this.cambia);
    this.cambia = !this.cambia;
  }

  habilitaCambioFotos(){
    console.log('habilitaCambioFotos')
    this.habilitaCambiosFotos.next(true);
    setTimeout(()=>{
      this.cambioFotos.next(true);
      setInterval(() => {
        this.cambiaFotos();
      }, 2000);

    }, 6000);
  }


}
