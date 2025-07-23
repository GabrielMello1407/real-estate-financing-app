"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, FileText, Users, DollarSign, TrendingUp, LogOut } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { generateFinancingPDF } from "@/lib/pdf-utils"

interface Proposal {
  id: string
  name: string
  email: string
  phone: string
  propertyValue: number
  downPayment: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  financingTerm: number
  status: string
  createdAt: string
  signature?: string // Adicionado para armazenar a assinatura
}

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // Verifica token admin
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null
    if (!token) {
      router.push("/login")
      return
    }
    // Não envie Authorization, deixe o cookie ser usado
    fetch("/api/proposals").then(res => {
      if (res.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/login")
      }
    })
  }, [router])

  useEffect(() => {
    fetchProposals()
  }, [])

  useEffect(() => {
    const filtered = proposals.filter(
      (proposal) =>
        proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProposals(filtered)
  }, [proposals, searchTerm])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error("Erro ao buscar propostas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalProposals = proposals.length
  const signedProposals = proposals.filter((p) => p.status === "signed").length
  const totalFinancedAmount = proposals.reduce((sum, p) => sum + p.financedAmount, 0)
  const averagePropertyValue =
    proposals.length > 0 ? proposals.reduce((sum, p) => sum + p.propertyValue, 0) / proposals.length : 0

  // Função para gerar e abrir o PDF estilizado
  async function handleViewPDF(proposal: Proposal) {
    const blob = await generateFinancingPDF(proposal)
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  // Paginação
  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE)
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie as simulações e propostas de financiamento</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => {
              localStorage.removeItem("adminToken");
              document.cookie = "adminToken=; path=/; max-age=0";
              window.location.href = "/login";
            }}
          >
            <LogOut className="h-5 w-5" /> Sair
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProposals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propostas Assinadas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{signedProposals}</div>
              <p className="text-xs text-muted-foreground">
                {totalProposals > 0 ? ((signedProposals / totalProposals) * 100).toFixed(1) : 0}% de conversão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Financiado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalFinancedAmount.toString())}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averagePropertyValue.toString())}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Propostas */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas de Financiamento</CardTitle>
            <CardDescription>Lista de todas as simulações realizadas</CardDescription>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="max-w-sm"
                />
              </div>
              {/* Paginação no topo em telas pequenas */}
              <div className="flex justify-end w-full sm:w-auto">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabela tradicional para telas médias/grandes */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Valor do Imóvel</TableHead>
                    <TableHead>Financiado</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{proposal.email}</div>
                          <div className="text-gray-500">{proposal.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(proposal.propertyValue.toString())}</TableCell>
                      <TableCell>{formatCurrency(proposal.financedAmount.toString())}</TableCell>
                      <TableCell>{formatCurrency(proposal.monthlyPayment.toString())}</TableCell>
                      <TableCell>
                        <Badge variant={proposal.status === "signed" ? "default" : "secondary"}>
                          {proposal.status === "signed" ? "Assinada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewPDF(proposal)}>
                          <FileText className="h-4 w-4" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Cards para telas pequenas */}
            <div className="sm:hidden space-y-4">
              {paginatedProposals.map((proposal) => (
                <div key={proposal.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-base">{proposal.name}</span>
                    <Badge variant={proposal.status === "signed" ? "default" : "secondary"}>
                      {proposal.status === "signed" ? "Assinada" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</div>
                  <div className="text-sm"><span className="font-medium">Email:</span> {proposal.email}</div>
                  <div className="text-sm"><span className="font-medium">Telefone:</span> {proposal.phone}</div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div><span className="font-medium">Imóvel:</span> {formatCurrency(proposal.propertyValue.toString())}</div>
                    <div><span className="font-medium">Financiado:</span> {formatCurrency(proposal.financedAmount.toString())}</div>
                    <div><span className="font-medium">Parcela:</span> {formatCurrency(proposal.monthlyPayment.toString())}</div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewPDF(proposal)}>
                      <FileText className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProposals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Nenhuma proposta encontrada com os critérios de busca." : "Nenhuma proposta encontrada."}
              </div>
            )}
            {/* Paginação no rodapé */}
            <div className="flex justify-center mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de paginação reutilizável
function PaginationControls({ currentPage, totalPages, setCurrentPage }: { currentPage: number, totalPages: number, setCurrentPage: (n: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <button
        className="px-2 py-1 rounded disabled:opacity-50 text-xs bg-gray-100 hover:bg-gray-200"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
      >«</button>
      <button
        className="px-2 py-1 rounded disabled:opacity-50 text-xs bg-gray-100 hover:bg-gray-200"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >‹</button>
      <span className="px-2 text-xs">Página {currentPage} de {totalPages}</span>
      <button
        className="px-2 py-1 rounded disabled:opacity-50 text-xs bg-gray-100 hover:bg-gray-200"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >›</button>
      <button
        className="px-2 py-1 rounded disabled:opacity-50 text-xs bg-gray-100 hover:bg-gray-200"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      >»</button>
    </div>
  )
}
