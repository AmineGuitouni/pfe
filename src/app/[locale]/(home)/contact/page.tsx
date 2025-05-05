"use client"; // Required for form handling state

import React, { useState } from 'react';
import { Button, Input, Textarea } from '@heroui/react'; // Assuming these components are available
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null); // 'success', 'error', or null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission (replace with actual API call later)
    console.log('Form Data:', formData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Reset form and show success message (simulation)
    setSubmitStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);

    // Hide success message after a few seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  };


  return (
    <div className="min-h-screen bg-dark_blue text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4 bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Get in touch with DigiGrowing. We&amp;apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">DigiGrowing</h2>
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-light_blue-500 mt-1 flex-shrink-0" size={20} />
              <p className="text-white/90">
                B N°12 Business Incubator Mahdia Entreprendre,<br />
                Mahdia, Tunisia, 5111
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <FaPhone className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href="tel:+21621897583" className="text-white/90 hover:text-light_blue-500 transition-colors">
                +216 21 897 583
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href="mailto:ceo.digigrowing@gmail.com" className="text-white/90 hover:text-light_blue-500 transition-colors">
                ceo.digigrowing@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <FaGlobe className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href="https://www.fb.com/digigrowing.company" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-light_blue-500 transition-colors">
                www.fb.com/digigrowing.company
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light_blue mb-1">Name</label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light_blue mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-light_blue mb-1">Message</label>
                <Textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-light_blue-500 text-dark_blue py-3 px-6 rounded-lg text-lg font-semibold hover:bg-light_blue transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
              {submitStatus === 'success' && (
                <p className="text-green-400 text-center">Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-400 text-center">Please fill out all fields.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}