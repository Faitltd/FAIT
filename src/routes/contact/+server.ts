import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'your_resend_api_key_here');

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, email, company, message } = await request.json();
    
    // Validate required fields
    if (!name || !email || !message) {
      return json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'FAIT Contact Form <onboarding@resend.dev>',
      to: ['admin@itsfait.com'],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    return json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return json({ error: 'Failed to send message' }, { status: 500 });
  }
};
