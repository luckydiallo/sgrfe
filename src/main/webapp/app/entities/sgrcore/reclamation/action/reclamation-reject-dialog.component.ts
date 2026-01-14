import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_REJECT_EVENT } from 'app/config/navigation.constants';
import { IReclamation } from '../reclamation.model';
import { ReclamationService } from '../service/reclamation.service';

@Component({
  templateUrl: './reclamation-reject-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ReclamationRejectDialogComponent {
  reclamation?: IReclamation;

  protected reclamationService = inject(ReclamationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmReject(reclamation: IReclamation): void {
    this.reclamationService.changerEtat(reclamation.id!, 'REJETEE').subscribe(() => {
      this.activeModal.close(ITEM_REJECT_EVENT);
    });
  }
}
