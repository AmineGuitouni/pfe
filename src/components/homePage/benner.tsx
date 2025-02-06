"use client"
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import React, { useState, useEffect, useCallback } from 'react';
import { Button, cn } from "@heroui/react";
import { motion } from "framer-motion";

const SLIDE_DURATION = 5000;

const slides = [
  {
    title: "Who We Are",
    content: "We are a team of innovators dedicated to transforming the way businesses operate. Our AI-powered platform streamlines workflow, enhances productivity, and adapts to your team's unique needs."
  },
  {
    title: "Our Mission",
    content: "To revolutionize workspaces by integrating smart automation, intelligent analytics, and seamless collaboration tools—empowering teams to achieve more with less effort."
  }
];

const slideVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = useCallback((index : number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Reset timer whenever currentSlide changes
  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [currentSlide, nextSlide]);

  return (
    <div className="w-full text-white h-full my-8">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="relative">
          {/* Content */}
          <div className="items-center text-center relative z-10">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                variants={slideVariants}
                initial={index === 0 ? "visible" : "hidden"}
                animate={index === currentSlide ? "visible" : "hidden"}
                transition={{ duration: 0.3 }}
                className="overflow-hidden flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
              >
                <div className={cn(
                  "text-4xl sm:text-6xl font-semibold h-[70px] text-center",
                  "bg-gradient-to-r from-light_blue via-light_blue-500 to-white",
                  "bg-clip-text text-transparent mb-5"
                )}>
                  {slide.title}
                </div>
                <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
                  {slide.content}
                </p>
                <div className="flex space-x-3 mb-8">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        idx === currentSlide ? "bg-white scale-125" : "bg-white/50"
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="absolute left-0 z-20 right-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4">
            <Button
              onPress={prevSlide}
              isIconOnly
              className="p-2 rounded-full bg-white/10 text-white transition-colors duration-300 border-1 border-white/20"
              aria-label="Previous slide"
            >
              <IoChevronBack />
            </Button>
            <Button
              onPress={nextSlide}
              isIconOnly
              className="p-2 rounded-full bg-white/10 text-white transition-colors duration-300 border-1 border-white/20"
              aria-label="Next slide"
            >
              <IoChevronForward />
            </Button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute z-10 top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-32 h-32 blur-3xl bg-light_blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 blur-3xl bg-light_blue-500/10 rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;