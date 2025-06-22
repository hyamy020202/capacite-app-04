export function calculerSurfacePedagogique(surface, cno, maxApprenants) {
  const result = Number(surface) / Number(cno);
  if (isNaN(result) || !isFinite(result)) return 0;
  return result <= maxApprenants ? parseFloat(result.toFixed(2)) : maxApprenants;
}

export function calculerHeuresMax(semaines, heuresParSemaine = 56) {
  const s = Number(semaines);
  const h = Number(heuresParSemaine);
  if (isNaN(s) || isNaN(h)) return 0;
  return h * s;
}

export function moyenneColonne(colonne) {
  const valides = colonne
    .map(val => Number(val))
    .filter(val => typeof val === 'number' && !isNaN(val));
  if (valides.length === 0) return 0;
  const total = valides.reduce((acc, curr) => acc + curr, 0);
  return parseFloat((total / valides.length).toFixed(2));
}

export function sommeColonne(colonne) {
  return colonne
    .map(val => Number(val))
    .filter(val => typeof val === 'number' && !isNaN(val))
    .reduce((acc, curr) => acc + curr, 0);
}

export function calculerBesoinHoraireParSpecialiteAjout(nbGroupes, nbGroupesAjout, besoinParGroupe) {
  const n = Number(nbGroupes);
  const nAjout = Number(nbGroupesAjout);
  const b = Number(besoinParGroupe);
  if (isNaN(n) || isNaN(nAjout) || isNaN(b)) return 0;
  return (n + nAjout) * b;
}

export function calculerHeuresRestantes(sommeHeuresMax, sommeBesoinParSpecialite) {
  const a = Number(sommeHeuresMax);
  const b = Number(sommeBesoinParSpecialite);
  if (isNaN(a) || isNaN(b)) return 0;
  return parseFloat((a - b).toFixed(2));
}

export function calculerApprenantsPossibles(heuresRestantes, moyenneBesoinParGroupe, moyenneSurfacePedagogique) {
  const h = Number(heuresRestantes);
  const m = Number(moyenneBesoinParGroupe);
  const s = Number(moyenneSurfacePedagogique);
  if (isNaN(h) || isNaN(m) || isNaN(s) || m === 0) return 0;
  return Math.round((h / m) * s);
}

export function determinerEtat(heuresRestantes) {
  const h = Number(heuresRestantes);
  if (isNaN(h)) return '-';
  return h >= 0 ? 'Excédent' : 'Dépassement';
}