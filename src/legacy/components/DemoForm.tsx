import { Arrow } from './Arrow';
import { useState, type FormEvent } from 'react';
import { copy, type Locale } from '../data/event';
import { subscribeToEventUpdates, submitPartnershipInquiry } from '../services/forms';

// Drafts survive locale navigation in memory only; nothing is persisted or sent.
const drafts = { signup: { name: '', company: '', email: '', message: '' }, partnership: { name: '', company: '', email: '', message: '' } };

export function DemoForm({ locale, partnership = false }: { locale: Locale; partnership?: boolean }) {
  const c = copy[locale];
  const kind = partnership ? 'partnership' : 'signup';
  const [values, setValues] = useState(() => ({ ...drafts[kind] }));
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const update = (key: keyof typeof values, value: string) => {
    const next = { ...values, [key]: value };
    drafts[kind] = next;
    setValues(next);
    if (status !== 'pending') setStatus('idle');
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'pending') return;
    setStatus('pending');
    try {
      if (partnership) await submitPartnershipInquiry({ ...values, locale });
      else await subscribeToEventUpdates({ email: values.email, locale });
      setStatus('success');
    } catch { setStatus('error'); }
  };
  return <form onSubmit={submit} className={`demo-form ${partnership ? 'partnership-form' : ''}`} aria-describedby={`${kind}-notice`}>
    <p id={`${kind}-notice`} className="demo-notice"><span aria-hidden="true">◌</span> {c.mockNotice}</p>
    {partnership && <div className="form-pair">
      <label>{c.name}<input autoComplete="name" name="name" value={values.name} onChange={e => update('name', e.target.value)} required maxLength={150} /></label>
      <label>{c.company}<input autoComplete="organization" name="company" value={values.company} onChange={e => update('company', e.target.value)} required maxLength={200} /></label>
    </div>}
    <label htmlFor={`${kind}-email`}>{c.email}</label>
    <div className="email-row"><input id={`${kind}-email`} autoComplete="email" type="email" name="email" placeholder="nombre@ejemplo.com" value={values.email} onChange={e => update('email', e.target.value)} required maxLength={254} />
      {!partnership && <button className="button button-red" disabled={status === 'pending'} type="submit">{status === 'pending' ? c.sending : c.submit}<Arrow /></button>}
    </div>
    {partnership && <><label>{c.message}<textarea name="message" rows={4} value={values.message} onChange={e => update('message', e.target.value)} required maxLength={3000} /></label><button className="button button-red" disabled={status === 'pending'} type="submit">{status === 'pending' ? c.sending : c.send}<Arrow /></button></>}
    {!partnership && <p className="small form-note">{c.signupNote}</p>}
    <p role="status" className={`form-status ${status}`} aria-live="polite">{status === 'success' ? c.mockSuccess : status === 'error' ? c.formError : '\u00a0'}</p>
    <noscript><p>{c.mockNotice} {locale === 'es' ? 'La demostración interactiva requiere JavaScript.' : 'The interactive demonstration requires JavaScript.'}</p></noscript>
  </form>;
}
