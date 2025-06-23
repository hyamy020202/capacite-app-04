import { useRef, useState, useEffect } from "react";
import TableauSalles from "../components/TableauSalles";
import TableauEffectif from "../components/TableauEffectif";
import TableauRepartition from "../components/TableauRepartition";
import TableauResultats from "../components/TableauResultats";
import TableauDependances from "../components/TableauDependances";
import useSpecialties from "../components/useSpecialties";
import { generatePDF } from "../components/generatePDF";
import {
  calculerHeuresRestantes,
  calculerApprenantsPossibles,
  determinerEtat,
} from "../utils/calculs";

function calculerPourcentageLigne(heuresRestantes, heuresDemandées, etat) {
  if (!heuresDemandées || isNaN(heuresRestantes)) return "";
  const percent = Math.abs(Math.round((heuresRestantes / heuresDemandées) * 100));
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

export default function TDA() {
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
  const [effectif, setEffectif] = useState([{ specialite: "", groupes: 0, apprenants: 0 }]);
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
  const [showDependances, setShowDependances] = useState(false);

  const specialties = useSpecialties();

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
    heuresRestantesPrat, repartition.moyennePrat, moyenneSurfaceTheo
  );
  const apprenantsPossiblesTpSpec = calculerApprenantsPossibles(
    heuresRestantesTpSpec, repartition.moyenneTpSpec, moyenneSurfaceTheo
  );
  const apprenantsPossiblesTp2 = calculerApprenantsPossibles(
    heuresRestantesTp2, repartition.moyenneTp2, moyenneSurfaceTheo
  );
  const apprenantsPossiblesTp3 = calculerApprenantsPossibles(
    heuresRestantesTp3, repartition.moyenneTp3, moyenneSurfaceTheo
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

  const percentTheo = calculerPourcentageLigne(heuresRestantesTheo, repartition.besoinTheoTotal, etatTheo);
  const percentPrat = calculerPourcentageLigne(heuresRestantesPrat, repartition.besoinPratTotal, etatPrat);
  const percentTpSpec = calculerPourcentageLigne(heuresRestantesTpSpec, repartition.besoinTpSpecTotal, etatTpSpec);
  const percentTp2 = calculerPourcentageLigne(heuresRestantesTp2, repartition.besoinTp2Total, etatTp2);
  const percentTp3 = calculerPourcentageLigne(heuresRestantesTp3, repartition.besoinTp3Total, etatTp3);

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

  // استخراج وحساب النسبة النهائية حسب منطقك الجديد
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
    columns: ["Type", "Heures rest.", "Marge App.", "État", "Niveau"],
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
    setEffectif(rows.length ? rows : [{ specialite: "", groupes: 0, apprenants: 0 }]);
  };

  const handleRepartitionChange = (repData) => {
    const r = Array.isArray(repData) && repData.length > 0 ? repData[0] : {};
    setRepartition({
      besoinTheoTotal: r.besoinTheorieTotal ?? 0,
      besoinPratTotal: r.besoinInfoTotal ?? 0,
      besoinTpSpecTotal: r.besoinTP1Total ?? 0,
      besoinTp2Total: r.besoinTP2Total ?? 0,
      besoinTp3Total: r.besoinTP3Total ?? 0,
      moyenneTheo: r.moyenneBesoinTheoriqueParGroupe ?? 0,
      moyennePrat: r.moyenneBesoinPratiqueParGroupe ?? 0,
      // أضف المتوسطات الأخرى إذا كنت تحسبها
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
    localStorage.removeItem("tdaData");
    setSalles({
      theorie: [defaultSalle(1.0, 72, 56)],
      pratique: [defaultSalle(1.0, 72, 56)],
      tpSpecifiques: [defaultSalle(1.0, 72, 56)],
      tp2: [defaultSalle(1.0, 72, 56)],
      tp3: [defaultSalle(1.0, 72, 56)],
    });
    setEffectif([{ specialite: "", groupes: 0, apprenants: 0 }]);
    setRepartition({
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
    alert("Les données ont été réinitialisées.");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 md:p-4">
      <div ref={pdfRef}>
        <div className="w-full flex justify-center">
          <h1
            className="
              text-base sm:text-lg md:text-xl font-bold text-center text-gray-800 mb-3
              inline-block
              px-4 py-1
              border border-black
              rounded-xl
              bg-white
              shadow-sm
              mx-auto
            "
          >
            Simulateur de l&apos;état actuel
          </h1>
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

          {/* checkboxes الجديدة أسفل جداول القاعات وبنفس حجم الخط */}
          <div className="w-full flex justify-center gap-6 mb-4 mt-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showEffectif}
                onChange={() => setShowEffectif(v => !v)}
                className="accent-blue-500"
              />
              Effectif
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showRepartition}
                onChange={() => setShowRepartition(v => !v)}
                className="accent-blue-500"
              />
              Répartition
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showResultats}
                onChange={() => setShowResultats(v => !v)}
                className="accent-blue-500"
              />
              Résultat
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showDependances}
                onChange={() => setShowDependances(v => !v)}
                className="accent-blue-500"
              />
              Dépendances
            </label>
          </div>
        </div>
        <div className="tables-row">
          {showEffectif && (
            <TableauEffectif
              titre={<span className="table-title">Effectif Actuel</span>}
              specialties={specialties}
              modeActuel={true}
              onDataChange={handleEffectifChange}
              data={effectif}
              salles={salles}
            />
          )}
          {showRepartition && (
            <TableauRepartition
              titre={<span className="table-title">Répartition actuelle des heures</span>}
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
        {/* هنا يظهر جدول الديبوندانس أسفل الجداول الثلاثة وليس بجانبها */}
        {showDependances && (
          <TableauDependances />
        )}
      </div>
      <div className="tight-buttons flex flex-col md:flex-row flex-wrap justify-center">
        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-500 hover:bg-blue-700 text-white shadow"
        >
          ↩️ Accueil
        </button>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow"
        >
          💾 Enregistrer
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-700 text-white shadow"
        >
          🗑️ Réinitialiser
        </button>
        <button
          onClick={() => window.print()}
          className="bg-purple-500 hover:bg-indigo-700 text-white shadow"
        >
          🖨️ Imprimer
        </button>
        <button
          onClick={() => generatePDF({ sallesSummary, apprenantsSummary, resultatsTable })}
          className="bg-green-500 hover:bg-green-700 text-white shadow"
        >
          📄 Rapport
        </button>
      </div>
    </div>
  );
}