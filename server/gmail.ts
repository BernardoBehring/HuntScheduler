// Gmail Integration for Request Approval Notifications
import { google } from 'googleapis';

let connectionSettings: any;

const emailTranslations: Record<string, {
  approvalSubject: string;
  approvalTitle: string;
  approvalGreeting: string;
  approvalMessage: string;
  approvalFooter: string;
  approvalReminder: string;
  rejectionSubject: string;
  rejectionTitle: string;
  rejectionGreeting: string;
  rejectionMessage: string;
  rejectionFooter: string;
  rejectionReminder: string;
  respawnLabel: string;
  timeSlotLabel: string;
  periodLabel: string;
  reasonLabel: string;
  automatedMessage: string;
}> = {
  en: {
    approvalSubject: 'Hunt Request Approved',
    approvalTitle: 'Hunt Request Approved!',
    approvalGreeting: 'Hello',
    approvalMessage: 'Great news! Your hunt request has been approved.',
    approvalFooter: 'Make sure to be online and ready for your hunt session!',
    approvalReminder: '',
    rejectionSubject: 'Hunt Request Update',
    rejectionTitle: 'Hunt Request Not Approved',
    rejectionGreeting: 'Hello',
    rejectionMessage: 'Unfortunately, your hunt request could not be approved at this time.',
    rejectionFooter: 'Feel free to submit another request for a different time slot.',
    rejectionReminder: '',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Time Slot',
    periodLabel: 'Period',
    reasonLabel: 'Reason',
    automatedMessage: 'This is an automated message from GuildHall Hunt Schedule Manager.'
  },
  pt: {
    approvalSubject: 'Pedido de Hunt Aprovado',
    approvalTitle: 'Pedido de Hunt Aprovado!',
    approvalGreeting: 'Olá',
    approvalMessage: 'Ótimas notícias! Seu pedido de hunt foi aprovado.',
    approvalFooter: 'Certifique-se de estar online e pronto para sua sessão de hunt!',
    approvalReminder: '',
    rejectionSubject: 'Atualização do Pedido de Hunt',
    rejectionTitle: 'Pedido de Hunt Não Aprovado',
    rejectionGreeting: 'Olá',
    rejectionMessage: 'Infelizmente, seu pedido de hunt não pôde ser aprovado neste momento.',
    rejectionFooter: 'Sinta-se à vontade para enviar outro pedido para um horário diferente.',
    rejectionReminder: '',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Horário',
    periodLabel: 'Período',
    reasonLabel: 'Motivo',
    automatedMessage: 'Esta é uma mensagem automática do GuildHall Hunt Schedule Manager.'
  },
  es: {
    approvalSubject: 'Solicitud de Caza Aprobada',
    approvalTitle: '¡Solicitud de Caza Aprobada!',
    approvalGreeting: 'Hola',
    approvalMessage: '¡Buenas noticias! Tu solicitud de caza ha sido aprobada.',
    approvalFooter: '¡Asegúrate de estar en línea y listo para tu sesión de caza!',
    approvalReminder: '',
    rejectionSubject: 'Actualización de Solicitud de Caza',
    rejectionTitle: 'Solicitud de Caza No Aprobada',
    rejectionGreeting: 'Hola',
    rejectionMessage: 'Desafortunadamente, tu solicitud de caza no pudo ser aprobada en este momento.',
    rejectionFooter: 'No dudes en enviar otra solicitud para un horario diferente.',
    rejectionReminder: '',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Horario',
    periodLabel: 'Período',
    reasonLabel: 'Motivo',
    automatedMessage: 'Este es un mensaje automático de GuildHall Hunt Schedule Manager.'
  },
  de: {
    approvalSubject: 'Jagdanfrage Genehmigt',
    approvalTitle: 'Jagdanfrage Genehmigt!',
    approvalGreeting: 'Hallo',
    approvalMessage: 'Gute Nachrichten! Deine Jagdanfrage wurde genehmigt.',
    approvalFooter: 'Stelle sicher, dass du online und bereit für deine Jagdsitzung bist!',
    approvalReminder: '',
    rejectionSubject: 'Jagdanfrage Aktualisierung',
    rejectionTitle: 'Jagdanfrage Nicht Genehmigt',
    rejectionGreeting: 'Hallo',
    rejectionMessage: 'Leider konnte deine Jagdanfrage zu diesem Zeitpunkt nicht genehmigt werden.',
    rejectionFooter: 'Du kannst gerne eine neue Anfrage für einen anderen Zeitslot einreichen.',
    rejectionReminder: '',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Zeitfenster',
    periodLabel: 'Zeitraum',
    reasonLabel: 'Grund',
    automatedMessage: 'Dies ist eine automatische Nachricht vom GuildHall Hunt Schedule Manager.'
  },
  pl: {
    approvalSubject: 'Prośba o Polowanie Zatwierdzona',
    approvalTitle: 'Prośba o Polowanie Zatwierdzona!',
    approvalGreeting: 'Cześć',
    approvalMessage: 'Świetne wiadomości! Twoja prośba o polowanie została zatwierdzona.',
    approvalFooter: 'Upewnij się, że będziesz online i gotowy na sesję polowania!',
    approvalReminder: '',
    rejectionSubject: 'Aktualizacja Prośby o Polowanie',
    rejectionTitle: 'Prośba o Polowanie Niezatwierdzona',
    rejectionGreeting: 'Cześć',
    rejectionMessage: 'Niestety, Twoja prośba o polowanie nie mogła zostać zatwierdzona w tym momencie.',
    rejectionFooter: 'Możesz wysłać kolejną prośbę na inny przedział czasowy.',
    rejectionReminder: '',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Przedział czasowy',
    periodLabel: 'Okres',
    reasonLabel: 'Powód',
    automatedMessage: 'To jest automatyczna wiadomość z GuildHall Hunt Schedule Manager.'
  }
};

