import React from "react";
import { sommeColonne } from "../utils/calculs";

export default function TableauEffectifAjout({
  titre,
  specialties = [],
  data,
  onDataChange,
  moyenneSurfaceTheo = 0
}) {
  const ajouterSpecialite = () => {
    const currentData = Array.isArray(data) ? data : [];
    const newData = [
      ...currentData,
      { specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }
    ];
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const annuler = () => {
    if (data.length > 1) {
      onDataChange(data.slice(0, -1));
    } else {
      onDataChange([{ specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }]);
    }
  };

  const handleChange = (index, field, value) => {
    const newRows = [...data];
    if (field === "specialite") {
      newRows[index][field] = value;
    } else {
      newRows[index][field] = Number(value);
    }
    if (field === "groupesAjout") {
      newRows[index].apprenantsAjout = Number(value) * (Number(moyenneSurfaceTheo) || 0);
    }
    onDataChange(
      newRows.map(row => ({
        ...row,
        groupesAjout: Number(row.groupesAjout) || 0,
        apprenantsAjout: Number(row.groupesAjout || 0) * (Number(moyenneSurfaceTheo) || 0)
      }))
    );
  };

  const rows = (data && data.length > 0
    ? data
    : [{ specialite: "", groupes: 0, groupesAjout: 0, apprenants: 0 }]
  ).map(row => ({
    ...row,
    groupes: Number(row.groupes) || 0,
    groupesAjout: Number(row.groupesAjout) || 0,
    apprenants: Number(row.apprenants) || 0,
    apprenantsAjout: Number(row.groupesAjout || 0) * (Number(moyenneSurfaceTheo) || 0)
  }));

  const totalGroupes = sommeColonne(rows.map(e => e.groupes));
  const totalGroupesAjout = sommeColonne(rows.map(e => e.groupesAjout));
  const totalGroupesAll = totalGroupes + totalGroupesAjout;

  const totalApprenants = sommeColonne(rows.map(e => e.apprenants));
  const totalApprenantsAjout = sommeColonne(rows.map(e => e.apprenantsAjout));
  const totalApprenantsAll = totalApprenants + totalApprenantsAjout;

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 flex-1">
      <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">{titre}</h2>
      <div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
        <table className="table-compact">
          <thead>
            <tr>
              <th rowSpan={2}>Spécialité</th>
              <th colSpan={2}>Groupes</th>
              <th colSpan={2}>Apprenants</th>
            </tr>
            <tr>
              <th>Existant</th>
              <th>Ajout</th>
              <th>Existant</th>
              <th>Ajout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((eff, idx) => (
              <tr key={idx}>
                <td>
                  <select
                    value={eff.specialite}
                    onChange={e => handleChange(idx, "specialite", e.target.value)}
                    className="border rounded"
                    style={{ fontSize: "0.85rem", minWidth: 90 }}
                  >
                    <option value="">-- Choisir --</option>
                    {specialties.map(s => (
                      <option key={s["Spécialité"]} value={s["Spécialité"]}>
                        {s["Spécialité"]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={eff.groupes}
                    onChange={e => handleChange(idx, "groupes", e.target.value)}
                    className="border rounded"
                    style={{ fontSize: "0.85rem", width: 60 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={eff.groupesAjout}
                    onChange={e => handleChange(idx, "groupesAjout", e.target.value)}
                    className="border rounded"
                    style={{ fontSize: "0.85rem", width: 60 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={eff.apprenants}
                    onChange={e => handleChange(idx, "apprenants", e.target.value)}
                    className="border rounded"
                    style={{ fontSize: "0.85rem", width: 60 }}
                  />
                </td>
                <td className="bg-gray-50 text-center">
                  {eff.apprenantsAjout}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td style={{ textAlign: "center" }}>Total</td>
              <td style={{ textAlign: "center" }}>{totalGroupes}</td>
              <td style={{ textAlign: "center" }}>{totalGroupesAjout}</td>
              <td style={{ textAlign: "center" }}>{totalApprenants}</td>
              <td style={{ textAlign: "center" }}>{totalApprenantsAjout}</td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td style={{ textAlign: "center" }}>Total général</td>
              <td style={{ textAlign: "center" }} colSpan={2}>{totalGroupesAll}</td>
              <td style={{ textAlign: "center" }} colSpan={2}>{totalApprenantsAll}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex gap-4 mt-4 justify-center">
        <button
          className="bg-blue-500 text-white rounded px-3 py-1"
          onClick={ajouterSpecialite}
        >
          Ajouter spécialité
        </button>
        <button
          className="bg-gray-300 text-gray-700 rounded px-3 py-1"
          onClick={annuler}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}