// Gmail Integration for Request Approval Notifications
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

interface EmailTranslations {
  approvalSubject: string;
  approvalTitle: string;
  approvalGreeting: string;
  approvalMessage: string;
  approvalFooter: string;
  rejectionSubject: string;
  rejectionTitle: string;
  rejectionMessage: string;
  rejectionFooter: string;
  respawnLabel: string;
  timeSlotLabel: string;
  periodLabel: string;
  reasonLabel: string;
  automatedMessage: string;
}

const translationsCache: Record<string, EmailTranslations> = {};

function loadTranslations(lang: string): EmailTranslations {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }

  const localesPath = path.join(process.cwd(), 'client', 'src', 'i18n', 'locales');
  const filePath = path.join(localesPath, `${lang}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.email) {
        translationsCache[lang] = parsed.email;
        return parsed.email;
      }
    }
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
  }

  if (lang !== 'en') {
    return loadTranslations('en');
  }

  return {
    approvalSubject: 'Hunt Request Approved',
    approvalTitle: 'Hunt Request Approved!',
    approvalGreeting: 'Hello',
    approvalMessage: 'Great news! Your hunt request has been approved.',
    approvalFooter: 'Make sure to be online and ready for your hunt session!',
    rejectionSubject: 'Hunt Request Update',
    rejectionTitle: 'Hunt Request Not Approved',
    rejectionMessage: 'Unfortunately, your hunt request could not be approved at this time.',
    rejectionFooter: 'Feel free to submit another request for a different time slot.',
    respawnLabel: 'Respawn',
    timeSlotLabel: 'Time Slot',
    periodLabel: 'Period',
    reasonLabel: 'Reason',
    automatedMessage: 'This is an automated message from GuildHall Hunt Schedule Manager.'
  };
}

function getTranslation(language?: string): EmailTranslations {
  const lang = language?.toLowerCase().substring(0, 2) || 'en';
  const supportedLangs = ['en', 'pt', 'es', 'de', 'pl'];
  const effectiveLang = supportedLangs.includes(lang) ? lang : 'en';
  return loadTranslations(effectiveLang);
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
        <p>${t.approvalGreeting} <strong>${userName}</strong>,</p>
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