function getTranslation(language?: string) {
  const lang = language?.toLowerCase().substring(0, 2) || 'en';
  return emailTranslations[lang] || emailTranslations['en'];
}

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createEmailMessage(to: string, subject: string, body: string): string {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ];
  const message = messageParts.join('\n');
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendRequestApprovalEmail(
  userEmail: string,
  userName: string,
  respawnName: string,
  slotTime: string,
  periodName: string,
  language?: string
): Promise<boolean> {
  try {
    if (!userEmail) {
      console.log('No email provided for user, skipping email notification');
      return false;
    }

    const gmail = await getUncachableGmailClient();
    const t = getTranslation(language);
    
    const subject = `${t.approvalSubject} - ${respawnName}`;
    const body = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 30px; border-radius: 10px;">
        <h1 style="color: #d4af37; margin-bottom: 20px; font-family: serif;">GuildHall</h1>
        <h2 style="color: #d4af37; margin-bottom: 15px;">${t.approvalTitle}</h2>
        <p>${t.approvalGreeting} <strong>${userName}</strong>,</p>
        <p>${t.approvalMessage}</p>
        <div style="background: #252542; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <p style="margin: 5px 0;"><strong>${t.respawnLabel}:</strong> ${respawnName}</p>
          <p style="margin: 5px 0;"><strong>${t.timeSlotLabel}:</strong> ${slotTime}</p>
          <p style="margin: 5px 0;"><strong>${t.periodLabel}:</strong> ${periodName}</p>
        </div>
        <p>${t.approvalFooter}</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">${t.automatedMessage}</p>
      </div>
    `;

    const encodedMessage = createEmailMessage(userEmail, subject, body);
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`Email sent successfully to ${userEmail} in language: ${language || 'en'}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendRequestRejectionEmail(
  userEmail: string,
  userName: string,
  respawnName: string,
  slotTime: string,
  periodName: string,
  rejectionReason?: string,
  language?: string
): Promise<boolean> {
  try {
    if (!userEmail) {
      console.log('No email provided for user, skipping email notification');
      return false;
    }

    const gmail = await getUncachableGmailClient();
    const t = getTranslation(language);
    
    const subject = `${t.rejectionSubject} - ${respawnName}`;
    const body = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 30px; border-radius: 10px;">
        <h1 style="color: #d4af37; margin-bottom: 20px; font-family: serif;">GuildHall</h1>
        <h2 style="color: #c9302c; margin-bottom: 15px;">${t.rejectionTitle}</h2>
        <p>${t.rejectionGreeting} <strong>${userName}</strong>,</p>
        <p>${t.rejectionMessage}</p>
        <div style="background: #252542; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c9302c;">
          <p style="margin: 5px 0;"><strong>${t.respawnLabel}:</strong> ${respawnName}</p>
          <p style="margin: 5px 0;"><strong>${t.timeSlotLabel}:</strong> ${slotTime}</p>
          <p style="margin: 5px 0;"><strong>${t.periodLabel}:</strong> ${periodName}</p>
          ${rejectionReason ? `<p style="margin: 10px 0 5px 0;"><strong>${t.reasonLabel}:</strong> ${rejectionReason}</p>` : ''}
        </div>
        <p>${t.rejectionFooter}</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">${t.automatedMessage}</p>
      </div>
    `;

    const encodedMessage = createEmailMessage(userEmail, subject, body);
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`Rejection email sent successfully to ${userEmail} in language: ${language || 'en'}`);
    return true;
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return false;
  }
}
