// Thèmes des revues. Le thème est un texte libre en base : cette liste ne sert qu'à
// proposer les plus courants et à fixer leur ordre d'affichage.
export const AEROMODELISME = 'Aéromodélisme';

export const THEMES_PROPOSES = [AEROMODELISME, 'Porsche', 'Enduro', 'Trial'];

// Le plan encarté n'existe que dans les revues d'aéromodélisme (la base l'impose aussi)
export const aUnPlanPossible = (theme: string | null | undefined) => theme === AEROMODELISME;

// Thèmes proposés d'abord, puis les autres par ordre alphabétique
export const trierThemes = (themes: Iterable<string>): string[] => {
  const uniques = [...new Set(themes)].filter(Boolean);
  const rang = (theme: string) => {
    const index = THEMES_PROPOSES.indexOf(theme);
    return index === -1 ? THEMES_PROPOSES.length : index;
  };
  return uniques.sort((a, b) => rang(a) - rang(b) || a.localeCompare(b, 'fr'));
};
