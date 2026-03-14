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
import { Switch } from "@/components/ui/switch"

interface Reseller {
  id?: string
  company: string
  address?: string | null
  contact_person?: string | null
  tel?: string | null
  email?: string | null
  status: boolean
}

interface ResellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reseller?: Reseller | null
  onSave: (reseller: Reseller) => void
}

export function ResellerDialog({ open, onOpenChange, reseller, onSave }: ResellerDialogProps) {
  const [company, setCompany] = React.useState(reseller?.company || "")
  const [address, setAddress] = React.useState(reseller?.address || "")
  const [contact_person, setContactPerson] = React.useState(reseller?.contact_person || "")
  const [tel, setTel] = React.useState(reseller?.tel || "")
  const [email, setEmail] = React.useState(reseller?.email || "")
  const [status, setStatus] = React.useState(reseller?.status ?? true)

  React.useEffect(() => {
    if (reseller) {
      setCompany(reseller.company)
      setAddress(reseller.address || "")
      setContactPerson(reseller.contact_person || "")
      setTel(reseller.tel || "")
      setEmail(reseller.email || "")
      setStatus(reseller.status)
    } else {
      setCompany("")
      setAddress("")
      setContactPerson("")
      setTel("")
      setEmail("")
      setStatus(true)
    }
  }, [reseller, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation for email and phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      alert("Invalid email address format");
      return;
    }

    const telRegex = /^[0-9\-\+ ]{7,15}$/;
    if (tel && !telRegex.test(tel)) {
      alert("Invalid phone number format. Use 7-15 digits, spaces, -, or +.");
      return;
    }

    onSave({
      ...(reseller?.id && { id: reseller.id }),
      company,
      address: address || null,
      contact_person: contact_person || null,
      tel: tel || null,
      email: email || null,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{reseller ? "Edit Reseller" : "Add Reseller"}</DialogTitle>
            <DialogDescription>
              Update reseller account information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_person" className="text-right">Contact</Label>
              <Input id="contact_person" value={contact_person} onChange={(e) => setContactPerson(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tel" className="text-right">Tel</Label>
              <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch checked={status} onCheckedChange={setStatus} />
                <span>{status ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{reseller ? "Save Changes" : "Add Reseller"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}