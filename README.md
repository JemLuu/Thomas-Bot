# Thomas Bot - GroupMe Practice Reminder

A smart GroupMe bot that sends practice reminders and checks if someone already mentioned the practice time.

## Features

- 📅 **Automatic reminders**: Sends practice times on Tuesday, Thursday, and Friday
- 🤖 **Smart responses**: If someone already posted the practice time, responds with "Yeah what [username] said"
- 🎲 **Random timing**: Messages sent at random times between 12:00-12:05 PM EST
- 🔄 **GitHub Actions**: Runs automatically, no server needed

## Quick Setup

### 1. Create GroupMe Bot

1. Go to https://dev.groupme.com and sign in
2. Click "Bots" → "Create Bot"
3. Select your group and name your bot
4. Save these values:
   - **Bot ID**
   - **Access Token** (from your account)
   - **Group ID** (from the group URL)

### 2. Configure GitHub Repository

1. Fork or clone this repository
2. Go to Settings → Secrets and variables → Actions
3. Add these repository secrets:
   - `GROUPME_BOT_ID` - Your bot ID
   - `GROUPME_ACCESS_TOKEN` - Your access token
   - `GROUPME_GROUP_ID` - Your group ID

### 3. Enable GitHub Actions

1. Go to the Actions tab
2. Enable workflows if prompted
3. Test using "Send Test Message" workflow

## How It Works

The bot runs via GitHub Actions at 12:00 PM EST on practice days and:
1. Waits a random 0-5 minutes (to seem more natural)
2. Checks today's GroupMe messages for "7:30" or "6:30"
3. If someone mentioned practice: responds with acknowledgment
4. If not: sends the practice reminder

**Schedule:**
- Tuesday/Thursday: "Practice tonight at 7:30!"
- Friday: "Practice tonight at 6:30!"

## Testing

### Manual Test
1. Go to Actions tab
2. Select "Send Test Message"
3. Run workflow with custom message

### Check Logs
View the Actions tab to see run history and any errors

## Customization

Edit messages in `send-scheduled-message.js`:
```javascript
const dayMessages = {
  Tuesday: "Practice tonight at 7:30!",
  Thursday: "Practice tonight at 7:30!",
  Friday: "Practice tonight at 6:30!"
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot not sending | Check all 3 secrets are set correctly |
| Wrong message | Verify ACCESS_TOKEN and GROUP_ID are correct |
| Not detecting messages | Ensure bot has access to read group messages |

## License

MIT