import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IReclamation } from '../../reclamation.model';


@Component({
  templateUrl: './reclamation-filiere-modal-detail.component.html',
})
export class ReclamationFiliereModalDetailComponent {
  @Input() reclamation!: IReclamation;

  constructor(public activeModal: NgbActiveModal) {}
}