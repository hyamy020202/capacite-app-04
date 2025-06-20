import React, { useState } from "react";
import {
  calculerSurfacePedagogique,
  calculerHeuresMax,
  moyenneColonne,
  sommeColonne
} from "../utils/calculs";

// أضف TP2 وTP3
const salleTitles = [
  { key: "theorie", label: "Salles Théorie" },
  { key: "pratique", label: "Salles Info" },           // تم التغيير هنا
  { key: "tpSpecifiques", label: "Salles TP1" },      // تم التغيير هنا
  { key: "tp2", label: "Salles TP2" },
  { key: "tp3", label: "Salles TP3" },
];

const defaultSalle = (cno, semaines, heures, maxApprenants = 26) => ({
  surface: "",
  cno,
  semaines,
  heures,
  surfaceP: calculerSurfacePedagogique(0, cno, maxApprenants),
  heuresMax: calculerHeuresMax(semaines, heures),
});

export default function TableauSalles({
  salles,
  setSalles,
  cnos,
  setCnos,
  semaines,
  setSemaines,
  heures,
  setHeures,
  apprenants,
  setApprenants
}) {
  // حالة إظهار الجداول
  const [visibleTables, setVisibleTables] = useState({
    theorie: true,
    pratique: true,
    tpSpecifiques: true,
    tp2: false,
    tp3: false,
  });

  React.useEffect(() => {
    let changed = false;
    const newSalles = { ...salles };
    salleTitles.forEach(({ key }) => {
      if (!Array.isArray(newSalles[key]) || newSalles[key].length === 0) {
        newSalles[key] = [defaultSalle(cnos[key], semaines[key], heures[key], apprenants[key])];
        changed = true;
      }
    });
    if (changed) setSalles(newSalles);
    // eslint-disable-next-line
  }, []);

  const handleChange = (type, index, field, value) => {
    setSalles(prev => {
      const arr = prev[type].slice();
      arr[index] = { ...arr[index], [field]: value };
      arr[index].surfaceP = calculerSurfacePedagogique(
        parseFloat(arr[index].surface || 0),
        parseFloat(arr[index].cno),
        apprenants[type]
      );
      arr[index].heuresMax = calculerHeuresMax(
        arr[index].semaines,
        arr[index].heures
      );
      return { ...prev, [type]: arr };
    });
  };

  const updateCno = (type, value) => {
    setCnos(prev => ({ ...prev, [type]: value }));
    setSalles(prev => {
      const arr = prev[type].map(salle => ({
        ...salle,
        cno: value,
        surfaceP: calculerSurfacePedagogique(
          parseFloat(salle.surface || 0),
          parseFloat(value),
          apprenants[type]
        )
      }));
      return { ...prev, [type]: arr };
    });
  };
  const updateSemaines = (type, value) => {
    setSemaines(prev => ({ ...prev, [type]: value }));
    setSalles(prev => {
      const arr = prev[type].map(salle => ({
        ...salle,
        semaines: value,
        heuresMax: calculerHeuresMax(value, salle.heures)
      }));
      return { ...prev, [type]: arr };
    });
  };
  const updateHeures = (type, value) => {
    setHeures(prev => ({ ...prev, [type]: value }));
    setSalles(prev => {
      const arr = prev[type].map(salle => ({
        ...salle,
        heures: value,
        heuresMax: calculerHeuresMax(salle.semaines, value)
      }));
      return { ...prev, [type]: arr };
    });
  };

  const updateApprenants = (type, value) => {
    setApprenants(prev => ({ ...prev, [type]: value }));
    setSalles(prev => {
      const arr = prev[type].map(salle => ({
        ...salle,
        surfaceP: calculerSurfacePedagogique(
          parseFloat(salle.surface || 0),
          parseFloat(salle.cno),
          value
        )
      }));
      return { ...prev, [type]: arr };
    });
  };

  const ajouterSalle = (type) => {
    setSalles(prev => ({
      ...prev,
      [type]: [
        ...prev[type],
        defaultSalle(cnos[type], semaines[type], heures[type], apprenants[type])
      ],
    }));
  };

  const annulerModification = (type) => {
    setSalles(prev => {
      const arr = prev[type];
      if (arr.length > 1) {
        return { ...prev, [type]: arr.slice(0, -1) };
      } else {
        return {
          ...prev,
          [type]: [
            {
              ...arr[0],
              surface: "",
              surfaceP: calculerSurfacePedagogique(0, arr[0].cno, apprenants[type]),
              heuresMax: calculerHeuresMax(arr[0].semaines, arr[0].heures)
            }
          ]
        };
      }
    });
  };

  const heuresOptions = [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60];
  const cnoOptions = Array.from({ length: 21 }, (_, i) => +(1 + i * 0.1));
  const semainesOptions = Array.from({ length: 100 }, (_, i) => i + 1);
  const apprenantsOptions = Array.from({ length: 21 }, (_, i) => 10 + i);

  // قائمة اختيار الجداول
  const handleTableCheck = (key) => {
    setVisibleTables(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* قائمة اختيار الجداول */}
      <div className="flex flex-wrap gap-4 mb-4 items-center justify-center">
        {salleTitles.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={!!visibleTables[key]}
              onChange={() => handleTableCheck(key)}
              className="accent-blue-500"
            />
            {label}
          </label>
        ))}
      </div>
      {/* عرض الجداول المختارة فقط */}
      <div className="flex flex-wrap justify-center gap-6 w-full">
        {salleTitles.filter(({ key }) => visibleTables[key]).map(({ key, label }) => {
          const sallesType = salles[key] && salles[key].length > 0
            ? salles[key]
            : [defaultSalle(cnos[key], semaines[key], heures[key], apprenants[key])];
          const totalHeuresMax = sommeColonne(sallesType.map(s => Number(s.heuresMax) || 0));
          const moyenneSurfaceP = moyenneColonne(sallesType.map(s => Number(s.surfaceP) || 0));
          return (
            <div className="bg-white shadow rounded-2xl p-4 mb-8 max-w-md w-full sm:w-[370px] flex-shrink-0" key={key}>
              <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">{label}</h2>
              <div className="mb-2 flex flex-col items-center">
                <div className="flex gap-2 mb-1 justify-center">
                  <span className="text-xs w-16 text-center">CNO</span>
                  <span className="text-xs w-16 text-center">Semaines</span>
                  <span className="text-xs w-16 text-center">Heures</span>
                  <span className="text-xs w-20 text-center">Apprenants</span>
                </div>
                <div className="flex gap-2 justify-center">
                  <select
                    value={cnos[key]}
                    onChange={e => updateCno(key, Number(e.target.value))}
                    className="text-xs px-2 py-1 h-7 border rounded w-16 text-center"
                  >
                    {cnoOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.toFixed(1)}</option>
                    ))}
                  </select>
                  <select
                    value={semaines[key]}
                    onChange={e => updateSemaines(key, Number(e.target.value))}
                    className="text-xs px-2 py-1 h-7 border rounded w-16 text-center"
                  >
                    {semainesOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select
                    value={heures[key]}
                    onChange={e => updateHeures(key, Number(e.target.value))}
                    className="text-xs px-2 py-1 h-7 border rounded w-16 text-center"
                  >
                    {heuresOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select
                    value={apprenants[key]}
                    onChange={e => updateApprenants(key, Number(e.target.value))}
                    className="text-xs px-2 py-1 h-7 border rounded w-20 text-center"
                  >
                    {apprenantsOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-responsive flex justify-center" style={{ width: "100%", overflowX: "auto" }}>
                <table className="table-compact">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Surface<br />(m²)</th>
                      <th>Surface<br />Pédagogique</th>
                      <th>Heures<br />Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sallesType.map((salle, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="number"
                            value={salle.surface}
                            onChange={e => handleChange(key, index, "surface", e.target.value)}
                            className="w-16 p-1 border rounded"
                            style={{ fontSize: "0.85rem" }}
                          />
                        </td>
                        <td>{salle.surfaceP}</td>
                        <td>{salle.heuresMax}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={2}>Moyenne / Somme</td>
                      <td>{moyenneSurfaceP}</td>
                      <td>{totalHeuresMax}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                <button
                  className="bg-blue-500 text-white rounded px-3 py-1"
                  onClick={() => ajouterSalle(key)}
                >
                  Ajouter salle
                </button>
                <button
                  className="bg-gray-300 text-gray-700 rounded px-3 py-1"
                  onClick={() => annulerModification(key)}
                >
                  Annuler
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}