import { IFiliere } from 'app/entities/sgrcore/filiere/filiere.model';
import { IMatiere } from 'app/entities/sgrcore/matiere/matiere.model';
import { IUser } from 'app/entities/user/user.model';
import dayjs from 'dayjs';

export interface IReclamation {
  id: number;
  nomReclamant?: string | null;
  prenomReclamant?: string | null;
  niveauEtude?: string | null;
  objetReclamation?: string | null;
  motifReclamation?: string | null;
  justificatif?: string | null;
  justificatifContentType?: string | null;
  etatReclamation?: string | null;
  noteActuelle?: number | null;
  noteCorrige?: number | null;
  contactProfesseur?: string | null;
  dateEnregistrement?: dayjs.Dayjs | null,
  filiere?: IFiliere | null;
  matiere?: IMatiere | null;
  etudiant?: Pick<IUser, 'id' | 'login'> | null;
  professeur?: Pick<IUser, 'id' | 'login' | 'firstName' | 'lastName'> | null;

}

export type NewReclamation = Omit<IReclamation, 'id'> & { id: null };


export interface IUserReclamation {
  idUserReclamation?: number;
  reclamation?: IReclamation;
}

export class UserReclamation implements IUserReclamation {
  constructor(
    public idUser?: number,
    public reclamation?: IReclamation) { }
}