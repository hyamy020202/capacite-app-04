import React, { useState } from "react";

const dependancesList = [
  "Équipe de formateurs adéquate aux groupes et spécialités.",
  "Certificat de prévention des risques de la Protection Civile.",
  "Voies de circulation et système de ventilation adéquats",
  "Équipements nécessaires selon la spécificité des spécialités."
];

export default function TableauDependances() {
  // 0: غير محدد، 1: ✓ أخضر، 2: ✗ أحمر
  const [choices, setChoices] = useState(Array(dependancesList.length).fill(0));

  const handleChoice = (idx, value) => {
    setChoices(prev => {
      const arr = [...prev];
      arr[idx] = arr[idx] === value ? 0 : value; // إلغاء التحديد إذا ضغط مرتين
      return arr;
    });
  };

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 mx-1 table-responsive" style={{ minWidth: 220 }}>
      <h2 className="text-xl font-bold text-gray-700 mb-4 text-center table-title">Dépendances</h2>
      <table className="table-compact" style={{ width: "100%", margin: "auto" }}>
        <tbody>
          {dependancesList.map((dep, idx) => (
            <tr key={idx}>
              <td style={{ fontSize: "0.85rem" }}>{dep}</td>
              <td style={{ fontSize: "1.1rem", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => handleChoice(idx, 1)}
                  style={{
                    color: choices[idx] === 1 ? "#16a34a" : "#bbb",
                    background: "none",
                    border: "none",
                    fontSize: "1.2em",
                    cursor: "pointer",
                    marginRight: 8
                  }}
                  aria-label="Valider"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice(idx, 2)}
                  style={{
                    color: choices[idx] === 2 ? "#dc2626" : "#bbb",
                    background: "none",
                    border: "none",
                    fontSize: "1.2em",
                    cursor: "pointer"
                  }}
                  aria-label="Refuser"
                >
                  ✗
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}