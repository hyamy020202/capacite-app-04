import React, { useState } from "react";
import TableauSalles from "./TableauSalles";
import TableauRepartition from "./TableauRepartition";
import TableauResultats from "./TableauResultats";

// specialties يجب أن تحتوي على Besoin TP Spécifique par Groupe
const specialties = [
  { 
    "Spécialité": "Math", 
    "Besoin Théorique par Groupe": 10, 
    "Besoin Pratique par Groupe": 12,
    "Besoin TP Spécifique par Groupe": 6
  },
  { 
    "Spécialité": "Physique", 
    "Besoin Théorique par Groupe": 8, 
    "Besoin Pratique par Groupe": 14,
    "Besoin TP Spécifique par Groupe": 7
  },
];

const defaultSalles = {
  theorie: [{ surface: '', cno: 1.0, semaines: 72, heures: 56, surfaceP: 0, heuresMax: 0 }],
  pratique: [{ surface: '', cno: 1.0, semaines: 72, heures: 56, surfaceP: 0, heuresMax: 0 }],
  tpSpecifiques: [{ surface: '', cno: 1.0, semaines: 72, heures: 56, surfaceP: 0, heuresMax: 0 }],
};

const defaultCnos = { theorie: 1.0, pratique: 1.0, tpSpecifiques: 1.0 };
const defaultSemaines = { theorie: 72, pratique: 72, tpSpecifiques: 72 };
const defaultHeures = { theorie: 56, pratique: 56, tpSpecifiques: 56 };

export default function ResultsContainer() {
  const [salles, setSalles] = useState(defaultSalles);
  const [cnos, setCnos] = useState(defaultCnos);
  const [semaines, setSemaines] = useState(defaultSemaines);
  const [heures, setHeures] = useState(defaultHeures);
  const [effectifData, setEffectifData] = useState([
    { specialite: "Math", groupes: 2, apprenants: 30 },
    { specialite: "Physique", groupes: 1, apprenants: 20 },
  ]);

  // متغيرات النتائج لكل نوع قاعة
  const totalHeuresTheo = (salles?.theorie || []).reduce((sum, s) => sum + Number(s.heuresMax || 0), 0);
  const totalHeuresPrat = (salles?.pratique || []).reduce((sum, s) => sum + Number(s.heuresMax || 0), 0);
  const totalHeuresTpSpec = (salles?.tpSpecifiques || []).reduce((sum, s) => sum + Number(s.heuresMax || 0), 0);

  const besoinTheoTotal = effectifData.reduce((sum, row) => {
    const spec = specialties.find(s => s["Spécialité"] === row.specialite) || {};
    return sum + (Number(row.groupes) * Number(spec["Besoin Théorique par Groupe"] || 0));
  }, 0);
  const besoinPratTotal = effectifData.reduce((sum, row) => {
    const spec = specialties.find(s => s["Spécialité"] === row.specialite) || {};
    return sum + (Number(row.groupes) * Number(spec["Besoin Pratique par Groupe"] || 0));
  }, 0);
  const besoinTpSpecTotal = effectifData.reduce((sum, row) => {
    const spec = specialties.find(s => s["Spécialité"] === row.specialite) || {};
    return sum + (Number(row.groupes) * Number(spec["Besoin TP Spécifique par Groupe"] || 0));
  }, 0);

  const moyenneBesoinTheo = (() => {
    const arr = effectifData
      .filter(row => row.specialite && specialties.some(s => s["Spécialité"] === row.specialite))
      .map(row => {
        const spec = specialties.find(s => s["Spécialité"] === row.specialite);
        return Number(spec["Besoin Théorique par Groupe"]) || 0;
      });
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  })();
  
  const moyenneBesoinPrat = (() => {
    const arr = effectifData
      .filter(row => row.specialite && specialties.some(s => s["Spécialité"] === row.specialite))
      .map(row => {
        const spec = specialties.find(s => s["Spécialité"] === row.specialite);
        return Number(spec["Besoin Pratique par Groupe"]) || 0;
      });
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  })();
  
  const moyenneBesoinTpSpec = (() => {
    const arr = effectifData
      .filter(row => row.specialite && specialties.some(s => s["Spécialité"] === row.specialite))
      .map(row => {
        const spec = specialties.find(s => s["Spécialité"] === row.specialite);
        return Number(spec["Besoin TP Spécifique par Groupe"]) || 0;
      });
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  })();

  const moyenneSurfaceTheo = (salles?.theorie || []).length
    ? ((salles?.theorie || []).reduce((a, s) => a + Number(s.surfaceP) || 0, 0) / (salles?.theorie || []).length).toFixed(2)
    : 0;
  const moyenneSurfacePrat = (salles?.pratique || []).length
    ? ((salles?.pratique || []).reduce((a, s) => a + Number(s.surfaceP) || 0, 0) / (salles?.pratique || []).length).toFixed(2)
    : 0;
  const moyenneSurfaceTpSpec = (salles?.tpSpecifiques || []).length
    ? ((salles?.tpSpecifiques || []).reduce((a, s) => a + Number(s.surfaceP) || 0, 0) / (salles?.tpSpecifiques || []).length).toFixed(2)
    : 0;

  return (
    <div>
      <TableauSalles
        salles={salles}
        setSalles={setSalles}
        cnos={cnos}
        setCnos={setCnos}
        semaines={semaines}
        setSemaines={setSemaines}
        heures={heures}
        setHeures={setHeures}
      />
      <TableauRepartition
        effectifData={effectifData}
        specialties={specialties}
        setEffectifData={setEffectifData}
      />
      <TableauResultats
        data={{
          totalHeuresTheo: Number(totalHeuresTheo),
          totalHeuresPrat: Number(totalHeuresPrat),
          totalHeuresTpSpec: Number(totalHeuresTpSpec),
          besoinTheoTotal: Number(besoinTheoTotal),
          besoinPratTotal: Number(besoinPratTotal),
          besoinTpSpecTotal: Number(besoinTpSpecTotal),
          moyenneBesoinTheo: Number(moyenneBesoinTheo),
          moyenneBesoinPrat: Number(moyenneBesoinPrat),
          moyenneBesoinTpSpec: Number(moyenneBesoinTpSpec),
          moyenneSurfaceTheo: Number(moyenneSurfaceTheo),
          moyenneSurfacePrat: Number(moyenneSurfacePrat),
          moyenneSurfaceTpSpec: Number(moyenneSurfaceTpSpec),
        }}
      />
    </div>
  );
}