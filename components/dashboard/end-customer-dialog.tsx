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

interface EndCustomer {
  id?: string
  company?: string | null
  address?: string | null
  contact_person: string
  tel: string
  email?: string | null
  status: string
}

interface EndCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endCustomer?: EndCustomer | null
  onSave: (endCustomer: EndCustomer) => void
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function EndCustomerDialog({ open, onOpenChange, endCustomer, onSave }: EndCustomerDialogProps) {
  const [company, setCompany] = React.useState(endCustomer?.company || "")
  const [address, setAddress] = React.useState(endCustomer?.address || "")
  const [contact_person, setContactPerson] = React.useState(endCustomer?.contact_person || "")
  const [tel, setTel] = React.useState(endCustomer?.tel || "")
  const [email, setEmail] = React.useState(endCustomer?.email || "")
  const [status, setStatus] = React.useState(endCustomer?.status || "active")

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
      setStatus("active")
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
              {endCustomer 
                ? "Make changes to the end customer account here." 
                : "Add a new end customer account here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <div className="col-span-3">
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <div className="col-span-3">
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_person" className="text-right">
                Contact Person
              </Label>
              <div className="col-span-3">
                <Input
                  id="contact_person"
                  value={contact_person}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tel" className="text-right">
                Telephone
              </Label>
              <div className="col-span-3">
                <Input
                  id="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
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
            <Button type="submit">{endCustomer ? "Save Changes" : "Add End Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}