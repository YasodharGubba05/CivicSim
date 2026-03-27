import nodemailer from 'nodemailer';

/**
 * CivicSim Email Service
 *
 * Uses Nodemailer with any SMTP provider.
 * Configure via environment variables in .env:
 *
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=your@email.com
 *   EMAIL_PASS=your-app-password
 *   EMAIL_FROM="CivicSim <your@email.com>"
 *
 * For Gmail: enable 2FA and create an App Password.
 * For SendGrid: host=smtp.sendgrid.net, user=apikey, pass=<API_KEY>.
 */

const configured =
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS;

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: (process.env.EMAIL_PORT || '587') === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

export interface SimulationSummary {
  simulationName: string;
  policies: {
    incomeTaxRate: number;
    corporateTaxRate: number;
    minimumWage: number;
    subsidyPolicies: number;
    universalBasicIncome: number;
  };
  finalMetrics: {
    year: number;
    gdp: number;
    unemploymentRate: number;
    medianIncome: number;
    giniIndex: number;
  };
  simulationId: string;
}

function buildEmailHtml(s: SimulationSummary): string {
  const gdpK = (s.finalMetrics.gdp / 1000).toFixed(0);
  const uRate = (s.finalMetrics.unemploymentRate * 100).toFixed(1);
  const gini  = s.finalMetrics.giniIndex.toFixed(3);
  const income = s.finalMetrics.medianIncome.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="padding:24px 28px;border-bottom:1px solid #1f1f23;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;height:28px;background:#10b981;border-radius:6px;text-align:center;vertical-align:middle;font-size:14px;">⊞</td>
            <td style="padding-left:10px;font-size:15px;font-weight:600;color:#fafafa;">CivicSim</td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px;">
          <p style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#10b981;margin:0 0 8px;">Simulation Complete</p>
          <h1 style="font-size:20px;font-weight:700;color:#fafafa;margin:0 0 6px;letter-spacing:-.02em;">${s.simulationName}</h1>
          <p style="font-size:13px;color:#71717a;margin:0 0 24px;">Your policy simulation has finished. Here's a summary of the results.</p>

          <!-- Metrics -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="48%" style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#52525b;margin:0 0 6px;">Final GDP</p>
                <p style="font-size:22px;font-weight:700;color:#fafafa;margin:0;font-variant-numeric:tabular-nums;">$${gdpK}k</p>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#52525b;margin:0 0 6px;">Unemployment</p>
                <p style="font-size:22px;font-weight:700;color:#fafafa;margin:0;font-variant-numeric:tabular-nums;">${uRate}%</p>
              </td>
            </tr>
            <tr><td colspan="3" style="height:8px;"></td></tr>
            <tr>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#52525b;margin:0 0 6px;">Median Income</p>
                <p style="font-size:22px;font-weight:700;color:#fafafa;margin:0;font-variant-numeric:tabular-nums;">$${income}</p>
              </td>
              <td width="4%"></td>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#52525b;margin:0 0 6px;">Gini Index</p>
                <p style="font-size:22px;font-weight:700;color:#fafafa;margin:0;font-variant-numeric:tabular-nums;">${gini}</p>
              </td>
            </tr>
          </table>

          <!-- Policy summary -->
          <p style="font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#52525b;margin:0 0 10px;">Policy Configuration</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${[
              ['Income Tax',       `${(s.policies.incomeTaxRate * 100).toFixed(0)}%`],
              ['Corporate Tax',    `${(s.policies.corporateTaxRate * 100).toFixed(0)}%`],
              ['Minimum Wage',     `$${s.policies.minimumWage}/hr`],
              ['UBI',              `$${s.policies.universalBasicIncome.toLocaleString()}/yr`],
              ['Subsidy Level',    `$${s.policies.subsidyPolicies.toLocaleString()}`],
            ].map(([k, v]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #1f1f23;font-size:13px;color:#71717a;">${k}</td>
              <td style="padding:8px 0;border-bottom:1px solid #1f1f23;font-size:13px;color:#fafafa;font-weight:600;text-align:right;font-variant-numeric:tabular-nums;">${v}</td>
            </tr>`).join('')}
          </table>

          <p style="font-size:12px;color:#3f3f46;margin:0;">Simulation ID: ${s.simulationId}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 28px;border-top:1px solid #1f1f23;">
          <p style="font-size:11.5px;color:#3f3f46;margin:0;">© 2025 CivicSim · You're receiving this because you ran a simulation.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendSimulationCompleteEmail(
  toEmail: string,
  summary: SimulationSummary,
): Promise<void> {
  if (!transporter) {
    console.log('[email] Not configured — skipping email to', toEmail);
    return;
  }

  const finalYear = summary.finalMetrics.year;
  const gdpK = (summary.finalMetrics.gdp / 1000).toFixed(0);
  const uRate = (summary.finalMetrics.unemploymentRate * 100).toFixed(1);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `CivicSim <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `✅ Simulation complete: ${summary.simulationName} — GDP $${gdpK}k, Unemployment ${uRate}%`,
      html: buildEmailHtml(summary),
      text: `CivicSim — Simulation Complete\n\nName: ${summary.simulationName}\nYear: ${finalYear}\nGDP: $${gdpK}k\nUnemployment: ${uRate}%\nGini: ${summary.finalMetrics.giniIndex.toFixed(3)}\n\nSimulation ID: ${summary.simulationId}`,
    });
    console.log('[email] Sent simulation complete email to', toEmail);
  } catch (err) {
    console.error('[email] Failed to send:', err);
    // Non-fatal — don't throw, simulation result is already returned
  }
}
