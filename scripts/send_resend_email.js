#!/usr/bin/env node
// Env required: RESEND_API_KEY
const [,, recipients, subject, body] = process.argv;
const  fs = require('fs');
if (!recipients) {
  console.error('Uso: node send_resend_email.js <comma_emails> <subject> <body>');
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('RESEND_API_KEY no está definido en el entorno');
  process.exit(2);
}

let  html = fs.readFileSync("./scripts/mail-template.html", "utf-8");
const isSuccess = process.env.BUILD_STATUS === 'SUCCESS';
const placeholders = {
    '{{project}}': process.env.JOB_NAME,
    '{{status}}': isSuccess ? 'Despliegue Exitoso' : 'Fallo en el Pipeline',
    '{{stage}}': process.env.STAGE_NAME || 'N/A',
    '{{buildId}}': process.env.BUILD_NUMBER,
    '{{color}}': isSuccess ? '#2ecc71' : '#e74c3c',
    '{{url}}': process.env.BUILD_URL,
    '{{commitMsg}}': 'Revisar logs para detalles del commit'
};
Object.keys(placeholders).forEach(key =>  {
    html = html.split(key).join(placeholders[key])
})

const to = recipients.split(',').map(s => s.trim()).filter(Boolean);
const payload = {
  from: 'alertas@angdev.tech',
  to,
  subject: `[${process.env.JOB_NAME}] Status: ${process.env.BUILD_STATUS}`,
  html: html
};
(async () => {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('Error enviando correo:', res.status, text);
      process.exit(3);
    }
    console.log('Correo enviado:', text);
  } catch (err) {
    console.error('Error:', err);
    process.exit(4);
  }
})();