import { differenceInDays, parse } from 'date-fns';

const REFERENCE_NUMBER = 210;
const REFERENCE_DATE = parse('2022-01-15', 'yyyy-MM-dd', new Date());

export function current(): number {
  const daysDiff = differenceInDays(new Date(), REFERENCE_DATE);
  return REFERENCE_NUMBER + daysDiff;
}
