# Submission form email delivery — activation required

Contact destination: **shahriyarkarimsiam@gmail.com**.

The website includes a plain HTML `<form>` with:

- `action="https://formsubmit.co/shahriyarkarimsiam@gmail.com"`
- `method="POST"` and `enctype="multipart/form-data"`
- real respondent name/email, paper title, DOI, STEM field, explanation, optional PDF attachment (< 10 MB), rights consent
- a nonvisible honeypot and standard human-verification flow from FormSubmit.

It does **not** store submissions in your site's source code and does **not** directly operate the Gmail API. FormSubmit acts as a third-party data processor that sends your form data to Gmail.

**Required setup after deployment:**

1. Open your published `/submit/` page and send a test submission with non-sensitive sample data. Submit to the production domain.
2. Open the activation message that FormSubmit sends to `shahriyarkarimsiam@gmail.com`. Click the confirmation/activation link. This is an action only the email-account owner can take.
3. Submit again from a second email address, ideally including a small permitted PDF. Confirm the name, DOI, message and attachment reach the mailbox. Check spam/junk if necessary.
4. On subsequent deliveries, respond manually and review editorial eligibility. A submission does NOT automatically appear on the website.
5. If FormSubmit or its data policy is unsuitable, replace the action URL with your own authenticated form backend and secure object storage. Gmail app passwords or API credentials must **never** be embedded in client HTML or JavaScript.

**Do not use this basic form to collect confidential unpublished papers, patient data, or sensitive participant records.**

Documentation: https://formsubmit.co/documentation (FormSubmit file limit 10 MB; first confirmation required). Retention, CAPTCHA, spam blocking and delivery depend on the provider.
