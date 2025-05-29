"use client";

import React, { useState } from 'react';
import { Button, Input, Textarea } from '@heroui/react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

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
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">{t('form.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-light_blue mb-1">
            {t('form.fields.name.label')}
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
            placeholder={t('form.fields.name.placeholder')}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-light_blue mb-1">
            {t('form.fields.email.label')}
          </label>
          <Input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
            placeholder={t('form.fields.email.placeholder')}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-light_blue mb-1">
            {t('form.fields.message.label')}
          </label>
          <Textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border-white/20 rounded-md p-3 text-white focus:border-light_blue-500 focus:ring-light_blue-500"
            placeholder={t('form.fields.message.placeholder')}
          />
        </div>
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-light_blue-500 text-dark_blue py-3 px-6 rounded-lg text-lg font-semibold hover:bg-light_blue transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('form.submit.sending') : t('form.submit.default')}
          </Button>
        </div>
        {submitStatus === 'success' && (
          <p className="text-green-400 text-center">{t('form.messages.success')}</p>
        )}
        {submitStatus === 'error' && (
          <p className="text-red-400 text-center">{t('form.messages.error')}</p>
        )}
      </form>
    </div>
  );
}