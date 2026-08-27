import { db } from "@/lib/db"
import { patients } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await db.select().from(patients).orderBy(desc(patients.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.firstName || !body?.lastName) {
    return NextResponse.json({ error: "firstName and lastName are required" }, { status: 400 })
  }
  const [row] = await db
    .insert(patients)
    .values({
      firstName: String(body.firstName),
      lastName: String(body.lastName),
      email: body.email ?? null,
      phone: body.phone ?? null,
      dateOfBirth: body.dateOfBirth ?? null,
      notes: body.notes ?? null,
    })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
