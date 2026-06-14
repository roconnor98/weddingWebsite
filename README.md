# Wedding Website Template

A customisable, static wedding website template that uses Google Forms for RSVPs and AWS Amplify for hosting. This project is built with vanilla HTML, CSS, and JavaScript, making it lightweight and easy to modify.

## Features

- **Responsive Design**: Works on mobile and desktop.
- **Static Hosting**: Fast and cheap/free hosting on AWS Amplify.
- **Google Sheets Integration**: RSVPs are sent directly to a Google Sheet via a Google Form.
- **Auto-Reply Emails**: (Optional) specific Google Apps Script included to send confirmation emails with calendar invites to guests.
- **Configurable**: Most text and settings are managed via a single configuration file or environment variables.

---

## Getting Started

### Prerequisites

- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (VS Code extension) **or** [`serve`](https://github.com/vercel/serve) (`npm install -g serve`) for terminal-based local development
- A Google Account (for the RSVP form)
- An AWS Account (if hosting on Amplify)

### 1. Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/StartAutomating/weddingWebsite.git
    cd weddingWebsite
    ```

2.  **Create your local config:**
    Copy the code block below and create a file named `config.js` in yourroot directory. Fill in your specific details.

    ```javascript
    window.env = {
      // Content
      WEDDING_TITLE: "Jane & John",
      WEDDING_DATE: "28<sup>th</sup> of December 2026",
      WEDDING_INITIALS: "J & J",
      BRIDE_NAME: "Jane",       // Used in the FAQs contact question
      
      // Accommodation Page Content
      ACCOMM_ONSITE_INTRO: "Overview text for onsite options...",
      ACCOMM_DESC_1: "Description for option 1...",
      ACCOMM_DESC_2: "Description for option 2...",
      ACCOMM_DESC_3: "Description for option 3...",
      ACCOMM_TITLE_1: "Option 1 Title",
      ACCOMM_TITLE_2: "Option 2 Title",
      ACCOMM_TITLE_3: "Option 3 Title",
      
      ACCOMM_ALTERNATE_INTRO: "Overview for offsite options...",
      ACCOMM_ALT_TITLE_1: "Hotel A",
      ACCOMM_ALT_TITLE_2: "Hotel B",
      ACCOMM_ALT_TITLE_3: "Hotel C",
      ACCOMM_ALT_TITLE_4: "Hotel D",
      ACCOMM_ALT_TITLE_5: "Hotel E",
      ACCOMM_ALT_DESC_1: "Description for Hotel A...",
      ACCOMM_ALT_DESC_2: "Description for Hotel B...",
      ACCOMM_ALT_DESC_3: "Description for Hotel C...",
      ACCOMM_ALT_DESC_4: "Description for Hotel D...",
      ACCOMM_ALT_DESC_5: "Description for Hotel E...",
      
      // Accommodation Images (Relative paths)
      ACCOMM_IMG_1: "../assets/rooms/img-1.jpg",
      ACCOMM_IMG_2: "../assets/rooms/img-2.jpg",
      ACCOMM_IMG_3: "../assets/rooms/img-3.jpg",
      ACCOMM_ALT_IMG_1: "../assets/alternate-accomm/img-1.jpg",
      ACCOMM_ALT_IMG_2: "../assets/alternate-accomm/img-2.jpg",
      ACCOMM_ALT_IMG_3: "../assets/alternate-accomm/img-3.jpg",
      ACCOMM_ALT_IMG_4: "../assets/alternate-accomm/img-4.jpg",
      ACCOMM_ALT_IMG_5: "../assets/alternate-accomm/img-5.jpg",

      // Alternate Accommodation Contact Info
      ACCOMM_ALT_1_TEL: "0123456789",
      ACCOMM_ALT_1_EMAIL: "info@hotel-a.com",
      ACCOMM_ALT_1_WEB: "https://www.hotel-a.com/",
      ACCOMM_ALT_2_TEL: "0123456789",
      ACCOMM_ALT_2_EMAIL: "info@hotel-b.com",
      ACCOMM_ALT_2_WEB: "https://www.hotel-b.com/",
      ACCOMM_ALT_3_TEL: "0123456789",
      ACCOMM_ALT_3_EMAIL: "info@hotel-b.com",
      ACCOMM_ALT_3_WEB: "https://www.hotel-b.com/",
      ACCOMM_ALT_4_TEL: "0123456789",
      ACCOMM_ALT_4_EMAIL: "info@hotel-b.com",
      ACCOMM_ALT_4_WEB: "https://www.hotel-b.com/",
      ACCOMM_ALT_5_TEL: "0123456789",
      ACCOMM_ALT_5_EMAIL: "info@hotel-e.com",
      ACCOMM_ALT_5_WEB: "https://www.hotel-e.com/",
      
      // RSVP Configuration (See Section 2)
      RSVP_FORM_ACTION: "", 
      RSVP_ENTRY_EMAIL: "",
      RSVP_ENTRY_NAME: "",
      RSVP_ENTRY_ATTENDANCE: "",
      RSVP_ENTRY_ACCOMMODATION: "",
      
      // Location Links
      CEREMONY_LOCATION_NAME: "St. Mary's Church",
      CEREMONY_LOCATION_MAP_URL: "https://maps.google.com/...",
      RECEPTION_LOCATION_NAME: "Grand Hotel",
      RECEPTION_LOCATION_MAP_URL: "https://maps.google.com/..."
    };
    ```

3.  **Run Locally:**
    - **VS Code**: Open `index.html` with **Live Server** (Right-click -> Open with Live Server).
    - **Terminal (e.g. Neovim)**: Run `serve` from the project root:
      ```bash
      serve .
      ```
      Then open the URL printed in the terminal (default: `http://localhost:3000`).

---

## Asset Hosting (S3 & Redirects)

To keep the repository light and ensure fast loading times for images (backgrounds, room photos, etc.), this project is configured to serve assets from an AWS S3 bucket using Amplify's rewrite rules.

### 1. Why use S3?
Storing large image files in Git can bloat the repository. By hosting them on S3 and rewriting the URLs using Amplify, we can keep the code clean and leverage S3's durability and performance.

### 2. Setup S3 Bucket
1.  **Create an S3 Bucket** in your AWS Console (e.g., `my-wedding-assets`).
2.  **Uncheck "Block all public access"** (unless you are configuring CloudFront OAI or similar measures, but for this simple setup, allowing public read is usually required).
3.  **Add a Bucket Policy** to allow public read access to objects:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            }
        ]
    }
    ```
    *Replace `YOUR-BUCKET-NAME` with your actual bucket name.*

### 3. Upload Assets
1.  Navigate to the `assets/` folder in this repository.
2.  Upload the **contents** of this folder to the **root** of your S3 bucket.
    *   Example: `assets/backgrounds/home.jpg` should be uploaded so it is accessible at `https://YOUR-BUCKET.s3.REGION.amazonaws.com/backgrounds/home.jpg`.

