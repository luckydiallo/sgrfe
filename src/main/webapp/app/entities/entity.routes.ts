import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'Authorities' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
  {
    path: 'filiere',
    data: { pageTitle: 'Filieres' },
    loadChildren: () => import('./sgrcore/filiere/filiere.routes'),
  },

  {
    path: 'matiere',
    data: { pageTitle: 'Matieres' },
    loadChildren: () => import('./sgrcore/matiere/matiere.routes'),
  },

  {
    path: 'reclamation',
    data: { pageTitle: 'Reclamations' },
    loadChildren: () => import('./sgrcore/reclamation/reclamation.routes'),
  },
];

export default routes;
