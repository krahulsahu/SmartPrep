type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (process.env.NODE_ENV !== 'production') {
    console.info('[smartprep-email]', JSON.stringify(payload, null, 2));
  }

  return { delivered: true };
}
