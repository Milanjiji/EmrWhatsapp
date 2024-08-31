import React  from "react";
import { View,Text } from "react-native";
import SendSMSSample from "./components/SendSms";
import ListenSMS from "./components/ReadSMS";

const App = () =>{
  return (
    <View>
      <Text>hello world</Text>
      <SendSMSSample />
      <ListenSMS />
    </View>
  )
}

export default App;