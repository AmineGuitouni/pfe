import React from 'react';
import { Button } from '@heroui/react';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const t = useTranslations('pricing');

  const getFeatures = (planKey: string): string[] => {
    try {
      const features = t.raw(`plans.${planKey}.features`);
      return Array.isArray(features) ? features : [];
    } catch (error) {
      console.error(`Error loading features for ${planKey}:`, error);
      return [];
    }
  };

  const pricingPlans = [
    {
      key: 'starter',
      name: t('plans.starter.name'),
      price: t('plans.starter.price'),
      frequency: t('plans.starter.frequency'),
      description: t('plans.starter.description'),
      features: getFeatures('starter'),
      cta: t('plans.starter.cta'),
      href: '/register',
      popular: false,
    },
    {
      key: 'professional',
      name: t('plans.professional.name'),
      price: t('plans.professional.price'),
      frequency: t('plans.professional.frequency'),
      description: t('plans.professional.description'),
      features: getFeatures('professional'),
      cta: t('plans.professional.cta'),
      href: '/register',
      popular: true,
    },
    {
      key: 'enterprise',
      name: t('plans.enterprise.name'),
      price: t('plans.enterprise.price'),
      frequency: t('plans.enterprise.frequency'),
      description: t('plans.enterprise.description'),
      features: getFeatures('enterprise'),
      cta: t('plans.enterprise.cta'),
      href: '/contact-us',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-dark_blue text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4 bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent pb-4">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.key}
              className={`bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col ${plan.popular ? 'border-light_blue-500 border-2 relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 mr-4 -mt-3 bg-light_blue-500 text-dark_blue text-xs font-semibold px-3 py-1 rounded-full">
                  {t('mostPopular')}
                </div>
              )}
              <h2 className="text-2xl font-semibold text-white mb-2">{plan.name}</h2>
              <p className="text-white/70 mb-6 h-10">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.frequency && (
                  <span className="text-lg text-white/70 ml-1">{plan.frequency}</span>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <FaCheckCircle className="text-light_blue-500 mr-3 flex-shrink-0" />
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center">
                    <FaCheckCircle className="text-light_blue-500 mr-3 flex-shrink-0" />
                    <span className="text-white/90">No features available</span>
                  </li>
                )}
              </ul>

              <Button
                as={Link}
                href={plan.href}
                className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-light_blue-500 text-dark_blue hover:bg-light_blue'
                    : 'bg-white/10 text-light_blue-500 hover:bg-white/20 border border-light_blue-500/50'
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}