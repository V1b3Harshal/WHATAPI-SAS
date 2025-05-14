"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director, TechCorp",
      content:
        "ConnectAPI has transformed how we communicate with our customers. The API is reliable and the integration was seamless. Our customer engagement has increased by 40% since we started using their service.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CTO, E-commerce Solutions",
      content:
        "As a tech company, we needed a robust API solution that could handle our scale. ConnectAPI delivers exceptional performance and their documentation made integration a breeze. Highly recommended!",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Jessica Williams",
      role: "Customer Success Manager, RetailGiant",
      content:
        "The ability to send order confirmations and shipping updates via multiple channels has significantly improved our customer experience. ConnectAPI's platform is reliable and their support team is always responsive.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4,
    },
    {
      name: "David Rodriguez",
      role: "Product Manager, FinTech Innovations",
      content:
        "We've tried several API providers, but ConnectAPI stands out with their reliability and ease of use. Their template approval process is also much faster than competitors.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const handlePrev = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-xl">
            What Our <span className="gradient-text">Customers Say</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">Trusted by businesses of all sizes around the world.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="testimonial-card w-full flex-shrink-0 px-4"
                >
                  <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-lg italic">"{testimonial.content}"</blockquote>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  onClick={() => {
                    setAutoplay(false)
                    setActiveIndex(index)
                  }}
                >
                  <span className="sr-only">Testimonial {index + 1}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
