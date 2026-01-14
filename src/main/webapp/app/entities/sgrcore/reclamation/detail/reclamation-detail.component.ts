import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IReclamation } from '../reclamation.model';

@Component({
  selector: 'jhi-reclamation-detail',
  templateUrl: './reclamation-detail.component.html',
  styleUrl: './reclamation-detail.component.scss',
  imports: [SharedModule, RouterModule],
})
export class ReclamationDetailComponent {
  reclamation = input<IReclamation | null>(null);

  previousState(): void {
    window.history.back();
  }

  downloadJustificatif(reclamation: IReclamation): void {
    if (!reclamation.justificatif || !reclamation.justificatifContentType) {
      return;
    }

    const byteCharacters = atob(reclamation.justificatif);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: reclamation.justificatifContentType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `justificatif_reclamation_${reclamation.id}`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
