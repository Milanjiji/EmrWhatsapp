import React from "react";
import { View,Text } from "react-native";
import colors from '../colors.json'
const Colors = colors[0];

const Header = (props) =>{
    console.log(Colors.background);

    
    return(
        <View style={{backgroundColor:Colors.primary,paddingLeft:20,paddingVertical:40}} >
            <Text style={{color:'black',fontFamily:Colors.Bold,fontSize:50,letterSpacing:3}} >Angaros</Text>
            <Text style={{fontFamily:Colors.Med}} >An Open source github chatapp</Text>
        </View>
    );
}

export default Header;