# Firebase Setup Instructions

Your Flutter app has been configured for Firebase and Firebase Cloud Messaging (FCM). Follow these steps to complete the setup:

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login to Firebase: `firebase login`

## Step 1: Initialize Firebase in Your Project

Run the following command in your project root directory:

```bash
flutterfire configure
```

This command will:
- Create or select a Firebase project
- Register your app with Firebase
- Download configuration files (`google-services.json` for Android and `GoogleService-Info.plist` for iOS)
- Generate `firebase_options.dart` file

## Step 2: Update main.dart (if using FlutterFire CLI)

If you used `flutterfire configure`, you'll need to update `lib/main.dart` to use the generated options:

```dart
import 'firebase_options.dart';

// In main() function, update the Firebase initialization:
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

## Step 3: Enable Cloud Messaging in Firebase Console

1. Go to your Firebase project in the Firebase Console
2. Navigate to **Project Settings** > **Cloud Messaging**
3. Enable **Firebase Cloud Messaging API** (if not already enabled)
4. Note your **Server Key** and **Sender ID** for sending notifications

## Step 4: Test Notifications

### Get FCM Token

When you run the app, check the console/logs for:
```
FCM Token: <your-token>
```

Save this token to test notifications.

### Send Test Notification

1. Go to Firebase Console > **Cloud Messaging**
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Paste your FCM token
6. Click **Test**

Or use curl:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test notification from Firebase"
    }
  }'
```

## Configuration Files

### Android: `google-services.json`

Place this file in: `android/app/google-services.json`

### iOS: `GoogleService-Info.plist`

Place this file in: `ios/Runner/GoogleService-Info.plist`

After adding, open Xcode and add the file to the Runner target:
1. Open `ios/Runner.xcworkspace` in Xcode
2. Right-click on `Runner` folder
3. Select **Add Files to "Runner"**
4. Select `GoogleService-Info.plist`
5. Make sure **Copy items if needed** is checked

## Features Implemented

✅ Firebase Core integration
✅ Firebase Cloud Messaging (FCM)
✅ Foreground notification handling
✅ Background notification handling
✅ Notification click handling
✅ Topic subscription support
✅ FCM token management
✅ iOS notification permissions
✅ Android notification permissions (API 33+)

## Usage in Your App

### Get FCM Token

```dart
final firebaseService = FirebaseService();
String? token = await firebaseService.getToken();
print('FCM Token: $token');
```

### Subscribe to Topics

```dart
await firebaseService.subscribeToTopic('camera_alerts');
await firebaseService.subscribeToTopic('motion_detected');
```

### Unsubscribe from Topics

```dart
await firebaseService.unsubscribeFromTopic('camera_alerts');
```

## Notification Payload Structure

### Simple Notification

```json
{
  "to": "FCM_TOKEN",
  "notification": {
    "title": "Motion Detected",
    "body": "Camera detected motion in the living room"
  }
}
```

### Notification with Data

```json
{
  "to": "FCM_TOKEN",
  "notification": {
    "title": "Motion Detected",
    "body": "Camera detected motion in the living room"
  },
  "data": {
    "camera_id": "camera_1",
    "timestamp": "2025-12-13T10:30:00Z",
    "type": "motion_detection"
  }
}
```

## Troubleshooting

### Android

- Ensure `google-services.json` is in `android/app/`
- Run `flutter clean` and rebuild
- Check minSdkVersion is at least 21
- Verify Google Services plugin is applied

### iOS

- Ensure `GoogleService-Info.plist` is added to Xcode project
- Check that Runner target includes the file
- Enable Push Notifications capability in Xcode
- Request notification permissions at runtime

### Common Issues

1. **"Default FirebaseApp is not initialized"**
   - Make sure `Firebase.initializeApp()` is called before `runApp()`

2. **No notifications received**
   - Check FCM token is correctly generated
   - Verify Firebase Cloud Messaging API is enabled
   - Check notification permissions are granted

3. **iOS notifications not working**
   - Enable Push Notifications in Xcode Capabilities
   - Upload APNs key to Firebase Console

## Next Steps

1. Implement custom notification handling in `FirebaseService`
2. Add local notifications for foreground messages
3. Store FCM token on your backend server
4. Send targeted notifications based on camera events
5. Add notification channels for different alert types

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
