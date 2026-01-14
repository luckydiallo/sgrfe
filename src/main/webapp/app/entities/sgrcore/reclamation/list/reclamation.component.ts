import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { ItemCountComponent } from 'app/shared/pagination';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_ACCEPT_EVENT, ITEM_DELETED_EVENT, ITEM_REJECT_EVENT, SORT } from 'app/config/navigation.constants';
import { IReclamation } from '../reclamation.model';
import { EntityArrayResponseType, ReclamationService } from '../service/reclamation.service';
import { ReclamationDeleteDialogComponent } from '../delete/reclamation-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { ReclamationRejectDialogComponent } from '../action/reclamation-reject-dialog.component';
import { ReclamationAcceptDialogComponent } from '../action/reclamation-accept-dialog.component';
import { ReclamationObjetModalDetailComponent } from './modal/reclamation-objet-modal-detail.component';
import { ReclamationMatiereModalDetailComponent } from './modal/reclamation-matiere-modal-detail.component';
import { ReclamationFiliereModalDetailComponent } from './modal/reclamation-filiere-modal-detail.component';
import { ReclamationMotifModalDetailComponent } from './modal/reclamation-motif-modal-detail.component';


@Component({
  selector: 'jhi-reclamation',
  templateUrl: './reclamation.component.html',
  styleUrls: ['./reclamation.component.scss'],
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, ItemCountComponent],
})
export class ReclamationComponent implements OnInit {
  subscription: Subscription | null = null;
  reclamations = signal<IReclamation[]>([]);
  isLoading = false;
  isScolarite = false;
  isDirecteur = false;
  isAdmin = false;
  isProfesseur = false;
  isEtudiant = false;
  idAccount!: number;

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  public readonly router = inject(Router);
  protected readonly reclamationService = inject(ReclamationService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected readonly accountService = inject(AccountService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  trackId = (item: IReclamation): number => this.reclamationService.getReclamationIdentifier(item);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account?.id != null) {
        this.idAccount = account.id;
        this.isScolarite = account?.profile === 'SCOLARITE';
        this.isDirecteur = account?.profile === 'DIRECTEUR';
        this.isProfesseur = account?.profile === 'PROFESSEUR';
        this.isAdmin = account?.profile === 'ADMIN';
        this.isEtudiant = account?.profile === 'ETUDIANT';
      } else {
      console.log("idAccount est null");
      }
      });
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

  }

  delete(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.reclamation = reclamation;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
        console.log("Liste des reclamations recus du backend", res);
      },
    });
  }

  loadNonAffectedReclamations(): void {
    this.queryBackendForNonAffectedReclamations().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
        console.log("Liste des reclamations recus du backend", res);
      },
    });
  }

  loadAllReclamations(): void {
    this.queryAllReclamationsByDirecteur().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
        console.log("Liste des reclamations recus du backend", res);
      },
    });
  }

    rejeterReclamation(reclamation: IReclamation): void {
      const modalRef = this.modalService.open(ReclamationRejectDialogComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.reclamation = reclamation;
      // unsubscribe not needed because closed completes on modal close
      modalRef.closed
        .pipe(
          filter(reason => reason === ITEM_REJECT_EVENT),
          tap(() => this.load()),
        )
        .subscribe();
  }

  accepterReclamation(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationAcceptDialogComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.reclamation = reclamation;
      modalRef.closed
        .pipe(
          filter(reason => reason === ITEM_ACCEPT_EVENT),
          tap(() => this.load()),
        )
        .subscribe();
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




  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page, event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }

  showMotifDetails(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationMotifModalDetailComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.reclamation = reclamation;
  }

  showObjetReclamationDetails(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationObjetModalDetailComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.reclamation = reclamation;
  }

  showMatiereDetails(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationMatiereModalDetailComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.reclamation = reclamation;
  }

  showFiliereDetails(reclamation: IReclamation): void {
    const modalRef = this.modalService.open(ReclamationFiliereModalDetailComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.reclamation = reclamation;
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.reclamations.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IReclamation[] | null): IReclamation[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
      idAccount: this.idAccount,
    };
    return this.reclamationService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected queryBackendForNonAffectedReclamations(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
      idAccount: this.idAccount,
    };
    return this.reclamationService.reclamationNonAffecteAUnUser(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected queryAllReclamationsByDirecteur(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
      idAccount: this.idAccount,
    };
    return this.reclamationService.queryAllReclamationsByDirecteur(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
