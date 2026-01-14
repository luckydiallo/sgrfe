export interface IMatiere {
  id: number;
  nomMatiere?: string | null;
}

export type NewMatiere = Omit<IMatiere, 'id'> & { id: null };
