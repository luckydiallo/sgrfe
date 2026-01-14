import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFiliere } from '../filiere.model';
import { FiliereService } from '../service/filiere.service';

@Component({
  templateUrl: './filiere-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FiliereDeleteDialogComponent {
  filiere?: IFiliere;

  protected filiereService = inject(FiliereService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.filiereService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
