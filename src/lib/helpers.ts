'use client';
import { type Location } from '@/lib/types';
import { format, getDay, isAfter, isBefore, parse } from 'date-fns';

export function checkOpenStatus(location: Location): { isOpen: boolean; closesAt: string; opensAt: string, todayName: string } {
  const now = new Date();
  const todayName = format(now, 'EEEE'); // 'Monday', 'Tuesday'...

  // Add a check to ensure location.hours exists before trying to access it.
  if (!location.hours) {
    return { isOpen: false, closesAt: '', opensAt: '', todayName };
  }

  const todaysHours = location.hours[todayName];

  if (!todaysHours) {
    return { isOpen: false, closesAt: '', opensAt: '', todayName };
  }

  const openTime = parse(todaysHours.open, 'HH:mm', now);
  const closeTime = parse(todaysHours.close, 'HH:mm', now);

  const isOpen = isAfter(now, openTime) && isBefore(now, closeTime);

  return { 
    isOpen, 
    closesAt: format(closeTime, 'p'),
    opensAt: format(openTime, 'p'),
    todayName,
  };
}
