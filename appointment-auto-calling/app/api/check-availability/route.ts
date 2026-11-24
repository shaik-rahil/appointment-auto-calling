import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSpokenDate, getTodayDateStr } from '@/lib/dateUtils';

// Standard clinic appointment time slots (20-minute consultation intervals)
const CLINIC_SLOTS = [
  '10:00 AM', '10:20 AM', '10:40 AM',
  '11:00 AM', '11:20 AM', '11:40 AM',
  '12:00 PM', '12:20 PM', '12:40 PM',
  '02:00 PM', '02:20 PM', '02:40 PM',
  '03:00 PM', '03:20 PM', '03:40 PM',
  '04:00 PM', '04:20 PM', '04:40 PM',
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const doctorInput = body.doctor || 'Dr. Rahul Sharma';
    const date = parseSpokenDate(body.date || getTodayDateStr());

    // 1. Resolve Doctor from Supabase
    let doctorName = 'Dr. Rahul Sharma';
    let doctorId: string | null = null;
    let specialization = 'Cardiology';

    try {
      const { data: docData } = await supabaseAdmin
        .from('doctors')
        .select('id, name, department')
        .ilike('name', `%${doctorInput.replace(/^Dr\.\s*/i, '').trim()}%`)
        .limit(1)
        .maybeSingle();

      if (docData) {
        doctorName = docData.name;
        doctorId = docData.id;
        specialization = docData.department || 'General Consultation';
      }
    } catch (e) {
      // Continue with defaults
    }

    // 2. Find which slots are ALREADY booked on this date
    const bookedTimes = new Set<string>();

    try {
      // Check doctor_slots for this date (ISO prefix matching: YYYY-MM-DD)
      const { data: bookedSlots } = await supabaseAdmin
        .from('doctor_slots')
        .select('slot_start, is_booked')
        .gte('slot_start', `${date}T00:00:00.000Z`)
        .lte('slot_start', `${date}T23:59:59.999Z`);

      if (bookedSlots && bookedSlots.length > 0) {
        for (const slot of bookedSlots) {
          if (slot.slot_start) {
            const d = new Date(slot.slot_start);
            if (!isNaN(d.getTime())) {
              const formattedTime = d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              bookedTimes.add(formattedTime);
            }
          }
        }
      }

      // Also check appointments count for call-wise queue offset
      const { data: appts } = await supabaseAdmin
        .from('appointments')
        .select('id, slot_id, created_at')
        .order('created_at', { ascending: true });

      // If doctor_slots didn't catch it, use sequential offset based on total bookings
      const apptCount = (appts || []).length;
      if (bookedTimes.size === 0 && apptCount > 0) {
        for (let i = 0; i < Math.min(apptCount, CLINIC_SLOTS.length - 1); i++) {
          bookedTimes.add(CLINIC_SLOTS[i]);
        }
      }
    } catch (e) {
      console.warn('Could not query booked slots:', e);
    }

    // 3. Sequential Call-Wise Slot Allocation (FIFO)
    // Filter out already booked slots
    const availableSlots = CLINIC_SLOTS.filter(slot => !bookedTimes.has(slot));

    // Next sequential slot for this incoming call
    const nextSlot = availableSlots.length > 0 ? availableSlots[0] : '05:00 PM';
    const alternativeSlot = availableSlots.length > 1 ? availableSlots[1] : '05:20 PM';

    return NextResponse.json({
      found: true,
      doctor: doctorName,
      doctor_name: doctorName,
      specialization: specialization,
      department: specialization,
      date: date,
      // The exact sequential next slot assigned for this call
      next_available_slot: nextSlot,
      next_slot: nextSlot,
      free_slots: availableSlots.slice(0, 3).map(time => ({ time })),
      available_slots: availableSlots.slice(0, 5).map(time => ({ time })),
      message: `${doctorName} is available on ${date}. The next available appointment is at ${nextSlot}. Would you like to confirm for ${nextSlot}?`,
    }, { status: 200 });

  } catch (err: any) {
    console.error('Availability check request error:', err);
    const date = parseSpokenDate();
    return NextResponse.json({
      found: true,
      doctor_name: 'Dr. Rahul Sharma',
      date: date,
      next_available_slot: '10:00 AM',
      next_slot: '10:00 AM',
      available_slots: [
        { time: '10:00 AM' },
        { time: '10:20 AM' },
        { time: '10:40 AM' },
      ],
      message: `The next available appointment is at 10:00 AM. Would you like to confirm?`
    }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'check-availability-sequential',
    slots: CLINIC_SLOTS,
  });
}
