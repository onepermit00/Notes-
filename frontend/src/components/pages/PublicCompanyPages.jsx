import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BriefcaseBusiness, Building2, CheckCircle2,
  ChevronDown, CircleAlert, Clock3, LoaderCircle, Mail, Send, Users,
} from 'lucide-react';
import { Metadata } from './PublicPlaceholderPage';
import { PageContainer } from '../foundation/Foundation';
import { brand, pageMetadata } from '../../config/brand';
import { submitContactInquiry } from '../../services/contactSubmission';
import './public-pages.css';

function Chapter({ children, detail }) {
  return <div className="public-chapter"><span>{children}</span>{detail && <small>{detail}</small>}</div>;
}

function CompanyHero({ eyebrow, detail, title, accent, thesis, body }) {
  return <section className="company-hero"><PageContainer><Chapter detail={detail}>{eyebrow}</Chapter>
    <h1>{title} {accent && <em>{accent}</em>}</h1>
    <div className="company-hero__split"><p>{thesis}</p><p>{body}</p></div>
  </PageContainer></section>;
}

const ownershipPrinciples = [
  ['Knowledge remains with the property', 'Contacts, locations, building details, and practical answers should stay available when schedules and teams change.'],
  ['Procedures remain with the property', 'The way a building handles keys, vendors, packages, emergencies, and daily routines should not depend on who is working.'],
  ['History remains with the property', 'Shift activity, incidents, visits, handoffs, and unresolved items should form one continuous operational record.'],
  ['Every employee receives the context needed to perform', 'A new hire or coverage employee should be able to understand the property, find the approved procedure, and begin the shift informed.'],
];

