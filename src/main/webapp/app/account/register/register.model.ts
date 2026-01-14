export type UserProfile =
  | 'ETUDIANT'
  | 'PROFESSEUR'
  | 'SCOLARITE'
  | 'DIRECTEUR';

export class Registration {
  constructor(
    // identifiants
    public login: string,
    public email: string,
    public password: string,
    public langKey: string,

    // informations communes
    public firstName?: string,
    public lastName?: string,
    public profile?: UserProfile,

    // ===== ETUDIANT =====
    public niveauEtude?: string | null,
    public filiereId?: number | null,
    public filiereLibelle?: string | null,

    // ===== PROFESSEUR =====
    public matiereIds?: number[] | null,
    public matiereLibelles?: string[] | null
  ) {}
}




