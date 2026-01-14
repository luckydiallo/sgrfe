import { IFiliere } from "app/entities/sgrcore/filiere/filiere.model";

export class Account {
  constructor(
    public id?: number,                   // maintenant optionnel
    public activated: boolean = false,    // valeur par défaut
    public authorities: string[] = [],   // valeur par défaut
    public email: string = '',            // valeur par défaut
    public firstName?: string | null,     // optionnel
    public profile?: string | null,
    public langKey: string = 'fr',        // valeur par défaut
    public lastName?: string | null,      // optionnel
    public login: string = '',            // valeur par défaut
    public imageUrl?: string | null,      // optionnel
    public niveauEtude?: string | null,   // optionnel
    public filiereId?: number | null      // optionnel
  ) {}
}

