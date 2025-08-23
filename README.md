# Thomas Bot - GroupMe Scheduler

A simple GroupMe bot that automatically sends motivational messages every Tuesday, Thursday, and Friday at a scheduled time. **Designed to run 24/7 in the cloud for free!**

## Features

- 📅 **Random scheduling**: Messages sent at random times between 12:00 PM - 3:00 PM EST on Tuesday, Thursday, Friday
- 🏐 **Practice reminders**: Automated reminders with practice times
- 🔄 Automatic retry on failed messages
- 📊 Health check endpoint for monitoring
- 📝 Comprehensive logging
- 🛡️ Graceful shutdown handling
- 🎯 Manual test message endpoint

## Prerequisites

- A GitHub account (free)
- A GroupMe account
- A GroupMe group where you want the bot to send messages

## Quick Start Guide

### Step 1: Create a GroupMe Bot

1. **Sign in to GroupMe Developer Portal**
   - Go to https://dev.groupme.com
   - Log in with your GroupMe credentials
   - You may need to create an application first to access the Bots section

2. **Create a New Bot**
   - Click on "Bots" in the top menu
   - Click "Create Bot"
   - Fill in the bot details:
     - **Select Group**: Choose your group from dropdown
     - **Name**: Thomas Bot (or any name you prefer)
     - **Callback URL**: Put `http://localhost:3000` (won't be used)
     - **Avatar URL**: Optional - add a picture for your bot
   - Click "Submit"

3. **Copy Your Bot ID**
   - After creating the bot, you'll see it listed on the Bots page
   - **IMPORTANT**: Copy the "Bot ID" - you'll need this for deployment

### Step 2: Set Up Your GitHub Repository

1. **Fork or Clone This Repository**
   - Click "Fork" on this GitHub repo, or
   - Download and upload to your own GitHub repository

2. **Keep Your Bot ID Secret**
   - Never commit your Bot ID to the repository
   - You'll add it as a secret environment variable in the hosting service

## 🚀 FREE Deployment Options

### Option 1: Render.com (Recommended - 100% Free)

Render offers a generous free tier perfect for bots like this.

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with your GitHub account (free)

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your thomas-bot repository
   - Configure the service:
     - **Name**: `thomas-bot` (or any name)
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Select **Free**

3. **Add Environment Variables**
   - Scroll to "Environment Variables" section
   - Add these variables:
     - `GROUPME_BOT_ID` = (paste your Bot ID from Step 1)
     - `START_HOUR` = `12` (messages start after 12 PM EST)
     - `END_HOUR` = `15` (messages sent before 3 PM EST)
     - `PORT` = `10000` (Render uses port 10000)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (takes 2-3 minutes)
   - Your bot is now running 24/7 for free!

5. **Verify It's Working**
   - Once deployed, Render gives you a URL like `https://thomas-bot.onrender.com`
   - Visit `https://thomas-bot.onrender.com/health` to check status
   - The bot will automatically send messages on schedule

**Note**: Free tier services may spin down after 15 minutes of inactivity but will automatically restart when the scheduled time arrives.

### Option 2: GitHub Actions (Completely Free, No Signup Required)

Use GitHub's servers to run your bot on schedule - perfect for a message scheduler!

1. **Create GitHub Secret**
   - In your GitHub repository, go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GROUPME_BOT_ID`
   - Value: (paste your Bot ID)
   - Click "Add secret"

2. **Enable GitHub Actions**
   - The workflow files are already included in `.github/workflows/`
   - Go to the Actions tab in your repository
   - Click "I understand my workflows, go ahead and enable them"

3. **Test Your Bot**
   - Go to Actions tab
   - Click "Send Test Message" workflow
   - Click "Run workflow"
   - Enter a test message and click "Run workflow"
   - Check your GroupMe for the message!

4. **That's It!**
   - The bot will automatically send messages at random times between 12:00 PM - 3:00 PM EST on Tuesday, Thursday, and Friday
   - To change the schedule, edit `.github/workflows/scheduler.yml`
   - Check the Actions tab to see run history
   - Completely free, runs on GitHub's servers forever!

### Option 3: Replit (Free with Account)

1. **Create a Replit Account**
   - Go to https://replit.com
   - Sign up for free

2. **Import from GitHub**
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste your repository URL

3. **Set Up Secrets**
   - Click on "Secrets" (lock icon)
   - Add `GROUPME_BOT_ID` with your Bot ID

4. **Run the Bot**
   - Click "Run"
   - Replit will keep it running (may require "Always On" for 24/7 operation)

## Why Not Run Locally?

**Important**: Running the bot on your personal computer is not recommended because:
- Your computer needs to stay on 24/7
- The bot stops if your computer sleeps or restarts
- Network interruptions will cause missed messages
- That's why we recommend the free cloud hosting options above!

## Configuration Options

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `GROUPME_BOT_ID` | Your GroupMe Bot ID (required) | - | `abc123def456` |
| `PORT` | Server port | `3000` | `10000` for Render |
| `START_HOUR` | Start of random message window (24-hour EST) | `12` | `13` for 1 PM |
| `END_HOUR` | End of random message window (24-hour EST) | `15` | `16` for 4 PM |

**Note**: All times are in EST (America/New_York timezone)

## Testing Your Bot

### For Render.com Deployment:
1. **Check Health Status**
   - Visit: `https://your-app-name.onrender.com/health`
   - You should see the bot status and configuration

2. **Send a Test Message**
   ```bash
   curl -X POST https://your-app-name.onrender.com/send-test \
     -H "Content-Type: application/json" \
     -d '{"message": "Test from Thomas Bot!"}'
   ```

### For GitHub Actions:
1. **Send Test Message**
   - Go to your repository's Actions tab
   - Click "Send Test Message" workflow
   - Click "Run workflow"
   - Enter your message and run it
   - Check your GroupMe group!

## Scheduling Details

The bot automatically sends practice reminders on:
- **Tuesday**: "Practice tonight at 7:30!" - sent at random time between 12:00 PM - 3:00 PM EST
- **Thursday**: "Practice tonight at 7:30!" - sent at random time between 12:00 PM - 3:00 PM EST
- **Friday**: "Practice tonight at 6:30!" - sent at random time between 12:00 PM - 3:00 PM EST

Each day, the bot picks a new random time within the window, so messages appear more natural and less robotic. The random time is selected when the bot starts up and after each message is sent.

## Customizing Messages

To customize the practice messages, edit the `dayMessages` object in `index.js`:

```javascript
const dayMessages = {
  Tuesday: "Practice tonight at 7:30!",
  Thursday: "Practice tonight at 7:30!",
  Friday: "Practice tonight at 6:30!"
};
```

Simply change the text for each day to update the reminder messages.

## Logging

The bot logs all activities to:
- **Console**: Colored output for easy reading
- **File**: `bot.log` for persistent logging

Log entries include:
- Successful message sends
- API errors
- Network issues
- Server status

## Troubleshooting

### Bot Not Sending Messages

1. **Check Bot ID**: Ensure `GROUPME_BOT_ID` is set correctly in your hosting service's environment variables
2. **Check Deployment Logs**: 
   - Render: Check the Logs tab in your dashboard
   - GitHub Actions: Check the Actions tab in your repository
3. **Test Manually**: Use the `/send-test` endpoint to verify the bot can send messages
4. **Verify Schedule**: Check that your timezone and scheduled time are correct
5. **Check Service Status**:
   - For Render: Ensure the service is "Live" not "Suspended"
   - For GitHub Actions: Ensure workflows are enabled

### Common Errors

| Error | Solution |
|-------|----------|
| "GROUPME_BOT_ID is not set" | Add your Bot ID to environment variables in your hosting service |
| "Network error" | Check if your hosting service is running |
| "API Error: 404" | Your Bot ID might be incorrect |
| "API Error: 401" | The bot might have been deleted or the ID is wrong |
| Bot not sending on schedule | Verify TIMEZONE and SCHEDULED_TIME are set correctly |

### Getting Help

1. **Check Logs**: 
   - Render: Dashboard → Logs tab
   - GitHub Actions: Actions tab → Click on workflow run
2. **Test Endpoint**: Use `/send-test` to debug message sending
3. **Health Check**: Visit `/health` endpoint to see the bot status
4. **GroupMe Status**: Check https://status.groupme.com for API issues

## Security Notes

- **Never commit your `.env` file** to version control
- Keep your Bot ID secret
- Use environment variables for all sensitive data
- The bot only sends messages; it cannot read group messages

## Contributing

Feel free to submit issues or pull requests to improve the bot!

## License

MIT License - See LICENSE file for details

## Optional: Local Development & Testing

If you want to test the bot locally before deploying:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROUPME_BOT_ID
   ```

3. **Run Locally**
   ```bash
   npm start
   ```

4. **Test Locally**
   ```bash
   curl -X POST http://localhost:3000/send-test \
     -H "Content-Type: application/json" \
     -d '{"message": "Local test!"}'
   ```

Remember: Local testing is just for development. Deploy to the cloud for 24/7 operation!

## Support

For issues or questions:
1. Check the troubleshooting section
2. For Render: Check dashboard logs
3. For GitHub Actions: Check Actions tab for workflow runs
4. Create an issue in the repository

---

**Happy scheduling with Thomas Bot!** 🤖
