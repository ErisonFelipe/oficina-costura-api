import nodemailer from 'nodemailer';
import { env } from '../config/env';
import type { Quote } from '@prisma/client';

const transporter =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

export async function sendQuoteNotification(quote: Quote) {
  if (!transporter || !env.EMAIL_TO) {
    console.log('📧 [DEV] Novo orçamento recebido:', {
      name: quote.name,
      email: quote.email,
      phone: quote.phone,
      service: quote.service,
      message: quote.message,
    });
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #C67B5C;">Novo Orçamento Recebido</h2>
      <p>Uma nova solicitação de orçamento chegou pelo site:</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Nome:</td><td>${quote.name}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">E-mail:</td><td>${quote.email}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Telefone:</td><td>${quote.phone || 'Não informado'}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Serviço:</td><td>${quote.service || 'Não especificado'}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Mensagem:</td><td>${quote.message}</td></tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: env.EMAIL_TO,
    subject: `Novo Orçamento — ${quote.name}`,
    html,
  });
}
