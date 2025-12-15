# Firebase Cloud Messaging (FCM) Setup Guide - MVP

Simple Firebase Cloud Messaging setup for single device notifications.

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file

### 2. Configure Firebase

1. Create `src/firebase/firebase.config.ts`:
   ```typescript
   export const firebaseConfig = {
     projectId: 'your-project-id',
     privateKey: 'your-private-key',
     clientEmail: 'your-client-email',
   };
   ```

2. Add to `.gitignore`:
   ```
   src/firebase/firebase.config.ts
   ```

## API Usage

### 1. Register Device Token

**POST** `/notifications/register`

Register your device's FCM token to receive notifications.

```json
{
  "token": "your-fcm-device-token-here"
}
```

### 2. Send Test Notification

**POST** `/notifications/send`

Send a test notification to the registered device.

```json
{
  "title": "Test Alert",
  "body": "This is a test notification",
  "data": {
    "type": "test"
  }
}
```

### 3. Motion Detection (Auto-sends Notification)

**POST** `/motion/trigger`

Trigger motion detection - automatically sends notification to registered device.

```json
{
  "motionValue": 1
}
```

## Client Setup

### Get FCM Token (Web)

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    projectId: "your-project-id",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  };

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Get token and register it
  messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' })
    .then((token) => {
      fetch('http://localhost:3000/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    });

  // Handle incoming messages
  messaging.onMessage((payload) => {
    console.log('Notification:', payload);
  });
</script>
```

## Testing

1. Start server: `npm run start:dev`
2. Get your FCM token from client app
3. Register token: `POST /notifications/register`
4. Trigger motion: `POST /motion/trigger`
5. Device receives notification!
