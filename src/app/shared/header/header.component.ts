import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  selec : string = 'Home';

  constructor(){  }


  cambiaSelec(opcion : string){
    this.selec = opcion;
  }

}
