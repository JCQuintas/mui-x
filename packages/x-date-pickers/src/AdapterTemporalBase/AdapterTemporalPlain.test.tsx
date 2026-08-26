import { describe, it, expect } from 'vitest';
// The Temporal API is not yet available in every runtime, so the tests install the polyfill globally.
import 'temporal-polyfill/global';
import { AdapterTemporal } from '@mui/x-date-pickers/AdapterTemporal';
import { AdapterTemporalPlainDate } from '@mui/x-date-pickers/AdapterTemporalPlainDate';
import { AdapterTemporalPlainTime } from '@mui/x-date-pickers/AdapterTemporalPlainTime';
import { AdapterTemporalPlainDateTime } from '@mui/x-date-pickers/AdapterTemporalPlainDateTime';

describe('AdapterTemporalPlainDate', () => {
  const adapter = new AdapterTemporalPlainDate();

  it('should build a value from an ISO date, ignoring any time part', () => {
    expect(adapter.date('2022-04-17')?.toString()).to.equal('2022-04-17');
    expect(adapter.date('2022-04-17T23:30:00Z')?.toString()).to.equal('2022-04-17');
  });

  it('should return null for a null input and an invalid value for junk', () => {
    expect(adapter.date(null)).to.equal(null);
    expect(adapter.isValid(adapter.date('not-a-date') as Temporal.PlainDate)).to.equal(false);
  });

  it('should format tokens without a time', () => {
    const value = adapter.date('2022-04-17') as Temporal.PlainDate;
    expect(adapter.formatByString(value, 'yyyy-MM-dd')).to.equal('2022-04-17');
    expect(adapter.formatByString(value, 'MMMM')).to.equal('April');
    expect(adapter.formatByString(value, 'EEE')).to.equal('Sun');
  });

  it('should parse a formatted value back to the same date', () => {
    const parsed = adapter.parse('04/17/2022', 'MM/dd/yyyy');
    expect(parsed?.toString()).to.equal('2022-04-17');
  });

  it('should treat a day without a month as invalid', () => {
    expect(adapter.isValid(adapter.parse('17', 'dd'))).to.equal(false);
  });

  it('should do calendar arithmetic', () => {
    const value = adapter.date('2022-01-31') as Temporal.PlainDate;
    expect(adapter.addMonths(value, 1).toString()).to.equal('2022-02-28');
    expect(adapter.addDays(value, 1).toString()).to.equal('2022-02-01');
    expect(adapter.startOfMonth(value).toString()).to.equal('2022-01-01');
    expect(adapter.endOfMonth(value).toString()).to.equal('2022-01-31');
  });

  it('should compare by calendar date', () => {
    const a = adapter.date('2022-04-17') as Temporal.PlainDate;
    const b = adapter.date('2022-04-18') as Temporal.PlainDate;
    expect(adapter.isBefore(a, b)).to.equal(true);
    expect(adapter.isAfter(b, a)).to.equal(true);
    expect(adapter.isSameDay(a, a)).to.equal(true);
    expect(adapter.isSameMonth(a, b)).to.equal(true);
  });

  it('should report no timezone support', () => {
    expect(adapter.isTimezoneCompatible).to.equal(false);
    const value = adapter.date('2022-04-17') as Temporal.PlainDate;
    expect(adapter.setTimezone(value, 'America/New_York').toString()).to.equal('2022-04-17');
  });

  it('should build a 6-week grid whose weeks all have 7 days', () => {
    const value = adapter.date('2022-04-17') as Temporal.PlainDate;
    const weeks = adapter.getWeekArray(value);
    expect(weeks.length).to.be.greaterThan(3);
    weeks.forEach((week) => {
      expect(week.length).to.equal(7);
    });
  });

  it('should not shift the day when read from another timezone, unlike a zoned value', () => {
    const zonedAdapter = new AdapterTemporal();
    const zoned = zonedAdapter.date('2022-04-17T00:00:00', 'Asia/Tokyo') as Temporal.ZonedDateTime;
    const plain = adapter.date('2022-04-17') as Temporal.PlainDate;

    // A zoned value is an exact instant, so reading it further west lands on the previous day.
    expect(zoned.withTimeZone('America/New_York').day).to.equal(16);
    // A plain date has no instant to reinterpret, so the calendar day is stable everywhere.
    expect(adapter.getDate(plain)).to.equal(17);
    expect(adapter.formatByString(plain, 'yyyy-MM-dd')).to.equal('2022-04-17');
  });

  it('should not be affected by a DST transition', () => {
    // 2022-03-13 is the US spring-forward day: 02:00 does not exist in America/New_York.
    const springForward = adapter.date('2022-03-13') as Temporal.PlainDate;
    expect(adapter.addDays(springForward, 1).toString()).to.equal('2022-03-14');
    expect(adapter.startOfDay(springForward).toString()).to.equal('2022-03-13');
  });
});

