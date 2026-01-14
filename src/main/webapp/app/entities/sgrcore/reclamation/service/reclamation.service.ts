import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IReclamation, IUserReclamation, NewReclamation } from '../reclamation.model';

export type PartialUpdateReclamation = Partial<IReclamation> & Pick<IReclamation, 'id'>;

export type EntityResponseType = HttpResponse<IReclamation>;
export type EntityArrayResponseType = HttpResponse<IReclamation[]>;

@Injectable({ providedIn: 'root' })
export class ReclamationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/reclamations', 'sgrcore');

  create(reclamation: NewReclamation): Observable<EntityResponseType> {
    console.log("Données reclamations envoyé au bakend", reclamation)
    return this.http.post<IReclamation>(this.resourceUrl, reclamation, { observe: 'response' });
  }

  update(reclamation: IReclamation): Observable<EntityResponseType> {
    return this.http.put<IReclamation>(`${this.resourceUrl}/${this.getReclamationIdentifier(reclamation)}`, reclamation, {
      observe: 'response',
    });
  }

  partialUpdate(reclamation: PartialUpdateReclamation): Observable<EntityResponseType> {
    return this.http.patch<IReclamation>(`${this.resourceUrl}/${this.getReclamationIdentifier(reclamation)}`, reclamation, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IReclamation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IReclamation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  downloadJustificatif(idReclamation: number): Observable<Blob> {
  return this.http.get(
    `${this.resourceUrl}/${idReclamation}/justificatif`,
    { responseType: 'blob' }
  );
}


  reclamationNonAffecteAUnUser(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    const url = this.resourceUrl + "/non-affecte-a-un-user";
    return this.http.get<IReclamation[]>(url, { params: options, observe: 'response' });
  }

  queryAllReclamationsByDirecteur(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    const url = this.resourceUrl + "/query-all-reclamations-directeur";
    return this.http.get<IReclamation[]>(url, { params: options, observe: 'response' });
  }


  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getReclamationIdentifier(reclamation: Pick<IReclamation, 'id'>): number {
    return reclamation.id;
  }

  compareReclamation(o1: Pick<IReclamation, 'id'> | null, o2: Pick<IReclamation, 'id'> | null): boolean {
    return o1 && o2 ? this.getReclamationIdentifier(o1) === this.getReclamationIdentifier(o2) : o1 === o2;
  }

  addReclamationToCollectionIfMissing<Type extends Pick<IReclamation, 'id'>>(
    reclamationCollection: Type[],
    ...reclamationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const reclamations: Type[] = reclamationsToCheck.filter(isPresent);
    if (reclamations.length > 0) {
      const reclamationCollectionIdentifiers = reclamationCollection.map(reclamationItem => this.getReclamationIdentifier(reclamationItem));
      const reclamationsToAdd = reclamations.filter(reclamationItem => {
        const reclamationIdentifier = this.getReclamationIdentifier(reclamationItem);
        if (reclamationCollectionIdentifiers.includes(reclamationIdentifier)) {
          return false;
        }
        reclamationCollectionIdentifiers.push(reclamationIdentifier);
        return true;
      });
      return [...reclamationsToAdd, ...reclamationCollection];
    }
    return reclamationCollection;
  }

  affecterReclamationAUser(userReclamation: IUserReclamation, idAccount: number): Observable<HttpResponse<IUserReclamation>> {
    console.log("L'objet reçu par affecterReclamationsAAgent", userReclamation)
    const url = this.resourceUrl + "/affecter-reclamations-user";
    return this.http.post<IUserReclamation>(url, userReclamation, {params: {idAccount: `${idAccount}`}, observe: 'response' });
  }

  changerEtat(id: number, etat: 'ACCEPTEE' | 'REJETEE'): Observable<IReclamation> {
  return this.http.put<IReclamation>(`${this.resourceUrl}/${id}/etat`,null,{ params: { etat } });
  }

}
