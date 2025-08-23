const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'bot.log' })
  ]
});

const BOT_ID = process.env.GROUPME_BOT_ID;
const PORT = process.env.PORT || 3000;
const TIMEZONE = 'America/New_York';
const START_HOUR = parseInt(process.env.START_HOUR || '12', 10);
const END_HOUR = parseInt(process.env.END_HOUR || '15', 10);

if (!BOT_ID) {
  logger.error('GROUPME_BOT_ID is not set in environment variables');
  process.exit(1);
}

const scheduledTimes = new Map();

const dayMessages = {
  Tuesday: "Practice tonight at 7:30!",
  Thursday: "Practice tonight at 7:30!",
  Friday: "Practice tonight at 6:30!",
  Saturday: "Saturday test message! 🧪 Bot is working correctly!"
};

async function sendMessage(text) {
  const url = 'https://api.groupme.com/v3/bots/post';
  
  try {
    const response = await axios.post(url, {
      bot_id: BOT_ID,
      text: text
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 202) {
      logger.info(`Message sent successfully: "${text}"`);
      return true;
    } else {
      logger.error(`Unexpected response status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      logger.error(`API Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      logger.error('Network error: No response received from GroupMe API');
    } else {
      logger.error(`Error sending message: ${error.message}`);
    }
    return false;
  }
}

async function sendScheduledMessage(dayName) {
  const message = dayMessages[dayName] || "Hello from Thomas Bot!";
  logger.info(`Attempting to send ${dayName} message: "${message}"`);
  
  const success = await sendMessage(message);
  
  if (!success) {
    logger.warn('Failed to send message, will retry in 1 minute');
    
    setTimeout(async () => {
      logger.info('Retrying message send...');
      await sendMessage(message);
    }, 60000);
  }
}

function getRandomTimeInRange(startHour, endHour) {
  const randomHour = startHour + Math.floor(Math.random() * (endHour - startHour));
  const randomMinute = Math.floor(Math.random() * 60);
  return { hour: randomHour, minute: randomMinute };
}

function scheduleRandomMessage(dayOfWeek, dayName) {
  const { hour, minute } = getRandomTimeInRange(START_HOUR, END_HOUR);
  const cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
  
  logger.info(`Scheduling ${dayName} message for ${hour}:${minute.toString().padStart(2, '0')} EST`);
  logger.info(`Message will be: "${dayMessages[dayName]}"`);
  
  const task = cron.schedule(cronExpression, async () => {
    logger.info(`Executing ${dayName} scheduled message at ${hour}:${minute.toString().padStart(2, '0')}`);
    await sendScheduledMessage(dayName);
    
    scheduleRandomMessage(dayOfWeek, dayName);
  }, {
    scheduled: true,
    timezone: TIMEZONE
  });
  
  scheduledTimes.set(dayName, `${hour}:${minute.toString().padStart(2, '0')}`);
  return task;
}

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bot_id: BOT_ID ? 'configured' : 'not configured',
    timezone: 'America/New_York (EST)',
    schedule_window: `${START_HOUR}:00 - ${END_HOUR}:00 EST`,
    next_scheduled_times: {
      Tuesday: scheduledTimes.get('Tuesday') || 'Not scheduled yet',
      Thursday: scheduledTimes.get('Thursday') || 'Not scheduled yet',
      Friday: scheduledTimes.get('Friday') || 'Not scheduled yet',
      Saturday: '15:30 (3:30 PM) - Test message'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Thomas Bot',
    version: '1.0.0',
    status: 'running',
    schedule: `Tuesday, Thursday, Friday at random times between ${START_HOUR}:00 and ${END_HOUR}:00`,
    health_check: '/health'
  });
});

app.post('/send-test', async (req, res) => {
  const testMessage = req.body.message || 'Test message from Thomas Bot! 🤖';
  
  logger.info('Manual test message requested');
  const success = await sendMessage(testMessage);
  
  if (success) {
    res.json({ 
      success: true, 
      message: 'Test message sent successfully',
      text: testMessage 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test message' 
    });
  }
});

logger.info(`Scheduling messages for Tuesday, Thursday, Friday between ${START_HOUR}:00 and ${END_HOUR}:00 EST`);
logger.info(`Each day will have a random time selected within this window`);

scheduleRandomMessage(2, 'Tuesday');
scheduleRandomMessage(4, 'Thursday');
scheduleRandomMessage(5, 'Friday');

const saturdayTestCron = '30 15 * * 6';
logger.info('Scheduling Saturday test message at 3:30 PM EST');
cron.schedule(saturdayTestCron, async () => {
  logger.info('Executing Saturday test message at 3:30 PM EST');
  await sendScheduledMessage('Saturday');
}, {
  scheduled: true,
  timezone: TIMEZONE
});

const server = app.listen(PORT, () => {
  logger.info(`Thomas Bot is running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Bot ID: ${BOT_ID ? 'Configured' : 'Not configured - please set GROUPME_BOT_ID'}`);
  logger.info(`Random message times scheduled:`);
  logger.info(`  Tuesday: ${scheduledTimes.get('Tuesday') || 'Scheduling...'}`);
  logger.info(`  Thursday: ${scheduledTimes.get('Thursday') || 'Scheduling...'}`);
  logger.info(`  Friday: ${scheduledTimes.get('Friday') || 'Scheduling...'}`);
});

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});