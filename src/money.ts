const SCALE = 1_000_000_000_000n;

export type Decimal = bigint;

export function parseDecimal(value: string): Decimal {
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid decimal value: ${value}`);
  }

  const sign = match[1] === '-' ? -1n : 1n;
  const whole = BigInt(match[2]);
  const fraction = (match[3] || '').padEnd(12, '0').slice(0, 12);
  return sign * (whole * SCALE + BigInt(fraction));
}

export function isZero(value: Decimal): boolean {
  return value === 0n;
}

export function addDecimal(a: Decimal, b: Decimal): Decimal {
  return a + b;
}

export function multiplyDecimal(a: Decimal, b: Decimal): Decimal {
  return (a * b) / SCALE;
}

export function decimalToActualAmount(value: Decimal): number {
  const sign = value < 0n ? -1n : 1n;
  const absolute = value < 0n ? -value : value;
  const rounded = (absolute * 100n + SCALE / 2n) / SCALE;
  return Number(sign * rounded);
}

export function actualAmountToNok(value: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  const kroner = Math.floor(absolute / 100);
  const ore = absolute % 100;
  return `${sign}${kroner}.${ore.toString().padStart(2, '0')}`;
}

export function formatDecimal(value: Decimal, digits = 2): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const whole = absolute / SCALE;
  const fraction = absolute % SCALE;
  const divisor = 10n ** BigInt(12 - digits);
  const roundedFraction = (fraction + divisor / 2n) / divisor;
  return `${sign}${whole}.${roundedFraction.toString().padStart(digits, '0')}`;
}
