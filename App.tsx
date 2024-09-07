import React  from "react";
import { View,Text, ScrollView } from "react-native";
import SendSMSSample from "./components/SendSms";
import ListenSMS from "./components/ReadSMS";
import Header from './components/Header'
import colors from './colors.json'
import Chat from "./components/Chat";
const Colors = colors[0];

import { MMKV } from 'react-native-mmkv'



const App = () =>{

  const storage = new MMKV()

  return (
    <ScrollView style={{display:'flex',flex:1,backgroundColor:Colors.background}} >
      <Header  />
      <Chat storage={storage} />
      {/* <Text>hello world</Text>
      <SendSMSSample />
      <ListenSMS /> */}
    </ScrollView>
  )
}

export default App;