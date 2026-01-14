import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFiliere, NewFiliere } from '../filiere.model';

export type PartialUpdateFiliere = Partial<IFiliere> & Pick<IFiliere, 'id'>;

export type EntityResponseType = HttpResponse<IFiliere>;
export type EntityArrayResponseType = HttpResponse<IFiliere[]>;

@Injectable({ providedIn: 'root' })
export class FiliereService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/filieres', 'sgrcore');

  create(filiere: NewFiliere): Observable<EntityResponseType> {
    return this.http.post<IFiliere>(this.resourceUrl, filiere, { observe: 'response' });
  }

  update(filiere: IFiliere): Observable<EntityResponseType> {
    return this.http.put<IFiliere>(`${this.resourceUrl}/${this.getFiliereIdentifier(filiere)}`, filiere, { observe: 'response' });
  }

  partialUpdate(filiere: PartialUpdateFiliere): Observable<EntityResponseType> {
    return this.http.patch<IFiliere>(`${this.resourceUrl}/${this.getFiliereIdentifier(filiere)}`, filiere, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IFiliere>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFiliere[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFiliereIdentifier(filiere: Pick<IFiliere, 'id'>): number {
    return filiere.id;
  }

  compareFiliere(o1: Pick<IFiliere, 'id'> | null, o2: Pick<IFiliere, 'id'> | null): boolean {
    return o1 && o2 ? this.getFiliereIdentifier(o1) === this.getFiliereIdentifier(o2) : o1 === o2;
  }

  addFiliereToCollectionIfMissing<Type extends Pick<IFiliere, 'id'>>(
    filiereCollection: Type[],
    ...filieresToCheck: (Type | null | undefined)[]
  ): Type[] {
    const filieres: Type[] = filieresToCheck.filter(isPresent);
    if (filieres.length > 0) {
      const filiereCollectionIdentifiers = filiereCollection.map(filiereItem => this.getFiliereIdentifier(filiereItem));
      const filieresToAdd = filieres.filter(filiereItem => {
        const filiereIdentifier = this.getFiliereIdentifier(filiereItem);
        if (filiereCollectionIdentifiers.includes(filiereIdentifier)) {
          return false;
        }
        filiereCollectionIdentifiers.push(filiereIdentifier);
        return true;
      });
      return [...filieresToAdd, ...filiereCollection];
    }
    return filiereCollection;
  }
}
