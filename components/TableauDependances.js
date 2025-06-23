import React, { useState } from "react";

const dependancesList = [
  "Équipe de formateurs adéquate aux groupes et spécialités.",
  "Certificat de prévention des risques de la Protection Civile.",
  "Voies de circulation et système de ventilation adéquats",
  "Équipements nécessaires selon la spécificité des spécialités."
];

export default function TableauDependances({ show, onToggle }) {
  // 0: غير محدد، 1: ✓ أخضر، 2: ✗ أحمر
  const [choices, setChoices] = useState(Array(dependancesList.length).fill(0));

  const handleSelect = (idx, value) => {
    setChoices(prev => {
      const arr = [...prev];
      arr[idx] = Number(value);
      return arr;
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Checkbox أسفل الجداول الثلاثة */}
      <label className="flex items-center gap-1 text-xs mb-2">
        <input
          type="checkbox"
          checked={show}
          onChange={onToggle}
          className="accent-blue-500"
        />
        Dépendances
      </label>
      {/* جدول dépendances يظهر فقط إذا كان show=true */}
      {show && (
        <div className="bg-white shadow rounded-2xl p-4 mb-8 mx-1 table-responsive" style={{ minWidth: 220, width: "100%", maxWidth: 600 }}>
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center table-title">Dépendances</h2>
          <table className="table-compact" style={{ width: "100%", margin: "auto" }}>
            <tbody>
              {dependancesList.map((dep, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: "0.85rem" }}>{dep}</td>
                  <td style={{ fontSize: "1.1rem", textAlign: "center" }}>
                    <select
                      value={choices[idx]}
                      onChange={e => handleSelect(idx, e.target.value)}
                      style={{
                        fontSize: "1.1em",
                        padding: "2px 8px",
                        borderRadius: 5,
                        border: "1px solid #bbb",
                        background: "#f9fafb",
                        color:
                          choices[idx] === 1
                            ? "#16a34a"
                            : choices[idx] === 2
                            ? "#dc2626"
                            : "#444",
                      }}
                    >
                      <option value={0}>---</option>
                      <option value={1} style={{ color: "#16a34a" }}>✓</option>
                      <option value={2} style={{ color: "#dc2626" }}>✗</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}