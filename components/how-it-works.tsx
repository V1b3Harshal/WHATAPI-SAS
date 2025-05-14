"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Sign Up & Get API Key",
      description: "Create an account and get your API key to start integrating our services.",
    },
    {
      number: "02",
      title: "Choose Your APIs",
      description: "Select from our suite of APIs based on your business needs.",
    },
    {
      number: "03",
      title: "Integrate Our SDK",
      description: "Use our SDK for your preferred programming language to integrate quickly.",
    },
    {
      number: "04",
      title: "Go Live",
      description: "Deploy your integration and start connecting with customers globally.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="heading-xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">Get started with our API platform in just a few simple steps.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="rounded-lg bg-card p-6 shadow-sm border relative z-10">
                <div className="mb-4 text-4xl font-bold text-primary/20">{step.number}</div>
                <h3 className="heading-md mb-2">{step.title}</h3>
                <p className="body-md">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full z-0 w-12 h-0.5 bg-border -translate-y-1/2">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-lg bg-card p-6 shadow-sm border">
          <h3 className="heading-md mb-4">Example Integration</h3>
          <div className="rounded-lg bg-muted p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>
                {`// Initialize the ConnectAPI client
import { ConnectAPI } from '@connectapi/sdk';

// Create a client instance with your API key
const client = new ConnectAPI({
  apiKey: process.env.API_KEY,
  environment: 'production' // or 'sandbox' for testing
});

// Use any of our APIs
async function sendMessage() {
  try {
    const result = await client.whatsapp.sendTemplate({
      to: '+1234567890',
      templateName: 'order_confirmation',
      parameters: {
        orderNumber: '12345',
        total: '$99.99',
        deliveryDate: '2023-05-15'
      }
    });
    
    console.log('Message sent:', result.id);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}`}
              </code>
            </pre>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Simple Integration</h4>
                <p className="text-sm text-muted-foreground">Just a few lines of code to get started</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Comprehensive SDKs</h4>
                <p className="text-sm text-muted-foreground">Available for Node.js, Python, PHP, Java, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Detailed Documentation</h4>
                <p className="text-sm text-muted-foreground">Full API reference and integration guides</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
