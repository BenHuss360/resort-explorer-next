import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'WanderNest <noreply@fileseal.uk>',
      to: 'ben@immersi.co.uk',
      replyTo: email,
      subject: `WanderNest Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
