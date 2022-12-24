import { Transform } from 'class-transformer';

export function Percent() {
  return Transform(({ value }) => parseFloat((value * 100).toFixed(2)));
}

export function Round() {
  return Transform(({ value }) => parseFloat(value.toFixed(2)));
}
