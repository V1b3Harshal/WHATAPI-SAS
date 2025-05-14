"use client"

import { motion } from "framer-motion"

export function TrustedBy() {
  const logos = [
    { name: "Company 1", logo: "/icons8-confluence.svg?height=40&width=120" },
    { name: "Company 2", logo: "/icons8-fujitsu.svg?height=40&width=120" },
    { name: "Company 3", logo: "/icons8-staad-pro.svg?height=40&width=120" },
    { name: "Company 4", logo: "/icons8-nvstec.svg?height=40&width=120" }
  ]

  return (
    <section className="py-12 border-y border-muted/60">
      <div className="container-custom">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-muted-foreground">TRUSTED BY INNOVATIVE COMPANIES</p>
        </div>
        <motion.div
          className="flex flex-wrap justify-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <img src={logo.logo || "/placeholder.svg"} alt={logo.name} className="h-8 md:h-10" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
