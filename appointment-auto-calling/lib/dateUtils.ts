/**
 * Real-time dynamic date utilities & natural language spoken date normalizer
 * Supports relative days (Wednesday, tomorrow, today, etc.) and formats for MedPulse AI in Asia/Kolkata (IST)
 */

export function getTodayDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function formatDisplayDate(dateStr?: string): string {
  const target = dateStr ? new Date(dateStr + 'T00:00:00+05:30') : new Date();
  return target.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }); // e.g. "25 Nov 2026"
}

export function formatFullDateHeader(dateStr?: string): string {
  const target = dateStr ? new Date(dateStr + 'T00:00:00+05:30') : new Date();
  return target.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatKolkataTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatKolkataDate(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export function getSlotIso(dateStr: string, timeStr: string): { startIso: string; endIso: string } {
  const cleanT = parseSpokenTime(timeStr);
  const parts = cleanT.trim().split(/\s+/);
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || '0', 10);
  const modifier = parts[1]?.toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  const start = new Date(`${dateStr}T${hh}:${mm}:00+05:30`);
  const end = new Date(start.getTime() + 20 * 60 * 1000);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function getRelativeDateLabel(dateStr: string): string {
  const today = getTodayDateStr();
  if (dateStr === today) {
    return `Today's Appointments – ${formatDisplayDate(dateStr)}`;
  }

  const base = new Date(today + 'T00:00:00+05:30');
  
  const tomorrow = new Date(base.getTime() + 86400000);
  const tomorrowStr = formatKolkataDate(tomorrow);
  if (dateStr === tomorrowStr) {
    return `Tomorrow's Appointments – ${formatDisplayDate(dateStr)}`;
  }

  const yesterday = new Date(base.getTime() - 86400000);
  const yesterdayStr = formatKolkataDate(yesterday);
  if (dateStr === yesterdayStr) {
    return `Yesterday's Appointments – ${formatDisplayDate(dateStr)}`;
  }

  return `Appointments – ${formatDisplayDate(dateStr)}`;
}

export function getQuickDates(centerDateStr: string = getTodayDateStr()) {
  const base = new Date(centerDateStr + 'T00:00:00+05:30');
  const offsets = [-1, 0, 1, 2];
  const todayStr = getTodayDateStr();

  return offsets.map((offset) => {
    const d = new Date(base.getTime() + offset * 86400000);
    const dateStr = formatKolkataDate(d);
    const isToday = dateStr === todayStr;
    const shortLabel = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    const label = isToday ? `Today: ${shortLabel}` : shortLabel;
    return { dateStr, label, isToday };
  });
}

/**
 * Normalizes spoken day names (e.g. "Wednesday", "tomorrow", "next Monday") into YYYY-MM-DD
 * Dynamic, continuous, and tracks live calendar in Asia/Kolkata time.
 */
export function parseSpokenDate(inputDate?: string): string {
  if (!inputDate) return getTodayDateStr();
  const raw = String(inputDate).trim().toLowerCase();

  // If already valid YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const todayStr = getTodayDateStr();
  const baseToday = new Date(todayStr + 'T00:00:00+05:30');

  // Relative Today / Tomorrow
  if (raw === 'today' || raw.includes('today') || raw.includes('eeroju') || raw.includes('ఈరోజు')) {
    return todayStr;
  }

  if (raw === 'tomorrow' || raw.includes('tomorrow') || raw.includes('repu') || raw.includes('రేపు')) {
    const d = new Date(baseToday.getTime() + 86400000);
    return formatKolkataDate(d);
  }

  if (raw.includes('day after tomorrow') || raw.includes('ellundi') || raw.includes('ఎల్లుండి')) {
    const d = new Date(baseToday.getTime() + 2 * 86400000);
    return formatKolkataDate(d);
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

  const currentDay = baseToday.getDay();

  for (const [dayName, dayIndex] of Object.entries(daysMap)) {
    if (raw.includes(dayName)) {
      let diff = dayIndex - currentDay;
      if (raw.includes('next')) {
        diff = diff <= 0 ? diff + 7 : diff + 7;
      } else {
        if (diff < 0) diff += 7; // upcoming occurrence
      }

      // If requested day is Sunday (closed), move to Monday
      if (dayIndex === 0) diff += 1;

      const target = new Date(baseToday.getTime() + diff * 86400000);
      return formatKolkataDate(target);
    }
  }

  // Attempt JS standard parse
  try {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2020) {
      return formatKolkataDate(parsed);
    }
  } catch (e) {}

  return todayStr;
}

/**
 * Normalizes spoken time (e.g. "morning", "10am", "2:30pm") into "HH:MM AM/PM"
 */
export function parseSpokenTime(inputTime?: string): string {
  if (!inputTime) return '10:00 AM';
  const raw = String(inputTime).trim().toLowerCase();

  if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(raw)) {
    let clean = raw.toUpperCase();
    if (!clean.includes('AM') && !clean.includes('PM')) {
      const h = parseInt(clean.split(':')[0], 10);
      clean += (h >= 8 && h <= 11) ? ' AM' : ' PM';
    }
    return clean;
  }
  if (raw.includes('morning') || raw.includes('ఉదయం')) return '10:00 AM';
  if (raw.includes('afternoon') || raw.includes('మధ్యాహ్నం')) return '02:00 PM';
  if (raw.includes('evening') || raw.includes('సాయంత్రం')) return '04:00 PM';

  const match = raw.match(/(\d{1,2})/);
  if (match) {
    const num = parseInt(match[1], 10);
    const isPm = raw.includes('pm') || (num >= 1 && num <= 6);
    return `${String(num).padStart(2, '0')}:00 ${isPm ? 'PM' : 'AM'}`;
  }

  return '10:00 AM';
}
