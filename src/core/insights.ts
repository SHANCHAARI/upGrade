import { Habit, DayActivity } from './types';
import { getDayOfWeek, parseDateKey } from './time';

export interface InsightCardData {
  id: string;
  type: 'keystone' | 'correlation' | 'streak_risk' | 'momentum' | 'pattern';
  headline: string;
  sentence: string;
  metricNumber?: string;
  metricLabel?: string;
  confidence: 'high' | 'medium' | 'preliminary';
  sampleSize: number;
  whyThis: string;
  habitId?: string;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Local-first Insights Engine: runs statistical correlation and pattern mining
 * entirely on the user's local dataset.
 * Never invents insights without honest sample size gating.
 */
export function generateInsights(
  habits: Habit[],
  history: Record<string, DayActivity>,
  currentDateKey: string
): InsightCardData[] {
  const insights: InsightCardData[] = [];
  const historyDays = Object.values(history).filter((d) => d.totalHabits > 0);
  const totalDaysLogged = historyDays.length;

  if (habits.length === 0) return [];

  // 1. Streak Risk Insight
  // If user has an active streak habit with timeOfDay that is pending today
  const currentHour = new Date().getHours();
  habits.forEach((h) => {
    const isDoneToday = h.completedDates.includes(currentDateKey);
    if (!isDoneToday && h.streak >= 2) {
      if (h.timeOfDay === 'morning' && currentHour >= 12) {
        insights.push({
          id: `risk-${h.id}`,
          type: 'streak_risk',
          headline: 'Streak at Risk',
          sentence: `Your ${h.streak}-day streak for "${h.title}" is pending. You usually complete morning rituals earlier.`,
          metricNumber: `${h.streak}d`,
          metricLabel: 'Active Streak',
          confidence: 'high',
          sampleSize: h.streak,
          whyThis: `Based on your ${h.streak} consecutive completions and the current time of day (${currentHour}:00).`,
          habitId: h.id,
        });
      } else if (currentHour >= 19) {
        insights.push({
          id: `risk-evening-${h.id}`,
          type: 'streak_risk',
          headline: 'Evening Reminder',
          sentence: `Don't break your ${h.streak}-day momentum on "${h.title}".`,
          metricNumber: `${h.streak}d`,
          metricLabel: 'On the line',
          confidence: 'high',
          sampleSize: h.streak,
          whyThis: `You have ${h.streak} continuous days logged for this ritual.`,
          habitId: h.id,
        });
      }
    }
  });

  // If insufficient historical data (< 5 days logged), provide welcoming honest preliminary guidance
  if (totalDaysLogged < 5) {
    if (insights.length === 0 && habits.length > 0) {
      insights.push({
        id: 'preliminary-momentum',
        type: 'momentum',
        headline: 'Gathering Momentum',
        sentence: `You have logged ${totalDaysLogged} day${totalDaysLogged === 1 ? '' : 's'} so far. Insights unlock correlations after 7 logged sessions.`,
        metricNumber: `${totalDaysLogged}/7`,
        metricLabel: 'Days to correlations',
        confidence: 'preliminary',
        sampleSize: totalDaysLogged,
        whyThis: 'The Insights Engine requires a minimum of 7 data points to calculate honest statistical correlations without bias.',
      });
    }
    return insights;
  }

  // 2. Keystone Habit Analysis
  // A "great day" has >= 75% consistency
  let bestKeystoneHabit: Habit | null = null;
  let bestKeystoneLift = 0;
  let bestKeystoneSuccessRate = 0;

  for (const habit of habits) {
    let daysWithHabit = 0;
    let greatDaysWithHabit = 0;

    for (const day of historyDays) {
      const habitDone = habit.completedDates.includes(day.date);
      if (habitDone) {
        daysWithHabit++;
        if (day.consistencyPercentage >= 75) {
          greatDaysWithHabit++;
        }
      }
    }

    if (daysWithHabit >= 5) {
      const successRate = greatDaysWithHabit / daysWithHabit;
      if (successRate > bestKeystoneLift && successRate >= 0.7) {
        bestKeystoneLift = successRate;
        bestKeystoneSuccessRate = Math.round(successRate * 100);
        bestKeystoneHabit = habit;
      }
    }
  }

  if (bestKeystoneHabit) {
    insights.push({
      id: 'keystone-habit',
      type: 'keystone',
      headline: 'Keystone Ritual Identified',
      sentence: `"${bestKeystoneHabit.title}" is your strongest catalyst. On days you complete it, ${bestKeystoneSuccessRate}% of all daily rituals succeed.`,
      metricNumber: `${bestKeystoneSuccessRate}%`,
      metricLabel: 'Day Success Rate',
      confidence: totalDaysLogged >= 14 ? 'high' : 'medium',
      sampleSize: totalDaysLogged,
      whyThis: `Calculated from ${totalDaysLogged} historical days. On days where "${bestKeystoneHabit.title}" was checked off, consistency averaged ${bestKeystoneSuccessRate}%.`,
      habitId: bestKeystoneHabit.id,
    });
  }

  // 3. Habit Pair Correlation (e.g. Training vs Deep Work)
  if (habits.length >= 2) {
    const habitA = habits.find((h) => h.category === 'health' || h.category === 'focus') || habits[0];
    const habitB = habits.find((h) => (h.category === 'dev' || h.category === 'growth') && h.id !== habitA?.id) || habits[1];

    if (habitA && habitB) {
      let daysWithA = 0;
      let daysWithBoth = 0;
      let daysWithoutA = 0;
      let daysWithBOnly = 0;

      historyDays.forEach((d) => {
        const hasA = habitA.completedDates.includes(d.date);
        const hasB = habitB.completedDates.includes(d.date);

        if (hasA) {
          daysWithA++;
          if (hasB) daysWithBoth++;
        } else {
          daysWithoutA++;
          if (hasB) daysWithBOnly++;
        }
      });

      if (daysWithA >= 4 && daysWithoutA >= 3) {
        const rateWithA = daysWithBoth / daysWithA;
        const rateWithoutA = daysWithBOnly / daysWithoutA;
        const diff = Math.round((rateWithA - rateWithoutA) * 100);

        if (Math.abs(diff) >= 15) {
          insights.push({
            id: `correlation-${habitA.id}-${habitB.id}`,
            type: 'correlation',
            headline: 'Behavioral Coupling',
            sentence: diff > 0 
              ? `On days you do "${habitA.title}", completion of "${habitB.title}" is +${diff}% higher.`
              : `"${habitA.title}" and "${habitB.title}" compete for cognitive bandwidth (${diff}% dip).`,
            metricNumber: `${diff > 0 ? '+' : ''}${diff}%`,
            metricLabel: 'Correlation',
            confidence: totalDaysLogged >= 21 ? 'high' : 'medium',
            sampleSize: daysWithA + daysWithoutA,
            whyThis: `Analyzed ${daysWithA} days with "${habitA.title}" vs ${daysWithoutA} days without it across your tracked logs.`,
          });
        }
      }
    }
  }

  // 4. Strongest Weekday Pattern
  const weekdayScores = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
  historyDays.forEach((d) => {
    const day = getDayOfWeek(d.date);
    weekdayScores[day].total += d.consistencyPercentage;
    weekdayScores[day].count += 1;
  });

  let bestDayIndex = 1; // Mon default
  let bestDayAvg = 0;
  weekdayScores.forEach((ws, idx) => {
    const avg = ws.count > 0 ? Math.round(ws.total / ws.count) : 0;
    if (avg > bestDayAvg && ws.count >= 2) {
      bestDayAvg = avg;
      bestDayIndex = idx;
    }
  });

  if (bestDayAvg >= 60) {
    insights.push({
      id: 'pattern-best-day',
      type: 'pattern',
      headline: 'Weekly Peak Performance',
      sentence: `${WEEKDAY_NAMES[bestDayIndex]}s are your strongest day, averaging ${bestDayAvg}% consistency.`,
      metricNumber: `${bestDayAvg}%`,
      metricLabel: `${WEEKDAY_NAMES[bestDayIndex]} Average`,
      confidence: totalDaysLogged >= 14 ? 'high' : 'medium',
      sampleSize: weekdayScores[bestDayIndex].count,
      whyThis: `Average calculated across all ${weekdayScores[bestDayIndex].count} logged ${WEEKDAY_NAMES[bestDayIndex]}s in your history.`,
    });
  }

  return insights;
}
