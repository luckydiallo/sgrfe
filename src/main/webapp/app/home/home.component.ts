import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  isScolarite = false;
  isDirecteur = false;
  isAdmin = false;
  isProfesseur = false;
  isEtudiant = false;

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));

    this.accountService.identity().subscribe(account => {
      console.log('Utilisateur connecté :', account);
        this.isScolarite = account?.profile === 'SCOLARITE';
        this.isDirecteur = account?.profile === 'DIRECTEUR';
        this.isProfesseur = account?.profile === 'PROFESSEUR';
        this.isAdmin = account?.profile === 'ADMIN';
        this.isEtudiant = account?.profile === 'ETUDIANT';
});
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
