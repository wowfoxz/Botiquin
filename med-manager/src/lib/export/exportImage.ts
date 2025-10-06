interface ShoppingItem {
  id: string;
  name: string;
  presentation?: string;
  quantity: number;
  price: number;
}

export async function exportAsImage(
  name: string,
  items: ShoppingItem[],
  total: number,
  fileName: string
): Promise<void> {
  try {
    console.log("Iniciando exportación de imagen...", {
      name,
      itemsCount: items.length,
      total,
      fileName,
    });

    // Configurar dimensiones base
    const width = 2480; // ~210mm a 300 DPI (ancho A4)
    const padding = 120;

    // Calcular altura dinámica según contenido
    const logoHeight = 180;
    const titleHeight = 100;
    const itemHeight = 70; // altura por item (texto + línea + espacio)
    const totalSectionHeight = 200;
    const disclaimerHeight = 420;
    const extraPadding = 240; // padding superior e inferior

    const calculatedHeight =
      extraPadding +
      logoHeight +
      titleHeight +
      items.length * itemHeight +
      totalSectionHeight +
      disclaimerHeight;

    // Crear canvas con altura dinámica
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No se pudo obtener el contexto del canvas");
    }

    canvas.width = width;
    canvas.height = calculatedHeight;

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, calculatedHeight);

    let y = padding;

    // Cargar y dibujar el logo
    try {
      const logo = new Image();
      logo.src = "/Botilyx_negro.png";

      await new Promise<void>((resolve) => {
        logo.onload = () => {
          // Dibujar logo en la esquina superior derecha
          const logoWidth = 300;
          const logoDisplayHeight = 150;
          ctx.drawImage(
            logo,
            width - padding - logoWidth,
            y,
            logoWidth,
            logoDisplayHeight
          );
          resolve();
        };
        logo.onerror = () => {
          console.warn("No se pudo cargar el logo, continuando sin él");
          resolve(); // Continuar aunque falle el logo
        };
      });

      y += logoHeight;
    } catch (error) {
      console.warn("Error al cargar logo:", error);
      y += logoHeight;
    }

    // Título (reducido de 84px a 56px)
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 56px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Lista de Compras: ${name || "Sin nombre"}`, padding, y);
    y += titleHeight;

    // Items
    ctx.font = "42px Arial, sans-serif";
    ctx.fillStyle = "#374151";

    items.forEach((item) => {
      const itemText = `${item.quantity} x ${item.name}${item.presentation ? ` (${item.presentation})` : ""}`;
      const priceText = `$${(item.price * item.quantity).toFixed(2)}`;

      // Texto del item (izquierda)
      ctx.textAlign = "left";
      ctx.fillText(itemText, padding, y);

      // Precio (derecha)
      ctx.textAlign = "right";
      ctx.font = "bold 42px Arial, sans-serif";
      ctx.fillText(priceText, width - padding, y);

      // Línea separadora
      y += 20;
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      y += 50;
      ctx.font = "42px Arial, sans-serif";
    });

    // Línea del total
    y += 40;
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    // Total
    y += 80;
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 60px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Total: $${total.toFixed(2)}`, width - padding, y);

    // Disclaimer (fondo más grande)
    y += 120;
    const disclaimerBoxHeight = 360; // Aumentado para que cubra todo el texto
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(padding, y, width - padding * 2, disclaimerBoxHeight);

    y += 60;
    ctx.fillStyle = "#6b7280";
    ctx.font = "33px Arial, sans-serif";
    ctx.textAlign = "left";

    const disclaimerLines = [
      "Precios de referencia: promedio de valores declarados por laboratorios al Vademécum Nacional de Medicamentos (VNM),",
      "organismo dependiente de la Administración Nacional de Medicamentos, Alimentos y Tecnología Médica (ANMAT).",
      "",
      "La farmacia puede cobrar igual, más o menos. ",
      "Solo estimación; no es cotización ni obligación de venta.",
    ];

    disclaimerLines.forEach((line) => {
      ctx.fillText(line, padding + 40, y);
      y += 40;
    });

    console.log("Canvas renderizado con altura:", calculatedHeight);

    // Convertir a imagen
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    console.log("Canvas convertido a imagen");

    // Descargar
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();

    console.log("Descarga iniciada:", fileName);
  } catch (error) {
    console.error("Error al exportar imagen:", error);
    throw error;
  }
}
