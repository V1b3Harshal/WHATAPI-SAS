"use client"

import { motion } from "framer-motion"
import { MessageSquare, Zap, Lock, Globe, BarChart, Code } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: "Messaging APIs",
      description: "Connect with customers via WhatsApp, SMS, and other messaging platforms with a unified API.",
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Process thousands of requests per second with our globally distributed infrastructure.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "End-to-end encryption and compliance with global data protection regulations.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with users in over 180 countries with localized messaging and payment options.",
    },
    {
      icon: BarChart,
      title: "Advanced Analytics",
      description: "Track usage, performance, and engagement metrics in real-time with detailed dashboards.",
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Comprehensive documentation, SDKs for all major languages, and responsive support.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="heading-xl">
            Powerful Features for <span className="gradient-text">Modern Businesses</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">
            Our API platform provides everything you need to connect with your customers effectively.
          </p>
        </div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm"
              variants={itemVariants}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="heading-md mb-2">{feature.title}</h3>
              <p className="body-md">{feature.description}</p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-violet-600 transition-all duration-300 group-hover:w-full"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
