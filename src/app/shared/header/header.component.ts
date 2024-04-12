import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  selec : string = 'Home';

  constructor(public commonService : CommonService){  }

  cambiaSelec(opcion : string){
    this.commonService.selecPag = opcion;
  }

}
