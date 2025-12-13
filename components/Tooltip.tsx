
import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div 
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}>
          {content}
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-zinc-900 border-zinc-700 transform rotate-45 ${
            position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
            position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
            'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
