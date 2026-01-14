import { IFiliere, NewFiliere } from './filiere.model';

export const sampleWithRequiredData: IFiliere = {
  id: 23000,
};

export const sampleWithPartialData: IFiliere = {
  id: 26131,
};

export const sampleWithFullData: IFiliere = {
  id: 19526,
  nomFiliere: 'foule',
};

export const sampleWithNewData: NewFiliere = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
