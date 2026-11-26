# Lakexplorer: Kadmat & Amini (Lakshadweep 3N/4D)

A static 3D itinerary website (HTML + CSS + JS, three.js from CDN). No build step.

## Files
- `index.html` page structure
- `style.css` design (light/dark aware)
- `content.js` ALL site text and contact details (this is what you publish)
- `app.js` renders content, enquiry buttons and the admin editor
- `scene.js` 3D lagoon background

## Deploy on GitHub Pages
1. Create a new GitHub repository and upload all files to the root.
2. Settings > Pages > Build and deployment > Deploy from a branch > `main` / `(root)` > Save.
3. After a minute the site is live at `https://<username>.github.io/<repo>/`.

## Edit the site (admin)
1. Open your site and click **Admin** in the footer (or add `#admin` to the URL). Log in.
2. Edit any text, add or remove days, routes, cards and list items. Under **Contact** set:
   phone, WhatsApp number (country code + number, e.g. 919XXXXXXXXX), email, Instagram handle, address.
   Empty contact fields stay hidden; the floating WhatsApp button appears once a number is set.
3. Click **Download content.js**, replace `content.js` in the repository and commit.
   Edits are only visible to every visitor after this step.
   **Save draft** keeps your edits in your own browser only.

## Security note
GitHub Pages is static hosting, so the admin login runs in the browser. The password is stored only as a salted PBKDF2 hash,
but anyone can read that hash and try to guess the password offline, and the login does not stop someone from editing `content.js` in the repo.
Real protection comes from GitHub itself: only collaborators can commit changes. Use a long password, and keep the repository's write access private.

Change the password: run
`node -e "console.log(require('crypto').pbkdf2Sync('NEW_PASSWORD','lakexplorer-v1',150000,32,'sha256').toString('hex'))"`
and paste the result into `PASS_HASH` at the top of `app.js`.
