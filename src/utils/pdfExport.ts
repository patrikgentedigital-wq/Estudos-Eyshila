/**
 * Printable PDF Exporter for Portal de Estudos Eyshila Caxias.
 *
 * The printable document is assembled with DOM APIs so AI-generated text is
 * always treated as text instead of executable HTML.
 */
function appendFormattedText(documentRef: Document, parent: HTMLElement, value: string) {
  const markdownToken = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;

  for (const match of value.matchAll(markdownToken)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parent.appendChild(documentRef.createTextNode(value.slice(lastIndex, start)));
    }

    const element = document.createElement(match[1] !== undefined ? "strong" : "em");
    element.textContent = match[1] ?? match[2] ?? "";
    parent.appendChild(element);
    lastIndex = start + match[0].length;
  }

  if (lastIndex < value.length) {
    parent.appendChild(documentRef.createTextNode(value.slice(lastIndex)));
  }
}

function createPrintableContent(documentRef: Document, content: string) {
  const container = documentRef.createElement("div");
  container.className = "content";

  const paragraphs = content.split(/\n{2,}/);
  for (const paragraph of paragraphs) {
    const element = documentRef.createElement("p");
    paragraph.split("\n").forEach((line, index) => {
      if (index > 0) {
        element.appendChild(documentRef.createElement("br"));
      }
      appendFormattedText(documentRef, element, line);
    });
    container.appendChild(element);
  }

  return container;
}

export function exportToPrintablePdf(title: string, content: string, category: string = "Resumo ENARE Enfermagem") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permita pop-ups no seu navegador para exportar o PDF.");
    return;
  }

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const printDocument = printWindow.document;
  const style = printDocument.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .brand span { color: #4f46e5; }
    .badge {
      background: #e0e7ff;
      color: #4338ca;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .doc-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .doc-date {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 24px;
    }
    .content {
      font-size: 14px;
      color: #334155;
      background: #f8fafc;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .content p { margin-bottom: 12px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print { body { padding: 20px; } }
  `;

  printDocument.documentElement.lang = "pt-BR";
  printDocument.title = `${title} - Portal Eyshila Caxias`;
  printDocument.head.replaceChildren(style);

  const header = printDocument.createElement("div");
  header.className = "header";
  const brand = printDocument.createElement("div");
  brand.className = "brand";
  brand.appendChild(printDocument.createTextNode("Portal de Estudos "));
  const brandName = printDocument.createElement("span");
  brandName.textContent = "Eyshila Caxias";
  brand.appendChild(brandName);
  const badge = printDocument.createElement("div");
  badge.className = "badge";
  badge.textContent = category;
  header.append(brand, badge);

  const docTitle = printDocument.createElement("div");
  docTitle.className = "doc-title";
  docTitle.textContent = title;

  const docDate = printDocument.createElement("div");
  docDate.className = "doc-date";
  docDate.textContent = `Gerado em ${currentDate} • Foco ENARE 2026/2027`;

  const footer = printDocument.createElement("div");
  footer.className = "footer";
  footer.textContent = "Portal de Estudos Eyshila Caxias • ENARE Enfermagem • Todos os direitos reservados.";

  printDocument.body.replaceChildren(header, docTitle, docDate, createPrintableContent(printDocument, content), footer);

  printWindow.setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.focus();
      printWindow.print();
    }
  }, 250);
}
