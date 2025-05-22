"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Loader2, Info, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"

// Define schema based on API requirements
const templateSchema = z.object({
  template_name: z.string()
    .min(1, "Template name is required")
    .max(512, "Must be under 512 characters")
    .regex(/^[a-zA-Z0-9_\-]+$/, "Only letters, numbers, underscores and hyphens allowed"),
  category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]),
  header_text: z.string()
    .max(60, "Must be under 60 characters")
    .optional(),
  body_text: z.string()
    .min(1, "Body text is required")
    .max(1024, "Must be under 1024 characters"),
  body_parameters: z.array(z.string().min(1, "Cannot be empty")).min(1, "Add at least one parameter"),
  header_parameters: z.array(z.string().min(1, "Cannot be empty")).optional()
})

type TemplateForm = z.infer<typeof templateSchema>

export default function TemplatesPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof TemplateForm, string>>>({})

  const [form, setForm] = useState<TemplateForm>({
    template_name: "",
    category: "UTILITY",
    header_text: "",
    body_text: "",
    body_parameters: [""],
    header_parameters: [""]
  })

  const handleChange = (field: keyof TemplateForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleParamChange = (type: 'body' | 'header', index: number, value: string) => {
    const field = `${type}_parameters` as const
    const newParams = [...form[field] || []]
    newParams[index] = value
    handleChange(field, newParams)
  }

  const addParam = (type: 'body' | 'header') => {
    const field = `${type}_parameters` as const
    handleChange(field, [...(form[field] || []), ""])
  }

  const removeParam = (type: 'body' | 'header', index: number) => {
    const field = `${type}_parameters` as const
    if ((form[field]?.length || 0) > 1) {
      handleChange(field, (form[field] || []).filter((_, i) => i !== index))
    }
  }

  const countPlaceholders = (text: string) => {
    return (text.match(/\{\{\d+\}\}/g) || []).length
  }

  const validate = () => {
    try {
      // Count placeholders and validate against parameters
      const bodyPlaceholders = countPlaceholders(form.body_text)
      if (bodyPlaceholders !== form.body_parameters.length) {
        throw new z.ZodError([{
          code: "custom",
          path: ["body_parameters"],
          message: `Body has ${bodyPlaceholders} placeholders but ${form.body_parameters.length} parameters provided`
        }])
      }

      if (form.header_text) {
        const headerPlaceholders = countPlaceholders(form.header_text)
        if (headerPlaceholders !== (form.header_parameters?.length || 0)) {
          throw new z.ZodError([{
            code: "custom",
            path: ["header_parameters"],
            message: `Header has ${headerPlaceholders} placeholders but ${form.header_parameters?.length || 0} parameters provided`
          }])
        }
      }

      // Validate with schema
      templateSchema.parse(form)
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: typeof errors = {}
        err.errors.forEach(e => {
          const path = e.path[0] as keyof TemplateForm
          newErrors[path] = e.message
        })
        setErrors(newErrors)
        
        // Scroll to first error
        const firstError = document.querySelector('[class*="border-destructive"]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }
  }

  const submitTemplate = async () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // Prepare payload according to API requirements
      const payload = {
        template_name: form.template_name.trim(),
        category: form.category,
        body_text: form.body_text.trim(),
        body_parameters: form.body_parameters.map(p => p.trim()),
        ...(form.header_text && {
          header_text: form.header_text.trim(),
          header_parameters: form.header_parameters?.map(p => p.trim()) || [""]
        })
      }

      const res = await fetch('/api/dashboard/create-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message || 
          data.error || 
          `Failed to create template (Status: ${res.status})`
        )
      }

      // Show success state
      setIsSuccess(true)
      toast({
        title: "Success!",
        description: "Template created successfully",
        action: (
          <Button variant="ghost" onClick={() => {
            setIsDialogOpen(false)
            router.refresh()
          }}>
            Close
          </Button>
        )
      })

      // Reset form after delay
      setTimeout(() => {
        setIsDialogOpen(false)
        router.refresh()
      }, 2000)

    } catch (error) {
      console.error("Template creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      template_name: "",
      category: "UTILITY",
      header_text: "",
      body_text: "",
      body_parameters: [""],
      header_parameters: [""]
    })
    setErrors({})
    setIsSuccess(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
          <p className="text-muted-foreground">Create and manage message templates</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isSuccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Template Created Successfully
                  </div>
                ) : (
                  "Create New Template"
                )}
              </DialogTitle>
            </DialogHeader>
            
            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h3 className="text-lg font-medium">Template Created</h3>
                <p className="text-muted-foreground">
                  Your template "{form.template_name}" has been successfully created.
                </p>
                <div className="pt-4">
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name*</label>
                  <Input
                    value={form.template_name}
                    onChange={e => handleChange('template_name', e.target.value)}
                    placeholder="order_confirmation"
                    className={errors.template_name ? "border-destructive" : ""}
                  />
                  {errors.template_name && (
                    <p className="text-sm text-destructive mt-1">{errors.template_name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category*</label>
                  <Select
                    value={form.category}
                    onValueChange={val => handleChange('category', val as TemplateForm['category'])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Header (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Header Text</label>
                  <Input
                    value={form.header_text}
                    onChange={e => handleChange('header_text', e.target.value)}
                    placeholder="Your Order #1234"
                    className={errors.header_text ? "border-destructive" : ""}
                  />
                  {errors.header_text && (
                    <p className="text-sm text-destructive mt-1">{errors.header_text}</p>
                  )}
                  
                  {/* Header Parameters (shown only if header exists) */}
                  {form.header_text && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Header Parameters*</label>
                      <div className="space-y-2">
                        {(form.header_parameters || []).map((param, i) => (
                          <div key={`header-${i}`} className="flex gap-2 items-center">
                            <Input
                              value={param}
                              onChange={e => handleParamChange('header', i, e.target.value)}
                              placeholder={`Value for {{${i+1}}}`}
                              className={errors.header_parameters ? "border-destructive" : ""}
                            />
                            {(form.header_parameters?.length || 0) > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeParam('header', i)}
                              >
                                <Trash className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addParam('header')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Header Parameter
                        </Button>
                      </div>
                      {errors.header_parameters && (
                        <p className="text-sm text-destructive mt-1">{errors.header_parameters}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message Body*</label>
                  <Textarea
                    value={form.body_text}
                    onChange={e => handleChange('body_text', e.target.value)}
                    rows={5}
                    placeholder={`Hello {{1}}, your order {{2}} has shipped!\n\nTracking number: {{3}}\nExpected delivery: {{4}}`}
                    className={errors.body_text ? "border-destructive" : ""}
                  />
                  {errors.body_text && (
                    <p className="text-sm text-destructive mt-1">{errors.body_text}</p>
                  )}
                </div>

                {/* Body Parameters */}
                <div>
                  <label className="block text-sm font-medium mb-2">Body Parameters*</label>
                  <div className="space-y-2">
                    {form.body_parameters.map((param, i) => (
                      <div key={`body-${i}`} className="flex gap-2 items-center">
                        <Input
                          value={param}
                          onChange={e => handleParamChange('body', i, e.target.value)}
                          placeholder={`Value for {{${i+1}}}`}
                          className={errors.body_parameters ? "border-destructive" : ""}
                        />
                        {form.body_parameters.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParam('body', i)}
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addParam('body')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Body Parameter
                    </Button>
                  </div>
                  {errors.body_parameters && (
                    <p className="text-sm text-destructive mt-1">{errors.body_parameters}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitTemplate} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Template"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Guidelines Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <CardTitle>Template Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium">Template Requirements</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Template names: 1-512 chars, letters/numbers/underscores/hyphens</li>
              <li>Message body: 1-1024 characters</li>
              <li>Header text: 0-60 characters (if provided)</li>
              <li>Parameters must match placeholders exactly</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Parameters</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Use {'{{1}}'}, {'{{2}}'} format for variables</li>
              <li>Number of parameters must match placeholders in text</li>
              <li>Header parameters required if header exists</li>
              <li>At least one body parameter required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}