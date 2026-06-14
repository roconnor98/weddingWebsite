/**
 * @file Code.gs
 * @description Google Apps Script to handle RSVP form submissions.
 * It sends a confirmation email to the guest and attaches an ICS calendar invite.
 */

/**
 * Triggered when a form response is submitted.
 * Parses the response, generates an email <body>, creates an .ics file,
 * and sends an email to the guest.
 * 
 * @param {Object} e - The event object from the Google Form submission trigger.
 * @param {Object} e.values - An array of values from the submission.
 *                            Typically: [timestamp, email, attendance, name, accommodation, ...]
 */
function autoReply(e) {
  // Store the user's response (e.g., "Yes, I'll be there" or "No, can't make it")
  var response = e.values[2];
  
  // Store the user's name from the form submission
  var userName = e.values[3];
  
  // Store the user's email address to send the reply to
  var userEmail = e.values[1];
  
  // Store the accommodation preference (e.g., "Yes" or "No")
  var accommodation = e.values[4];

  // Define the subject line of the email
  var subject = "Thank you for your RSVP to {names}'s Wedding!";
  
  // Initialise an array to hold email attachments (like the calendar invite)
  var attachments = [];
  
  // Initialise a string variable for the HTML body of the email
  var htmlBody = "";
  
  // Define the sender name for the email
  var name = "{names}";

  // Check if the guest responded "Yes, I'll be there"
  if (response === "Yes, I'll be there") {
    
    // Check if the guest also requested on-site accommodation
    if (accommodation === "Yes") {
      // Construct the HTML body including a note about accommodation
      htmlBody = "<p>Dear " + userName + ",</p>" +
                  "<br>" +
                  "<p>Thank you for your RSVP. We are so looking forward to celebrating with you on the {date-of-wedding}!</p>" +
                  "<p>We will be in touch about on-site accommodation.</p>" +
                  "<br>" +
                  "<p>With love,</p>" +
                  "<p>{names}</p>";
    } else {
      // Construct the HTML body for a standard "Yes" RSVP without accommodation
      htmlBody = "<p>Dear " + userName + ",</p>" +
                  "<br>" +
                  "<p>Thank you for your RSVP. We are so looking forward to celebrating with you on the {date-of-wedding}!</p>" +
                  "<br>" +
                  "<p>With love,</p>" +
                  "<p>{names}</p>";
    }
    
    // --- CREATE CALENDAR INVITE (.ics) ---
    
    // Define the event start date in YYYYMMDD format
    var start = "{YYYMMDD}";
    
    // Define the event end date in YYYYMMDD format (usually start + 1 day for all-day events)
    var end = "{YYYMMDD+1}";
    
    // Define the title of the calendar event
    var eventTitle = "{names}'s Wedding";
    
    // Define the location of the event
    var location = "{wedding-location}";
    
    // Construct the ICS file content string
    // VCALENDAR/VEVENT structure required by calendar apps
    var icsString = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n" +
                    "DTSTART:" + start + "\n" +
                    "DTEND:" + end + "\n" +
                    "SUMMARY:" + eventTitle + "\n" +
                    "LOCATION:" + location + "\n" +
                    "DESCRIPTION:Looking forward to seeing you there!\n" +
                    "END:VEVENT\nEND:VCALENDAR";

    // Create a blob/attachment object for the ICS file
    // attachments.push adds this object to the attachments array
    attachments.push({
      fileName: "invite.ics",       // Filename as it appears in the email
      content: icsString,           // The ICS string data
      mimeType: "text/calendar"     // MIME type so email clients recognise it as a calendar file
    });

  } else {
    // Handle the case where the guest responded that they cannot attend
    htmlBody = "<p>Dear " + userName + ",</p>" +
              "<br>" +
              "<p>Thank you for your RSVP. We are sorry you can't make it.</p>" +
              "<br>" +
              "<p>With love,</p>" +
              "<p>{names}</p>";
  }

  // Send the email using the MailApp service
  MailApp.sendEmail({
    to: userEmail,           // Recipient email
    subject: subject,        // Email subject
    htmlBody: htmlBody,      // Email body content (HTML)
    name: name,              // Sender name to display
    attachments: attachments // Array of attachments (empty if "No" response)
  });
}
