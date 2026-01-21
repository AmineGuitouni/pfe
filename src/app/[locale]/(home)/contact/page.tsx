import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import ContactForm from '@/features/contact/ContactForm';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-dark_blue text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4 bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">{t('company.name')}</h2>
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-light_blue-500 mt-1 flex-shrink-0" size={20} />
              <p className="text-white/90 whitespace-pre-line">
                {t('company.address')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <FaPhone className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href={`tel:${t('company.phone')}`} className="text-white/90 hover:text-light_blue-500 transition-colors">
                {t('company.phone')}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href={`mailto:${t('company.email')}`} className="text-white/90 hover:text-light_blue-500 transition-colors">
                {t('company.email')}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <FaGlobe className="text-light_blue-500 flex-shrink-0" size={20} />
              <a href={`https://${t('company.website')}`} target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-light_blue-500 transition-colors">
                {t('company.website')}
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}