import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number): string {
  const numericValue = typeof value === "string" ? parseCurrency(value) : value

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue)
}

export function parseCurrency(value: string): number {
  // Remove todos os caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, "")

  // Substitui vírgula por ponto para conversão
  const normalizedValue = cleanValue.replace(",", ".")

  return Number.parseFloat(normalizedValue) || 0
}

export function formatPhone(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, "")

  // Aplica a máscara (XX) XXXXX-XXXX
  if (cleanValue.length <= 11) {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return value
}
