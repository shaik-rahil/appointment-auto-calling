/**
 * Real-time dynamic date utilities & natural language spoken date normalizer
 * Supports relative days (Wednesday, tomorrow, today, etc.) and formats for MedPulse AI
 */

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr?: string): string {
  const target = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  return target.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }); // e.g. "24 Nov 2026"
}

export function formatFullDateHeader(dateStr?: string): string {
  const target = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  return target.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getRelativeDateLabel(dateStr: string): string {
  const today = getTodayDateStr();
  if (dateStr === today) {
    return `Today's Appointments – ${formatDisplayDate(dateStr)}`;
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (dateStr === tomorrowStr) {
    return `Tomorrow's Appointments – ${formatDisplayDate(dateStr)}`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (dateStr === yesterdayStr) {
    return `Yesterday's Appointments – ${formatDisplayDate(dateStr)}`;
  }

  return `Appointments – ${formatDisplayDate(dateStr)}`;
}

export function getQuickDates(centerDateStr: string = getTodayDateStr()) {
  const base = new Date(centerDateStr + 'T00:00:00');
  const offsets = [-1, 0, 1, 2];
  const todayStr = getTodayDateStr();

  return offsets.map((offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const shortLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const label = isToday ? `Today: ${shortLabel}` : shortLabel;
    return { dateStr, label, isToday };
  });
}

/**
 * Normalizes spoken day names (e.g. "Wednesday", "tomorrow", "next Monday") into YYYY-MM-DD
 * This solves AI voice agents failing SQL DATE syntax errors
 */
export function parseSpokenDate(inputDate?: string): string {
  if (!inputDate) return getTodayDateStr();
  const raw = String(inputDate).trim().toLowerCase();

  // If already valid YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const now = new Date();

  // Relative Today / Tomorrow
  if (raw === 'today' || raw.includes('today') || raw.includes('eeroju') || raw.includes('ఈరోజు')) {
    return getTodayDateStr();
  }

  if (raw === 'tomorrow' || raw.includes('tomorrow') || raw.includes('repu') || raw.includes('రేపు')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Weekday Names matching (e.g. "Wednesday", "Monday")
  const daysMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (const [dayName, dayIndex] of Object.entries(daysMap)) {
    if (raw.includes(dayName)) {
      const currentDay = now.getDay();
      let diff = dayIndex - currentDay;
      if (diff <= 0) diff += 7; // Next upcoming occurrence
      const target = new Date(now);
      target.setDate(now.getDate() + diff);
      const year = target.getFullYear();
      const month = String(target.getMonth() + 1).padStart(2, '0');
      const day = String(target.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Attempt JS standard parse
  try {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2020) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}

  return getTodayDateStr();
}

/**
 * Normalizes spoken time (e.g. "morning", "10am", "2:30pm") into "HH:MM AM/PM"
 */
export function parseSpokenTime(inputTime?: string): string {
  if (!inputTime) return '10:00 AM';
  const raw = String(inputTime).trim().toLowerCase();

  if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(raw)) {
    return raw.toUpperCase();
  }
  if (raw.includes('morning') || raw.includes('ఉదయం')) return '10:00 AM';
  if (raw.includes('afternoon') || raw.includes('మధ్యాహ్నం')) return '02:00 PM';
  if (raw.includes('evening') || raw.includes('సాయంత్రం')) return '05:00 PM';

  const match = raw.match(/(\d{1,2})/);
  if (match) {
    const num = parseInt(match[1], 10);
    const isPm = raw.includes('pm') || (num >= 1 && num <= 6);
    return `${String(num).padStart(2, '0')}:00 ${isPm ? 'PM' : 'AM'}`;
  }

  return '10:00 AM';
}
