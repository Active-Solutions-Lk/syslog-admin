"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboBox } from "@/components/dashboard/combo_box"

interface Admin {
  id?: string
  name: string
  email: string
  password?: string
  role: string
  status: "active" | "inactive"
}

interface AdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin?: Admin | null
  onSave: (admin: Admin) => void
}

const roleOptions = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Moderator", label: "Moderator" },
  { value: "Support", label: "Support" },
]

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function AdminDialog({ open, onOpenChange, admin, onSave }: AdminDialogProps) {
  const [name, setName] = React.useState(admin?.name || "")
  const [email, setEmail] = React.useState(admin?.email || "")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState(admin?.role || "Admin")
  const [status, setStatus] = React.useState<"active" | "inactive">(admin?.status || "active")

  React.useEffect(() => {
    if (admin) {
      setName(admin.name)
      setEmail(admin.email)
      setPassword("") // Don't prefill password for security
      setRole(admin.role)
      setStatus(admin.status)
    } else {
      setName("")
      setEmail("")
      setPassword("")
      setRole("Admin")
      setStatus("active")
    }
  }, [admin, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...(admin?.id && { id: admin.id }),
      name,
      email,
      ...(password && { password }), // Only include password if it's being set
      role,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{admin ? "Edit Admin" : "Add Admin"}</DialogTitle>
            <DialogDescription>
              {admin 
                ? "Make changes to the admin account here." 
                : "Add a new admin account here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {admin ? "Password" : "Password"}
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  {...(admin ? {} : { required: true })} // Only required when adding new admin
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={roleOptions}
                  value={role}
                  onValueChange={setRole}
                  placeholder="Select a role..."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={statusOptions}
                  value={status}
                  onValueChange={setStatus}
                  placeholder="Select a status..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{admin ? "Save Changes" : "Add Admin"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}