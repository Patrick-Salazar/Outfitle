# Security Guidelines

## API Keys and Secrets

### Protected Files
All sensitive information is stored in `.env` file which is **automatically ignored by git**. This includes:

- Firebase API keys and configuration
- Google AI (Gemini) API keys
- Google Calendar API credentials
- Any other authentication tokens

### Setup for New Developers

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials** in `.env`:
   - Get Firebase credentials from [Firebase Console](https://console.firebase.google.com/)
   - Get Google AI key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get Calendar API credentials from [Google Cloud Console](https://console.cloud.google.com/)

3. **Never commit `.env`** to git. The `.gitignore` file prevents this automatically.

### What's Safe to Commit

✅ **Safe to commit:**
- `.env.example` - Template with placeholder values
- Configuration files without actual credentials
- Source code
- Documentation

❌ **Never commit:**
- `.env` - Contains real API keys
- Any file with actual credentials
- Service account keys
- OAuth tokens
- Private keys (*.key, *.pem, etc.)

### Security Checklist

Before pushing to GitHub:
- [ ] Verify `.env` is not tracked: `git status` should not show `.env`
- [ ] Check `.gitignore` includes `.env`
- [ ] Ensure `.env.example` only has placeholders
- [ ] No API keys in source code (use `import.meta.env.VITE_*` instead)

### If You Accidentally Commit Secrets

If you accidentally commit API keys:

1. **Immediately revoke/regenerate** the exposed keys in their respective consoles
2. **Remove from git history:**
   ```bash
   # For the last commit
   git reset --soft HEAD~1
   git reset HEAD .env
   git commit -c ORIG_HEAD

   # For older commits, use git-filter-repo or BFG Repo-Cleaner
   ```
3. **Update .env** with new credentials
4. **Force push** (if already pushed to remote)

### API Key Rotation

It's good practice to rotate API keys periodically:
- Firebase API keys: Can be restricted by domain in Firebase Console
- Google AI API key: Rotate every 90 days
- OAuth credentials: Monitor usage in Google Cloud Console

### Production Deployment

For production deployments:
- Use environment variables in your hosting platform (Vercel, Netlify, etc.)
- Never hardcode production keys in code
- Enable API key restrictions in Firebase and Google Cloud Console
- Use different API keys for development and production

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainer directly instead of creating a public issue.
