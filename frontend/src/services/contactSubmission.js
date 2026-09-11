export class ContactSubmissionError extends Error {
  constructor(message, code = 'SUBMISSION_FAILED') {
    super(message);
    this.name = 'ContactSubmissionError';
    this.code = code;
  }
}

export async function submitContactInquiry(payload, { signal } = {}) {
  const endpoint = process.env.REACT_APP_CONTACT_ENDPOINT?.trim();
  if (!endpoint) {
    await new Promise(resolve => setTimeout(resolve, 450));
    throw new ContactSubmissionError(
      'Online delivery is not connected yet. Your message has not been sent.',
      'ENDPOINT_NOT_CONFIGURED',
    );
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ContactSubmissionError('We could not reach the contact service. Your message has not been sent.');
  }

  if (!response.ok) {
    throw new ContactSubmissionError('The contact service could not accept your message. Please try again or email us directly.');
  }

  return { delivered: true };
}
