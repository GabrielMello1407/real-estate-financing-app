import { z } from "zod"
import { isValidEmail, isValidPhone } from "@/lib/validators"

export const proposalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().refine(isValidEmail, { message: "Email inválido" }),
  phone: z.string().refine(isValidPhone, { message: "Telefone inválido" }),
  propertyValue: z.number().min(1, "Valor do imóvel é obrigatório"),
  downPayment: z.number().min(1, "Valor da entrada é obrigatório"),
  financedAmount: z.number(),
  monthlyPayment: z.number(),
  totalAmount: z.number(),
  financingTerm: z.number().min(12, "Prazo mínimo de 12 meses").max(420, "Prazo máximo de 420 meses"),
  interestRate: z.number(),
  signature: z.string().optional(),
  status: z.string(),
})

export const adminLoginSchema = z.object({
  email: z.string().refine(isValidEmail, { message: "Email inválido" }),
  password: z.string().min(4, "Senha obrigatória"),
}) 