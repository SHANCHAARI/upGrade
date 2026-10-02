import React from 'react';
import { ViewTab } from '../../types';
import { CheckCircle2, Calendar, TrendingUp, Clock, Plus } from 'lucide-react';

interface TabBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'dashboard' as ViewTab, label: 'Today', icon: CheckCircle2 },
    { id: 'heatmap' as ViewTab, label: 'Year', icon: Calendar },
    { id: 'new' as const, label: 'Add', icon: Plus, isAction: true },
    { id: 'analytics' as ViewTab, label: 'Trends', icon: TrendingUp },
    { id: 'focus' as ViewTab, label: 'Focus', icon: Clock },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--separator)] select-none pb-[env(safe-area-inset-bottom)]"
      style={{
        backgroundColor: 'var(--tab-bg)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="h-[49px] flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if ('isAction' in tab && tab.isAction) {
            return (
              <button
                key="action-add"
                type="button"
                onClick={onOpenAddModal}
                className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--accent)] active:scale-90 transition"
                aria-label="Add new ritual"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            );
          }

          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as ViewTab)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[var(--accent)] font-medium' : 'text-[var(--label-3)] hover:text-[var(--label-2)]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
