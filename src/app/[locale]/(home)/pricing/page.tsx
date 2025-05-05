import React from 'react';
import { Button } from '@heroui/react'; // Assuming Button component is available
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Starter',
    price: '$10',
    frequency: '/month',
    description: 'Ideal for small teams getting started.',
    features: [
      'Up to 5 Users',
      'Basic Project & Task Management',
      '1 GB File Storage',
      'Basic AI Search',
      'Community Support',
    ],
    cta: 'Get Started',
    href: '/register', // Link to registration
    popular: false,
  },
  {
    name: 'Professional',
    price: '$20',
    frequency: '/user/month',
    description: 'For growing businesses needing core AI features.',
    features: [
      'Up to 50 Users',
      'Full Project & Task Management',
      'AI CV Analysis & Task Suggestions',
      '10 GB File Storage per User',
      'Semantic File Search',
      'Analytics Dashboards',
      'Group Management (RBAC)',
      'Priority Email Support',
    ],
    cta: 'Choose Plan',
    href: '/register', // Link to registration
    popular: true, // Highlight this plan
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    frequency: '',
    description: 'For large organizations with advanced needs.',
    features: [
      'Unlimited Users',
      'Advanced AI Workflow Automation',
      'Full Audit Logs',
      'Tenant Database Management',
      'Customizable Storage',
      'Dedicated Account Manager',
      'Premium Support & SLA',
      'API Access (Optional)',
    ],
    cta: 'Contact Sales',
    href: '/contact-us', // Link to a contact page (assuming it exists or will exist)
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-dark_blue text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4 bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent pb-4">
            Pricing Plans
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Choose the plan that best fits your company&amp;apos;s needs. Scale up as you grow.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col ${plan.popular ? 'border-light_blue-500 border-2 relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 mr-4 -mt-3 bg-light_blue-500 text-dark_blue text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
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
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <FaCheckCircle className="text-light_blue-500 mr-3 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
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