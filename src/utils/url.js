import { URL } from 'url';

export function isValidURL(string) {
  try {
    return Boolean(new URL(string));
  } catch (error) {
    return false;
  }
}
