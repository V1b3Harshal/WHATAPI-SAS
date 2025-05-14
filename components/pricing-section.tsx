"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses just getting started.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Access to WhatsApp API",
        "1,000 messages per month",
        "Basic templates",
        "Email support",
        "API access",
        "Basic analytics",
      ],
      highlighted: false,
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses with higher volume needs.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Access to WhatsApp & SMS APIs",
        "10,000 messages per month",
        "Advanced templates",
        "Priority email support",
        "Webhooks integration",
        "Advanced analytics",
        "Multiple users",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom requirements.",
      monthlyPrice: 249,
      annualPrice: 199,
      features: [
        "Access to all APIs",
        "50,000 messages per month",
        "Custom templates",
        "24/7 phone & email support",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "White-label options",
      ],
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="heading-xl">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees or surprises.
          </p>

          <div className="flex items-center justify-center mt-8">
            <span className={`mr-2 text-sm ${!isAnnual ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-primary" />
            <span className={`ml-2 text-sm ${isAnnual ? "font-medium" : "text-muted-foreground"}`}>
              Annual <span className="text-xs text-primary font-medium ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`relative rounded-lg border ${
                plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : "border-border shadow-sm"
              } bg-card overflow-hidden`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-primary py-1.5 text-xs font-medium text-primary-foreground text-center">
                  Most Popular
                </div>
              )}
              <div className={`p-6 ${plan.highlighted ? "pt-10" : ""}`}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground h-12">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                {isAnnual && <p className="mt-1 text-xs text-primary">Billed annually</p>}
                <Link href="/register">
                  <Button className={`mt-6 w-full ${plan.highlighted ? "" : "bg-secondary hover:bg-secondary/90"}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
              <div className="border-t p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom plan?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
