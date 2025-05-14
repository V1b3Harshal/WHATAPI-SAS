"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none" />
      <motion.div
        className="absolute -z-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 10,
          ease: "easeInOut",
        }}
        style={{ top: "20%", left: "10%" }}
      />
      <motion.div
        className="absolute -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 12,
          ease: "easeInOut",
        }}
        style={{ bottom: "20%", right: "10%" }}
      />

      <div className="container-custom relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-xl">
              Ready to Transform Your <span className="gradient-text">Business Communication?</span>
            </h2>
            <p className="body-lg max-w-2xl mx-auto">
              Join thousands of businesses that use our API platform to engage with their customers effectively.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Start with a 14-day free trial.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
