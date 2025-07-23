"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Home, DollarSign, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency, parseCurrency } from "@/lib/utils"
import { NumericFormat, PatternFormat } from 'react-number-format'

const simulationSchema = z
  .object({
    propertyValue: z.string().min(1, "Valor do imóvel é obrigatório"),
    downPayment: z.string().min(1, "Valor da entrada é obrigatório"),
    financingTerm: z.number().min(12, "Prazo mínimo de 12 meses").max(420, "Prazo máximo de 420 meses"),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  })
  .refine(
    (data) => {
      const propertyValue = parseCurrency(data.propertyValue)
      const downPayment = parseCurrency(data.downPayment)
      return downPayment >= propertyValue * 0.2
    },
    {
      message: "Entrada deve ser no mínimo 20% do valor do imóvel",
      path: ["downPayment"],
    },
  )

type SimulationForm = z.infer<typeof simulationSchema>

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      financingTerm: 360,
    },
  })

  const propertyValue = watch("propertyValue")
  const downPayment = watch("downPayment")

  const onSubmit = async (data: SimulationForm) => {
    setIsLoading(true)

    const propertyValueNum = parseCurrency(data.propertyValue)
    const downPaymentNum = parseCurrency(data.downPayment)
    const financedAmount = propertyValueNum - downPaymentNum

    // Cálculo da parcela usando Sistema Price (juros compostos)
    const monthlyRate = 0.12 / 12 // 12% ao ano = 1% ao mês
    const monthlyPayment =
      (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, data.financingTerm))) /
      (Math.pow(1 + monthlyRate, data.financingTerm) - 1)

    const simulationData = {
      ...data,
      propertyValue: propertyValueNum,
      downPayment: downPaymentNum,
      financedAmount,
      monthlyPayment,
      totalAmount: monthlyPayment * data.financingTerm,
      interestRate: 0.12,
    }

    // Salvar no localStorage para a próxima página
    localStorage.setItem("simulationData", JSON.stringify(simulationData))

    setIsLoading(false)
    router.push("/results")
  }

  const minDownPayment = propertyValue ? parseCurrency(propertyValue) * 0.2 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => router.push("/login")}
          >
            Login Admin
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulação de Financiamento</h1>
          <p className="text-gray-600">Simule seu financiamento imobiliário com taxa de 12% ao ano</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados da Simulação
            </CardTitle>
            <CardDescription>Preencha os dados abaixo para calcular seu financiamento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor do Imóvel
                  </Label>
                  <NumericFormat
                    customInput={Input}
                    id="propertyValue"
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    value={propertyValue}
                    onValueChange={(values: { value: string }) => setValue("propertyValue", values.value)}
                    className={errors.propertyValue ? "border-red-500" : ""}
                  />
                  {errors.propertyValue && <p className="text-sm text-red-500">{errors.propertyValue.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor da Entrada
                  </Label>
                  <NumericFormat
                    customInput={Input}
                    id="downPayment"
                    thousandSeparator="."
                    decimalSeparator="," 
                    prefix="R$ "
                    value={downPayment}
                    onValueChange={(values: { value: string }) => setValue("downPayment", values.value)}
                    className={errors.downPayment ? "border-red-500" : ""}
                  />
                  {minDownPayment > 0 && (
                    <p className="text-xs text-gray-500">Mínimo: {formatCurrency(minDownPayment.toString())}</p>
                  )}
                  {errors.downPayment && <p className="text-sm text-red-500">{errors.downPayment.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financingTerm" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Prazo do Financiamento (meses)
                </Label>
                <Input
                  id="financingTerm"
                  type="number"
                  min="12"
                  max="420"
                  {...register("financingTerm", { valueAsNumber: true })}
                  className={errors.financingTerm ? "border-red-500" : ""}
                />
                {errors.financingTerm && <p className="text-sm text-red-500">{errors.financingTerm.message}</p>}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <PatternFormat
                    customInput={Input}
                    id="phone"
                    format="(##) # ####-####"
                    mask="_"
                    value={watch("phone")}
                    onValueChange={(values: { value: string }) => setValue("phone", values.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" disabled={isLoading}>
                {isLoading ? "Calculando..." : "Simular Financiamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
