import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IReclamation } from '../../reclamation.model';


@Component({
  templateUrl: './reclamation-matiere-modal-detail.component.html',
})
export class ReclamationMatiereModalDetailComponent {
  @Input() reclamation!: IReclamation;

  constructor(public activeModal: NgbActiveModal) {}
}