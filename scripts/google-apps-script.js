/**
 * Google Apps Script Webhook Handler for OpenSTEM Replicate
 * Spreadsheet: "OpenSTEM Replicate — Research Submissions"
 * Spreadsheet ID: 12lgsA1gCiG0yZJ6sEkoZwEqPMtc37OoVJVEzz_vDz0A
 * Target Email: shahriyarkarimsiam@gmail.com
 *
 * Setup Instructions:
 * 1. Open your brand new Google Sheet:
 *    https://docs.google.com/spreadsheets/d/12lgsA1gCiG0yZJ6sEkoZwEqPMtc37OoVJVEzz_vDz0A/edit
 * 2. In the top menu, click "Extensions" -> "Apps Script"
 *    (or open directly: https://script.google.com/d/12lgsA1gCiG0yZJ6sEkoZwEqPMtc37OoVJVEzz_vDz0A/edit)
 * 3. Delete any default code in the editor, and paste this entire file.
 * 4. Click the Save icon (💾).
 * 5. In the top right, click "Deploy" -> "New deployment"
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: "OpenSTEM Replicate Research Collector"
 *    - Execute as: "Me (trade09siam@gmail.com)"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy". Authorize permissions once when prompted.
 * 7. Copy the generated Web App URL (/exec).
 */

var SPREADSHEET_ID = "12lgsA1gCiG0yZJ6sEkoZwEqPMtc37OoVJVEzz_vDz0A";
var NOTIFICATION_EMAIL = "shahriyarkarimsiam@gmail.com";

function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(raw);
    var ss = getSpreadsheet();
    var sheetName = "Research Submissions";
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var headers = [
        "Timestamp",
        "Full Name",
        "Email Address",
        "Institution",
        "Country",
        "Paper Title",
        "DOI / Research URL",
        "Discipline",
        "Why Feature (Relevance & Evidence)",
        "Attachment Name",
        "Permission Confirmed",
        "Status"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef7f4").setFontColor("#07373b");
      sheet.setFrozenRows(1);
    }

    // Send styled notification email to Siam
    var subject = "📄 [OpenSTEM Replicate] New Research Submission: " + (data.paper_title || "Untitled Paper") + " (" + (data.discipline || "STEM") + ")";
    var htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 650px; border: 1px solid #d1e5e0; padding: 26px; border-radius: 12px; background: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #067f80; padding-bottom: 12px; margin-bottom: 18px;">
          <h2 style="color: #07373b; margin: 0; font-size: 20px;">New STEM Research Submission</h2>
          <span style="background: #e6f3ee; color: #086b6a; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${data.discipline || 'STEM'}</span>
        </div>
        
        <p style="font-size: 14px; color: #4b5563; margin-top: 0;">A new peer-reviewed paper or preprint proposal was submitted for editorial review on <strong>openstemreplicate.org</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px;">
          <tr style="background: #f8fbfa;">
            <td style="padding: 10px 12px; font-weight: bold; width: 32%; border-bottom: 1px solid #e5e7eb; color: #07373b;">Full Name:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.name || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">Email Address:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.email}" style="color: #067f80; font-weight: bold;">${data.email || 'N/A'}</a></td>
          </tr>
          <tr style="background: #f8fbfa;">
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">Institution:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.institution || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">Country:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.country || 'N/A'}</td>
          </tr>
          <tr style="background: #f8fbfa;">
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">Paper Title:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${data.paper_title || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">DOI / Original URL:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;"><a href="${data.source_url}" target="_blank" style="color: #067f80; word-break: break-all; font-weight: 600;">${data.source_url || 'N/A'} ↗</a></td>
          </tr>
          <tr style="background: #f8fbfa;">
            <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #07373b;">Attachment:</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.attachment_name || 'None attached'}</td>
          </tr>
        </table>

        <div style="background: #f0f7f5; border-left: 4px solid #067f80; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
          <strong style="color: #07373b; display: block; margin-bottom: 6px;">Why should OpenSTEM feature this research? (Author's Rationale):</strong>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #374151;">"${data.reason || 'No description provided'}"</p>
        </div>

        <div style="font-size: 12px; color: #6b7280; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
          ✓ Recorded in Google Sheet: <strong>OpenSTEM Replicate — Research Submissions</strong> (Tab: <strong>Research Submissions</strong>)
        </div>
      </div>
    `;

    var mailOptions = {
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      replyTo: data.email || NOTIFICATION_EMAIL
    };

    if (data.fileBase64 && data.fileName) {
      try {
        var blob = Utilities.newBlob(Utilities.base64Decode(data.fileBase64), data.fileType || "application/pdf", data.fileName);
        mailOptions.attachments = [blob];
      } catch (attErr) {}
    }

    var emailStatus = "Delivered to " + NOTIFICATION_EMAIL;
    var emailErrorDetails = null;
    try {
      MailApp.sendEmail(mailOptions);
    } catch (e1) {
      try {
        GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, "", {
          htmlBody: htmlBody,
          replyTo: data.email || NOTIFICATION_EMAIL
        });
      } catch (e2) {
        emailStatus = "Auth Required (" + (e1.message || e1.toString()) + ")";
        emailErrorDetails = e1.toString() + " | " + e2.toString();
      }
    }

    var timestamp = new Date();
    var row = [
      timestamp,
      data.name || "",
      data.email || "",
      data.institution || "",
      data.country || "",
      data.paper_title || "",
      data.source_url || "",
      data.discipline || "",
      data.reason || "",
      data.attachment_name || "None",
      data.permission_confirmed ? "Yes" : "No",
      emailStatus
    ];
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      emailStatus: emailStatus,
      emailRecipient: NOTIFICATION_EMAIL,
      errorDetails: emailErrorDetails,
      message: "Research submission logged to Google Sheet and processed for " + NOTIFICATION_EMAIL,
      spreadsheetId: SPREADSHEET_ID,
      sheet: "Research Submissions"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function testSendEmail() {
  var email = NOTIFICATION_EMAIL;
  var subject = "🧪 [OpenSTEM Replicate] Email Connection Test";
  var body = "Hello Siam,\n\nThis is a direct verification test from OpenSTEM Replicate Apps Script.\n\nYour email (" + email + ") is successfully connected with the research submission form!\n\nSubmissions from openstemreplicate.org/submit/ will land directly in this inbox.\n\nTime: " + new Date().toISOString();

  try {
    MailApp.sendEmail(email, subject, body);
    Logger.log("✓ Success: Test email sent via MailApp to " + email);
  } catch (err) {
    Logger.log("MailApp notice, trying GmailApp: " + err.toString());
    GmailApp.sendEmail(email, subject, body);
    Logger.log("✓ Success: Test email sent via GmailApp to " + email);
  }
}

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "OpenSTEM Replicate Form Collector",
    spreadsheet: "OpenSTEM Replicate — Research Submissions",
    spreadsheetId: SPREADSHEET_ID,
    notificationEmail: NOTIFICATION_EMAIL,
    ready: true
  })).setMimeType(ContentService.MimeType.JSON);
}
