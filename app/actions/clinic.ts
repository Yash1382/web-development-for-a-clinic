"use server"

import { db } from "@/lib/db"
import { doctors, patients, services, appointments } from "@/lib/db/schema"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/* ----------------------------- Doctors ----------------------------- */

export async function getDoctors() {
  return db.select().from(doctors).orderBy(desc(doctors.createdAt))
}

export async function createDoctor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const specialty = String(formData.get("specialty") ?? "").trim()
  if (!name || !specialty) throw new Error("Name and specialty are required")

  await db.insert(doctors).values({
    name,
    specialty,
    email: emptyToNull(formData.get("email")),
    phone: emptyToNull(formData.get("phone")),
    bio: emptyToNull(formData.get("bio")),
  })
  revalidatePath("/")
}

export async function deleteDoctor(id: number) {
  await db.delete(doctors).where(eq(doctors.id, id))
  revalidatePath("/")
}

/* ----------------------------- Patients ----------------------------- */

export async function getPatients() {
  return db.select().from(patients).orderBy(desc(patients.createdAt))
}

export async function createPatient(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim()
  const lastName = String(formData.get("lastName") ?? "").trim()
  if (!firstName || !lastName) throw new Error("First and last name are required")

  await db.insert(patients).values({
    firstName,
    lastName,
    email: emptyToNull(formData.get("email")),
    phone: emptyToNull(formData.get("phone")),
    dateOfBirth: emptyToNull(formData.get("dateOfBirth")),
    notes: emptyToNull(formData.get("notes")),
  })
  revalidatePath("/")
}

export async function deletePatient(id: number) {
  await db.delete(patients).where(eq(patients.id, id))
  revalidatePath("/")
}

/* ----------------------------- Services ----------------------------- */

export async function getServices() {
  return db.select().from(services).orderBy(desc(services.createdAt))
}

export async function createService(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("Service name is required")

  const duration = Number(formData.get("durationMinutes"))
  const price = Number(formData.get("priceCents"))

  await db.insert(services).values({
    name,
    description: emptyToNull(formData.get("description")),
    durationMinutes: Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : 30,
    priceCents: Number.isFinite(price) && price >= 0 ? Math.floor(price) : 0,
  })
  revalidatePath("/")
}

export async function deleteService(id: number) {
  await db.delete(services).where(eq(services.id, id))
  revalidatePath("/")
}

/* --------------------------- Appointments --------------------------- */

export async function getAppointments() {
  return db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      serviceId: appointments.serviceId,
      patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
      doctorName: doctors.name,
      serviceName: services.name,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .orderBy(desc(appointments.scheduledAt))
}

export async function getUpcomingAppointmentsCount() {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(and(gte(appointments.scheduledAt, new Date()), eq(appointments.status, "scheduled")))
  return rows[0]?.count ?? 0
}

export async function createAppointment(formData: FormData) {
  const patientId = Number(formData.get("patientId"))
  const doctorId = Number(formData.get("doctorId"))
  const serviceIdRaw = formData.get("serviceId")
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "")

  if (!Number.isInteger(patientId) || patientId <= 0) throw new Error("A valid patient is required")
  if (!Number.isInteger(doctorId) || doctorId <= 0) throw new Error("A valid doctor is required")
  if (!scheduledAtRaw) throw new Error("A date and time is required")

  const scheduledAt = new Date(scheduledAtRaw)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("Invalid date and time")

  const serviceId = serviceIdRaw ? Number(serviceIdRaw) : null

  await db.insert(appointments).values({
    patientId,
    doctorId,
    serviceId: serviceId && Number.isInteger(serviceId) ? serviceId : null,
    scheduledAt,
    reason: emptyToNull(formData.get("reason")),
    status: "scheduled",
  })
  revalidatePath("/")
}

export async function updateAppointmentStatus(id: number, status: string) {
  const allowed = ["scheduled", "completed", "cancelled", "no_show"]
  if (!allowed.includes(status)) throw new Error("Invalid status")
  await db.update(appointments).set({ status }).where(eq(appointments.id, id))
  revalidatePath("/")
}

export async function deleteAppointment(id: number) {
  await db.delete(appointments).where(eq(appointments.id, id))
  revalidatePath("/")
}

/* ------------------------------ helpers ----------------------------- */

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim()
  return s.length ? s : null
}
