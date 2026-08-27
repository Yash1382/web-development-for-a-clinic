import { db } from "@/lib/db"
import { appointments } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await db.select().from(appointments).orderBy(desc(appointments.scheduledAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const patientId = Number(body?.patientId)
  const doctorId = Number(body?.doctorId)
  if (!Number.isInteger(patientId) || !Number.isInteger(doctorId) || !body?.scheduledAt) {
    return NextResponse.json(
      { error: "patientId, doctorId and scheduledAt are required" },
      { status: 400 },
    )
  }
  const scheduledAt = new Date(String(body.scheduledAt))
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "scheduledAt is invalid" }, { status: 400 })
  }
  const serviceId = body.serviceId ? Number(body.serviceId) : null
  const [row] = await db
    .insert(appointments)
    .values({
      patientId,
      doctorId,
      serviceId: serviceId && Number.isInteger(serviceId) ? serviceId : null,
      scheduledAt,
      reason: body.reason ?? null,
      status: "scheduled",
    })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
