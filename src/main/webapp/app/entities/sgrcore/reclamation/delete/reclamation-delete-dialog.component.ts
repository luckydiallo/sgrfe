import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IReclamation } from '../reclamation.model';
import { ReclamationService } from '../service/reclamation.service';

@Component({
  templateUrl: './reclamation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ReclamationDeleteDialogComponent {
  reclamation?: IReclamation;

  protected reclamationService = inject(ReclamationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.reclamationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
