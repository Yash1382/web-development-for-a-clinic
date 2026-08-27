import { db } from "@/lib/db"
import { services } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await db.select().from(services).orderBy(desc(services.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  const duration = Number(body.durationMinutes)
  const price = Number(body.priceCents)
  const [row] = await db
    .insert(services)
    .values({
      name: String(body.name),
      description: body.description ?? null,
      durationMinutes: Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : 30,
      priceCents: Number.isFinite(price) && price >= 0 ? Math.floor(price) : 0,
    })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
