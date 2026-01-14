import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IReclamation } from '../reclamation.model';
import { ReclamationService } from '../service/reclamation.service';

const reclamationResolve = (route: ActivatedRouteSnapshot): Observable<null | IReclamation> => {
  const id = route.params.id;
  if (id) {
    return inject(ReclamationService)
      .find(id)
      .pipe(
        mergeMap((reclamation: HttpResponse<IReclamation>) => {
          if (reclamation.body) {
            return of(reclamation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default reclamationResolve;
