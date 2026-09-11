import React from 'react';
import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

const cx = (...values) => values.filter(Boolean).join(' ');

export function PageContainer({ as: Tag = 'div', size = 'lg', className, children, ...props }) {
  return <Tag className={cx('noted-container', `noted-container--${size}`, className)} {...props}>{children}</Tag>;
}

export function SectionHeader({ eyebrow, title, description, actions, align = 'left', as: Heading = 'h2' }) {
  return <header className={cx('noted-section-header', `noted-section-header--${align}`)}>
    <div>{eyebrow && <p className="noted-eyebrow">{eyebrow}</p>}<Heading>{title}</Heading>{description && <p>{description}</p>}</div>
    {actions && <div className="noted-section-header__actions">{actions}</div>}
  </header>;
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }) {
  return <button type={type} className={cx('noted-button', `noted-button--${variant}`, `noted-button--${size}`, className)} {...props} />;
}

export function Field({ label, hint, error, id, children }) {
  return <div className="noted-field"><label htmlFor={id}>{label}</label>{children}{error ? <p className="noted-field__error" role="alert">{error}</p> : hint ? <p className="noted-field__hint">{hint}</p> : null}</div>;
}

export const Input = React.forwardRef(function Input({ className, ...props }, ref) { return <input ref={ref} className={cx('noted-input', className)} {...props} />; });
export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={cx('noted-input noted-textarea', className)} {...props} />; });

export function Card({ as: Tag = 'div', className, children, ...props }) { return <Tag className={cx('noted-card', className)} {...props}>{children}</Tag>; }
export function StatusBadge({ tone = 'neutral', children }) { return <span className={cx('noted-status', `noted-status--${tone}`)}>{children}</span>; }

function State({ icon, title, description, action, compact = false, role }) {
  return <div className={cx('noted-state', compact && 'noted-state--compact')} role={role}>{icon}<h2>{title}</h2>{description && <p>{description}</p>}{action && <div>{action}</div>}</div>;
}
export function LoadingState({ label = 'Loading your property…', fullPage = false }) { return <State icon={<LoaderCircle className="noted-state__spinner" aria-hidden="true" />} title={label} compact={!fullPage} role="status" />; }
export function EmptyState({ title = 'Nothing here yet', description, action }) { return <State icon={<Inbox aria-hidden="true" />} title={title} description={description} action={action} />; }
export function ErrorState({ title = 'Something went wrong', description = 'Please try again.', action }) { return <State icon={<AlertCircle aria-hidden="true" />} title={title} description={description} action={action} role="alert" />; }
