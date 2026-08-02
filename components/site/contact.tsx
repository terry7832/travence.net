"use client";

import Image from "next/image";
import { useActionState, useCallback, useRef, useState } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { submitInquiry, type InquiryActionState } from "@/app/inquiry-actions";
import { useReveal } from "@/lib/use-reveal";
import { EMAIL } from "@/lib/site";
import { Lang, content } from "@/lib/content";

const initialState: InquiryActionState = { status: "idle" };
const emptyFormValues = {
  category: "",
  company: "",
  name: "",
  email: "",
  website: "",
  message: "",
  consent: false,
};

export function Contact({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [formValues, setFormValues] = useState(emptyFormValues);
  const submitAndReset = useCallback(async (previousState: InquiryActionState, formData: FormData) => {
    const result = await submitInquiry(previousState, formData);
    if (result.status === "success") setFormValues(emptyFormValues);
    return result;
  }, []);
  const [state, formAction, pending] = useActionState(submitAndReset, initialState);
  useReveal(ref);
  const t = content[lang].contact;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setEmailCopied(true);
    } catch {
      window.prompt(t.form.copyEmail, EMAIL);
    }
  }

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="section-inner">
        <div className="reveal">
          <p className="section-eyebrow">{t.eyebrow}</p>
          <h2 className="section-headline">{t.head}</h2>
          <p className="section-body">{t.body}</p>
        </div>
        <div className="contact-card reveal reveal-d1">
          <div className="contact-left">
            <Image className="contact-left-title" src="/contact-title.png" alt="TRAVENCE" width={600} height={388} />
            <div className="contact-left-sub">{t.sub}</div>
            <div className="contact-row">
              <div className="contact-item">
                <div className="contact-item-icon"><MapPin size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.address}</div>
                  <div className="contact-value" dangerouslySetInnerHTML={{ __html: t.address }} />
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Phone size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.phone}</div>
                  <div className="contact-value"><a href="tel:02-2274-8240">02.2274.8240</a></div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Mail size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.email}</div>
                  <div className="contact-value">
                    <button type="button" className="contact-email-copy" onClick={copyEmail}>
                      {EMAIL}
                    </button>
                    <span className="contact-copy-hint" aria-live="polite">
                      {emailCopied ? t.form.copiedEmail : t.form.copyEmail}
                    </span>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Globe size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-label">{t.labels.website}</div>
                  <div className="contact-value"><a href="https://www.travence.net">www.travence.net</a></div>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-right">
            <h3 dangerouslySetInnerHTML={{ __html: t.rightHead }} />
            <p>{t.rightBody}</p>
            {state.status === "success" && !pending ? (
              <div className="contact-form-status success" role="status">
                <strong>{t.form.successTitle}</strong>
                <span>{t.form.successBody}</span>
              </div>
            ) : null}
            <form action={formAction} className="contact-form">
              <input type="hidden" name="lang" value={lang} />
              <div className="contact-honeypot" aria-hidden="true">
                <label htmlFor={`contact-fax-${lang}`}>Fax</label>
                <input id={`contact-fax-${lang}`} name="fax" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              </div>

              <div className="contact-form-required">{t.form.requiredNotice}</div>

              <div className="contact-field">
                <label htmlFor={`contact-category-${lang}`}>{t.form.category} *</label>
                <select
                  id={`contact-category-${lang}`}
                  name="category"
                  value={formValues.category}
                  onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value }))}
                  required
                  aria-invalid={Boolean(state.fieldErrors?.category)}
                  aria-describedby={state.fieldErrors?.category ? `contact-category-error-${lang}` : undefined}
                >
                  <option value="" disabled>{t.form.categoryPlaceholder}</option>
                  {t.form.categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {state.fieldErrors?.category ? <span id={`contact-category-error-${lang}`} className="contact-field-error">{state.fieldErrors.category}</span> : null}
              </div>

              <div className="contact-form-grid">
                <div className="contact-field">
                  <label htmlFor={`contact-company-${lang}`}>{t.form.company} *</label>
                  <input
                    id={`contact-company-${lang}`}
                    name="company"
                    type="text"
                    value={formValues.company}
                    onChange={(event) => setFormValues((current) => ({ ...current, company: event.target.value }))}
                    required
                    maxLength={120}
                    autoComplete="organization"
                    placeholder={t.form.companyPlaceholder}
                    aria-invalid={Boolean(state.fieldErrors?.company)}
                    aria-describedby={state.fieldErrors?.company ? `contact-company-error-${lang}` : undefined}
                  />
                  {state.fieldErrors?.company ? <span id={`contact-company-error-${lang}`} className="contact-field-error">{state.fieldErrors.company}</span> : null}
                </div>
                <div className="contact-field">
                  <label htmlFor={`contact-name-${lang}`}>{t.form.name} *</label>
                  <input
                    id={`contact-name-${lang}`}
                    name="name"
                    type="text"
                    value={formValues.name}
                    onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                    required
                    maxLength={80}
                    autoComplete="name"
                    placeholder={t.form.namePlaceholder}
                    aria-invalid={Boolean(state.fieldErrors?.name)}
                    aria-describedby={state.fieldErrors?.name ? `contact-name-error-${lang}` : undefined}
                  />
                  {state.fieldErrors?.name ? <span id={`contact-name-error-${lang}`} className="contact-field-error">{state.fieldErrors.name}</span> : null}
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor={`contact-email-${lang}`}>{t.form.email} *</label>
                <input
                  id={`contact-email-${lang}`}
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder={t.form.emailPlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.email)}
                  aria-describedby={state.fieldErrors?.email ? `contact-email-error-${lang}` : undefined}
                />
                {state.fieldErrors?.email ? <span id={`contact-email-error-${lang}`} className="contact-field-error">{state.fieldErrors.email}</span> : null}
              </div>

              <div className="contact-field">
                <label htmlFor={`contact-website-${lang}`}>{t.form.website}</label>
                <input
                  id={`contact-website-${lang}`}
                  name="website"
                  type="text"
                  value={formValues.website}
                  onChange={(event) => setFormValues((current) => ({ ...current, website: event.target.value }))}
                  maxLength={300}
                  inputMode="url"
                  autoComplete="url"
                  placeholder={t.form.websitePlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.website)}
                  aria-describedby={state.fieldErrors?.website ? `contact-website-error-${lang}` : undefined}
                />
                {state.fieldErrors?.website ? <span id={`contact-website-error-${lang}`} className="contact-field-error">{state.fieldErrors.website}</span> : null}
              </div>

              <div className="contact-field">
                <label htmlFor={`contact-message-${lang}`}>{t.form.message} *</label>
                <textarea
                  id={`contact-message-${lang}`}
                  name="message"
                  value={formValues.message}
                  onChange={(event) => setFormValues((current) => ({ ...current, message: event.target.value }))}
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={5}
                  placeholder={t.form.messagePlaceholder}
                  aria-invalid={Boolean(state.fieldErrors?.message)}
                  aria-describedby={state.fieldErrors?.message ? `contact-message-error-${lang}` : undefined}
                />
                {state.fieldErrors?.message ? <span id={`contact-message-error-${lang}`} className="contact-field-error">{state.fieldErrors.message}</span> : null}
              </div>

              <div className="contact-consent">
                <input
                  id={`contact-consent-${lang}`}
                  name="consent"
                  type="checkbox"
                  required
                  checked={formValues.consent}
                  onChange={(event) => setFormValues((current) => ({ ...current, consent: event.target.checked }))}
                  aria-invalid={Boolean(state.fieldErrors?.consent)}
                  aria-describedby={state.fieldErrors?.consent ? `contact-consent-error-${lang}` : undefined}
                />
                <label htmlFor={`contact-consent-${lang}`}>{t.form.consent}</label>
              </div>
              {state.fieldErrors?.consent ? <span id={`contact-consent-error-${lang}`} className="contact-field-error contact-consent-error">{state.fieldErrors.consent}</span> : null}

              {state.status === "error" && state.message ? (
                <div className="contact-form-status error" role="alert">{state.message}</div>
              ) : null}

              <button type="submit" className="contact-btn" disabled={pending}>
                {pending ? t.form.pending : t.form.submit}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
