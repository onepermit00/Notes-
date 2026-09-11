import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { brand } from '../../config/brand';
import { PageContainer } from '../foundation/Foundation';
import './layouts.css';

export function PublicNavigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const close = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return <header className="noted-public-nav">
    <PageContainer className="noted-public-nav__inner">
      <Link to="/" className="noted-wordmark" aria-label={`${brand.name} home`}><span aria-hidden="true">N</span>{brand.name}</Link>
      <nav className="noted-public-nav__desktop" aria-label="Primary navigation">
        {brand.navigation.primary.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
      </nav>
      <div className="noted-public-nav__actions"><Link to="/login">Sign in</Link><Link className="noted-nav-cta" to="/signup">Create account <ArrowRight size={15} /></Link></div>
      <button className="noted-mobile-trigger" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="noted-mobile-menu" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button>
    </PageContainer>
    <MobileNavigation open={open} />
  </header>;
}

export function MobileNavigation({ open }) {
  if (!open) return null;
  return <nav id="noted-mobile-menu" className="noted-mobile-nav" aria-label="Mobile navigation">
    {brand.navigation.primary.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
    <NavLink to="/faq">FAQ</NavLink><NavLink to="/contact">Contact</NavLink>
    <div><Link to="/login">Sign in</Link><Link className="noted-nav-cta" to="/signup">Create account</Link></div>
  </nav>;
}

export function Footer() {
  return <footer className="noted-footer"><PageContainer>
    <div className="noted-footer__lead"><div><p className="noted-eyebrow">Operational continuity</p><h2>{brand.promise}</h2></div><Link to="/contact">Talk with us <ArrowRight size={17} /></Link></div>
    <div className="noted-footer__grid"><div><Link to="/" className="noted-wordmark noted-wordmark--inverse"><span aria-hidden="true">N</span>{brand.name}</Link><p>{brand.description}</p></div><nav aria-label="Company navigation">{brand.navigation.company.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}</nav><div><p>Questions about Noted?</p><a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a></div></div>
    <div className="noted-footer__base"><span>© {new Date().getFullYear()} {brand.name}</span><span>Property knowledge · Shift continuity · Operational history</span></div>
  </PageContainer></footer>;
}

export function PublicLayout() { return <div className="noted-public-shell"><a className="noted-skip-link" href="#main-content">Skip to content</a><PublicNavigation /><main id="main-content"><Outlet /></main><Footer /></div>; }
