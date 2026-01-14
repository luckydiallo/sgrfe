import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ReclamationResolve from './route/reclamation-routing-resolve.service';
import { AffectationReclamationComponent } from './affectation/affectation-reclamation.component';

const reclamationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/reclamation.component').then(m => m.ReclamationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/reclamation-detail.component').then(m => m.ReclamationDetailComponent),
    resolve: {
      reclamation: ReclamationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/reclamation-update.component').then(m => m.ReclamationUpdateComponent),
    resolve: {
      reclamation: ReclamationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/reclamation-update.component').then(m => m.ReclamationUpdateComponent),
    resolve: {
      reclamation: ReclamationResolve,
    },
    canActivate: [UserRouteAccessService],
  },

  {
    path: ':id/affect',
    component: AffectationReclamationComponent,
    resolve: {
      reclamation: ReclamationResolve,
    },
    canActivate: [UserRouteAccessService],
  }
];

export default reclamationRoute;
