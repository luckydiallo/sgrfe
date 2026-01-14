import { Component, inject } from "@angular/core";
import { IUser } from "app/admin/user-management/user-management.model";
import { ReclamationService } from "../service/reclamation.service";
import { FormBuilder } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import SharedModule from "app/shared/shared.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Account } from "app/core/auth/account.model";


@Component({
  templateUrl: './choix-reclamation-dialog.component.html',
  imports: [
    CommonModule,
    SharedModule,
    FontAwesomeModule,
  ],
})
export class ChoixReclamationDialogComponent {
  users: IUser[] = [];
  user!: IUser;
  isScolarite = false;
  isDirecteur = false;
  isAdmin = false

  protected reclamationService = inject(ReclamationService);
  protected fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  protected modalService = inject(NgbModal);

  choisirUser(user: IUser): void {
      this.user = user;
      this.activeModal.close('ok');
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

}
