import { z } from 'zod';

export const generateSchema = z.object({
  endpointUrl: z
    .string()
    .min(1, 'Required')
    .url('Must be a valid URL')
    .startsWith('https://', 'Must use HTTPS')
    .max(200, 'URL too long')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.pathname === '/' || parsed.pathname === '';
      } catch {
        return false;
      }
    }, 'Must be a base URL without path, e.g. https://api.yourservice.com'),

  path: z
    .string()
    .min(1, 'Required')
    .startsWith('/', 'Must start with /')
    .regex(/^[a-zA-Z0-9/_\-:]+$/, 'Only letters, numbers, /, -, _, : allowed. Use :param for path params.')
    .max(100, 'Path too long'),

  price: z
    .string()
    .min(1, 'Required')
    .regex(/^\d+(\.\d{1,7})?$/, 'Must be a number with max 7 decimal places')
    .refine((v) => parseFloat(v) >= 0.0001, 'Minimum price is 0.0001 USDC')
    .refine((v) => parseFloat(v) <= 1000, 'Maximum price is 1000 USDC'),
});