export function AboutPage() {
  return <div className="public-editorial company-page"><Metadata {...pageMetadata.about} />
    <CompanyHero eyebrow="About Noted" detail="01 / Our reason" title="The property should" accent="own what it knows." thesis="Buildings accumulate enormous operational knowledge. Most properties do not own that knowledge in a structure their teams can reliably use." body="It lives in employee memory, printed binders, scattered files, inboxes, group chats, and verbal instructions. When the employee changes, vital context can disappear with them." />
    <section className="about-manifesto"><PageContainer><Chapter detail="02 / The principle">What stays</Chapter><div className="about-manifesto__lead"><h2>The employee changes.<br />The building does not.</h2><p>Noted is building a property operating system for the people who run the concierge desk. The property becomes the stable home for its knowledge, procedures, daily work, and operational history.</p></div>
      <div className="principle-list">{ownershipPrinciples.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
    </PageContainer></section>
    <section className="about-first-day"><PageContainer><div><Chapter>Our design test</Chapter><h2>Could someone new walk in today and operate the desk?</h2></div><div className="first-day-answer"><span>YES</span><p>Every useful part of Noted should move a property closer to that answer—by making the right context findable at the moment the work is happening.</p><Link to="/how-it-works">See how context carries forward <ArrowRight /></Link></div></PageContainer></section>
    <section className="company-cta"><PageContainer><p className="noted-eyebrow">Build durable context</p><h2>A continuous record for a continuously operating building.</h2><Link to="/contact">Talk with us <ArrowRight /></Link></PageContainer></section>
  </div>;
}

const faqGroups = [
  ['Understanding Noted', [
    ['What is Noted?', 'Noted is a property operating system for concierge and front-desk operations. It connects property knowledge, procedures, shift work, documentation, handoffs, and history around the building that owns that context.'],
    ['Who is it for?', 'Noted is designed for property managers and the full-time, part-time, temporary, or third-party teams operating a residential property’s concierge or front desk.'],
    ['Does Noted replace property-management software?', 'No. Noted is not positioned as a rent, leasing, accounting, billing, or CRM system. It focuses on the operating layer for the people running the front desk and can sit alongside existing property systems.'],
    ['Can Noted work alongside our existing systems?', 'That is the intended role: Noted focuses on property knowledge and front-desk operations rather than claiming to replace every system a property uses. Specific integrations should be evaluated based on the systems involved.'],
  ]],
  ['Property knowledge and procedures', [
    ['How are property-specific procedures handled?', 'Managers can document how their property operates so staff can find building-specific instructions rather than rely on generic guidance or memory.'],
    ['What are visual SOPs?', 'Visual SOPs are procedures organized as usable guidance. They can bring together short instructions, ordered steps, locations, photos or video references, warnings, rules, and contacts instead of leaving the team with another folder of PDFs.'],
    ['How is a property set up?', 'A manager creates the property and adds the operating information the team needs, such as areas, contacts, procedures, tasks, and staff. Setup depth depends on the property; Noted does not claim that undocumented knowledge appears automatically.'],
    ['Will Noted use AI?', 'Property-aware assistance is a future direction, not a promise of current functionality. Any future assistance should be grounded in property-approved information and should say when an answer has not been documented.'],
  ]],
  ['Teams and access', [
    ['Can a temporary concierge receive access?', 'The product direction includes giving coverage staff access to the property context they need for the relevant assignment. Exact access timing and controls should be confirmed for the intended deployment.'],
    ['Can third-party concierge companies use Noted?', 'Noted is being designed with third-party concierge and security providers in mind, including staff who rotate between properties. Available workflows should be confirmed against your team’s needs.'],
    ['Can one organization manage multiple properties?', 'Multiple-property oversight is part of the longer-term product direction. Noted’s current public positioning remains focused on building a strong operating record for each individual property.'],
    ['How does Noted approach privacy?', 'Noted should collect and display only the operational information appropriate to each workflow and role. This site does not claim certifications, compliance status, encryption standards, or privacy guarantees that have not been independently verified.'],
  ]],
  ['The operational record', [
    ['How does shift history work?', 'Each shift can leave documented activity, open items, and handoff context so the next employee does not begin from zero and managers can review the recorded operation.'],
    ['How are incidents handled?', 'Employees are guided to document what happened, the response taken, relevant details, and current status. The goal is consistent operational documentation, not merely another blank form.'],
    ['Can teams record visitors and vendors?', 'Yes. Visitor and vendor activity can become part of the property’s operational record, with the property-specific process close at hand.'],
    ['Can teams track packages?', 'Package activity can be recorded alongside the rest of the front-desk operation, helping the property retain the history of what occurred during a shift.'],
    ['Can records be exported?', 'The product includes reporting and export concepts for available operational records. The exact fields and formats should be confirmed for the workflow you need.'],
  ]],
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className={`faq-item${open ? ' is-open' : ''}`}><h3><button type="button" aria-expanded={open} aria-controls={`${id}-panel`} id={`${id}-button`} onClick={() => setOpen(value => !value)}><span>{question}</span><ChevronDown /></button></h3><div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} hidden={!open}><p>{answer}</p></div></div>;
}

export function FaqPage() {
  return <div className="public-editorial company-page"><Metadata {...pageMetadata.faq} />
    <CompanyHero eyebrow="Frequently asked questions" detail="01 / Clear answers" title="The operation," accent="explained." thesis="Noted gives the property a structured place to retain how the front desk works and what happened there." body="These answers distinguish what the product is designed to do today from longer-term direction. For a question specific to your property, talk with us." />
    <section className="faq-section"><PageContainer>{faqGroups.map(([group, items], index) => <section className="faq-group" key={group} aria-labelledby={`faq-group-${index}`}><div><span>{String(index + 1).padStart(2, '0')}</span><h2 id={`faq-group-${index}`}>{group}</h2></div><div>{items.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}</div></section>)}</PageContainer></section>
    <section className="faq-contact"><PageContainer><div><Mail /><p className="noted-eyebrow">Still deciding?</p><h2>Bring us the way your property operates today.</h2></div><Link to="/contact">Ask a question <ArrowRight /></Link></PageContainer></section>
  </div>;
}

