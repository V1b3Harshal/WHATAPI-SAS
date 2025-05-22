import { NextResponse } from 'next/server'

// Constants and Types
const MAX_TEMPLATE_NAME_LENGTH = 512
const MAX_HEADER_LENGTH = 60
const MAX_BODY_LENGTH = 1024
const TEMPLATE_NAME_REGEX = /^[a-zA-Z0-9_\-]+$/

enum WhatsAppTemplateCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
}

interface CreateTemplateRequest {
  template_name: string
  category: WhatsAppTemplateCategory
  header_text?: string
  header_parameters?: string[]
  body_text: string
  body_parameters: string[]
}

interface ApiResponseSuccess {
  success: true
  message: string
  data: {
    id?: string
    status?: string
    createdAt: string
    [key: string]: any
  }
}

interface ApiResponseError {
  success: false
  error: string
  message: string
  errors?: Record<string, string>
  statusCode?: number
}

// Validation helper
const validateWhatsAppRequest = (body: Partial<CreateTemplateRequest>) => {
  const errors: Record<string, string> = {}

  // Config validation
  const apiUrl = process.env.WHATSAPP_API_URL?.trim()
  const apiKey = process.env.WHATSAPP_API_KEY?.trim()
  const bearerToken = process.env.WHATSAPP_BEARER_TOKEN?.trim()

  if (!apiUrl || !apiKey || !bearerToken) {
    errors.config = 'WhatsApp API is not properly configured'
    return errors
  }

  // Request validation
  if (!body.template_name?.trim()) {
    errors.template_name = 'Template name is required'
  } else if (!TEMPLATE_NAME_REGEX.test(body.template_name)) {
    errors.template_name = 'Only letters, numbers, underscores and hyphens allowed'
  } else if (body.template_name.length > MAX_TEMPLATE_NAME_LENGTH) {
    errors.template_name = `Template name must be ${MAX_TEMPLATE_NAME_LENGTH} characters or less`
  }

  if (!body.category) {
    errors.category = 'Category is required'
  } else if (!Object.values(WhatsAppTemplateCategory).includes(body.category)) {
    errors.category = `Invalid category. Must be one of: ${Object.values(WhatsAppTemplateCategory).join(', ')}`
  }

  if (!body.body_text?.trim()) {
    errors.body_text = 'Body text is required'
  } else if (body.body_text.length > MAX_BODY_LENGTH) {
    errors.body_text = `Body must be ${MAX_BODY_LENGTH} characters or less`
  }

  if (!body.body_parameters || !Array.isArray(body.body_parameters)) {
    errors.body_parameters = 'Body parameters are required'
  }

  // Header validation
  if (body.header_text) {
    if (!body.header_parameters) {
      errors.header_parameters = 'Header parameters required when header exists'
    } else if (body.header_text.length > MAX_HEADER_LENGTH) {
      errors.header_text = `Header must be ${MAX_HEADER_LENGTH} characters or less`
    }
  }

  // Parameter validation
  try {
    if (body.header_text && body.header_parameters) {
      const headerPlaceholders = (body.header_text.match(/\{\{\d+\}\}/g) || []).length
      if (headerPlaceholders !== body.header_parameters.length) {
        errors.header_parameters = `Header has ${headerPlaceholders} placeholders but ${body.header_parameters.length} parameters provided`
      }
    }

    if (body.body_text && body.body_parameters) {
      const bodyPlaceholders = (body.body_text.match(/\{\{\d+\}\}/g) || []).length
      if (bodyPlaceholders !== body.body_parameters.length) {
        errors.body_parameters = `Body has ${bodyPlaceholders} placeholders but ${body.body_parameters.length} parameters provided`
      }
    }
  } catch (e) {
    errors.parameters = 'Invalid parameter format'
  }

  return Object.keys(errors).length > 0 ? errors : null
}

export async function POST(request: Request) {
  // Validate request
  let requestBody: Partial<CreateTemplateRequest>
  try {
    requestBody = await request.json()
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request',
      message: 'Failed to parse request body',
      statusCode: 400
    }, { status: 400 })
  }

  const validationErrors = validateWhatsAppRequest(requestBody)
  if (validationErrors) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      message: 'Invalid request data',
      errors: validationErrors,
      statusCode: validationErrors.config ? 500 : 400
    }, { status: validationErrors.config ? 500 : 400 })
  }

  // Prepare payload
  const payload = {
    template_name: requestBody.template_name!.trim(),
    category: requestBody.category!,
    body_text: requestBody.body_text!.trim(),
    body_parameters: requestBody.body_parameters!.map(p => p.trim()),
    ...(requestBody.header_text && {
      header_text: requestBody.header_text.trim(),
      header_parameters: requestBody.header_parameters?.map(p => p.trim()) || [""]
    })
  }

  // Call WhatsApp API
  try {
    const response = await fetch(
      `${process.env.WHATSAPP_API_URL}/api/text-template`,
      {
        method: 'POST',
        headers: {
          'x-api-key': process.env.WHATSAPP_API_KEY!,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_BEARER_TOKEN}`
        },
        body: JSON.stringify(payload)
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: responseData.error || 'WhatsApp API error',
        message: responseData.message || 'Failed to create template',
        statusCode: response.status
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      data: {
        ...responseData,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({
      success: false,
      error: 'API Connection Failed',
      message: 'Could not connect to WhatsApp API',
      statusCode: 503
    }, { status: 503 })
  }
}