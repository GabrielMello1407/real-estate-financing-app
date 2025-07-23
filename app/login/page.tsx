"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      console.log("Enviando login para /api/admin/login", { email, password })
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      console.log("Resposta status", res.status)
      const data = await res.json()
      console.log("Resposta data", data)
      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token)
        let cookieString = `adminToken=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        if (window.location.protocol === "https:") cookieString += "; Secure";
        document.cookie = cookieString;
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao painel administrativo."
        })
        console.log("Redirecionando para /admin (window.location.href)")
        window.location.href = "/admin"
      } else {
        setError(data.error || "Credenciais inválidas")
        toast({
          title: "Erro ao fazer login",
          description: data.error || "Credenciais inválidas",
        })
      }
    } catch (err) {
      setError("Erro ao fazer login")
      toast({
        title: "Erro ao fazer login",
        description: "Erro inesperado. Veja o console.",
      })
      console.error("Erro no login:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Painel Administrativo - Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 