const careerFields = [
  ['Product', 'Shape clear workflows from the complex reality of property operations.'],
  ['Engineering', 'Build dependable systems that carry context across people, shifts, and properties.'],
  ['Design', 'Make building knowledge understandable at the exact moment someone needs it.'],
  ['Customer success', 'Help property teams turn their operating knowledge into a useful working system.'],
  ['Property operations', 'Bring practical understanding of residential buildings and front-desk work.'],
  ['PropTech', 'Connect the product to the broader systems and realities of modern property management.'],
];

export function CareersPage() {
  return <div className="public-editorial company-page"><Metadata {...pageMetadata.careers} />
    <CompanyHero eyebrow="Careers" detail="01 / The work ahead" title="Help buildings" accent="remember." thesis="We are building for a simple operational truth: a property should not depend on one employee’s memory to run well." body="That requires people who can respect the complexity of a building while making the experience at the desk calmer, clearer, and more dependable." />
    <section className="career-disciplines"><PageContainer><Chapter detail="02 / Future team">Where the mission leads</Chapter><div className="career-disciplines__intro"><h2>Many disciplines.<br />One operational problem.</h2><p>As Noted grows, the work may span the following areas. These are fields we expect to matter—not advertised openings.</p></div><div className="career-grid">{careerFields.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><BriefcaseBusiness /><h3>{title}</h3><p>{copy}</p></article>)}</div></PageContainer></section>
    <section className="no-roles"><PageContainer><div className="no-roles__mark"><span /><span /><span /></div><div><p className="noted-eyebrow">Current openings</p><h2>No open roles right now.</h2><p>We do not have verified positions to share today. If the mission fits your work, you can send a general note and tell us what you would hope to contribute.</p><Link to="/contact?inquiry=general">Share your interest <ArrowRight /></Link></div></PageContainer></section>
  </div>;
}

const initialForm = { inquiryType: 'Book a Demo', name: '', email: '', company: '', role: '', organizationType: '', propertyCount: '', message: '' };
const inquiryTypes = ['Book a Demo', 'General Inquiry', 'Partnership', 'Concierge Company', 'Property Management Company'];
const orgTypes = ['Residential property', 'Property management company', 'Concierge company', 'Security company', 'PropTech company', 'Other'];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your work email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.company.trim()) errors.company = 'Enter your company or property.';
  if (!values.role.trim()) errors.role = 'Enter your role.';
  if (!values.organizationType) errors.organizationType = 'Select a property or company type.';
  if (['Property management company', 'Concierge company'].includes(values.organizationType) && !values.propertyCount) errors.propertyCount = 'Tell us how many properties are relevant.';
  if (values.propertyCount && Number(values.propertyCount) < 1) errors.propertyCount = 'Enter one property or more.';
  if (!values.message.trim()) errors.message = 'Tell us what you would like to discuss.';
  else if (values.message.trim().length < 20) errors.message = 'Please add a little more detail (at least 20 characters).';
  return errors;
}

function Field({ label, name, error, children, hint }) {
  return <div className={`contact-field${error ? ' has-error' : ''}`}><label htmlFor={name}>{label}</label>{children}{hint && !error && <p className="contact-field__hint">{hint}</p>}{error && <p className="contact-field__error" id={`${name}-error`}>{error}</p>}</div>;
}

