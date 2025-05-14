"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, CreditCard, Bell, Share2 } from "lucide-react"

export function ApiShowcase() {
  const [activeTab, setActiveTab] = useState("whatsapp")

  const apis = [
    {
      id: "whatsapp",
      name: "WhatsApp API",
      icon: MessageSquare,
      description: "Connect with customers through WhatsApp with our enterprise-grade API.",
      code: `// Send a WhatsApp message with attachment
export async function sendWhatsAppMessage(number, pdfUrl) {
  const response = await fetch('https://api.connectapi.com/whatsapp/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.API_KEY}\`,
    },
    body: JSON.stringify({
      to: number,
      template: "invoice_template",
      parameters: [pdfUrl]
    }),
  });
  
  return await response.json();
}`,
      language: "javascript",
    },
    {
      id: "payments",
      name: "Payments API",
      icon: CreditCard,
      description: "Process payments securely with our global payments infrastructure.",
      code: `// Process a payment
export async function processPayment(amount, currency, paymentMethod) {
  const response = await fetch('https://api.connectapi.com/payments/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.API_KEY}\`,
    },
    body: JSON.stringify({
      amount,
      currency,
      payment_method: paymentMethod,
      description: "Invoice payment"
    }),
  });
  
  return await response.json();
}`,
      language: "javascript",
    },
    {
      id: "notifications",
      name: "Notifications API",
      icon: Bell,
      description: "Send push notifications, emails, and SMS with a unified API.",
      code: `// Send a multi-channel notification
export async function sendNotification(userId, message, channels) {
  const response = await fetch('https://api.connectapi.com/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.API_KEY}\`,
    },
    body: JSON.stringify({
      user_id: userId,
      message,
      channels, // ["email", "push", "sms"]
      data: {
        action_url: "https://example.com/invoice/123"
      }
    }),
  });
  
  return await response.json();
}`,
      language: "javascript",
    },
    {
      id: "social",
      name: "Social Media API",
      icon: Share2,
      description: "Publish and manage content across multiple social media platforms.",
      code: `// Publish content to multiple platforms
export async function publishContent(content, platforms, media) {
  const response = await fetch('https://api.connectapi.com/social/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.API_KEY}\`,
    },
    body: JSON.stringify({
      content,
      platforms, // ["twitter", "facebook", "instagram"]
      media, // Array of media URLs
      schedule_time: new Date(Date.now() + 3600000).toISOString()
    }),
  });
  
  return await response.json();
}`,
      language: "javascript",
    },
  ]

  return (
    <section id="apis" className="py-16 md:py-24 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-xl">
            Our <span className="gradient-text">API Suite</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">
            Explore our comprehensive suite of APIs designed to power modern digital experiences.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="whatsapp" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              {apis.map((api) => (
                <TabsTrigger key={api.id} value={api.id} className="flex items-center gap-2">
                  <api.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{api.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {apis.map((api) => (
              <TabsContent key={api.id} value={api.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-5 gap-6 items-start"
                >
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <api.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="heading-md">{api.name}</h3>
                    </div>
                    <p className="body-md">{api.description}</p>
                  </div>
                  <div className="md:col-span-3 rounded-lg bg-card border shadow-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b flex items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="ml-4 text-xs font-medium">{api.name} Example</div>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code>{api.code}</code>
                    </pre>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
