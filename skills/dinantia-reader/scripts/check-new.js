const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SESSION_PATH = path.join(__dirname, 'session.json');

async function fetchMessages(session) {
  const url = 'https://app.dinantia.com/web/inbox/get?unread=0&starred=0&with_attachments=0&with_payments=0&with_polls=0&mode=rows&filter=&sortBy=date&sortDesc=1&perPage=100&currentPage=1&dateFrom=2026-03-18';

  const headers = {
    'accept': 'application/json',
    'user-agent': session.userAgent,
    'x-requested-with': 'XMLHttpRequest'
  };
  
  // Build cookie string based on what we have
  let cookies = [];
  if (session.PHPSESSID) cookies.push(`PHPSESSID=${session.PHPSESSID}`);
  if (session.REMEMBERME) cookies.push(`REMEMBERME=${session.REMEMBERME}`);
  if (session.csrfToken) {
    cookies.push(`csrfToken=${session.csrfToken}`);
  }
  
  // Build the cookie header by combining intercepted cookies with our own
  let cookieHeader = '';
  
  // Start with the intercepted cookie header if available
  if (session.cookieHeader) {
    cookieHeader = session.cookieHeader;
  }
  
  // Add our own cookies, ensuring we don't duplicate
  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    // Check if this cookie name already exists in the header
    const regex = new RegExp(`(^|;\\s*)${name}=`);
    if (!regex.test(cookieHeader)) {
      cookieHeader += (cookieHeader ? '; ' : '') + cookie;
    }
  });
  
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }
  
  // Use the dynamic CSRF token header if available
  if (session.xCsrfTokenHeader) {
    headers['X-CSRF-TOKEN'] = session.xCsrfTokenHeader;
  }

  const response = await axios.get(url, { headers, timeout: 30000 });

  const messages = response.data.rows || [];
  if (messages.length > 0) {
    const processedMessages = messages.map(row => {
      const msg = row.message;
      const sender = row.account.name;
      return {
        id: msg.id,
        from: sender,
        subject: msg.subject,
        sent: msg.sent,
        body: msg.body.replace(/<[^>]*>?/gm, '') // Full body, HTML removed
      };
    });
    return { status: 'ok', messages: processedMessages };
  } else {
    return { status: 'ok', messages: [] };
  }
}

async function refreshSession() {
  const { execSync } = require('child_process');
  
  try {
    execSync(`node ${path.join(__dirname, 'refresh-session-puppeteer.js')}`, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 180000
    });
    
    // Reload refreshed session
    const refreshedSession = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
    return refreshedSession;
  } catch (refreshError) {
    // Clean up error message to avoid stderr pollution
    let cleanMessage = refreshError.message;
    cleanMessage = cleanMessage.replace(/stderr:\s*.*/g, '').trim();
    cleanMessage = cleanMessage.replace(/Unexpected end of JSON input.*/, '').trim();
    
    throw new Error(`Unable to refresh Dinantia session: ${cleanMessage || 'Session refresh failed'}`);
  }
}

async function checkNewMessages() {
  if (!fs.existsSync(SESSION_PATH)) {
    return { status: 'error', message: 'Session file not found' };
  }

  let session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
  
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    if (attempts === 2) {
      try {
        session = await refreshSession();
      } catch (refreshError) {
        return { status: 'error', message: `Session refresh failed: ${refreshError.message}` };
      }
    }
    
    try {
      const result = await fetchMessages(session);
      return result;
    } catch (error) {
      const isAuthError = error.response?.status === 401 || 
                         error.message.includes('401') || 
                         error.message.includes('authentication');
      
      if (isAuthError && attempts < maxAttempts) {
        continue;
      }
      
      return { 
        status: 'error', 
        message: `Failed to fetch messages: ${error.message}` 
      };
    }
  }
  
  return { status: 'error', message: 'Unexpected error in checkNewMessages' };
}

// Main execution
checkNewMessages()
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error(JSON.stringify({ status: 'error', message: error.message }));
  });