describe('AdapterTemporalPlainTime', () => {
  const adapter = new AdapterTemporalPlainTime();

  it('should build a value from a bare time or an ISO string', () => {
    expect(adapter.date('15:30')?.toString()).to.equal('15:30:00');
    expect(adapter.date('2022-04-17T15:30:00')?.toString()).to.equal('15:30:00');
  });

  it('should return null for a null input and an invalid value for junk', () => {
    expect(adapter.date(null)).to.equal(null);
    expect(adapter.isValid(adapter.date('not-a-time') as Temporal.PlainTime)).to.equal(false);
  });

  it('should format time tokens', () => {
    const value = adapter.date('15:30') as Temporal.PlainTime;
    expect(adapter.formatByString(value, 'HH:mm')).to.equal('15:30');
    expect(adapter.formatByString(value, 'hh:mm a')).to.equal('03:30 PM');
  });

  it('should parse a formatted value back to the same time', () => {
    expect(adapter.parse('03:30 PM', 'hh:mm a')?.toString()).to.equal('15:30:00');
  });

  it('should do time arithmetic and wrap within the day', () => {
    const value = adapter.date('23:30') as Temporal.PlainTime;
    expect(adapter.addHours(value, 1).toString()).to.equal('00:30:00');
    expect(adapter.addMinutes(value, 15).toString()).to.equal('23:45:00');
  });

  it('should treat date operations as inert', () => {
    const value = adapter.date('15:30') as Temporal.PlainTime;
    expect(adapter.getYear(value)).to.satisfy(Number.isNaN);
    expect(adapter.addDays(value, 1).toString()).to.equal('15:30:00');
    expect(adapter.getWeekArray(value)).to.deep.equal([]);
  });

  it('should compare by time of day', () => {
    const a = adapter.date('09:00') as Temporal.PlainTime;
    const b = adapter.date('17:00') as Temporal.PlainTime;
    expect(adapter.isBefore(a, b)).to.equal(true);
    expect(adapter.isEqual(a, a)).to.equal(true);
  });
});

describe('AdapterTemporalPlainDateTime', () => {
  const adapter = new AdapterTemporalPlainDateTime();

  it('should build a value and drop any zone suffix', () => {
    expect(adapter.date('2022-04-17T15:30')?.toString()).to.equal('2022-04-17T15:30:00');
    expect(adapter.date('2022-04-17T15:30:00Z')?.toString()).to.equal('2022-04-17T15:30:00');
    expect(adapter.date('2022-04-17T15:30:00-04:00')?.toString()).to.equal('2022-04-17T15:30:00');
  });

  it('should keep the wall-clock reading rather than an instant', () => {
    const value = adapter.date('2022-04-17T15:30:00Z') as Temporal.PlainDateTime;
    expect(adapter.getHours(value)).to.equal(15);
    expect(adapter.getDate(value)).to.equal(17);
  });

  it('should format both date and time tokens', () => {
    const value = adapter.date('2022-04-17T15:30') as Temporal.PlainDateTime;
    expect(adapter.formatByString(value, 'MM/dd/yyyy HH:mm')).to.equal('04/17/2022 15:30');
  });

  it('should parse a formatted value back to the same date and time', () => {
    expect(adapter.parse('04/17/2022 15:30', 'MM/dd/yyyy HH:mm')?.toString()).to.equal(
      '2022-04-17T15:30:00',
    );
  });

  it('should support both date and time operations', () => {
    const value = adapter.date('2022-04-17T15:30') as Temporal.PlainDateTime;
    expect(adapter.addDays(value, 1).toString()).to.equal('2022-04-18T15:30:00');
    expect(adapter.addHours(value, 2).toString()).to.equal('2022-04-17T17:30:00');
    expect(adapter.startOfDay(value).toString()).to.equal('2022-04-17T00:00:00');
  });
});

describe('Temporal adapter family', () => {
  it('should expose a distinct lib name per adapter', () => {
    expect(new AdapterTemporal().lib).to.equal('temporal');
    expect(new AdapterTemporalPlainDate().lib).to.equal('temporal-plain-date');
    expect(new AdapterTemporalPlainTime().lib).to.equal('temporal-plain-time');
    expect(new AdapterTemporalPlainDateTime().lib).to.equal('temporal-plain-date-time');
  });

  it('should mark only the zoned adapter as timezone compatible', () => {
    expect(new AdapterTemporal().isTimezoneCompatible).to.equal(true);
    expect(new AdapterTemporalPlainDate().isTimezoneCompatible).to.equal(false);
    expect(new AdapterTemporalPlainTime().isTimezoneCompatible).to.equal(false);
    expect(new AdapterTemporalPlainDateTime().isTimezoneCompatible).to.equal(false);
  });

  it('should report a non-null invalid value so pickers can raise `invalidDate`', () => {
    [
      new AdapterTemporalPlainDate(),
      new AdapterTemporalPlainTime(),
      new AdapterTemporalPlainDateTime(),
    ].forEach((item) => {
      const invalid = item.getInvalidDate();
      expect(invalid).not.to.equal(null);
      expect(item.isValid(invalid as any)).to.equal(false);
    });
  });
});
