import { IMatiere, NewMatiere } from './matiere.model';

export const sampleWithRequiredData: IMatiere = {
  id: 19021,
};

export const sampleWithPartialData: IMatiere = {
  id: 1046,
};

export const sampleWithFullData: IMatiere = {
  id: 1103,
  nomMatiere: 'pisser absolument corps enseignant',
};

export const sampleWithNewData: NewMatiere = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
