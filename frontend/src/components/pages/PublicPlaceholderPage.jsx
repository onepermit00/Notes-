import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { brand, pageMetadata } from '../../config/brand';
import { PageContainer, SectionHeader } from '../foundation/Foundation';
import './public-pages.css';

const content = {
  product: ['The operating layer for the front desk.', 'Property knowledge, visual procedures, shift work, incidents, handoffs, and history belong in one connected operational record.'],
  'how-it-works': ['Configure once. Carry context forward.', 'Managers document how the property operates. Concierge teams receive clear work and approved procedures. The next shift inherits what happened.'],
  solutions: ['Built around the property.', 'Give managers oversight and give every concierge the context of someone who already knows the building.'],
  about: ['The employee changes. The building does not.', 'Noted exists so that property knowledge, operating standards, and history stay with the property—not in one person’s memory.'],
  faq: ['Clear answers, grounded in the operation.', 'We are preparing detailed guidance about deployment, team access, property setup, and daily use.'],
  careers: ['Build operational memory with us.', 'We are shaping a calmer, more dependable way to operate the front desk. Open roles will be published here when available.'],
  contact: ['Let’s talk about your property operation.', 'Tell us how your concierge or front-desk team works today and where context gets lost between shifts.'],
};

export function Metadata({ title, description }) {
  useEffect(() => {
    document.title = title ? brand.metadata.titleTemplate.replace('%s', title) : brand.metadata.title;
    const values = { description, 'og:title': title || brand.social.title, 'og:description': description || brand.social.description, 'og:type': brand.social.type };
    Object.entries(values).forEach(([key, value]) => {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!node) { node = document.createElement('meta'); node.setAttribute(attribute, key); document.head.appendChild(node); }
      node.setAttribute('content', value || brand.metadata.description);
    });
  }, [title, description]);
  return null;
}

export function PublicPlaceholderPage({ page }) {
  const metadata = pageMetadata[page];
  const [title, description] = content[page];
  return <><Metadata {...metadata} /><section className="noted-placeholder"><PageContainer>
    <SectionHeader as="h1" eyebrow={metadata.title} title={title} description={description} />
    <div className="noted-placeholder__rule" />
    <div className="noted-placeholder__note"><span>Foundation release</span><p>This route is ready for its full page design in a future session.</p><Link to={page === 'contact' ? `mailto:${brand.contact.email}` : '/signup'}>{page === 'contact' ? brand.contact.email : 'Create a manager account'} <ArrowRight size={16} /></Link></div>
  </PageContainer></section></>;
}
