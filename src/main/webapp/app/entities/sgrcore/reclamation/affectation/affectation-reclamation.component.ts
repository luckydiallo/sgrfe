
import { IReclamation, UserReclamation } from "../reclamation.model";
import { Component, inject, OnInit } from "@angular/core";
import { UserService } from "app/entities/user/service/user.service";
import { ReclamationService } from "../service/reclamation.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NgbModal, NgbToastModule } from "@ng-bootstrap/ng-bootstrap";
import { AccountService } from "app/core/auth/account.service";
import { FormBuilder } from "@angular/forms";
import { ChoixReclamationDialogComponent } from "./choix-reclamation-dialog.component";
import { CommonModule } from "@angular/common";
import SharedModule from "app/shared/shared.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Account } from "app/core/auth/account.model";
import { IUser } from "app/entities/user/user.model";


@Component({
  standalone: true,
  selector: 'jhi-affectation-reclamation',
  templateUrl: './affectation-reclamation.component.html',
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    NgbToastModule,
    FontAwesomeModule
  ]
})

export class AffectationReclamationComponent implements OnInit {
  isSaving = false;
  isEditable = false;
  showError = false;
  idAccount!: number;
  isScolarite = false;
  isDirecteur = false;
  isAdmin = false;
  users: IUser[] = [];
  userChoisi: IUser | null = null;
  reclamation!: IReclamation;
  reclamationAAffecte!: IReclamation;
  userARetire!: IUser;


  protected userService = inject(UserService);
  protected reclamationService = inject(ReclamationService);
  protected activatedRoute = inject(ActivatedRoute);
  protected modalService = inject(NgbModal);
  protected accountService = inject(AccountService);
  protected fb = inject(FormBuilder);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ reclamation }) => {
      this.reclamation = reclamation;
      this.reclamationAAffecte = reclamation;
    });

    this.accountService.identity().subscribe(account => {
      if (account?.id != null) {
        this.idAccount = account.id;
        this.isScolarite = account?.profile === 'SCOLARITE';
        this.isDirecteur = account?.profile === 'DIRECTEUR';
         this.isAdmin = account?.profile === 'ADMIN';
         console.log("isScolarite: ", this.isScolarite, " isDirecteur: ", this.isDirecteur, "isAdmin: ", this.isAdmin)
      } else {
      console.log("idAccount est null",this.idAccount);
      }
      });   
  }

   chargerUtilisateurs(): void {
    const modalRef = this.modalService.open(ChoixReclamationDialogComponent, { size: 'xl', backdrop: 'static' });
    const params = {
      idAccount: this.idAccount
    };
    if (this.reclamation.id) {
    this.userService.query().subscribe(resultat => {
    this.users = resultat.body ?? []; // IMPORTANT
    console.log("Utilisateurs chargés", this.users);

    modalRef.componentInstance.users = this.users;
    modalRef.componentInstance.isDirecteur = this.isDirecteur;
    modalRef.componentInstance.isScolarite = this.isScolarite;
    modalRef.componentInstance.isAdmin = this.isAdmin;
});
    }
    modalRef.closed.subscribe(reason => {
      if (reason === 'ok') {
        this.userChoisi = modalRef.componentInstance.user;
      }
    });
  }


  choisirDirecteur(): void {
    const modalRef = this.modalService.open(ChoixReclamationDialogComponent, { size: 'xl', backdrop: 'static' });
    const params = {
      idAccount: this.idAccount
    };
    if (this.reclamation.id) {
      console.log("Les utilisateurs reçus par AffectationReclamationComponent", this.users);
      this.userService.queryDirecteur().subscribe(resultat => {
        modalRef.componentInstance.users = resultat.body!;
        modalRef.componentInstance.isDirecteur = this.isDirecteur;
        modalRef.componentInstance.isScolarite = this.isScolarite;
        modalRef.componentInstance.isAdmin = this.isAdmin;
    });
    }
    modalRef.closed.subscribe(reason => {
      if (reason === 'ok') {
        this.userChoisi = modalRef.componentInstance.user;
      }
    });
  }

  choisirProfesseur(): void {
    const modalRef = this.modalService.open(ChoixReclamationDialogComponent, { size: 'xl', backdrop: 'static' });
    const params = {
      idAccount: this.idAccount
    };
    if (this.reclamation.id) {
      console.log("Les utilisateurs reçus par AffectationReclamationComponent", this.users);
      this.userService.queryProfesseurs().subscribe(resultat => {
        modalRef.componentInstance.users = resultat.body!;
        modalRef.componentInstance.isDirecteur = this.isDirecteur;
        modalRef.componentInstance.isScolarite = this.isScolarite;
        modalRef.componentInstance.isAdmin = this.isAdmin;
    });
    }
    modalRef.closed.subscribe(reason => {
      if (reason === 'ok') {
        this.userChoisi = modalRef.componentInstance.user;
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.userChoisi?.id == null) {
    this.showError = true;
    return;
  }
    const userReclamation = new UserReclamation(this.userChoisi.id, this.reclamationAAffecte);
    const idAccount = this.idAccount;
    this.reclamationService.affecterReclamationAUser(userReclamation, idAccount).subscribe();
    this.isSaving = true;
    this.previousState();
  }

  trackReclamationById(index: number, item: IReclamation): number {
    return item.id!;
  }

  deleteUser(): void {
  this.userChoisi = null;
}


  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }
}
