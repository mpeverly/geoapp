import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface NavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tab: any) => void;
  className?: string;
}

export default function Navigation({ items, activeTab, onTabChange, className = '' }: NavigationProps) {
  return (
    <nav className={`bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex space-x-8">
          {items.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === id
                  ? `border-green-500 ${color}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Mobile Navigation - Scrollable */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex space-x-3 min-w-max">
              {items.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? `bg-green-500 text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
