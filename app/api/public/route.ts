import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const result = await sql`
      INSERT INTO proposals (
        name, email, phone, property_value, down_payment, 
        financed_amount, monthly_payment, total_amount, 
        financing_term, interest_rate, signature, status
      ) VALUES (
        ${data.name}, ${data.email}, ${data.phone}, ${data.propertyValue}, 
        ${data.downPayment}, ${data.financedAmount}, ${data.monthlyPayment}, 
        ${data.totalAmount}, ${data.financingTerm}, ${data.interestRate}, 
        ${data.signature}, ${data.status}
      ) RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Erro ao salvar proposta:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const proposals = await sql`
      SELECT 
        id, name, email, phone, property_value as "propertyValue",
        down_payment as "downPayment", financed_amount as "financedAmount",
        monthly_payment as "monthlyPayment", total_amount as "totalAmount",
        financing_term as "financingTerm", status, created_at as "createdAt"
      FROM proposals 
      ORDER BY created_at DESC
    `

    return NextResponse.json(proposals)
  } catch (error) {
    console.error("Erro ao buscar propostas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
