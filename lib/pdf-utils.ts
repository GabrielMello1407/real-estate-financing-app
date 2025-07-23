import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export interface SimulationOrProposalData {
  name: string
  email: string
  phone: string
  propertyValue: number
  downPayment: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  financingTerm: number
  interestRate?: number
  status?: string
  createdAt?: string
  signature?: string
}

export async function generateFinancingPDF(data: SimulationOrProposalData, signatureDataUrl?: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 900])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Cores
  const blue = rgb(30/255, 64/255, 175/255)
  const green = rgb(34/255, 197/255, 94/255)
  const orange = rgb(251/255, 146/255, 60/255)
  const gray = rgb(71/255, 85/255, 105/255)
  const borderGray = rgb(203/255, 213/255, 225/255)

  // Header
  const createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
  page.drawText(`${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`, { x: 40, y: 870, size: 10, font, color: gray })
  page.drawText("v0 App", { x: 500, y: 870, size: 10, font, color: gray })

  // Título
  page.drawText("Resultado da Simulação", { x: 40, y: 840, size: 22, font: fontBold, color: rgb(0,0,0) })
  page.drawText("Confira os detalhes do seu financiamento", { x: 40, y: 820, size: 12, font, color: gray })

  // Card Resumo do Financiamento
  page.drawRectangle({ x: 30, y: 600, width: 540, height: 200, color: rgb(1,1,1), borderColor: borderGray, borderWidth: 1.5 })
  page.drawText("Resumo do Financiamento", { x: 50, y: 780, size: 15, font: fontBold, color: rgb(0,0,0) })
  if (data.interestRate !== undefined) {
    page.drawText(`Dados calculados com taxa de ${(data.interestRate * 100).toFixed(1)}% ao ano`, { x: 50, y: 765, size: 10, font, color: gray })
  }

  // Valores principais
  page.drawText("Valor do Imóvel", { x: 60, y: 740, size: 10, font, color: gray })
  page.drawText("Entrada", { x: 340, y: 740, size: 10, font, color: gray })
  page.drawText(`R$ ${data.propertyValue.toLocaleString()}`, { x: 60, y: 725, size: 15, font: fontBold, color: blue })
  page.drawText(`R$ ${data.downPayment.toLocaleString()}`, { x: 340, y: 725, size: 15, font: fontBold, color: green })

  // Valores detalhados
  page.drawText("Valor Financiado:", { x: 60, y: 705, size: 10, font, color: gray })
  page.drawText(`R$ ${data.financedAmount.toLocaleString()}`, { x: 180, y: 705, size: 10, font: fontBold, color: rgb(0,0,0) })
  page.drawText("Prazo:", { x: 60, y: 690, size: 10, font, color: gray })
  page.drawText(`${data.financingTerm} meses`, { x: 180, y: 690, size: 10, font: fontBold, color: rgb(0,0,0) })
  if (data.interestRate !== undefined) {
    page.drawText("Taxa de Juros:", { x: 60, y: 675, size: 10, font, color: gray })
    page.drawText(`${(data.interestRate * 100).toFixed(1)}% a.a.`, { x: 180, y: 675, size: 10, font: fontBold, color: rgb(0,0,0) })
  }

  // Parcela Mensal
  page.drawText("Parcela Mensal", { x: 60, y: 655, size: 10, font, color: gray })
  page.drawText(`R$ ${data.monthlyPayment.toLocaleString()}`, { x: 180, y: 655, size: 15, font: fontBold, color: gray })

  // Total a Pagar e Total de Juros
  page.drawText("Total a Pagar", { x: 60, y: 635, size: 10, font, color: gray })
  page.drawText(`R$ ${data.totalAmount.toLocaleString()}`, { x: 180, y: 635, size: 12, font: fontBold, color: rgb(0,0,0) })
  if (data.totalAmount !== undefined && data.financedAmount !== undefined) {
    page.drawText("Total de Juros", { x: 340, y: 635, size: 10, font, color: gray })
    const totalInterest = data.totalAmount - data.financedAmount
    page.drawText(`R$ ${totalInterest.toLocaleString()}`, { x: 440, y: 635, size: 12, font: fontBold, color: orange })
  }

  // Card Dados do Cliente
  page.drawRectangle({ x: 30, y: 400, width: 540, height: 120, color: rgb(1,1,1), borderColor: borderGray, borderWidth: 1.5 })
  page.drawText("Dados do Cliente", { x: 50, y: 510, size: 15, font: fontBold, color: rgb(0,0,0) })
  page.drawText("Informações fornecidas na simulação", { x: 50, y: 495, size: 10, font, color: gray })
  // Ajuste: alinhar dados à esquerda, padding horizontal
  const left = 60
  let y = 475
  page.drawText("Nome", { x: left, y, size: 10, font, color: gray })
  page.drawText(data.name.toUpperCase(), { x: left + 60, y, size: 12, font: fontBold, color: rgb(0,0,0) })
  y -= 15
  page.drawText("Email", { x: left, y, size: 10, font, color: gray })
  page.drawText(data.email, { x: left + 60, y, size: 12, font: fontBold, color: rgb(0,0,0) })
  y -= 15
  page.drawText("Telefone", { x: left, y, size: 10, font, color: gray })
  page.drawText(data.phone, { x: left + 60, y, size: 12, font: fontBold, color: rgb(0,0,0) })

  // Assinatura
  if (signatureDataUrl || data.signature) {
    const sigUrl = signatureDataUrl || data.signature
    if (sigUrl) {
      const pngImageBytes = await fetch(sigUrl).then(res => res.arrayBuffer())
      const pngImage = await pdfDoc.embedPng(pngImageBytes)
      page.drawText("Assinatura do Cliente:", { x: 50, y: 420, size: 10, font, color: gray })
      page.drawImage(pngImage, { x: 180, y: 400, width: 200, height: 40 })
    }
  }

  // Rodapé
  page.drawText("Documento gerado digitalmente. Válido sem assinatura manuscrita.", { x: 40, y: 30, size: 10, font, color: gray })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
} 