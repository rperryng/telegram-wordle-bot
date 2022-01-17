import { DateTime } from 'luxon';

const REFERENCE_NUMBER = 210;
const REFERENCE_DATE = DateTime.fromObject(
  { year: 2022, month: 1, day: 15 },
  { zone: 'America/New_York' },
);

export function current(): number {
  const daysDiff = Math.floor(now().diff(REFERENCE_DATE, 'days').days);
  return REFERENCE_NUMBER + daysDiff;
}

function now(): DateTime {
  return DateTime.fromObject({}, { zone: 'America/New_York' });
}
