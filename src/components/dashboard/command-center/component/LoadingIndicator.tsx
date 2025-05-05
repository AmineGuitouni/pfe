import React from 'react';
import { Loader } from 'lucide-react'; // Using lucide loader icon

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-start p-4 space-x-2 bg-dark_blue/80">
       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20 flex items-center justify-center">
          <Loader size={20} className="text-light_blue animate-spin" />
        </div>
      <div className="px-4 py-2 rounded-lg shadow bg-modal_bg text-white rounded-bl-none max-w-xs">
        {/* Updated text */}
        <p className="text-sm italic">Processing...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;