const axios = require('axios');
require('dotenv').config();

const BOT_ID = process.env.GROUPME_BOT_ID;
const ACCESS_TOKEN = process.env.GROUPME_ACCESS_TOKEN;
const GROUP_ID = process.env.GROUPME_GROUP_ID;

const dayMessages = {
  Tuesday: "Practice tonight at 7:30!",
  Thursday: "Practice tonight at 7:30!",
  Friday: "Practice tonight at 6:30!"
};

async function getTodaysMessages() {
  const url = `https://api.groupme.com/v3/groups/${GROUP_ID}/messages`;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    
    const response = await axios.get(url, {
      params: {
        token: ACCESS_TOKEN,
        limit: 100
      }
    });
    
    if (response.status === 200 && response.data.response) {
      const messages = response.data.response.messages || [];
      const todaysMessages = messages.filter(msg => {
        const msgTimestamp = msg.created_at;
        return msgTimestamp >= todayTimestamp;
      });
      
      console.log(`Found ${todaysMessages.length} messages from today`);
      return todaysMessages;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching messages: ${error.message}`);
    return [];
  }
}

async function checkIfPracticeTimeMentioned() {
  const messages = await getTodaysMessages();
  
  for (const msg of messages) {
    if (msg.text && (msg.text.includes('7:30') || msg.text.includes('6:30'))) {
      console.log(`Found practice time mentioned by ${msg.name}: "${msg.text}"`);
      return {
        mentioned: true,
        userName: msg.name,
        text: msg.text
      };
    }
  }
  
  return { mentioned: false };
}

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
      console.log(`✅ Message sent successfully: "${text}"`);
      return true;
    } else {
      console.error(`Unexpected response status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error sending message: ${error.message}`);
    return false;
  }
}

async function main() {
  // Get day of week
  const dayOfWeek = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];
  
  // Get default message for today
  const defaultMessage = dayMessages[dayName] || "Hello from Thomas Bot!";
  
  // Check if someone already mentioned practice time
  const practiceCheck = await checkIfPracticeTimeMentioned();
  
  let message;
  if (practiceCheck.mentioned) {
    message = `Yeah what ${practiceCheck.userName} said`;
    console.log(`Someone already mentioned practice time. Sending acknowledgment message.`);
  } else {
    message = defaultMessage;
    console.log(`No one mentioned practice time yet. Sending default message.`);
  }
  
  // Send the message
  const success = await sendMessage(message);
  
  if (!success) {
    console.error('Failed to send message');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});