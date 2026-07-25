/**
 * Printable PDF Exporter for Portal de Estudos Eyshila Caxias
 * Formats content into a clean, professional printable layout
 */
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

  const formattedContent = content
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"/>
      <title>${title} - Portal Eyshila Caxias</title>
      <style>
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
        .brand span {
          color: #4f46e5;
        }
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
        .content p {
          margin-bottom: 12px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">Portal de Estudos <span>Eyshila Caxias</span></div>
        <div class="badge">${category}</div>
      </div>
      
      <div class="doc-title">${title}</div>
      <div class="doc-date">Gerado em ${currentDate} • Foco ENARE 2026/2027</div>

      <div class="content">
        <p>${formattedContent}</p>
      </div>

      <div class="footer">
        Portal de Estudos Eyshila Caxias • ENARE Enfermagem • Todos os direitos reservados.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
