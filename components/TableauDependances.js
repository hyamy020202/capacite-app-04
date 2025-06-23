import React, { useState } from "react";

const dependancesList = [
  "Équipe de formateurs adéquate aux groupes et spécialités",
  "Certificat de prévention des risques de la Protection Civil",
  "Voies de circulation et système de ventilation adéquats",
  "Équipements nécessaires selon la spécificité des spécialités"
];

export default function TableauDependances() {
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
    <div
      className="bg-white shadow rounded-2xl p-4 mb-8 mx-1 table-responsive"
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        width: "fit-content", // يجعل الحاوية على قدر الجدول
        minWidth: 0,
        maxWidth: "100%"
      }}
    >
      <h2 className="text-xl font-bold text-gray-700 mb-4 text-center table-title">Dépendances</h2>
      <table
        className="table-compact"
        style={{
          margin: "auto",
          width: "auto",
          tableLayout: "auto"
        }}
      >
        <colgroup>
          <col style={{ width: "auto", whiteSpace: "nowrap" }} />
          <col style={{ width: "60px", whiteSpace: "nowrap" }} />
        </colgroup>
        <tbody>
          {dependancesList.map((dep, idx) => (
            <tr key={idx}>
              <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>{dep}</td>
              <td style={{ fontSize: "1.1rem", textAlign: "center", whiteSpace: "nowrap" }}>
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
                    width: "48px"
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
  );
}