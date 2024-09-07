import { PermissionsAndroid, NativeModules } from 'react-native';

const { SmsModule } = NativeModules;

const SendSMS = async (phoneNumber, message) => {
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
        const response = await SmsModule.sendSms(message, phoneNumber);
        console.log('SMS sent:', response);
        return { success: true, response }; 
      } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error }; 
      }
    } else {
      console.log('SEND_SMS permission denied');
      return { success: false, error: 'Permission denied' };
    }
  } catch (err) {
    console.warn(err);
    return { success: false, error: err.message };
  }
};

export default { SendSMS };
