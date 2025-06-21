import { useRef, useState, useEffect } from "react";
import TableauSalles from "../components/TableauSalles";
import TableauEffectifAjout from "../components/TableauEffectifAjout";
import TableauRepartitionAjout from "../components/TableauRepartitionAjout";
import TableauResultats from "../components/TableauResultats";
import useSpecialties from "../components/useSpecialties";
import { generatePDF } from "../components/generatePDF";

function calculerPourcentageLigne(heuresRestantes, heuresDisponibles, etat) {
  if (!heuresDisponibles || isNaN(heuresRestantes)) return "";
  const percent = Math.abs(Math.round((heuresRestantes / heuresDisponibles) * 100));
  return etat === "Excédent" ? `+${percent}%` : `-${percent}%`;
}

const moyenne = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const somme = arr => arr.reduce((a, b) => a + b, 0);

const defaultSalle = (cno, semaines, heures) => ({
  surface: "",
  cno,
  semaines,
  heures,
  surfaceP: 0,
  heuresMax: Math.round(semaines * heures),
});

export default function TDP() {
  const pdfRef = useRef();
  const [salles, setSalles] = useState({
    theorie: [defaultSalle(1.0, 72, 56)],
    pratique: [defaultSalle(1.0, 72, 56)],
    tpSpecifiques: [defaultSalle(1.0, 72, 56)],
    tp2: [defaultSalle(1.0, 72, 56)],
    tp3: [defaultSalle(1.0, 72, 56)],
  });
  const [cnos, setCnos] = useState({
    theorie: 1.0,
    pratique: 1.0,
    tpSpecifiques: 1.0,
    tp2: 1.0,
    tp3: 1.0,
  });
  const [semaines, setSemaines] = useState({
    theorie: 72,
    pratique: 72,
    tpSpecifiques: 72,
    tp2: 72,
    tp3: 72,
  });
  const [heures, setHeures] = useState({
    theorie: 56,
    pratique: 56,
    tpSpecifiques: 56,
    tp2: 56,
    tp3: 56,
  });
  const [apprenants, setApprenants] = useState({
    theorie: 26,
    pratique: 26,
    tpSpecifiques: 26,
    tp2: 26,
    tp3: 26,
  });
  const [effectif, setEffectif] = useState([
    { specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }
  ]);
  const [repartition, setRepartition] = useState({
    besoinTheoTotal: 0,
    besoinPratTotal: 0,
    besoinTpSpecTotal: 0,
    besoinTp2Total: 0,
    besoinTp3Total: 0,
    moyenneTheo: 0,
    moyennePrat: 0,
    moyenneTpSpec: 0,
    moyenneTp2: 0,
    moyenneTp3: 0,
  });
  const [showEffectif, setShowEffectif] = useState(false);
  const [showRepartition, setShowRepartition] = useState(false);
  const [showResultats, setShowResultats] = useState(false);
  const specialties = useSpecialties();

  function calculerHeuresRestantes(total, besoin) {
    return Number(total) - Number(besoin);
  }
  function determinerEtat(heuresRestantes) {
    return heuresRestantes >= 0 ? 'Excédent' : 'Dépassement';
  }
  function calculerApprenantsPossibles(heuresRestantes, moyenneBesoin, moyenneSurface) {
    if (!moyenneBesoin || !moyenneSurface || isNaN(heuresRestantes)) return 0;
    // احذف Math.max ليظهر العدد حتى لو كان سالباً (مثل tda.js)
    return Math.floor((heuresRestantes / moyenneBesoin) * moyenneSurface);
  }

  const totalHeuresTheo = somme(salles.theorie.map(s => Number(s.heuresMax) || 0));
  const totalHeuresPrat = somme(salles.pratique.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTpSpec = somme(salles.tpSpecifiques.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTp2 = somme(salles.tp2.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTp3 = somme(salles.tp3.map(s => Number(s.heuresMax) || 0));
  const moyenneSurfaceTheo = moyenne(salles.theorie.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfacePrat = moyenne(salles.pratique.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTpSpec = moyenne(salles.tpSpecifiques.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTp2 = moyenne(salles.tp2.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTp3 = moyenne(salles.tp3.map(s => Number(s.surfaceP) || 0));

  const heuresRestantesTheo = calculerHeuresRestantes(totalHeuresTheo, repartition.besoinTheoTotal);
  const heuresRestantesPrat = calculerHeuresRestantes(totalHeuresPrat, repartition.besoinPratTotal);
  const heuresRestantesTpSpec = calculerHeuresRestantes(totalHeuresTpSpec, repartition.besoinTpSpecTotal);
  const heuresRestantesTp2 = calculerHeuresRestantes(totalHeuresTp2, repartition.besoinTp2Total);
  const heuresRestantesTp3 = calculerHeuresRestantes(totalHeuresTp3, repartition.besoinTp3Total);

  const apprenantsPossiblesTheo = calculerApprenantsPossibles(
    heuresRestantesTheo, repartition.moyenneTheo, moyenneSurfaceTheo
  );
  const apprenantsPossiblesPrat = calculerApprenantsPossibles(
    heuresRestantesPrat, repartition.moyennePrat, moyenneSurfacePrat
  );
  const apprenantsPossiblesTpSpec = calculerApprenantsPossibles(
    heuresRestantesTpSpec, repartition.moyenneTpSpec, moyenneSurfaceTpSpec
  );
  const apprenantsPossiblesTp2 = calculerApprenantsPossibles(
    heuresRestantesTp2, repartition.moyenneTp2, moyenneSurfaceTp2
  );
  const apprenantsPossiblesTp3 = calculerApprenantsPossibles(
    heuresRestantesTp3, repartition.moyenneTp3, moyenneSurfaceTp3
  );

  const etatTheo = determinerEtat(heuresRestantesTheo);
  const etatPrat = determinerEtat(heuresRestantesPrat);
  const etatTpSpec = determinerEtat(heuresRestantesTpSpec);
  const etatTp2 = determinerEtat(heuresRestantesTp2);
  const etatTp3 = determinerEtat(heuresRestantesTp3);

  const testGlobal =
    [etatTheo, etatPrat, etatTpSpec, etatTp2, etatTp3].every(e => e === 'Excédent')
      ? 'Excédent'
      : 'Dépassement';

  const percentTheo = calculerPourcentageLigne(heuresRestantesTheo, totalHeuresTheo, etatTheo);
  const percentPrat = calculerPourcentageLigne(heuresRestantesPrat, totalHeuresPrat, etatPrat);
  const percentTpSpec = calculerPourcentageLigne(heuresRestantesTpSpec, totalHeuresTpSpec, etatTpSpec);
  const percentTp2 = calculerPourcentageLigne(heuresRestantesTp2, totalHeuresTp2, etatTp2);
  const percentTp3 = calculerPourcentageLigne(heuresRestantesTp3, totalHeuresTp3, etatTp3);

  // حساب Résultat Global فقط للصفوف الظاهرة
  const resultatsRows = [];
  if (moyenneSurfaceTheo > 0)
    resultatsRows.push([
      "Théorie",
      isNaN(heuresRestantesTheo) ? 0 : heuresRestantesTheo,
      isNaN(apprenantsPossiblesTheo) ? 0 : apprenantsPossiblesTheo,
      etatTheo,
      percentTheo
    ]);
  if (moyenneSurfacePrat > 0)
    resultatsRows.push([
      "Info",
      isNaN(heuresRestantesPrat) ? 0 : heuresRestantesPrat,
      isNaN(apprenantsPossiblesPrat) ? 0 : apprenantsPossiblesPrat,
      etatPrat,
      percentPrat
    ]);
  if (moyenneSurfaceTpSpec > 0)
    resultatsRows.push([
      "TP1",
      isNaN(heuresRestantesTpSpec) ? 0 : heuresRestantesTpSpec,
      isNaN(apprenantsPossiblesTpSpec) ? 0 : apprenantsPossiblesTpSpec,
      etatTpSpec,
      percentTpSpec
    ]);
  if (moyenneSurfaceTp2 > 0)
    resultatsRows.push([
      "TP2",
      isNaN(heuresRestantesTp2) ? 0 : heuresRestantesTp2,
      isNaN(apprenantsPossiblesTp2) ? 0 : apprenantsPossiblesTp2,
      etatTp2,
      percentTp2
    ]);
  if (moyenneSurfaceTp3 > 0)
    resultatsRows.push([
      "TP3",
      isNaN(heuresRestantesTp3) ? 0 : heuresRestantesTp3,
      isNaN(apprenantsPossiblesTp3) ? 0 : apprenantsPossiblesTp3,
      etatTp3,
      percentTp3
    ]);
  
  // استخراج وحساب النسبة النهائية حسب المنطق المطلوب
  let percentGlobal = "";
  if (resultatsRows.length) {
    if (testGlobal === "Excédent") {
      // أصغر نسبة موجبة (الأقرب للصفر من الفوائض)
      const positives = resultatsRows
        .map(row => Number(row[4]?.replace('%','').replace('+','')))
        .filter(v => !isNaN(v) && v > 0);
      if (positives.length) {
        percentGlobal = "+" + Math.min(...positives) + "%";
      } else {
        percentGlobal = "+0%";
      }
    } else {
      // أكبر نسبة سالبة (الأبعد عن الصفر من التجاوزات)
      const negatives = resultatsRows
        .map(row => Number(row[4]?.replace('%','')))
        .filter(v => !isNaN(v) && v < 0);
      if (negatives.length) {
        percentGlobal = Math.min(...negatives) + "%";
      } else {
        percentGlobal = "-0%";
      }
    }
  }

  resultatsRows.push([
    { value: "Résultat Global", colSpan: 3 },
    testGlobal,
    percentGlobal
  ]);
  const resultatsTable = {
    columns: ["Type", "Heures restantes", "Apprenants possibles", "État", "Niveau"],
    rows: resultatsRows
  };

  const sallesSummaryRaw = [
    ["Théorie", salles.theorie.length, moyenneSurfaceTheo.toFixed(2), totalHeuresTheo],
    ["Info", salles.pratique.length, moyenneSurfacePrat.toFixed(2), totalHeuresPrat],
    ["TP1", salles.tpSpecifiques.length, moyenneSurfaceTpSpec.toFixed(2), totalHeuresTpSpec],
    ["TP2", salles.tp2.length, moyenneSurfaceTp2.toFixed(2), totalHeuresTp2],
    ["TP3", salles.tp3.length, moyenneSurfaceTp3.toFixed(2), totalHeuresTp3],
  ];
  const sallesSummary = sallesSummaryRaw.filter(row => Number(row[2]) > 0);

  const totalGroupes = somme(effectif.map(e => Number(e.groupes) || 0));
  const totalApprenants = somme(effectif.map(e => Number(e.apprenants) || 0));
  const apprenantsSummary = [
    ...effectif.map(e => [e.specialite, e.groupes, e.apprenants, (Number(e.groupes) || 0) + (Number(e.apprenants) || 0)]),
    ["Total", totalGroupes, totalApprenants, totalGroupes + totalApprenants]
  ];

  const resultatsData = {
  totalHeuresTheo,
  totalHeuresPrat,
  totalHeuresTpSpec,
  totalHeuresTp2,
  totalHeuresTp3,
  besoinTheoTotal: repartition.besoinTheoTotal,
  besoinPratTotal: repartition.besoinPratTotal,
  besoinTpSpecTotal: repartition.besoinTpSpecTotal,
  besoinTp2Total: repartition.besoinTp2Total,
  besoinTp3Total: repartition.besoinTp3Total,
  moyenneBesoinTheo: repartition.moyenneTheo,
  moyenneBesoinPrat: repartition.moyennePrat,
  moyenneBesoinTpSpec: repartition.moyenneTpSpec,
  moyenneBesoinTp2: repartition.moyenneTp2,      // أضف هذا السطر
  moyenneBesoinTp3: repartition.moyenneTp3,      // وأضف هذا السطر
  moyenneSurfaceTheo,
  moyenneSurfacePrat,
  moyenneSurfaceTpSpec,
  moyenneSurfaceTp2,
  moyenneSurfaceTp3,
  heuresRestantesTheo,
  heuresRestantesPrat,
  heuresRestantesTpSpec,
  heuresRestantesTp2,
  heuresRestantesTp3,
  apprenantsPossiblesTheo,
  apprenantsPossiblesPrat,
  apprenantsPossiblesTpSpec,
  apprenantsPossiblesTp2,
  apprenantsPossiblesTp3,
  etatTheo,
  etatPrat,
  etatTpSpec,
  etatTp2,
  etatTp3,
  testGlobal
};

  const handleEffectifChange = (rows) => {
    if (!rows || rows.length === 0) {
      setEffectif([{ specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }]);
    } else {
      setEffectif(rows);
    }
  };

  const handleRepartitionChange = (repData) => {
    const r = (Array.isArray(repData) && repData.length > 0) ? repData[0] : {};
    setRepartition({
      besoinTheoTotal: r.besoinTheorieTotal ?? 0,
      besoinPratTotal: r.besoinInfoTotal ?? 0,
      besoinTpSpecTotal: r.besoinTP1Total ?? 0,
      besoinTp2Total: r.besoinTP2Total ?? 0,
      besoinTp3Total: r.besoinTP3Total ?? 0,
      moyenneTheo: r.moyenneBesoinTheoriqueParGroupe ?? 0,
      moyennePrat: r.moyenneBesoinPratiqueParGroupe ?? 0,
      moyenneTpSpec: r.moyenneBesoinTpSpecParGroupe ?? 0,
      moyenneTp2: r.moyenneBesoinTp2ParGroupe ?? 0,
      moyenneTp3: r.moyenneBesoinTp3ParGroupe ?? 0,
    });
  };

  const handleSave = () => {
    const data = { salles, effectif, repartition };
    localStorage.setItem("tdaData", JSON.stringify(data));
    alert("Les données ont été enregistrées !");
  };

  const handleReset = () => {
    localStorage.removeItem("tdp-data");
    window.location.reload();
  };

  useEffect(() => {
    const saved = localStorage.getItem("tdaData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSalles({
        theorie: parsed.salles?.theorie || [defaultSalle(1.0, 72, 56)],
        pratique: parsed.salles?.pratique || [defaultSalle(1.0, 72, 56)],
        tpSpecifiques: parsed.salles?.tpSpecifiques || [defaultSalle(1.0, 72, 56)],
        tp2: parsed.salles?.tp2 || [defaultSalle(1.0, 72, 56)],
        tp3: parsed.salles?.tp3 || [defaultSalle(1.0, 72, 56)],
      });
      setEffectif(parsed.effectif || [{ specialite: "", groupes: 0, apprenants: 0 }]);
      setRepartition({
        besoinTheoTotal: parsed.repartition?.besoinTheoTotal ?? 0,
        besoinPratTotal: parsed.repartition?.besoinPratTotal ?? 0,
        besoinTpSpecTotal: parsed.repartition?.besoinTpSpecTotal ?? 0,
        besoinTp2Total: parsed.repartition?.besoinTp2Total ?? 0,
        besoinTp3Total: parsed.repartition?.besoinTp3Total ?? 0,
        moyenneTheo: parsed.repartition?.moyenneTheo ?? 0,
        moyennePrat: parsed.repartition?.moyennePrat ?? 0,
        moyenneTpSpec: parsed.repartition?.moyenneTpSpec ?? 0,
        moyenneTp2: parsed.repartition?.moyenneTp2 ?? 0,
        moyenneTp3: parsed.repartition?.moyenneTp3 ?? 0,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 md:p-4">
      <div ref={pdfRef}>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-800 mb-3">
          Diagnostic de l&apos;état prévu
        </h1>
        <div className="flex justify-center gap-8 my-6">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <input type="checkbox" checked={showEffectif} onChange={() => setShowEffectif(v => !v)} />
            Effectif
          </label>
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <input type="checkbox" checked={showRepartition} onChange={() => setShowRepartition(v => !v)} />
            Répartition
          </label>
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <input type="checkbox" checked={showResultats} onChange={() => setShowResultats(v => !v)} />
            Résultat
          </label>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 flex-wrap mb-3">
          <TableauSalles
            salles={salles}
            setSalles={setSalles}
            cnos={cnos}
            setCnos={setCnos}
            semaines={semaines}
            setSemaines={setSemaines}
            heures={heures}
            setHeures={setHeures}
            apprenants={apprenants}
            setApprenants={setApprenants}
          />
        </div>
        <div className="tables-row">
          {showEffectif && (
            <TableauEffectifAjout
              titre={<span className="table-title">Effectif Prévu</span>}
              specialties={specialties}
              modeActuel={false}
              onDataChange={handleEffectifChange}
              data={effectif}
              salles={salles}
              moyenneSurfaceTheo={moyenneSurfaceTheo}
            />
          )}
          {showRepartition && (
            <TableauRepartitionAjout
              titre={<span className="table-title">Répartition Prévue des heures</span>}
              effectifData={effectif}
              specialties={specialties}
              onDataChange={handleRepartitionChange}
              salles={salles}
            />
          )}
          {showResultats && (
            <TableauResultats titre={<span className="table-title">Résultat</span>} data={resultatsData} salles={salles} />
          )}
        </div>
      </div>
      <div className="tight-buttons flex flex-col md:flex-row flex-wrap justify-center">
        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow"
        >
          ↩️ Page d&apos;accueil
        </button>
        <button
          onClick={() => generatePDF({ sallesSummary, apprenantsSummary, resultatsTable })}
          className="bg-green-600 hover:bg-green-700 text-white shadow"
        >
          📄 Générer le PDF
        </button>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow"
        >
          💾 Enregistrer les modifications
        </button>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white shadow"
        >
          🗑️ Réinitialiser
        </button>
      </div>
    </div>
  );
}