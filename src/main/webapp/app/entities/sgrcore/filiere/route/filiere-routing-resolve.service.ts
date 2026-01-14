import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFiliere } from '../filiere.model';
import { FiliereService } from '../service/filiere.service';

const filiereResolve = (route: ActivatedRouteSnapshot): Observable<null | IFiliere> => {
  const id = route.params.id;
  if (id) {
    return inject(FiliereService)
      .find(id)
      .pipe(
        mergeMap((filiere: HttpResponse<IFiliere>) => {
          if (filiere.body) {
            return of(filiere.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default filiereResolve;
