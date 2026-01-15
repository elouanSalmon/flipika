# 🚀 Quick Start - Google Slides API Spike

## 📋 Prerequisites

- Google Cloud Project
- OAuth 2.0 Client ID
- Node.js & npm

---

## ⚡ Installation (5 minutes)

### 1. Install Dependencies

```bash
npm install @react-oauth/google gapi-script
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select project "Flipika"
3. Enable APIs:
   - Google Slides API
   - Google Drive API
4. Configure OAuth Consent Screen:
   - App name: **Flipika**
   - User support email: your@email.com
   - Developer contact: your@email.com
5. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **Flipika Dev**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback`

### 3. Configure Environment

Create or update `.env.development`:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**⚠️ Important:** Replace `your_client_id_here` with your actual Client ID from Google Cloud Console.

---

## 🧪 Run Spike

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Open Spike Dashboard

Navigate to: **http://localhost:5173/app/spike/google-slides**

### 3. Run POCs

Follow the on-screen instructions:

1. **POC 1:** Click "Sign in with Google"
   - ✅ OAuth popup should open
   - ✅ Grant permissions
   - ✅ Token displayed

2. **POC 2:** Click "Create Presentation"
   - ✅ Presentation created in Google Drive
   - ✅ Click "Open in Google Slides" to verify

---

## 📊 Expected Results

### ✅ Success Criteria

- [ ] OAuth flow works smoothly
- [ ] Access token received and stored
- [ ] Presentation created in < 5 seconds
- [ ] Presentation opens in Google Slides
- [ ] No errors in console

### 📝 Document Results

Update `SPIKE_GOOGLE_SLIDES.md` with:
- ✅ What worked well
- ⚠️ Limitations discovered
- 🔴 Blockers (if any)
- 💡 Recommendations

---

## 🐛 Troubleshooting

### Error: "VITE_GOOGLE_CLIENT_ID not found"

**Solution:** Add Client ID to `.env.development` and restart dev server.

### Error: "redirect_uri_mismatch"

**Solution:** Verify authorized redirect URIs in Google Cloud Console match exactly:
- `http://localhost:5173/auth/callback`

### Error: "Access blocked: This app's request is invalid"

**Solution:** 
1. Check OAuth Consent Screen is configured
2. Add your email to test users (if app is in testing mode)

---

## 📚 Next Steps

After completing Google Slides spike:

1. Run TipTap spike (see `SPIKE_TIPTAP.md`)
2. Compare results
3. Make Go/No-Go decision
4. Update `NEXT_STEPS.md`

---

## 🔗 Resources

- [SPIKE_GOOGLE_SLIDES.md](./SPIKE_GOOGLE_SLIDES.md) - Full documentation
- [Google Slides API Docs](https://developers.google.com/slides/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
