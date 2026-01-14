export interface IUser {
  id: number | null;
  login?: string;
  firstName?: string | null;
  lastName?: string | null;
  profile?: UserProfile | null;
 
  email?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];
  createdBy?: string;
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;        
}

export type UserProfile = 'ETUDIANT' | 'PROFESSEUR' | 'SCOLARITE' | 'DIRECTEUR';

export interface UserFormValue {
  id: number | null;
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  profile: UserProfile;
  niveauEtude: string | null;
  filiereId: number | null;
  matiereIds: number[] | null;
  activated: boolean;
  // authorities: string[];
}

