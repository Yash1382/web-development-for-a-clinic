import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SubmitButton } from "@/components/submit-button"
import { DeleteButton, StatusSelect } from "@/components/row-actions"
import {
  getPatients,
  getDoctors,
  getServices,
  getAppointments,
  createPatient,
  createDoctor,
  createService,
  createAppointment,
  deletePatient,
  deleteDoctor,
  deleteService,
  deleteAppointment,
  updateAppointmentStatus,
} from "@/app/actions/clinic"
import { Users, Stethoscope, ClipboardList, CalendarDays } from "lucide-react"

const statusStyles: Record<string, string> = {
  scheduled: "bg-primary/15 text-primary border-primary/20",
  completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  no_show: "bg-muted text-muted-foreground border-border",
}

function formatDateTime(value: Date | string) {
  const d = new Date(value)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export async function ClinicDashboard() {
  const [patients, doctors, services, appointments] = await Promise.all([
    getPatients(),
    getDoctors(),
    getServices(),
    getAppointments(),
  ])

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.scheduledAt) >= new Date(),
  ).length

  const stats = [
    { label: "Patients", value: patients.length, icon: Users },
    { label: "Doctors", value: doctors.length, icon: Stethoscope },
    { label: "Services", value: services.length, icon: ClipboardList },
    { label: "Upcoming visits", value: upcoming, icon: CalendarDays },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Clinic Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage patients, doctors, services, and appointments
          </p>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="appointments">
        <TabsList className="mb-6">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Appointments */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 || doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add at least one patient and one doctor before booking.
                </p>
              ) : (
                <form action={createAppointment} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="apt-patient">Patient</Label>
                    <Select name="patientId" required>
                      <SelectTrigger id="apt-patient">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apt-doctor">Doctor</Label>
                    <Select name="doctorId" required>
                      <SelectTrigger id="apt-doctor">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apt-service">Service (optional)</Label>
                    <Select name="serviceId">
                      <SelectTrigger id="apt-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apt-when">Date &amp; time</Label>
                    <Input id="apt-when" type="datetime-local" name="scheduledAt" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="apt-reason">Reason</Label>
                    <Input id="apt-reason" name="reason" placeholder="Checkup, follow-up..." />
                  </div>
                  <div className="flex items-end">
                    <SubmitButton>Book appointment</SubmitButton>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <EmptyState label="No appointments yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {formatDateTime(a.scheduledAt)}
                        </TableCell>
                        <TableCell>{a.patientName ?? "—"}</TableCell>
                        <TableCell>{a.doctorName ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{a.serviceName ?? "—"}</TableCell>
                        <TableCell>
                          <StatusSelect
                            value={a.status}
                            onChange={async (status) => {
                              "use server"
                              await updateAppointmentStatus(a.id, status)
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            onDelete={async () => {
                              "use server"
                              await deleteAppointment(a.id)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add patient</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createPatient} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field id="p-first" name="firstName" label="First name" required />
                <Field id="p-last" name="lastName" label="Last name" required />
                <Field id="p-email" name="email" label="Email" type="email" />
                <Field id="p-phone" name="phone" label="Phone" />
                <Field id="p-dob" name="dateOfBirth" label="Date of birth" type="date" />
                <div className="flex items-end">
                  <SubmitButton>Add patient</SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <EmptyState label="No patients yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.firstName} {p.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.email ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.phone ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.dateOfBirth ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            onDelete={async () => {
                              "use server"
                              await deletePatient(p.id)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors */}
        <TabsContent value="doctors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createDoctor} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field id="d-name" name="name" label="Name" required />
                <Field id="d-spec" name="specialty" label="Specialty" required />
                <Field id="d-email" name="email" label="Email" type="email" />
                <Field id="d-phone" name="phone" label="Phone" />
                <div className="flex items-end">
                  <SubmitButton>Add doctor</SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              {doctors.length === 0 ? (
                <EmptyState label="No doctors yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{d.specialty}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{d.email ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{d.phone ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            onDelete={async () => {
                              "use server"
                              await deleteDoctor(d.id)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add service</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createService} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field id="s-name" name="name" label="Name" required />
                <Field id="s-dur" name="durationMinutes" label="Duration (min)" type="number" />
                <Field id="s-price" name="priceCents" label="Price (cents)" type="number" />
                <Field id="s-desc" name="description" label="Description" />
                <div className="flex items-end">
                  <SubmitButton>Add service</SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <EmptyState label="No services yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.durationMinutes} min</TableCell>
                        <TableCell className="tabular-nums">{formatPrice(s.priceCents)}</TableCell>
                        <TableCell className="text-muted-foreground">{s.description ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            onDelete={async () => {
                              "use server"
                              await deleteService(s.id)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({
  id,
  name,
  label,
  type = "text",
  required = false,
}: {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} required={required} />
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{label}</p>
}
