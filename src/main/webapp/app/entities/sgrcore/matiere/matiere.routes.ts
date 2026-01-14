import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import MatiereResolve from './route/matiere-routing-resolve.service';

const matiereRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/matiere.component').then(m => m.MatiereComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/matiere-detail.component').then(m => m.MatiereDetailComponent),
    resolve: {
      matiere: MatiereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/matiere-update.component').then(m => m.MatiereUpdateComponent),
    resolve: {
      matiere: MatiereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/matiere-update.component').then(m => m.MatiereUpdateComponent),
    resolve: {
      matiere: MatiereResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default matiereRoute;
