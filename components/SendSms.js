import React from 'react';
import { View, Button,NativeModules, PermissionsAndroid } from 'react-native';
const {SmsModule} = NativeModules;

const SendSMSSample = () => {
  const smsSend = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to send SMS messages.',
          buttonPositive: 'OK',
        }
      );
  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SEND_SMS permission granted');
        try {
          const response = await SmsModule.sendSms(
            'Some message',
            '7736744769'
          );
          console.log('SMS sent:', response);
        } catch (error) {
          console.error('Error sending SMS:', error);
        }
      } else {
        console.log('SEND_SMS permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View>
      <Button title="Send SMS" onPress={smsSend} />
    </View>
  );
};

export default SendSMSSample;
