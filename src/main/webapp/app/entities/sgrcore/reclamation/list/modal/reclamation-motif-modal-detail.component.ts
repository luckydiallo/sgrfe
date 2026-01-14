import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IReclamation } from '../../reclamation.model';


@Component({
  templateUrl: './reclamation-motif-modal-detail.component.html',
})
export class ReclamationMotifModalDetailComponent {
  @Input() reclamation!: IReclamation;

  constructor(public activeModal: NgbActiveModal) {}
}