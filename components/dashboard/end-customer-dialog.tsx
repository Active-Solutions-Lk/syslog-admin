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
import { Switch } from "@/components/ui/switch"

interface EndCustomer {
  id?: string
  company?: string | null
  address?: string | null
  contact_person: string
  tel: string
  email?: string | null
  status: boolean
}

interface EndCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endCustomer?: EndCustomer | null
  onSave: (endCustomer: EndCustomer) => void
}

export function EndCustomerDialog({ open, onOpenChange, endCustomer, onSave }: EndCustomerDialogProps) {
  const [company, setCompany] = React.useState(endCustomer?.company || "")
  const [address, setAddress] = React.useState(endCustomer?.address || "")
  const [contact_person, setContactPerson] = React.useState(endCustomer?.contact_person || "")
  const [tel, setTel] = React.useState(endCustomer?.tel || "")
  const [email, setEmail] = React.useState(endCustomer?.email || "")
  const [status, setStatus] = React.useState(endCustomer?.status ?? true)

  React.useEffect(() => {
    if (endCustomer) {
      setCompany(endCustomer.company || "")
      setAddress(endCustomer.address || "")
      setContactPerson(endCustomer.contact_person)
      setTel(endCustomer.tel)
      setEmail(endCustomer.email || "")
      setStatus(endCustomer.status)
    } else {
      setCompany("")
      setAddress("")
      setContactPerson("")
      setTel("")
      setEmail("")
      setStatus(true)
    }
  }, [endCustomer, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...(endCustomer?.id && { id: endCustomer.id }),
      company: company || null,
      address: address || null,
      contact_person,
      tel,
      email: email || null,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{endCustomer ? "Edit End Customer" : "Add End Customer"}</DialogTitle>
            <DialogDescription>
              Update end customer information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_person" className="text-right">Contact</Label>
              <Input id="contact_person" value={contact_person} onChange={(e) => setContactPerson(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tel" className="text-right">Tel</Label>
              <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} className="col-span-3" required />
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
            <Button type="submit">{endCustomer ? "Save Changes" : "Add End Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}