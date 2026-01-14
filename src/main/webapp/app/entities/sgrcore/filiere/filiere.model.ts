export interface IFiliere {
  id: number;
  nomFiliere?: string | null;
}

export type NewFiliere = Omit<IFiliere, 'id'> & { id: null };
