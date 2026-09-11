export const brand = {
  name: 'Noted',
  shortName: 'Noted',
  description: 'The property operating system for concierge and front-desk operations.',
  promise: 'The building remembers. Every shift starts informed.',
  contact: {
    email: 'support@noted.app',
  },
  navigation: {
    primary: [
      { label: 'Product', to: '/product' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Solutions', to: '/solutions' },
      { label: 'About', to: '/about' },
    ],
    company: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  metadata: {
    title: 'Noted — Property operations, remembered',
    titleTemplate: '%s — Noted',
    description: 'Keep property knowledge, procedures, tasks, incidents, and shift handoffs connected in one operational record.',
    themeColor: '#111714',
  },
  social: {
    title: 'Noted — The property operating system',
    description: 'Give every concierge the property knowledge and operating context they need for the shift ahead.',
    type: 'website',
  },
};

export const pageMetadata = {
  product: { title: 'Product', description: 'One connected operating system for property knowledge, procedures, daily work, and shift continuity.' },
  'how-it-works': { title: 'How it works', description: 'Managers configure the operation. Concierge teams execute with context. Every shift adds to the record.' },
  solutions: { title: 'Solutions', description: 'Operational continuity for property managers, concierge teams, and front-desk operations.' },
  about: { title: 'About', description: 'Noted is built around a simple principle: the building should not forget when the employee changes.' },
  faq: { title: 'Frequently asked questions', description: 'Answers about Noted and the property operations it supports.' },
  careers: { title: 'Careers', description: 'Help build the operating system for the people who run the front desk.' },
  contact: { title: 'Contact', description: 'Talk with the Noted team about your property operations.' },
};
