import { db } from "@/lib/db"
import { doctors } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await db.select().from(doctors).orderBy(desc(doctors.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.name || !body?.specialty) {
    return NextResponse.json({ error: "name and specialty are required" }, { status: 400 })
  }
  const [row] = await db
    .insert(doctors)
    .values({
      name: String(body.name),
      specialty: String(body.specialty),
      email: body.email ?? null,
      phone: body.phone ?? null,
      bio: body.bio ?? null,
    })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
