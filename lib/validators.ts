export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Aceita apenas números, mínimo 10 dígitos
  return /^\d{10,}$/.test(phone.replace(/\D/g, ""))
} 