export function ContactPage() {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const set = event => { const { name, value } = event.target; setValues(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: undefined })); if (status !== 'idle') setStatus('idle'); };
  const onSubmit = async event => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setStatus('invalid'); setStatusMessage('Review the highlighted fields and try again.'); document.getElementById(Object.keys(nextErrors)[0])?.focus(); return; }
    setStatus('loading'); setStatusMessage('Sending your inquiry…');
    try { await submitContactInquiry({ ...values, submittedAt: new Date().toISOString(), source: 'noted-public-contact' }); setStatus('success'); setStatusMessage('Your inquiry was sent. We will follow up using the email you provided.'); setValues(initialForm); }
    catch (error) { if (error.name !== 'AbortError') { setStatus('error'); setStatusMessage(error.message || 'Your message was not sent. Please try again or email us directly.'); } }
  };
  const needsCount = ['Property management company', 'Concierge company'].includes(values.organizationType);
  return <div className="public-editorial company-page"><Metadata {...pageMetadata.contact} />
    <CompanyHero eyebrow="Contact" detail="01 / Start a conversation" title="Tell us how the desk" accent="works today." thesis="Every property has its own operating reality. We want to understand where the knowledge lives, how shifts hand off, and where context is most likely to disappear." body="Use the form to discuss a demo, partnership, concierge operation, or property-management team. We will not claim a fit before understanding the work." />
    <section className="contact-section"><PageContainer><aside><Chapter>What to expect</Chapter><h2>A practical conversation about the operation.</h2><p>Share the type of property or company, how many properties are relevant, and the problem you want to solve. No technical or security promises are implied by submitting this form.</p><div className="contact-points"><span><Building2 /><b>Property context</b>How the building operates now</span><span><Clock3 /><b>Shift continuity</b>Where the story gets lost</span><span><Users /><b>Team structure</b>Who needs access to the context</span></div><a href={`mailto:${brand.contact.email}`}><Mail />{brand.contact.email}</a></aside>
      <form className="contact-form" onSubmit={onSubmit} noValidate aria-busy={status === 'loading'}>
        <div className="contact-form__heading"><span>Inquiry details</span><small>All fields are required unless marked optional.</small></div>
        <Field label="Inquiry type" name="inquiryType"><select id="inquiryType" name="inquiryType" value={values.inquiryType} onChange={set}>{inquiryTypes.map(type => <option key={type}>{type}</option>)}</select></Field>
        <div className="contact-form__row"><Field label="Name" name="name" error={errors.name}><input id="name" name="name" autoComplete="name" value={values.name} onChange={set} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} /></Field><Field label="Work email" name="email" error={errors.email}><input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} /></Field></div>
        <div className="contact-form__row"><Field label="Company or property" name="company" error={errors.company}><input id="company" name="company" autoComplete="organization" value={values.company} onChange={set} aria-invalid={!!errors.company} aria-describedby={errors.company ? 'company-error' : undefined} /></Field><Field label="Role" name="role" error={errors.role}><input id="role" name="role" autoComplete="organization-title" value={values.role} onChange={set} aria-invalid={!!errors.role} aria-describedby={errors.role ? 'role-error' : undefined} /></Field></div>
        <div className="contact-form__row"><Field label="Property or company type" name="organizationType" error={errors.organizationType}><select id="organizationType" name="organizationType" value={values.organizationType} onChange={set} aria-invalid={!!errors.organizationType} aria-describedby={errors.organizationType ? 'organizationType-error' : undefined}><option value="">Select one</option>{orgTypes.map(type => <option key={type}>{type}</option>)}</select></Field><Field label={`Number of properties${needsCount ? '' : ' (optional)'}`} name="propertyCount" error={errors.propertyCount} hint={needsCount ? 'Required for this company type.' : 'Add this when it is relevant.'}><input id="propertyCount" name="propertyCount" type="number" min="1" inputMode="numeric" value={values.propertyCount} onChange={set} aria-invalid={!!errors.propertyCount} aria-describedby={errors.propertyCount ? 'propertyCount-error' : undefined} /></Field></div>
        <Field label="Message" name="message" error={errors.message}><textarea id="message" name="message" rows="6" value={values.message} onChange={set} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} placeholder="What does your team need to carry from one shift to the next?" /></Field>
        {status !== 'idle' && <div className={`contact-status contact-status--${status}`} role={status === 'error' || status === 'invalid' ? 'alert' : 'status'} aria-live="polite">{status === 'loading' && <LoaderCircle className="spin" />}{status === 'success' && <CheckCircle2 />}{(status === 'error' || status === 'invalid') && <CircleAlert />}<span>{statusMessage}{status === 'error' && <> <a href={`mailto:${brand.contact.email}`}>Email us directly.</a></>}</span></div>}
        <div className="contact-form__footer"><p>Submitting this form does not create an account or guarantee product availability.</p><button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send inquiry'} <Send /></button></div>
      </form>
    </PageContainer></section>
  </div>;
}
