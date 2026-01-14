import { IReclamation, NewReclamation } from './reclamation.model';

export const sampleWithRequiredData: IReclamation = {
  id: 23787,
  nomReclamant: 'raide euh lorsque',
  prenomReclamant: 'raser',
  objetReclamation: 'corps enseignant propre',
  motifReclamation: 'proche de',
  etatReclamation: 'euh dévoiler contraindre',
};

export const sampleWithPartialData: IReclamation = {
  id: 11687,
  nomReclamant: 'près',
  prenomReclamant: 'hé foule gratter',
  niveauEtude: 'd’autant que',
  objetReclamation: 'fourbe',
  motifReclamation: 'commis de cuisine étonner',
  justificatif: 'vlan atchoum pschitt',
  etatReclamation: 'par',
};

export const sampleWithFullData: IReclamation = {
  id: 10196,
  nomReclamant: 'longtemps',
  prenomReclamant: 'débile relier claquer',
  niveauEtude: 'sur maintenant',
  objetReclamation: 'porte-parole chez juriste',
  motifReclamation: 'anéantir dynamique',
  justificatif: 'juriste envoyer',
  etatReclamation: 'coucher à côté de',
};

export const sampleWithNewData: NewReclamation = {
  nomReclamant: 'de crainte que mince aspirer',
  prenomReclamant: 'au lieu de toc-toc drelin',
  objetReclamation: 'toc gai grandement',
  motifReclamation: 'tandis que rejeter',
  etatReclamation: "pff de sorte que à l'instar de",
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
