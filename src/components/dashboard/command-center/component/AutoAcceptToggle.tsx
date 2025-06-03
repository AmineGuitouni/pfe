"use client";

import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { useCommandCenterContext } from '../context/CommandCenterContext';

export default function AutoAcceptToggle() {
    const { isAutoAcceptEnabled, toggleAutoAccept } = useCommandCenterContext();

    return (
        <button
            onClick={toggleAutoAccept}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                isAutoAcceptEnabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-light_blue-500/10 text-light_blue hover:bg-light_blue-500/20'
            }`}
            title={`Auto Accept Tool Calls: ${isAutoAcceptEnabled ? 'ON' : 'OFF'}`}
        >
            {isAutoAcceptEnabled ? (
                <>
                    <Zap size={16} />
                    Auto Accept ON
                </>
            ) : (
                <>
                    <ZapOff size={16} />
                    Auto Accept OFF
                </>
            )}
        </button>
    );
}