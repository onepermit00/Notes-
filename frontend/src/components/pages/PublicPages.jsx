import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowDown, ArrowRight, BookOpen, Box, Building2, Check,
  CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FileText, History,
  KeyRound, MapPin, Package, PlayCircle, Search, ShieldCheck, Sparkles,
  Users, UserRoundCheck, Wrench,
} from 'lucide-react';
import { Metadata } from './PublicPlaceholderPage';
import { PageContainer } from '../foundation/Foundation';
import { pageMetadata } from '../../config/brand';
import './public-pages.css';

const nowModules = [
  ['Property knowledge', BookOpen, 'Keep contacts, locations, building details, and answers attached to the property.'],
  ['Visual SOPs', PlayCircle, 'Turn procedures into clear steps with photos and video references.'],
  ['Daily tasks', ClipboardCheck, 'Give each shift a practical list of scheduled and property-specific work.'],
  ['Shift operations', Clock3, 'Bring priorities, open items, and the tools for the day into one view.'],
  ['Shift handoff', ArrowRight, 'Pass unresolved work and useful context directly to the next employee.'],
  ['Incidents', AlertTriangle, 'Document what happened, the response taken, and the current status.'],
  ['Visitors', UserRoundCheck, 'Record front-desk visitor activity with the property’s process close at hand.'],
  ['Vendors', Wrench, 'Keep vendor visits and the instructions needed to manage them together.'],
  ['Packages', Package, 'Track package activity as part of the same daily operating record.'],
  ['Operational history', History, 'Create a continuous, searchable record of shifts, work, and issues.'],
  ['Team management', Users, 'Add the people who operate the property and give them the right working context.'],
  ['Reporting', FileText, 'Review recorded activity and export available operational records.'],
];

function Chapter({ label, index }) {
  return <div className="public-chapter"><span>{label}</span>{index && <small>{index}</small>}</div>;
}

function PageHero({ eyebrow, title, accent, thesis, body, aside }) {
  return <section className="public-page-hero"><PageContainer>
    <Chapter label={eyebrow} index={aside} />
    <h1>{title} {accent && <em>{accent}</em>}</h1>
    <div className="public-page-hero__thesis"><p>{thesis}</p><div><p>{body}</p><Link to="/signup">Create a manager account <ArrowRight size={16} /></Link></div></div>
  </PageContainer></section>;
}

function Status({ future = false }) { return <span className={`public-status${future ? ' public-status--future' : ''}`}>{future ? <Sparkles /> : <CheckCircle2 />}{future ? 'Future direction' : 'Available now'}</span>; }

function OperationsDemo() {
  return <div className="ops-demo" aria-label="Example of a Noted shift workspace">
    <div className="ops-demo__bar"><div><span>N</span><strong>The Emerson</strong></div><span className="ops-live"><i /> Shift in progress</span></div>
    <div className="ops-demo__body"><aside><small>WORKSPACE</small>{['Today', 'Knowledge', 'Visitors', 'Packages', 'Incidents', 'History'].map((item, i) => <span className={i === 0 ? 'selected' : ''} key={item}>{item}</span>)}</aside>
      <div className="ops-demo__main"><div className="ops-demo__welcome"><div><small>MONDAY · 7:04 AM</small><h2>Good morning, Maya.</h2><p>Your property context is ready.</p></div><Status /></div>
        <div className="ops-demo__grid"><article className="demo-handoff"><small>PREVIOUS SHIFT</small><h3>Two items need context</h3><p>Garage gate vendor is expected at 9:30. Loading dock key is signed out to maintenance.</p><span>Handoff from Jordan · 6:52 AM</span></article>
          <article><small>TODAY</small><h3>3 of 7 complete</h3>{['Open amenity level', 'Review vendor arrival', 'Complete lobby walk'].map((x, i) => <div className="demo-task" key={x}><span className={i === 0 ? 'done' : ''}>{i === 0 && <Check />}</span>{x}</div>)}</article>
          <article><small>PROPERTY KNOWLEDGE</small><h3>Find the approved answer</h3><div className="demo-search"><Search />Search procedures, places, contacts…</div><p className="demo-caption">Answers stay connected to this property.</p></article>
          <article><small>OPEN ACTIVITY</small><h3>What needs attention</h3><div className="demo-activity"><AlertTriangle /><div><strong>Garage gate</strong><span>Vendor expected · 9:30 AM</span></div></div><div className="demo-activity"><Box /><div><strong>4 packages</strong><span>Awaiting resident pickup</span></div></div></article>
        </div>
      </div>
    </div>
  </div>;
}

