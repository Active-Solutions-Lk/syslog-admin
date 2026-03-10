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
  username: string
  email: string
  password?: string
  role: string
}

interface AdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin?: Admin | null
  onSave: (admin: Admin) => void
}

const roleOptions = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
]

export function AdminDialog({ open, onOpenChange, admin, onSave }: AdminDialogProps) {
  const [username, setUsername] = React.useState(admin?.username || "")
  const [email, setEmail] = React.useState(admin?.email || "")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState(admin?.role || "admin")
  // Added state to hold the validation error message for review
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    // Reset any validation errors when dialog opens or changes
    setError("")
    if (admin) {
      setUsername(admin.username)
      setEmail(admin.email)
      setPassword("")
      setRole(admin.role)
    } else {
      setUsername("")
      setEmail("")
      setPassword("")
      setRole("admin")
    }
  }, [admin, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the password: Must be at least 6 characters
    // Checks when creating a new admin OR updating an existing admin's password
    if ((!admin || password) && password.length < 6) {
      setError("Password must be at least 6 characters")
      return; // Stop form submission and retain the form state
    }

    // Clear any previous error message when validation passes
    setError("")

    onSave({
      ...(admin?.id && { id: admin.id }),
      username,
      email,
      ...(password && { password }),
      role,
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
                ? "Update admin account details."
                : "Add a new admin account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                Password
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  {...(admin ? {} : { required: true })}
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
            {/* Show password validation error message to the user here */}
            {error && (
              <div className="mt-2 rounded-md bg-destructive/15 p-3">
                <p className="text-sm font-medium text-destructive text-center">{error}</p>
              </div>
            )}
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