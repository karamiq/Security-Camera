# Firebase Push Notifications Setup

Your Flutter app is now configured to receive push notifications from Firebase Cloud Messaging (FCM).

## 🎉 What's Been Set Up

### 1. **Dependencies Added**
- `firebase_messaging`: ^16.0.4 - For Firebase Cloud Messaging
- `firebase_core`: ^4.2.1 - Firebase core functionality
- `awesome_notifications`: ^0.10.1 - Advanced notification UI and handling
- `flutter_local_notifications`: ^19.5.0 - Local notification support

### 2. **Service Implementation**
Created `/lib/services/notification_service.dart` with:
- Firebase Cloud Messaging initialization
- Foreground message handling
- Background message handling
- Notification tap handling
- Token management
- Topic subscription support
- Custom notification channels

### 3. **Android Configuration** ✅
Your `AndroidManifest.xml` already includes:
- `POST_NOTIFICATIONS` permission
- FCM default notification icon and color
- High importance notification channel

### 4. **iOS Configuration** ✅
Your iOS setup already includes:
- Push notification capability in `Info.plist`
- Background modes: `fetch` and `remote-notification`
- Notification delegate in `AppDelegate.swift`

## 🚀 How to Use

### Get FCM Token
The FCM token is automatically printed to the console when the app starts. You can also retrieve it programmatically:

```dart
String? token = await FirebaseNotificationService.getToken();
print('FCM Token: $token');
```

**Important:** Send this token to your backend server to send notifications to this device.

### Subscribe to Topics
Users can subscribe to topics to receive targeted notifications:

```dart
await FirebaseNotificationService.subscribeToTopic('security_alerts');
await FirebaseNotificationService.subscribeToTopic('motion_detected');
```

### Show Local Notifications
Trigger a notification locally:

```dart
await FirebaseNotificationService.showNotification(
  title: 'Motion Detected',
  body: 'Camera detected movement at front door',
  payload: {
    'type': 'motion_detected',
    'camera_id': 'camera_1',
    'timestamp': DateTime.now().toIso8601String(),
  },
);
```

## 🧪 Testing Push Notifications

### Method 1: Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Cloud Messaging** (or **Engage > Messaging**)
4. Click **Send your first message** or **New campaign**
5. Fill in:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test from Firebase"
6. Click **Send test message**
7. Paste your FCM token (from console logs)
8. Click **Test**

### Method 2: Using cURL (Backend Testing)
Replace `YOUR_SERVER_KEY` with your Firebase Server Key from Project Settings > Cloud Messaging:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "FCM_TOKEN_HERE",
    "notification": {
      "title": "Security Alert",
      "body": "Motion detected at front door",
      "sound": "default"
    },
    "data": {
      "type": "motion_detected",
      "camera_id": "camera_1"
    }
  }'
```

### Method 3: Using Postman or HTTP Client
**Endpoint:** `https://fcm.googleapis.com/fcm/send`

**Headers:**
```
Authorization: key=YOUR_SERVER_KEY
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "to": "FCM_TOKEN_HERE",
  "notification": {
    "title": "Security Alert",
    "body": "Motion detected at front door",
    "sound": "default"
  },
  "data": {
    "type": "motion_detected",
    "camera_id": "camera_1",
    "timestamp": "2025-12-13T10:30:00Z"
  },
  "priority": "high"
}
```

### Method 4: Send to Topic
Instead of `"to": "FCM_TOKEN"`, use:
```json
{
  "to": "/topics/security_alerts",
  "notification": { ... }
}
```

## 📱 Notification Behavior

### When App is in Foreground
- Notification is received via `FirebaseMessaging.onMessage`
- Displayed using Awesome Notifications
- User sees a local notification

### When App is in Background
- Notification handled by `_firebaseMessagingBackgroundHandler`
- Displayed in system tray
- Tapping opens the app

### When App is Terminated
- System handles notification display
- App opens when notification is tapped
- `getInitialMessage()` retrieves the notification data

## 🔧 Next Steps

1. **Get Your FCM Token:**
   - Run the app
   - Check the console for: `FCM Token: ...`
   - Copy this token

2. **Send a Test Notification:**
   - Use Firebase Console method above
   - Verify you receive the notification

3. **Implement Navigation:**
   - Update `_handleNotificationTap()` in `notification_service.dart`
   - Navigate to appropriate screens based on payload

4. **Backend Integration:**
   - Send FCM tokens to your backend server
   - Store tokens in your database
   - Use tokens to send notifications from your server

5. **Subscribe to Topics:**
   - Add topic subscriptions in your app
   - Example: Subscribe all users to "security_alerts"

## 🛠️ Troubleshooting

### iOS: Not Receiving Notifications
1. Ensure you have enabled Push Notifications in Xcode capabilities
2. Upload APNs certificates/keys to Firebase Console
3. Test on a physical device (push notifications don't work on simulator)

### Android: Not Receiving Notifications
1. Check `google-services.json` is properly configured
2. Verify app package name matches Firebase project
3. Check notification permissions are granted

### Token is NULL
1. Ensure internet connection
2. Wait a few seconds after app launch
3. Check Firebase configuration files are present
4. Verify Firebase project is properly set up

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Awesome Notifications Documentation](https://pub.dev/packages/awesome_notifications)
- [Flutter Local Notifications](https://pub.dev/packages/flutter_local_notifications)

## 🎯 Example Use Cases for Security Camera App

1. **Motion Detection Alert:**
```dart
// When motion is detected on camera
await FirebaseNotificationService.showNotification(
  title: '🚨 Motion Detected',
  body: 'Activity detected at Front Door Camera',
  payload: {'camera_id': 'front_door', 'type': 'motion'},
);
```

2. **Camera Offline Alert:**
```dart
await FirebaseNotificationService.showNotification(
  title: '⚠️ Camera Offline',
  body: 'Garage Camera has lost connection',
  payload: {'camera_id': 'garage', 'type': 'offline'},
);
```

3. **Recording Started:**
```dart
await FirebaseNotificationService.showNotification(
  title: '🔴 Recording Started',
  body: 'Camera started recording due to motion',
  payload: {'camera_id': 'front_door', 'type': 'recording'},
);
```

---

✅ **Setup Complete!** Your app is ready to receive push notifications from Firebase.
