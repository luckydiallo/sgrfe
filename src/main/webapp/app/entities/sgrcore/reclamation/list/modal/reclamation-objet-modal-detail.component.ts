import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IReclamation } from '../../reclamation.model';


@Component({
  templateUrl: './reclamation-objet-modal-detail.component.html',
})
export class ReclamationObjetModalDetailComponent {
  @Input() reclamation!: IReclamation;

  constructor(public activeModal: NgbActiveModal) {}
}