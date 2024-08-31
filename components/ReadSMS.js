import React, { useEffect } from "react";
import { View, Text, Button, PermissionsAndroid } from "react-native";
import SmsListener from 'react-native-android-sms-listener-background';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
  
const ListenSMS = () => {
  
  async function requestNotificationPermission() {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < 1) {
      console.log('Notification permissions not granted');
    }
  }
  async function onDisplayNotification(message) {
    await requestNotificationPermission();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: 'SMS Received',
      body: message,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  useEffect(() => {
    // Subscribe to foreground events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          break;
      }
    });

    
    return () => {
      unsubscribe();
    };
  }, []);


  const addListener = async () => {
    try {
      const requestReadSmsPermission = async () => {
        try {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        } catch (err) {
          console.log(err);
        }
      };

      const readSmsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      const receiveSmsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);

      if (!readSmsGranted || !receiveSmsGranted) {
        console.log("Permissions not granted, requesting permissions...");
        await requestReadSmsPermission();
      } else {
        console.log("Permissions are already granted.");
      }

      SmsListener.addListener(message => {
        console.info(message);
        const displayNotification = async () =>{
            try {
                const channelId = await notifee.createChannel({
                    id: 'default',
                    name: 'Default Channel',
                    importance: AndroidImportance.HIGH, 
                  });
              
                  await notifee.displayNotification({
                    title: 'SMS Received',
                    body: 'hellow rold',
                    android: {
                      channelId,
                      importance: AndroidImportance.HIGH, 
                      pressAction: {
                        id: 'default',
                      },
                    },
                  });
              } catch (error) {
                console.error('Failed to display notification:', error);
              } 
        }
        displayNotification()
      });
      console.log("SMS listener started");
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <Text>Hello</Text>
      <Button title="Show Notification" onPress={() => onDisplayNotification('Test notification')} />
      <Button title="Start SMS Listener" onPress={addListener} />
    </View>
  );
};

export default ListenSMS;
