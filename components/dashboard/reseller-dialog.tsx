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

interface Reseller {
  customer_id?: string
  company_name: string
  address?: string | null
  type: string
  credit_limit?: string | null
  payment_terms?: string | null
  note?: string | null
  vat?: string | null
  city?: string | null
}

interface ResellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reseller?: Reseller | null
  onSave: (reseller: Reseller) => void
}

const typeOptions = [
  { value: "Standard", label: "Standard" },
  { value: "Premium", label: "Premium" },
  { value: "Enterprise", label: "Enterprise" },
]

export function ResellerDialog({ open, onOpenChange, reseller, onSave }: ResellerDialogProps) {
  const [company_name, setCompanyName] = React.useState(reseller?.company_name || "")
  const [address, setAddress] = React.useState(reseller?.address || "")
  const [type, setType] = React.useState(reseller?.type || "Standard")
  const [credit_limit, setCreditLimit] = React.useState(reseller?.credit_limit || "")
  const [payment_terms, setPaymentTerms] = React.useState(reseller?.payment_terms || "")
  const [note, setNote] = React.useState(reseller?.note || "")
  const [vat, setVat] = React.useState(reseller?.vat || "")
  const [city, setCity] = React.useState(reseller?.city || "")

  React.useEffect(() => {
    if (reseller) {
      setCompanyName(reseller.company_name)
      setAddress(reseller.address || "")
      setType(reseller.type)
      setCreditLimit(reseller.credit_limit || "")
      setPaymentTerms(reseller.payment_terms || "")
      setNote(reseller.note || "")
      setVat(reseller.vat || "")
      setCity(reseller.city || "")
    } else {
      setCompanyName("")
      setAddress("")
      setType("Standard")
      setCreditLimit("")
      setPaymentTerms("")
      setNote("")
      setVat("")
      setCity("")
    }
  }, [reseller, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...(reseller?.customer_id && { customer_id: reseller.customer_id }),
      company_name,
      address: address || null,
      type,
      credit_limit: credit_limit || null,
      payment_terms: payment_terms || null,
      note: note || null,
      vat: vat || null,
      city: city || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{reseller ? "Edit Reseller" : "Add Reseller"}</DialogTitle>
            <DialogDescription>
              {reseller 
                ? "Make changes to the reseller account here." 
                : "Add a new reseller account here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right">
                Company Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="company_name"
                  value={company_name}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full"
                  required
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
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={typeOptions}
                  value={type}
                  onValueChange={setType}
                  placeholder="Select a type..."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credit_limit" className="text-right">
                Credit Limit
              </Label>
              <div className="col-span-3">
                <Input
                  id="credit_limit"
                  value={credit_limit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_terms" className="text-right">
                Payment Terms
              </Label>
              <div className="col-span-3">
                <Input
                  id="payment_terms"
                  value={payment_terms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <div className="col-span-3">
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vat" className="text-right">
                VAT
              </Label>
              <div className="col-span-3">
                <Input
                  id="vat"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <div className="col-span-3">
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{reseller ? "Save Changes" : "Add Reseller"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}