### 4. Configure Redirects
The `redirects.yml` file handles the mapping from your domain to the S3 bucket.

1.  Open `redirects.yml`.
2.  Update the target URL with your S3 bucket URL:
    ```yaml
    [
      {
        "source": "/assets/<*>",
        "status": "200",
        "target": "https://YOUR-BUCKET-NAME.s3.YOUR-REGION.amazonaws.com/<*>"
      },
      {
        "source": "/<*>",
        "status": "404-200",
        "target": "/index.html"
      }
    ]
    ```
    *   **Source**: Any request starting with `/assets/`.
    *   **Target**: The corresponding file in your S3 bucket.
    *   **Status**: `200` (Rewrite) - This means the user sees `yourdomain.com/assets/image.jpg` but Amplify serves the content from S3 behind the scenes.

3.  **Push changes to GitHub**. AWS Amplify automatically uses `redirects.yml` to configure these rules.

---

## Setting up the RSVP System

This site uses a "hacked" Google Form submission to handle RSVPs without a backend server.

1.  **Create a Google Form:**
    - Create a new blank form.
    - Add questions for:
        - **Name** (Short Answer)
        - **Email** (Short Answer)
        - **Will you be attending?** (Multiple Choice: "Yes, I'll be there", "Sorry, can't make it")
        - **Accommodation required?** (Multiple Choice: "Yes", "No")

2.  **Get the Form Action URL:**
    - View the live form (click the "Eye" icon).
    - Inspect the page source or use developer tools.
    - Find the `<form>` tag.
    - Copy the `action` attribute URL. It looks like: `https://docs.google.com/forms/d/e/..../formResponse`.
    - Paste this into `RSVP_FORM_ACTION` in your `config.js`.

