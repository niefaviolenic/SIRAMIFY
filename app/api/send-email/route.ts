import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, topic, message } = await request.json();

    // Konfigurasi Transporter Gmail
    // PENTING: Anda harus membuat App Password di akun Google Anda.
    // Caranya: Akun Google > Keamanan > Verifikasi 2 Langkah > Sandi Aplikasi (App Passwords)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'niefaviolenic14@gmail.com', // Email pengirim (milik Anda)
        pass: process.env.GMAIL_APP_PASSWORD, // App Password dari Google
      },
    });

    // Konfigurasi Email
    const mailOptions = {
      from: `"Siramify Contact" <niefaviolenic14@gmail.com>`, // Pengirim
      to: 'niefaviolenic14@gmail.com', // Penerima (Anda sendiri)
      replyTo: email, // Agar jika di-reply langsung ke email pengisi form
      subject: `[Siramify] Pesan Baru: ${topic}`,
      text: `
        Nama: ${firstName} ${lastName}
        Email: ${email}
        Topik: ${topic}
        
        Pesan:
        ${message}
      `,
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <img src="https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png" alt="Siramify Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h3>Pesan Baru dari Website Siramify</h3>
        <p><strong>Nama:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Topik:</strong> ${topic}</p>
        <hr/>
        <p><strong>Pesan:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    };

    // Kirim Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
