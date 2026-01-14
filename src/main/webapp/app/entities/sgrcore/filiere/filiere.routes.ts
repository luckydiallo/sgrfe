import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import FiliereResolve from './route/filiere-routing-resolve.service';

const filiereRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/filiere.component').then(m => m.FiliereComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/filiere-detail.component').then(m => m.FiliereDetailComponent),
    resolve: {
      filiere: FiliereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/filiere-update.component').then(m => m.FiliereUpdateComponent),
    resolve: {
      filiere: FiliereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/filiere-update.component').then(m => m.FiliereUpdateComponent),
    resolve: {
      filiere: FiliereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default filiereRoute;
