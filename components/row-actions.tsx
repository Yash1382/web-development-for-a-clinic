"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={() => startTransition(() => onDelete())}
    >
      {pending ? "..." : "Delete"}
    </Button>
  )
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (status: string) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()
  return (
    <Select
      value={value}
      onValueChange={(v) => startTransition(() => onChange(v))}
      disabled={pending}
    >
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
        <SelectItem value="no_show">No show</SelectItem>
      </SelectContent>
    </Select>
  )
}
