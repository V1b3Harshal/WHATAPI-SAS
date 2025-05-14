"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      <div className="hero-gradient absolute inset-0 pointer-events-none" />
      <div className="container-custom">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-1"></span>
              Enterprise API Solutions
            </div>
            <h1 className="heading-xl">
              Connect Your Business with <span className="gradient-text">Powerful APIs</span>
            </h1>
            <p className="body-lg max-w-[600px]">
              Seamlessly integrate messaging, payments, and more into your business applications with our reliable,
              scalable API solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/register">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Enterprise-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:ml-auto"
          >
            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-violet-500/20 to-blue-500/20 p-4 shadow-xl">
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">WhatsApp API</h3>
                      <p className="text-xs text-muted-foreground">Sending message...</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <code className="text-xs sm:text-sm">
                        <pre className="overflow-x-auto">
                          {`await sendingWhatsapp("+1234567890", 
  "https://example.com/invoice.pdf");`}
                        </pre>
                      </code>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 text-sm">
                      <p className="text-xs sm:text-sm">✅ Message sent successfully to +1234567890</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-violet-500/30 blur-2xl" />
            </div>
            <motion.div
              className="absolute -z-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 8,
                ease: "easeInOut",
              }}
              style={{ top: "20%", right: "10%" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
