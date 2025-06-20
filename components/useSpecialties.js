import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function useSpecialties() {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    fetch("/specialties.xlsx")
      .then(res => res.arrayBuffer())
      .then(ab => {
        const workbook = XLSX.read(ab, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        setSpecialties(data);
      });
  }, []);

  // specialties = [{ Spécialité, Besoin Théorique par Groupe, Besoin Pratique par Groupe }, ...]
  return specialties;
}