import React from 'react';
import { FaBuilding, FaUsers } from 'react-icons/fa'; // Example icons
import { useTranslations } from 'next-intl';

export default function WhoIsItFor() {
    const t = useTranslations('homepage.whoIsItFor');
    
    return (
        <section className="w-full flex flex-col items-center max-w-[1920px] sm:px-[20px] lg:px-[100px] gap-10 mb-28 z-10">
            <h2 className="text-4xl sm:text-5xl font-semibold text-center bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent mb-8">
                {t('title')}
            </h2>
            <p className="text-white/70 sm:text-lg text-medium w-[70%] sm:w-[60%] text-center mb-12">
                {t('description')}
            </p>
            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-8">
                {/* Company Owner Card */}
                <div className="bg-white/10 border-white/20 border-1 rounded-md p-6 w-full lg:w-1/2 flex flex-col gap-4 items-center text-center">
                    <FaBuilding className="text-4xl text-light_blue-500 mb-3" />
                    <h3 className="text-2xl font-semibold text-white">{t('companyOwners.title')}</h3>
                    <p className="text-white/70">
                        {t('companyOwners.description')}
                    </p>
                </div>

                {/* Employee Card */}
                <div className="bg-white/10 border-white/20 border-1 rounded-md p-6 w-full lg:w-1/2 flex flex-col gap-4 items-center text-center">
                    <FaUsers className="text-4xl text-light_blue-500 mb-3" />
                    <h3 className="text-2xl font-semibold text-white">{t('employees.title')}</h3>
                    <p className="text-white/70">
                        {t('employees.description')}
                    </p>
                </div>
            </div>
        </section>
    );
}