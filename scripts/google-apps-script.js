/**
 * Google Apps Script Webhook Handler for OpenSTEM Replicate & OpenSTEM Ecosystem
 * Spreadsheet: "Open stem form collecting"
 * Spreadsheet ID: 175S6D2hqI4q6mDwgoa1blreIATafYzQKq523A_VfBT8
 * Target Email: shahriyarkarimsiam@gmail.com
 *
 * Setup Instructions:
 * 1. Open your Google Sheet in Chrome:
 *    https://docs.google.com/spreadsheets/d/175S6D2hqI4q6mDwgoa1blreIATafYzQKq523A_VfBT8/edit
 * 2. In the top menu, click "Extensions" -> "Apps Script".
 * 3. Delete any default code in the editor, and paste this entire file.
 * 4. Click the Save icon (💾).
 * 5. In the top right, click "Deploy" -> "New deployment"
 *    - Click the gear icon next to "Select type" and select "Web app".
 *    - Description: "OpenSTEM Form Collector v2"
 *    - Execute as: "Me (trade09siam@gmail.com)"
 *    - Who has access: "Anyone" (crucial for web forms to submit without sign-in prompts).
 * 6. Click "Deploy". Authorize permissions if prompted.
 * 7. Copy the generated Web App URL (ends with /exec).
 */

var SPREADSHEET_ID = "175S6D2hqI4q6mDwgoa1blreIATafYzQKq523A_VfBT8";
var NOTIFICATION_EMAIL = "shahriyarkarimsiam@gmail.com";

function getTargetSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId() === SPREADSHEET_ID) {
      return active;
    }
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(raw);
    var ss = getTargetSpreadsheet();

    // =========================================================================
    // 1. Research Submission (OpenSTEM Replicate - /submit/)
    // =========================================================================
    if (data.action === "researchSubmission" || data.action === "paperSubmission" || data.paper_title) {
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
        "New Submission"
      ];
      sheet.appendRow(row);

      // Email notification directly to Siam
      var subject = "📄 [OpenSTEM Replicate] New Research Submission: " + (data.paper_title || "Untitled Paper") + " (" + (data.discipline || "STEM") + ")";
      var html = `
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

          <div style="font-size: 12px; color: #6b7280; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between;">
            <span>✓ Logged to Google Sheet: <strong>Open stem form collecting</strong> (Tab: <strong>Research Submissions</strong>)</span>
          </div>
        </div>
      `;

      var mailOptions = {
        to: NOTIFICATION_EMAIL,
        subject: subject,
        htmlBody: html,
        replyTo: data.email || NOTIFICATION_EMAIL
      };

      if (data.fileBase64 && data.fileName) {
        try {
          var blob = Utilities.newBlob(Utilities.base64Decode(data.fileBase64), data.fileType || "application/pdf", data.fileName);
          mailOptions.attachments = [blob];
        } catch (attErr) {}
      }

      try {
        MailApp.sendEmail(mailOptions);
      } catch (mailErr) {}

      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Research submission logged to Google Sheet and emailed to " + NOTIFICATION_EMAIL,
        sheet: "Research Submissions"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 2. Mentorship Application (OpenStemField - openstemfield.org)
    // =========================================================================
    if (data.action === "mentorshipApplication") {
      var mSheetName = "Mentorship Applications";
      var mSheet = ss.getSheetByName(mSheetName);

      if (!mSheet) {
        mSheet = ss.insertSheet(mSheetName);
        var mHeaders = [
          "Timestamp",
          "Full Name",
          "Country & Target",
          "Email",
          "Phone / WhatsApp",
          "Department / Field",
          "CGPA",
          "Test Scores (IELTS/GRE)",
          "Message / Quote",
          "Status"
        ];
        mSheet.appendRow(mHeaders);
        mSheet.getRange(1, 1, 1, mHeaders.length).setFontWeight("bold").setBackground("#eef4ec");
        mSheet.setFrozenRows(1);
      }

      var rawPhone = String(data.phone || "").trim();
      var safePhone = (rawPhone.startsWith("+") || rawPhone.startsWith("=")) ? "'" + rawPhone : rawPhone;

      var mRow = [
        new Date(),
        data.name || "",
        data.country || "",
        data.email || "",
        safePhone,
        data.department || "",
        data.cgpa || "",
        data.test_scores || "",
        data.message || "",
        "New Application"
      ];
      mSheet.appendRow(mRow);

      var mSubject = "🎓 [OpenStemField] New Mentorship Application: " + (data.name || "Student") + " (" + (data.department || "STEM") + ")";
      var mHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 620px; border: 1px solid #c9d8c4; padding: 24px; border-radius: 8px; background: #ffffff;">
          <h2 style="color: #123b2a; margin-top: 0; border-bottom: 2px solid #123b2a; padding-bottom: 10px;">New Mentorship Application Received</h2>
          <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
          <p><strong>Country / Target:</strong> ${data.country || 'N/A'}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email || 'N/A'}</a></p>
          <p><strong>Phone / WhatsApp:</strong> ${data.phone || 'N/A'}</p>
          <p><strong>Department:</strong> ${data.department || 'N/A'}</p>
          <p><strong>CGPA:</strong> ${data.cgpa || 'N/A'}</p>
          <p><strong>Test Scores:</strong> ${data.test_scores || 'N/A'}</p>
          <p><strong>Message:</strong> "${data.message || 'N/A'}"</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #777;">Recorded into Google Sheet (tab: Mentorship Applications).</small>
        </div>
      `;

      try {
        MailApp.sendEmail({
          to: NOTIFICATION_EMAIL,
          subject: mSubject,
          htmlBody: mHtml,
          replyTo: data.email || NOTIFICATION_EMAIL
        });
      } catch (mMailErr) {}

      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Mentorship application logged to Google Sheet and emailed to " + NOTIFICATION_EMAIL,
        sheet: "Mentorship Applications"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unrecognized action: " + data.action
    })).setMimeType(ContentService.MimeType.JSON);

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
    service: "OpenSTEM Master Form Collector",
    spreadsheet: "Open stem form collecting",
    spreadsheetId: SPREADSHEET_ID,
    notificationEmail: NOTIFICATION_EMAIL,
    ready: true
  })).setMimeType(ContentService.MimeType.JSON);
}
