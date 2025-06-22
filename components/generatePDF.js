import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// تحميل صورة الشعار (base64) من public/logo.png
function loadLogoMinistere(callback) {
  const img = new window.Image();
  img.src = '/logo1.png';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const base64 = canvas.toDataURL('image/png');
    callback(base64);
  };
  img.onerror = () => {
    console.warn('⚠️ فشل تحميل الشعار من المسار: /logo.png');
    callback(null);
  };
}

export function generatePDF({ sallesSummary, apprenantsSummary, resultatsTable }) {
  if (typeof window === 'undefined') {
    alert('⚠️ لا يمكن توليد PDF - يتم تنفيذ الكود خارج المتصفح.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // --- إعداد عرض الجداول وهامشها ---
  const tableWidth = 90; // نصف الصفحة تقريباً
  const leftMargin = (pageWidth - tableWidth) / 2;

  // --- التاريخ والتوقيت أعلى الصفحة على اليمين ---
  const dateTime = new Date().toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' •');
  pdf.setFontSize(10);
  pdf.text(dateTime, pageWidth - 14, 10, { align: 'right' });

  // --- ترقيم الصفحات (يتم إضافته بعد الانتهاء) ---
  const totalPagesExp = "{total_pages_count_string}";

  // --- تحميل الشعار ووضعه ---
  loadLogoMinistere((logoMinistere) => {
    let currentY = 10;
    if (logoMinistere) {
      pdf.addImage(logoMinistere, 'PNG', (pageWidth - 68) / 2, currentY, 68, 38);
    }
    currentY += 38;

    // --- النص تحت الشعار ---
    pdf.setFontSize(7);
    pdf.setTextColor(0, 70, 140); // أزرق سماوي
    pdf.text(
      "Direction Générale de l'Inspection et de l'Audit Pédagogique",
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    pdf.setTextColor(0, 0, 0); // إعادة اللون للأسود لما بعده
    currentY += 16;

    // --- إطار العنوان الرئيسي ---
    const title = "Rapport de diagnostic de la capacité d'accueil";
    const paddingH = 5;
    const paddingV = 3;
    pdf.setFontSize(15);
    pdf.setDrawColor(0, 0, 0);         // إطار أسود
    pdf.setFillColor(255, 255, 255);   // خلفية بيضاء (بدون لون)
    const textWidth = pdf.getTextWidth(title);
    const rectX = (pageWidth - textWidth) / 2 - paddingH;
    const rectY = currentY - 10;
    const rectWidth = textWidth + 2 * paddingH;
    const rectHeight = 10 + 2 * paddingV;
    pdf.roundedRect(rectX, rectY, rectWidth, rectHeight, 2, 2, 'S'); // 'S' = Stroke فقط (بدون تعبئة)
    pdf.setTextColor(0, 0, 0);         // لون العنوان أسود
    pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    currentY += 15;

    // --- معلومات عامة ---
    const nomStructure = localStorage.getItem('nomStructure') || 'Structure inconnue';
    const numEnregistrement = localStorage.getItem('numEnregistrement') || '---';
    pdf.setFontSize(10);
    pdf.text(`Nom de la structure : ${nomStructure}`, 14, currentY);
    pdf.text(`N° d'enregistrement : ${numEnregistrement}`, 14, currentY + 6);

    let tableStartY = currentY + 15;

    // دالة لفحص هل هناك مساحة كافية على الصفحة للرسم قبل أن نبدأ الجدول (لكي لا ينقسم بداية الجدول)
    function hasSpaceForTable(requiredHeight) {
      return (pageHeight - tableStartY) >= requiredHeight;
    }

    // --- ملخص القاعات وملخص المتعلمين جنبًا إلى جنب ---
    let sallesTableFinalY = tableStartY;
    let apprenantsTableFinalY = tableStartY;
    if (sallesSummary && sallesSummary.length > 0 && apprenantsSummary && apprenantsSummary.length > 0) {
      pdf.setFontSize(11);

      // إعداد رؤوس وأجسام الجداول
      const sallesHead = [['Type', 'Nombre', 'Moy. surf. pédag.', 'heures max']];
      const apprenantsHead = [['Spécialité', 'Total gr.', 'Total appr.']];
      const apprenantsBody = apprenantsSummary.map(row => row.slice(0, 3));

      // عرض كل جدول (نصف الجدول الكلي)
      const singleTableWidth = tableWidth;
      // اجعل كل جدول في ربع الصفحة تقريبًا مع هامش ثابت
      const sallesMargin = 14;
      const apprenantsMargin = pageWidth / 2 + 6; // 6mm هامش صغير بين الجدولين

      // رسم عنواني الجدولين
      pdf.text('Synthèse des salles', sallesMargin, tableStartY - 2);
      pdf.text('Synthèse des apprenants', apprenantsMargin, tableStartY - 2);

      // رسم جدول القاعات (يسار)
      autoTable(pdf, {
        startY: tableStartY,
        head: sallesHead,
        body: sallesSummary,
        styles: { fontSize: 9, cellWidth: 'wrap', wordBreak: 'normal' },
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: sallesMargin },
        tableWidth: singleTableWidth,
        pageBreak: 'avoid'
      });
      sallesTableFinalY = pdf.lastAutoTable.finalY;

      // رسم جدول المتعلمين (يمين)
      autoTable(pdf, {
        startY: tableStartY,
        head: apprenantsHead,
        body: apprenantsBody,
        styles: { fontSize: 9, cellWidth: 'wrap', wordBreak: 'normal' },
        theme: 'grid',
        headStyles: { fillColor: [255, 165, 0] },
        margin: { left: apprenantsMargin },
        tableWidth: singleTableWidth,
        pageBreak: 'avoid'
      });
      apprenantsTableFinalY = pdf.lastAutoTable.finalY;

      // تحديث Y بعد الجدولين
      tableStartY = Math.max(sallesTableFinalY, apprenantsTableFinalY) + 10;
    } else {
      // إذا لم تتوفر بيانات أحد الجدولين، اعرض كل جدول بشكل منفصل كما في السابق
      if (sallesSummary && sallesSummary.length > 0) {
        pdf.setFontSize(11);
        pdf.text('Synthèse des salles', leftMargin, tableStartY);
        tableStartY += 4;

        autoTable(pdf, {
          startY: tableStartY,
          head: [['Type', 'Nombre', 'Moy. surf. pédag.', 'heures max']],
          body: sallesSummary,
          styles: { fontSize: 9, cellWidth: 'wrap', wordBreak: 'normal' },
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          margin: { left: leftMargin, right: leftMargin },
          tableWidth: tableWidth,
          pageBreak: 'avoid'
        });
        tableStartY = pdf.lastAutoTable.finalY + 10;
      }
      if (apprenantsSummary && apprenantsSummary.length > 0) {
        pdf.setFontSize(11);
        pdf.text('Synthèse des apprenants', leftMargin, tableStartY);
        const apprenantsHeader = ['Spécialité', 'Total gr.', 'Total appr.'];
        const apprenantsBody = apprenantsSummary.map(row => row.slice(0, 3));
        tableStartY += 4;

        autoTable(pdf, {
          startY: tableStartY,
          head: [apprenantsHeader],
          body: apprenantsBody,
          styles: { fontSize: 9, cellWidth: 'wrap', wordBreak: 'normal' },
          theme: 'grid',
          headStyles: { fillColor: [255, 165, 0] },
          margin: { left: leftMargin, right: leftMargin },
          tableWidth: tableWidth,
          pageBreak: 'avoid'
        });
        tableStartY = pdf.lastAutoTable.finalY + 10;
      }
    }

    // --- ملخص النتائج و Résultat Global جنبًا إلى جنب ---
    if (resultatsTable && resultatsTable.rows.length > 0) {
      pdf.setFontSize(11);

      // إعداد بيانات جدول النتائج
      const resultsHead = [resultatsTable.columns.slice(0, 4)];
      const rowsSansGlobal = resultatsTable.rows.filter(
        row => !(row[0] && typeof row[0] === "object" && row[0].value === "Résultat Global")
      );
      const resultsBody = rowsSansGlobal.map((row) =>
        row.map((cell, colIdx) => {
          if (colIdx === 3) {
            const isExcedent = cell === 'Excédent';
            const color = isExcedent ? [39, 174, 96] : [231, 76, 60];
            return {
              content: cell,
              styles: {
                textColor: color,
                fontStyle: 'bold'
              }
            };
          }
          if (colIdx === 4) return { content: "" };
          return { content: cell };
        })
      );

      // إعداد بيانات Résultat Global
      const globalRow = resultatsTable.rows.find(
        row => row[0] && typeof row[0] === "object" && row[0].value === "Résultat Global"
      );

      // إعداد مكان الجدولين جنبًا إلى جنب
      const resultsTableWidth = tableWidth;
      const globalTableWidth = tableWidth; // نفس عرض الجدول الأول
      const resultsMargin = 14;
      const globalMargin = pageWidth / 2 + 1; // بدون انتقاص من عرض الجدول الأول

      // رسم عنوان جدول النتائج فقط (بدون عنوان Résultat Global)
      pdf.text('Synthèse des résultats', resultsMargin, tableStartY - 2);

      // رسم جدول النتائج (يسار)
      autoTable(pdf, {
        startY: tableStartY,
        head: resultsHead,
        body: resultsBody,
        styles: { fontSize: 9, halign: 'center', valign: 'middle', cellWidth: 'wrap', wordBreak: 'normal' },
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        margin: { left: resultsMargin },
        tableWidth: resultsTableWidth,
        pageBreak: 'avoid'
      });
      const resultsTableFinalY = pdf.lastAutoTable.finalY;

      // رسم جدول Résultat Global (يمين)
      let globalTableFinalY = tableStartY;
      if (globalRow) {
        const isExcedent = globalRow[1] === 'Excédent';
        const bgColor = isExcedent ? [39, 174, 96] : [231, 76, 60];

        // استخراج كل النسب من الجدول (بدون Résultat Global) وتحويلها لأرقام (مع العلامة)
        const percents = rowsSansGlobal
          .map(row => row[2])
          .filter(p => typeof p === 'string' && /^[+-]?\d+(\.\d+)?%$/.test(p))
          .map(p => ({ raw: p, abs: Math.abs(parseFloat(p)) }));

        let selectedPercent = '';
        if (percents.length) {
          if (isExcedent) {
            selectedPercent = percents.reduce((min, p) => p.abs < min.abs ? p : min, percents[0]).raw;
          } else {
            selectedPercent = percents.reduce((max, p) => p.abs > max.abs ? p : max, percents[0]).raw;
          }
          selectedPercent = selectedPercent.replace(/^[+-]/, "");
        } else {
          selectedPercent = globalRow[2] ? globalRow[2].replace(/^[+-]/, "") : '';
        }

        const resultText = `${globalRow[1]}${selectedPercent ? ` (${selectedPercent})` : ""}`;
        const label = "Résultat Global :";
        const fontSize = 9;
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", "bold");

        // حساب عرض الأعمدة تلقائياً حسب النص
        const w1 = pdf.getTextWidth(label) + 16;
        const w2 = pdf.getTextWidth(resultText) + 20;

        autoTable(pdf, {
          startY: tableStartY,
          body: [
            [
              { content: label, styles: { halign: 'center', fontStyle: 'bold', fontSize, cellWidth: w1, textColor: [0,0,0], fillColor: [255,255,255], lineWidth: 0 } },
              { content: resultText, styles: { halign: 'center', fontStyle: 'bold', fontSize, cellWidth: w2, textColor: [255,255,255], fillColor: bgColor, lineWidth: 0 } }
            ]
          ],
          theme: 'grid',
          styles: {
            cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
            valign: 'middle',
            font: "helvetica",
            fontSize: 9
          },
          head: [],
          margin: { left: globalMargin },
          tableWidth: w1 + w2 // عرض الجدول يساوي مجموع عرض العمودين
        });
        globalTableFinalY = pdf.lastAutoTable.finalY;
      }

      // تحديث Y بعد الجدولين
      tableStartY = Math.max(resultsTableFinalY, globalTableFinalY) + 10;

      // --- النص التوضيحي أسفل النتائج ---
      // حساب ارتفاع النص التوضيحي
      const remarqueText =
        "Remarques:\n" +
        "1. Ce rapport propose une estimation diagnostique de la capacité d'accueil, basée sur les données saisies. C'est un outil d'aide à la décision pour optimiser la planification, et non une validation définitive.\n" +
        "2. Les résultats de l'étude précitée demeurent tributaires de la disponibilité des éléments suivants :\n" +
        "- Équipe de formateurs adéquate aux groupes et spécialités.\n" +
        "- Certificat de prévention des risques de la Protection Civile.\n" +
        "- Voies de circulation et système de ventilation adéquats\n" +
        "- Équipements nécessaires selon la spécificité des spécialités";

      // تقدير ارتفاع النص (كل سطر تقريباً 6مم)
      const remarqueLines = remarqueText.split('\n').length;
      const remarqueHeight = remarqueLines * 6 + 4;
      // إذا لم يبق مكان كافٍ للنص في الصفحة، أضف صفحة جديدة
      if (pageHeight - tableStartY < remarqueHeight + 10) {
        pdf.addPage();
        tableStartY = 20;
      }

      pdf.setFontSize(10);
      pdf.setTextColor(80);
      pdf.setFont(undefined, 'normal');
      pdf.text(
        remarqueText,
        14,
        tableStartY,
        { maxWidth: pageWidth - 28, align: 'left' }
      );
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات ملخص النتائج.');
    }

    // --- ترقيم الصفحات في كل صفحة ---
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Page ${i} / ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // --- حفظ الملف ---
    const cleanTitle = "Rapport_de_diagnostic";
    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`${cleanTitle}_${dateStr}.pdf`);
  });
}