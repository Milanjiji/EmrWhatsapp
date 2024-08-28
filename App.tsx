import React  from "react";
import { View,Text } from "react-native";
import SendSMSSample from "./components/SendSms";

const App = () =>{
  return (
    <View>
      <Text>hello world</Text>
      <SendSMSSample />
    </View>
  )
}

export default App;