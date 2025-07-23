"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import SignatureModal from "@/components/signature-modal"
import { generateFinancingPDF } from "@/lib/pdf-utils"

interface SimulationData {
  name: string
  email: string
  phone: string
  propertyValue: number
  downPayment: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  financingTerm: number
  interestRate: number
}

export default function ResultsPage() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [showSignature, setShowSignature] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const router = useRouter()
  const signatureDataUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("simulationData")
    if (data) {
      setSimulationData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  const handleAcceptProposal = () => {
    setShowSignature(true)
  }

  // Função para gerar e baixar o PDF estilizado
  async function generateAndDownloadPDFStyled(simulationData: SimulationData, signatureDataUrl: string) {
    const blob = await generateFinancingPDF({ ...simulationData }, signatureDataUrl)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'simulacao-financiamento.pdf'
    link.click()
  }

  const handleSignatureComplete = async (signatureDataUrl: string) => {
    if (!simulationData) return

    try {
      // Salvar no banco de dados
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...simulationData,
          signature: signatureDataUrl,
          status: "signed",
        }),
      })

      if (response.ok) {
        setIsSigned(true)
        setShowSignature(false)
        signatureDataUrlRef.current = signatureDataUrl
        // Baixar PDF automaticamente
        await generateAndDownloadPDFStyled(simulationData, signatureDataUrl)
        // Pequeno delay para o usuário baixar o PDF
        setTimeout(() => {
          router.push("/")
        }, 1500)
      }
    } catch (error) {
      console.error("Erro ao salvar proposta:", error)
    }
  }

  if (!simulationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando resultados...</p>
        </div>
      </div>
    )
  }

  const totalInterest = simulationData.totalAmount - simulationData.financedAmount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resultado da Simulação</h1>
            <p className="text-gray-600">Confira os detalhes do seu financiamento</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo do Financiamento
              </CardTitle>
              <CardDescription>
                Dados calculados com taxa de {(simulationData.interestRate * 100).toFixed(1)}% ao ano
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor do Imóvel</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(simulationData.propertyValue.toString())}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Entrada</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(simulationData.downPayment.toString())}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Financiado:</span>
                  <span className="font-semibold">{formatCurrency(simulationData.financedAmount.toString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prazo:</span>
                  <span className="font-semibold">{simulationData.financingTerm} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de Juros:</span>
                  <span className="font-semibold">{(simulationData.interestRate * 100).toFixed(1)}% a.a.</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                  <p className="text-sm opacity-90 mb-1">Parcela Mensal</p>
                  <p className="text-3xl font-bold">{formatCurrency(simulationData.monthlyPayment.toString())}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-gray-600 mb-1">Total a Pagar</p>
                    <p className="font-semibold">{formatCurrency(simulationData.totalAmount.toString())}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-gray-600 mb-1">Total de Juros</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(totalInterest.toString())}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
              <CardDescription>Informações fornecidas na simulação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{simulationData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{simulationData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold">{simulationData.phone}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                {!isSigned ? (
                  <Button
                    onClick={handleAcceptProposal}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Aceitar Proposta e Assinar
                  </Button>
                ) : (
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">Proposta Assinada!</p>
                    <p className="text-green-600 text-sm">Sua proposta foi salva com sucesso.</p>
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent" onClick={() => generateAndDownloadPDFStyled(simulationData, "")}>
                  <Download className="h-4 w-4 mr-2" />
                  Imprimir/Salvar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showSignature && (
          <SignatureModal
            onClose={() => setShowSignature(false)}
            onSave={handleSignatureComplete}
            clientName={simulationData.name}
          />
        )}

        {isSigned && (
          <Button
            onClick={() => generateAndDownloadPDFStyled(simulationData, signatureDataUrlRef.current!)}
            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-lg py-6 shadow-lg flex items-center justify-center gap-2 border-2 border-green-200"
            style={{ transition: 'all 0.2s' }}
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar PDF de Confirmação com Assinatura
          </Button>
        )}
      </div>
    </div>
  )
}
