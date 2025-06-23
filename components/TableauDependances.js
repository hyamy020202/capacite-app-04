import React from "react";

export default function TableauDependances() {
  // بيانات افتراضية مؤقتة (سيتم تعديلها لاحقًا حسب طلبك)
  const rows = [
    ["Dépendance 1", "Valeur 1"],
    ["Dépendance 2", "Valeur 2"],
    ["Dépendance 3", "Valeur 3"],
  ];

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8 mx-1 table-responsive" style={{ minWidth: 220 }}>
      <h2 className="text-xl font-bold text-gray-700 mb-4 text-center table-title">Dépendances</h2>
      <table className="table-compact" style={{ width: "100%", margin: "auto" }}>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td style={{ fontSize: "0.85rem" }}>{row[0]}</td>
              <td style={{ fontSize: "0.85rem" }}>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}