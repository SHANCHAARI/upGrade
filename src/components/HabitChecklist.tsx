import React, { useState, useMemo } from 'react';
import { Habit, HabitCategory } from '../types';
import { getHabitScheduleStatus } from '../core/time';
import { ListGroup } from './ui/ListGroup';
import { ListRow } from './ui/ListRow';
import { SegmentedControl, SegmentOption } from './ui/SegmentedControl';
import { 
  Search, 
  Code2, 
  Heart, 
  Target, 
  BookOpen, 
  Moon, 
  Zap, 
  CheckCircle2,
  Inbox
} from 'lucide-react';

interface HabitChecklistProps {
  habits: Habit[];
  selectedDate: string;
  onToggleHabit: (habitId: string) => void;
  onUpdateNumeric: (habitId: string, newValue: number) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenAddModal: () => void;
}

type StatusFilter = 'all' | 'pending' | 'completed';

export const HabitChecklist: React.FC<HabitChecklistProps> = ({
  habits,
  selectedDate,
  onToggleHabit,
  onUpdateNumeric,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  // Category Helper Info
  const getCategoryMeta = (cat: HabitCategory) => {
    switch (cat) {
      case 'dev':
        return {
          color: 'var(--cat-dev)',
          bg: 'var(--cat-dev-bg)',
          icon: <Code2 className="w-4 h-4" />,
          label: 'Code & Dev',
        };
      case 'health':
        return {
          color: 'var(--cat-health)',
          bg: 'var(--cat-health-bg)',
          icon: <Heart className="w-4 h-4" />,
          label: 'Health & Body',
        };
      case 'focus':
        return {
          color: 'var(--cat-focus)',
          bg: 'var(--cat-focus-bg)',
          icon: <Target className="w-4 h-4" />,
          label: 'Deep Focus',
        };
      case 'growth':
        return {
          color: 'var(--cat-growth)',
          bg: 'var(--cat-growth-bg)',
          icon: <BookOpen className="w-4 h-4" />,
          label: 'Growth',
        };
      case 'mindset':
        return {
          color: 'var(--cat-mindset)',
          bg: 'var(--cat-mindset-bg)',
          icon: <Moon className="w-4 h-4" />,
          label: 'Mindset',
        };
      default:
        return {
          color: 'var(--label-2)',
          bg: 'var(--fill)',
          icon: <Zap className="w-4 h-4" />,
          label: 'Custom',
        };
    }
  };

  // Status counts
  const totalCount = habits.length;
  const completedCount = habits.filter((h) => h.completedDates.includes(selectedDate)).length;
  const pendingCount = totalCount - completedCount;

  // Filter options for Segmented Control
  const statusOptions: SegmentOption<StatusFilter>[] = [
    { value: 'all', label: 'All', badge: totalCount },
    { value: 'pending', label: 'Pending', badge: pendingCount },
    { value: 'completed', label: 'Done', badge: completedCount },
  ];

  // Category options
  const categoryFilters: { id: HabitCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'dev', label: 'Code & Dev' },
    { id: 'health', label: 'Health & Body' },
    { id: 'focus', label: 'Deep Focus' },
    { id: 'growth', label: 'Growth' },
    { id: 'mindset', label: 'Mindset' },
  ];

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const isDone = h.completedDates.includes(selectedDate);

      // Status filter
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'pending' && isDone) return false;

      // Category filter
      if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesDesc = h.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [habits, selectedDate, statusFilter, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Controls Bar: Search, Status Segmented Control, Category Chips */}
      <div className="space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* iOS Style Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--label-3)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rituals..."
              className="w-full h-9 pl-9 pr-4 rounded-[12px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[14px] transition-all focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--label-3)] hover:text-[var(--label)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Segmented Control for Status */}
          <div className="shrink-0 flex justify-end">
            <SegmentedControl
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm"
            />
          </div>

        </div>

        {/* Horizontal Scroll of Category Chips (Neutral fill, selected = inverted --label) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          {categoryFilters.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[var(--label)] text-[var(--label-inverse)] shadow-sm'
                    : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Inset Grouped List of Rituals */}
      {filteredHabits.length > 0 ? (
        <ListGroup>
          {filteredHabits.map((habit, index) => {
            const meta = getCategoryMeta(habit.category);
            const isDone = habit.completedDates.includes(selectedDate);
            const currentValue = habit.numericLogs ? (habit.numericLogs[selectedDate] ?? 0) : 0;
            const { isRestDay } = getHabitScheduleStatus(habit, selectedDate);
            const isRecovered = (habit.recoveredDates || []).includes(selectedDate);
            const isShielded = (habit.shieldedDates || []).includes(selectedDate);
            const isProgressive = habit.type === 'numeric' || habit.type === 'quantity' || habit.type === 'duration';

            return (
              <ListRow
                key={habit.id}
                id={habit.id}
                title={habit.title}
                subtitle={habit.description}
                category={habit.category}
                categoryColor={meta.color}
                categoryBg={meta.bg}
                categoryIcon={meta.icon}
                isCompleted={isDone}
                streak={habit.streak}
                shields={habit.shields || 0}
                isRestDay={isRestDay}
                isRecovered={isRecovered}
                isShielded={isShielded}
                isLast={index === filteredHabits.length - 1}
                onToggle={() => onToggleHabit(habit.id)}
                isNumeric={isProgressive}
                currentValue={currentValue}
                targetValue={habit.targetValue || 1}
                unit={habit.unit || ''}
                onUpdateNumeric={(val) => onUpdateNumeric(habit.id, val)}
              />
            );
          })}
        </ListGroup>
      ) : (
        /* SF-Style Clean Empty State */
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] p-12 text-center shadow-[var(--shadow-card)] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[var(--fill)] text-[var(--label-3)] flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="text-[17px] font-semibold text-[var(--label)] mb-1">
            No rituals found
          </h4>
          <p className="text-[15px] text-[var(--label-2)] max-w-xs mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search query or filters.'
              : 'Add your first daily ritual to start building momentum.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="text-[15px] font-medium text-[var(--accent)] hover:underline"
          >
            Create New Ritual
          </button>
        </div>
      )}

      {/* Section Footer / Completion Summary */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] bg-[var(--fill-secondary)] text-[var(--label-2)] text-[14px]">
          <CheckCircle2 className="w-4 h-4 text-[var(--system-green)]" />
          <span>All rituals complete for today.</span>
        </div>
      )}

    </div>
  );
};
