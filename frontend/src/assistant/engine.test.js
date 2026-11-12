import { answer, nextQuestion, ready, readArea, startFlow, understand } from './engine';

const ctx = {
  role: 'concierge',
  residents: [{ resident_id: 'res_1', name: 'Maria Alvarez', unit: '524', phone: '555-2001' }, { resident_id: 'res_2', name: 'John Chen', unit: '312' }],
  requests: [], incidents: [], todayLog: [], team: [], handoff: null, followUps: [], now: Date.now(),
};

describe('understanding what the desk says', () => {
  test('a package for a resident by name finds the unit', () => {
    const r = understand('UPS dropped 2 packages for Maria', ctx);
    expect(r).toMatchObject({ kind: 'start', type: 'package' });
    expect(r.fields).toMatchObject({ unit: '524', carrier: 'UPS' });
  });

  test('an emergency always comes first', () => {
    expect(understand('someone collapsed in the lobby', ctx).kind).toBe('emergency');
    expect(understand('there is a car parked in the fire lane', ctx).kind).not.toBe('emergency');
  });

  test('looking someone up', () => {
    const r = understand('who lives in 312', ctx);
    expect(r.kind).toBe('find');
    expect(r.things[0].name).toBe('John Chen');
  });

  test('a section name opens that section, and a handoff request starts the handoff', () => {
    expect(understand('open packages', ctx)).toMatchObject({ kind: 'open', open: 'packages' });
    expect(understand('draft my handoff', ctx)).toMatchObject({ kind: 'start', type: 'handoff' });
  });

  test('an incident keeps the place that was already said', () => {
    const r = understand("there's a water leak in the garage", ctx);
    expect(r).toMatchObject({ kind: 'start', type: 'incident' });
    expect(r.fields.location).toBe('Garage');
    expect(readArea('noise on the 4th floor hallway')).toBe('Hallway, floor 4');
  });

  test('things it cannot tell are left for the server', () => {
    expect(understand('what is the capital of France', ctx)).toBeNull();
  });
});

describe('guided entries', () => {
  test('a package asks only for what is missing, then is ready to save', () => {
    const flow = startFlow('package', { carrier: 'FedEx', count: '1' }, ctx);
    const q = nextQuestion(flow, ctx);
    expect(q.q.key).toBe('unit');
    expect(answer(flow, 'unit', 'bananas', ctx)).toBeTruthy();   // not a unit: asks again
    expect(answer(flow, 'unit', '312', ctx)).toBe('');
    expect(flow.f.resident).toBe('John Chen');
    let next; while ((next = nextQuestion(flow, ctx))) answer(flow, next.q.key, 'none', ctx);
    const card = ready(flow, ctx);
    expect(card.save.do).toBe('activity');
    expect(card.save.entry.title).toBe('Package delivery · FedEx → Unit 312');
    expect(card.save.entry.sourceSection).toBe('packages');
  });

  test('a manager request goes to a named concierge', () => {
    const mctx = { ...ctx, role: 'manager', team: [{ concierge_id: 'con_1', name: 'Casey Lee' }] };
    const r = understand('ask Casey to check the pool gate by 3pm', mctx);
    expect(r).toMatchObject({ kind: 'start', type: 'task' });
    const flow = startFlow('task', r.fields, mctx);
    let next; while ((next = nextQuestion(flow, mctx))) answer(flow, next.q.key, next.q.key === 'priority' ? 'Standard' : 'none', mctx);
    const card = ready(flow, mctx);
    expect(card.save).toMatchObject({ do: 'request' });
    expect(card.save.form).toMatchObject({ toId: 'con_1', dueTime: '15:00' });
  });
});
