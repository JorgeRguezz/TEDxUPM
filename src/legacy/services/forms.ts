import { event, type Locale } from '../data/event';

export interface SubscriptionInput { email: string; locale: Locale }
export interface PartnershipInput extends SubscriptionInput { name: string; company: string; message: string }
export type FormResult = { mode: 'mock'; saved: false };

async function demonstrate(): Promise<FormResult> {
  if (event.signupMode !== 'mock') throw new Error('No provider configured');
  // Deliberately no storage, console logging, analytics or network transmission.
  await new Promise(resolve => setTimeout(resolve, 500));
  return { mode: 'mock', saved: false };
}
export async function subscribeToEventUpdates(_input: SubscriptionInput) { return demonstrate(); }
export async function submitPartnershipInquiry(_input: PartnershipInput) { return demonstrate(); }
