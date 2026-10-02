import React, { useState } from 'react';
import { Habit, HabitCategory, HabitType, HabitSchedule, TimeOfDay } from '../types';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import { SegmentedControl } from './ui/SegmentedControl';
import { Shield } from 'lucide-react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('dev');
  const [type, setType] = useState<HabitType>('boolean');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekdays' | 'weekly_target' | 'specific_days'>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState<number>(3);
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [restDays, setRestDays] = useState<number[]>([]);
  const [identity, setIdentity] = useState('');

  const categories: { id: HabitCategory; label: string }[] = [
    { id: 'dev', label: 'Code & Dev' },
    { id: 'health', label: 'Health & Body' },
    { id: 'focus', label: 'Deep Focus' },
    { id: 'growth', label: 'Growth' },
    { id: 'mindset', label: 'Mindset' },
  ];

  const timesOfDay: { id: TimeOfDay; label: string }[] = [
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
    { id: 'anytime', label: 'Anytime' },
  ];

  const toggleRestDay = (day: number) => {
    setRestDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSpecificDay = (day: number) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let schedule: HabitSchedule = { type: 'daily' };
    if (scheduleType === 'weekdays') {
      schedule = { type: 'weekdays' };
    } else if (scheduleType === 'weekly_target') {
      schedule = { type: 'weekly_target', targetDaysPerWeek };
    } else if (scheduleType === 'specific_days') {
      schedule = { type: 'specific_days', days: specificDays };
    }

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      type,
      targetValue: type === 'boolean' ? undefined : Number(targetValue) || 1,
      unit: type === 'quantity' ? (unit.trim() || 'units') : type === 'duration' ? 'hrs' : type === 'timer' ? 'mins' : undefined,
      icon: 'check',
      color: category === 'dev' ? 'purple' : category === 'health' ? 'amber' : category === 'focus' ? 'green' : 'emerald',
      timeOfDay,
      createdAt: new Date().toISOString().split('T')[0],
      schedule,
      restDays,
      streak: 0,
      bestStreak: 0,
      shields: 0,
      completedDates: [],
      numericLogs: {},
      durationLogs: {},
      identity: identity.trim() || undefined,
    };

    onAddHabit(newHabit);
    setTitle('');
    setDescription('');
    setCategory('dev');
    setType('boolean');
    setTargetValue(1);
    setUnit('');
    setTimeOfDay('morning');
    setScheduleType('daily');
    setRestDays([]);
    setIdentity('');
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="New Ritual"
      subtitle="Establish a new compounding habit with schedule and forgiveness"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Ritual Name
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep Work / System Architecture"
            className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
          />
        </div>

        {/* Identity Statement (Apple Journal style) */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Identity Statement (Who are you becoming?)
          </label>
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="e.g. I am someone who ships quality code daily"
            className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
          />
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((c) => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`h-9 px-3 rounded-[10px] text-[13px] font-medium transition text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--label)] text-[var(--label-inverse)]'
                      : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                  }`}
                >
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Habit Type */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Habit Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'boolean', label: 'Yes / No' },
              { id: 'quantity', label: 'Quantity' },
              { id: 'duration', label: 'Duration (hr)' },
              { id: 'timer', label: 'Timer' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as HabitType)}
                className={`h-9 px-2.5 rounded-[10px] text-[13px] font-medium transition text-center ${
                  type === t.id
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-sm'
                    : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type specific targets */}
        {type === 'quantity' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
                Target Quantity
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition tnum"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pages, L, reps"
                className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
              />
            </div>
          </div>
        )}

        {type === 'duration' && (
          <div className="pt-1">
            <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
              Target Duration (Hours)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition tnum"
            />
          </div>
        )}

        {/* Schedule */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Schedule
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekdays', label: 'Weekdays' },
              { id: 'weekly_target', label: 'Target / Wk' },
              { id: 'specific_days', label: 'Custom Days' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScheduleType(s.id as any)}
                className={`h-9 px-2 rounded-[10px] text-[13px] font-medium transition text-center ${
                  scheduleType === s.id
                    ? 'bg-[var(--label)] text-[var(--label-inverse)]'
                    : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {scheduleType === 'specific_days' && (
            <div className="flex gap-1.5 pt-1">
              {DAYS_OF_WEEK.map((d) => {
                const active = specificDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleSpecificDay(d.day)}
                    className={`flex-1 h-9 rounded-[8px] text-[12px] font-medium transition ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--on-accent)] font-semibold'
                        : 'bg-[var(--fill)] text-[var(--label-2)]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}

          {scheduleType === 'weekly_target' && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[13px] text-[var(--label-2)]">Target days per week:</span>
              <div className="flex gap-1">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTargetDaysPerWeek(n)}
                    className={`w-8 h-8 rounded-[8px] text-[13px] font-medium transition ${
                      targetDaysPerWeek === n
                        ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                        : 'bg-[var(--fill)] text-[var(--label)]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scheduled Rest Days (Never count against streak) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-[var(--label-2)]">
              Scheduled Rest Days (Never break streak)
            </label>
            <span className="text-[11px] text-[var(--label-3)] flex items-center gap-1">
              <Shield className="w-3 h-3 text-[var(--system-green)]" />
              Exempt from streak
            </span>
          </div>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((d) => {
              const isRest = restDays.includes(d.day);
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleRestDay(d.day)}
                  className={`flex-1 h-9 rounded-[8px] text-[12px] font-medium transition ${
                    isRest
                      ? 'bg-[var(--system-green)]/15 border border-[var(--system-green)]/30 text-[var(--system-green)] font-semibold'
                      : 'bg-[var(--fill)] text-[var(--label-3)] hover:text-[var(--label)]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
            Preferred Time
          </label>
          <div className="grid grid-cols-4 gap-2">
            {timesOfDay.map((t) => {
              const isSelected = timeOfDay === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeOfDay(t.id)}
                  className={`h-9 px-2 rounded-[10px] text-[13px] font-medium transition text-center ${
                    isSelected
                      ? 'bg-[var(--label)] text-[var(--label-inverse)]'
                      : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--separator)]">
          <Button type="button" variant="plain" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="filled">
            Add Ritual
          </Button>
        </div>

      </form>
    </Sheet>
  );
};
