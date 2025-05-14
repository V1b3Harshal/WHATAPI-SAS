"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "What APIs does ConnectAPI offer?",
      answer:
        "ConnectAPI offers a suite of communication and engagement APIs including WhatsApp API, SMS API, Email API, Push Notifications API, Payment Processing API, and Social Media APIs. We're constantly expanding our offerings based on customer needs.",
    },
    {
      question: "How do I get started with ConnectAPI?",
      answer:
        "Getting started is simple. Sign up for an account, complete the verification process, obtain your API key, and integrate our SDK into your application. Our documentation provides step-by-step guides for various programming languages.",
    },
    {
      question: "What programming languages do you support?",
      answer:
        "We provide SDKs for Node.js, Python, PHP, Java, Ruby, and .NET. Our REST API can be used with any programming language that can make HTTP requests.",
    },
    {
      question: "How is pricing calculated?",
      answer:
        "Our pricing is based on the APIs you use and your usage volume. We offer tiered plans to accommodate businesses of all sizes, from startups to enterprises. Custom pricing is available for high-volume users.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes, we offer a 14-day free trial with access to all our APIs with limited usage. This allows you to test our services and see how they fit your business needs before committing to a paid plan.",
    },
    {
      question: "How secure is your platform?",
      answer:
        "Security is our top priority. We use industry-standard encryption for all data in transit and at rest. Our infrastructure is hosted on secure cloud providers with SOC 2 compliance, and we regularly undergo security audits.",
    },
    {
      question: "Do you have usage limits?",
      answer:
        "Each plan has monthly usage limits for different APIs. You can upgrade your plan at any time if you need higher limits. For enterprise customers, we offer custom high-volume solutions with flexible limits.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer different levels of support based on your plan. All customers receive email support, while higher-tier plans include priority support, phone support, and dedicated account managers. Our documentation and knowledge base are comprehensive and available to all users.",
    },
  ]

  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">Everything you need to know about our API platform.</p>
        </div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
