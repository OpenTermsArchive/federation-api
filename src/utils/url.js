import { URL } from 'url';

export function isURL(string) {
  try {
    return Boolean(new URL(string));
  } catch (error) {
    return false;
  }
}
