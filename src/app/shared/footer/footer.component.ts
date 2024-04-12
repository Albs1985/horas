import { Component } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  selec : string = 'home';

  constructor(public commonService : CommonService){

  }

  cambiaSelec(opcion : string){
    this.commonService.selecPag = opcion;
  }

}