function KnowledgeDemo() {
  return <div className="knowledge-demo"><div className="knowledge-demo__top"><span><KeyRound /> Property knowledge</span><div><Search /> Search The Emerson</div></div>
    <div className="knowledge-demo__content"><div className="knowledge-demo__title"><span><KeyRound /></span><div><small>ACCESS · EQUIPMENT</small><h3>Loading dock key</h3><p>Approved property procedure · Updated Aug 24</p></div></div>
      <div className="knowledge-demo__visual"><div><MapPin /><span>Key cabinet B</span><small>Lower drawer · Hook 14</small></div><ol><li><span>1</span><p><strong>Verify the request</strong>Confirm the vendor and work order.</p></li><li><span>2</span><p><strong>Record the handoff</strong>Log who received the key and when.</p></li><li><span>3</span><p><strong>Confirm its return</strong>Close the entry after the key is back.</p></li></ol></div>
    </div>
  </div>;
}

export function ProductPage() {
  return <div className="public-editorial"><Metadata {...pageMetadata.product} />
    <PageHero eyebrow="The product" aside="01 / Platform" title="One property." accent="One operating record." thesis="Noted connects what the team knows, what each shift does, and what the next person needs." body="Instead of a collection of isolated desk tools, the property becomes the organizing layer. Procedures inform tasks. Shift work becomes history. Handoffs carry the unfinished story forward." />
    <section className="public-demo-section"><PageContainer><OperationsDemo /><p className="public-demo-caption"><span>Illustrative workspace</span> A realistic view of how current capabilities can meet at the start of a shift.</p></PageContainer></section>
    <section className="public-modules"><PageContainer><Chapter label="One connected system" index="02 / Capabilities" /><div className="public-section-intro"><h2>The whole desk, in context.</h2><div><Status /><p>These capabilities are represented in the current product experience. Their value comes from sharing the same property context.</p></div></div>
      <div className="module-grid">{nowModules.map(([title, Icon, copy], i) => <article key={title}><span>{String(i + 1).padStart(2, '0')}</span><Icon /><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </PageContainer></section>
    <section className="public-dark-section"><PageContainer><Chapter label="Knowledge in the work" index="03 / Procedure" /><div className="public-section-intro"><h2>Show the answer where the work happens.</h2><p>A procedure can include the exact location, visual reference, ordered steps, and responsible contact—so a new employee does not have to translate a binder into action.</p></div><KnowledgeDemo /></PageContainer></section>
    <section className="future-section-public"><PageContainer><div className="future-panel"><Status future /><h2>Property-aware assistance, grounded in what the property has recorded.</h2><p>The longer-term direction is assistance that can help employees find relevant property knowledge and operational context faster. It is not presented as a currently implemented capability, and any future experience should make its source and uncertainty clear.</p><div><Sparkles /><span><small>ILLUSTRATIVE FUTURE QUESTION</small>“What should I check before the elevator vendor arrives?”</span></div></div></PageContainer></section>
  </div>;
}

const processSteps = [
  ['Manager creates property', 'The property becomes the stable home for its people, procedures, work, and record.', Building2],
  ['Configures operations', 'The manager chooses the working structure and defines how the desk should run.', Wrench],
  ['Builds property knowledge', 'Contacts, locations, procedures, photos, and instructions become usable guidance.', BookOpen],
  ['Adds the team', 'Employees join the property workspace and receive the context built for that building.', Users],
  ['Concierge starts a shift', 'The employee enters a shift view organized around this property and this day.', Clock3],
  ['Reviews context and priorities', 'Previous handoff notes, open issues, and today’s work are visible together.', Search],
  ['Performs and documents work', 'Tasks, visits, packages, and incidents add structured detail to the record.', ClipboardCheck],
  ['Creates a handoff', 'Unresolved work and useful observations are prepared for the next employee.', ArrowRight],
  ['Next employee inherits context', 'The incoming shift begins informed instead of rebuilding the story.', UserRoundCheck],
  ['Property history keeps growing', 'Every completed shift strengthens the property-owned operational record.', History],
];

function ContextRelay() {
  return <div className="context-relay"><article><small>OUTGOING SHIFT · 6:52 AM</small><div className="relay-person"><span>JD</span><div><strong>Jordan Davis</strong><p>Morning concierge</p></div></div><h3>Handoff ready</h3><p>Garage gate vendor expected at 9:30. Loading dock key remains with maintenance.</p><div className="relay-tags"><span>2 open items</span><span>1 vendor</span></div></article><div className="relay-arrow"><span>Context, not just a note</span><ArrowRight /></div><article className="relay-next"><small>INCOMING SHIFT · 7:04 AM</small><div className="relay-person"><span>MW</span><div><strong>Maya Williams</strong><p>Day concierge</p></div></div><h3>Start informed</h3><div className="relay-priority"><AlertTriangle /><span><strong>First priority</strong>Prepare for garage vendor arrival</span></div><button type="button">Review previous shift <ChevronRight /></button></article></div>;
}

export function HowItWorksPage() {
  return <div className="public-editorial"><Metadata {...pageMetadata['how-it-works']} />
    <PageHero eyebrow="How it works" aside="01 / The loop" title="Configure the property." accent="Carry the context." thesis="The manager establishes how the building operates. Each shift follows that structure and leaves the next shift better informed." body="Noted is designed as a loop, not a one-time setup. Knowledge guides the work; documented work becomes the property’s history; history gives the next employee context." />
    <section className="process-story"><PageContainer><Chapter label="From setup to continuity" index="02 / Ten moments" /><div className="process-line" aria-hidden="true"><span /></div><ol>{processSteps.map(([title, copy, Icon], i) => <li key={title}><div className="process-number">{String(i + 1).padStart(2, '0')}</div><span className="process-icon"><Icon /></span><div><h2>{title}</h2><p>{copy}</p></div>{i < processSteps.length - 1 && <ArrowDown className="process-arrow" />}</li>)}</ol></PageContainer></section>
    <section className="relay-section"><PageContainer><Chapter label="The shift change" index="03 / Handoff" /><div className="public-section-intro"><h2>The next person receives the story already in progress.</h2><p>Handoff connects an outgoing employee’s observations to the incoming employee’s priorities. The property record continues even though the person at the desk changes.</p></div><ContextRelay /></PageContainer></section>
    <section className="history-loop"><PageContainer><div className="history-loop__graphic" aria-hidden="true"><span>Knowledge</span><ArrowRight /><span>Work</span><ArrowRight /><span>Handoff</span><ArrowRight /><span>History</span><ArrowRight /></div><div><Chapter label="A compounding record" /><h2>Every shift leaves the property more prepared.</h2><p>Managers can review what was recorded, staff can recover earlier context, and future shifts begin with a clearer picture of the building’s operation.</p></div></PageContainer></section>
  </div>;
}

const audiences = [
  ['Property managers', Building2, 'Turn building-specific expectations into a working system the team can follow. Review the activity the desk records without relying on scattered updates.', ['Define how the property operates', 'Keep procedures attached to daily work', 'Review shifts, incidents, and open items']],
  ['Residential communities', KeyRound, 'Keep the building’s practical knowledge with the building, even as employees, schedules, and coverage change.', ['Preserve building-specific knowledge', 'Create more consistent shift transitions', 'Maintain a useful operational record']],
  ['Concierge companies', Users, 'Give assigned staff a clearer path into a property’s operation without making one experienced employee the only source of truth.', ['Help coverage staff find property context', 'Support repeatable desk routines', 'Document what happened during the shift']],
  ['Front-desk and security vendors', ShieldCheck, 'Make property instructions and shift expectations easier for on-site teams to find and follow while they perform the work.', ['Access property-specific procedures', 'Carry open context between shifts', 'Record incidents and daily activity']],
  ['Property-management companies', Building2, 'Help each property retain its own operating knowledge and history. Noted’s current focus is the individual property—not unsupported portfolio administration.', ['Create a durable record at each property', 'Reduce dependence on informal memory', 'Give on-site managers a structured workspace']],
];

export function SolutionsPage() {
  return <div className="public-editorial"><Metadata {...pageMetadata.solutions} />
    <PageHero eyebrow="Solutions" aside="01 / By role" title="Different teams." accent="One property truth." thesis="Everyone who operates the desk needs the same building-specific context—even when their responsibilities are different." body="Noted keeps operating knowledge with the property, giving managers a way to define the work and on-site teams a clearer way to carry it out and document it." />
    <section className="audiences-section"><PageContainer><Chapter label="Who it serves" index="02 / Five perspectives" /><div className="audience-list">{audiences.map(([title, Icon, copy, points], i) => <article key={title}><div className="audience-index"><span>{String(i + 1).padStart(2, '0')}</span><Icon /></div><div><h2>{title}</h2><p>{copy}</p></div><ul>{points.map(point => <li key={point}><Check />{point}</li>)}</ul></article>)}</div></PageContainer></section>
    <section className="ownership-section"><PageContainer><div><Chapter label="Why ownership matters" /><h2>The employee changes. The building does not.</h2></div><div className="ownership-diagram"><div className="people-column"><span>Manager</span><span>Full-time staff</span><span>Coverage staff</span><span>Vendor team</span></div><ArrowRight /><div className="property-node"><Building2 /><small>PROPERTY-OWNED</small><strong>Knowledge<br />Procedures<br />History</strong></div><ArrowRight /><div className="outcome-column"><span>Clearer starts</span><span>Consistent work</span><span>Useful handoffs</span><span>Durable context</span></div></div></PageContainer></section>
    <section className="boundary-section"><PageContainer><div><Status /><h2>Purposefully grounded in the property operation.</h2><p>Noted currently focuses on property knowledge, front-desk work, documentation, handoffs, and operational history. This page does not promise enterprise administration, portfolio controls, compliance certification, or third-party integrations.</p><Link to="/product">Explore the product <ArrowRight /></Link></div></PageContainer></section>
  </div>;
}
