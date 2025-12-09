'use client';
import { type Location } from '@/lib/types';
import { format, isAfter, isBefore, parse } from 'date-fns';

type OpenStatus = {
  status: 'open' | 'closed' | 'no-hours';
  closesAt: string;
  opensAt: string;
  todayName: string;
};

export function checkOpenStatus(location: Location): OpenStatus {
  const now = new Date();
  const todayName = format(now, 'EEEE'); // 'Monday', 'Tuesday'...

  if (!location.hours) {
    return { status: 'no-hours', closesAt: '', opensAt: '', todayName };
  }

  const todaysHours = location.hours[todayName];

  if (!todaysHours || typeof todaysHours !== 'object' || !todaysHours.open || !todaysHours.close) {
    return { status: 'closed', closesAt: '', opensAt: '', todayName };
  }

  const openTime = parse(todaysHours.open, 'HH:mm', now);
  const closeTime = parse(todaysHours.close, 'HH:mm', now);

  const isOpen = isAfter(now, openTime) && isBefore(now, closeTime);

  return { 
    status: isOpen ? 'open' : 'closed', 
    closesAt: format(closeTime, 'p'),
    opensAt: format(openTime, 'p'),
    todayName,
  };
}
