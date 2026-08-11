export const WEEK_BASE = 40;
export const TOTAL_BASE = WEEK_BASE * 9;
export const TEXT_BASE = 50;

export const RENDEMENT_9S_WEIGHT = 0.7;
export const RENDEMENT_TEXTE_WEIGHT = 0.3;

export function rendement9S(semaines: number[]): number {
  return (semaines.reduce((sum, note) => sum + note, 0) / TOTAL_BASE) * 100;
}

export function rendementTexte(noteTexte: number): number {
  return (noteTexte / TEXT_BASE) * 100;
}

export function rendementGlobal(semaines: number[], noteTexte: number): number {
  return (
    rendement9S(semaines) * RENDEMENT_9S_WEIGHT +
    rendementTexte(noteTexte) * RENDEMENT_TEXTE_WEIGHT
  );
}