3.  **Get the Input IDs:**
    - In the same source code (or using "Get pre-filled link"), find the `name` attributes for your input fields. They look like `entry.123456789`.
    - Map these IDs to the corresponding keys in `config.js`:
        - `RSVP_ENTRY_NAME` -> `entry.1234...` (Name field)
        - `RSVP_ENTRY_EMAIL` -> `entry.5678...` (Email field)
        - `RSVP_ENTRY_ATTENDANCE` -> `entry.9012...` (Attendance dropdown/radio)
        - `RSVP_ENTRY_ACCOMMODATION` -> `entry.3456...` (Accommodation field)

### (Optional) Auto-Replies & Calendar Invites

The `Code.gs` file contains a Google Apps Script to send confirmation emails with `.ics` calendar files.

1.  Open your Google Sheet (where responses are stored).
2.  Go to **Extensions > Apps Script**.
3.  Copy the content of `Code.gs` into the script editor.
4.  Update the placeholders in the script (`{names}`, `{date-of-wedding}`, IDs, etc.) to match your details.
5.  Set up a **Trigger**:
    - Click the clock icon (Triggers).
    - Add Trigger -> `autoReply` -> Head -> From spreadsheet -> **On form submit**.

---

## Deployment (AWS Amplify)

This repo is configured for AWS Amplify, which builds the `config.js` file from environment variables during deployment.

1.  **Push your code** to GitHub.
2.  **Log in to AWS Console** and go to **AWS Amplify**.
3.  **New App** -> "Host web app" -> Select GitHub -> Select your repository.
4.  **Build Settings**: Amplify should automatically detect `amplify.yml`.
5.  **Environment Variables**:
    - You **MUST** add every key from your `config.js` as an Environment Variable in the Amplify console.
    - *Note: Amplify handles the injection of these variables into the `config.js` file via the build commands defined in `amplify.yml`.*

---

## Custom Domain (LetsHost + AWS Amplify)

If your domain is registered with [LetsHost](https://www.letshost.ie), follow these steps to point it at your Amplify app.

### 1. Register a domain with LetsHost

1. Go to [letshost.ie](https://www.letshost.ie) and search for your desired domain name.
2. Add it to your cart and complete the purchase (you'll need to create a LetsHost account if you don't have one).
3. Once registered, your domain will appear under **My Account > My Domains**.

### 2. Add your domain in Amplify

1. In the AWS Amplify console, open your app and go to **App settings > Domain management**.
2. Click **Add domain** and enter your domain (e.g. `yourdomain.ie`).
3. Amplify will show you a list of **CNAME records** (and possibly an ANAME/root record) to add at your registrar.

### 3. Add the DNS records in LetsHost

1. Log in to [LetsHost](https://www.letshost.ie) and go to **My Account > My Domains**.
2. Click **Manage DNS** (or **DNS Zone Editor**) for your domain.
3. Add each record Amplify asks for:
   - **Subdomain (e.g. `www`)**: Add a `CNAME` record pointing to the Amplify URL shown (e.g. `xxxxx.cloudfront.net`).
   - **Root domain (e.g. `@`)**: LetsHost supports `ALIAS`/`ANAME` records — add one pointing to the same Amplify CloudFront URL. If only `A` records are available for the root, use Amplify's IP or set up a redirect from the root to `www`.
4. Save changes. DNS propagation typically takes a few minutes to a few hours.

### 4. Verify in Amplify

Once DNS has propagated, Amplify will automatically verify ownership and provision an SSL certificate via ACM. The domain status will change to **Active**.

---



### Code Review
- I've tried to do a thorough job of commenting each line/section of code, if you do not understand anything first look
in the main file e.g. if there is something unexplained in `/accommodation/index.html` check `index.html`.

### Images
- Create an `assets` directory and upload images there.
- Ensure filenames match or update the references in the CSS files (`index.css`, `accommodation.css`, etc.).

### Favicon
To recreate the favicon SVG file, run the following PowerShell command:

```powershell
New-Item -Path "assets\favicon.svg" -ItemType File -Value "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;display=swap'); text { font-family: 'Playfair Display', serif; fill: #AD974F; font-weight: 700; font-size: 24px; dominant-baseline: central; text-anchor: middle; }</style><rect width='100%' height='100%' fill='transparent'/><text x='50%' y='50%'>{first-initial}&amp;{second-initial}</text></svg>" -Force
```

### Styling
- `styles.css`: Global styles (fonts, colors).
- `index.css`: Homepage specific styles.
- Each section (`accommodation`, `rsvp`, etc.) has its own CSS file.

### Fonts
- The site currently uses fonts imported in `header.html` or CSS. You can change these in `index.html` or the respective CSS files.
