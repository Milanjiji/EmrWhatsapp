/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        console.log('User pressed background notification', detail.notification);
        
        break;
      
    }
  });

AppRegistry.registerComponent(appName, () => App);
