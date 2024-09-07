import React, { useEffect, useState } from "react";
import { View, Text, TextInput,PermissionsAndroid, FlatList, Button, TouchableOpacity } from "react-native";
import Contacts from 'react-native-contacts';
import Icon from 'react-native-vector-icons/AntDesign';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import SendSms from "./SendSms";
import colors from '../colors.json'
const Colors = colors[0];

const Chat = (props) => {

    const [contacts,setContacts] = useState([]);
    const [searchedContact,setSearchedContact] = useState([]);
    const [searcedContactDisplay,setSearchedContactDisplay] = useState(false);

    const [chatList,setChatList] = useState([]);

    const [openChatName,setOpenChatName] = useState('');
    const [OpenChatNumber,setOpenChatNumber] = useState('');
    const [openChatData,setOpenChatData] = useState([]);

    const [chatState,setChatState] = useState(false);

    const [message,setMessage] = useState('');

    const storage = props.storage;

    useEffect(()=>{

        async function requestContactsPermission() {
            try {
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                  title: "Contacts Permission",
                  message: "This app needs access to your contacts.",
                  buttonNeutral: "Ask Me Later",
                  buttonNegative: "Cancel",
                  buttonPositive: "OK"
                }
              );
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the contacts");
              } else {
                console.log("Contacts permission denied");
              }
            } catch (err) {
              console.warn(err);
            }
          }
          requestContactsPermission();

          const getChatList = () =>{
            try {
                const data = storage.getString('chatlist');

                if(data === undefined || !data || data === 'undefined'){

                }else{
                    // setChatlist(JSON.parse(data))
                    console.log(JSON.parse(data));
                    setChatList(JSON.parse(data));
                    
                }
                
            } catch (error) {
                
            }
          }
          getChatList();
        
    },[])

    

      const getContacts = () =>{
            Contacts.getAll()
            .then(contacts => {
                const data = contacts.map(data => ({Name:data.displayName,Number:data.phoneNumbers[0].number}))
                setContacts(data);
                setSearchedContact(data);
                setSearchedContactDisplay(true);
            })
            .catch(e => {
            console.error(e);
            });
    }
   function searchContacts(query) {
        const lowerCaseQuery = query.toLowerCase();
        
        const searchedData = contacts.filter(contact => {
        const { Name, Number } = contact;
        return (
            (Name && Name.toLowerCase().includes(lowerCaseQuery)) ||
            (Number && Number.toLowerCase().includes(lowerCaseQuery)) 
        );
        });
        const limitData = searchedData.slice(0,20);
        setSearchedContact(limitData);
        
    }

    const getOpenChatData = (name) =>{
        const getChatData = storage.getString(name);


        if(getChatData === undefined || getChatData === 'undefined'){
            setOpenChatData([])
        }else{
            const data = JSON.parse(getChatData);
            setOpenChatData(data)
        }
    }

    const findContactByName = (name) => {
        return chatList.find(contact => contact.name === name);
      };
    
    const renderItemContacts = (data) =>{

        const item = data.item;

        const setData = (name,number) => {

            setContacts([]);
            setSearchedContact([]); 
            setSearchedContactDisplay(false);
            

            if(findContactByName(item.Name) === 'undefined' || findContactByName(item.Name) === undefined){
                const data = [...chatList,{name:name,number:number}]
                setChatList(data);
                storage.set('chatlist',JSON.stringify(data));
                setOpenChatName(name);
                setOpenChatNumber(number);
                getOpenChatData(name);

            }else{
                setOpenChatName(name);
                setOpenChatNumber(number);
                getOpenChatData(name);
            }

        }
        return(
            <TouchableOpacity onPress={()=>setData(item.Name,item.Number)} style={{display:'flex',flexDirection:'row',padding:10,alignItems:'center'}} >
                <View style={{backgroundColor:Colors.primary,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:40}} >
                    <Text style={{color:'black'}} >{item.Name.charAt(0)}</Text>
                </View>
                <View style={{marginLeft:10}} >
                    <Text style={{color:'black'}} >{item.Name}</Text>
                    <Text>{item.Number}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderItemChatlist = (data) =>{
        const item  = data.item;

        const renderChatChata = () =>{
            if(chatState){
                setOpenChatName('');
                setOpenChatNumber('');
                getOpenChatData('');
                setChatState(!chatState)
            }else{
                setOpenChatName(item.name);
                setOpenChatNumber(item.number);
                getOpenChatData(item.name);
                setChatState(!chatState)
            }
        }

        const renderChat = (data) =>{
            const item = data.item;
            
            return(
                <View>
                    <Text>{item.message}</Text>
                </View>
            )
        }

        const sendMessage = () =>{

            const keygenerator = Math.floor(Math.random() * 10000)
            const data = [...openChatData,{message:message,key:keygenerator}];
            setOpenChatData(data);
            console.log(openChatName,OpenChatNumber,"openchat name and number");
            
            storage.set(item.name,JSON.stringify(data));
            setMessage('');
        }

        return (
            <View
            style={{
                paddingHorizontal:5,
                paddingVertical:10,
            }}
            >
                <TouchableOpacity onPress={renderChatChata} style={{display:'flex',flexDirection:'row',alignItems:'center'}} >
                    <View style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:Colors.primary,borderRadius:40,marginRight:10}} >
                        <Text style={{color:'black',fontFamily:Colors.Med,display:'flex',alignItems:'center'}} >{item.name.charAt(0)}</Text>
                    </View>
                    <View style={{display:'flex',flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}} >
                        <Text>{item.name}</Text>
                        <Icon name="down" size={15} color="#000" />
                    </View>
                </TouchableOpacity>
                <View style={{display:openChatName === item.name ? 'flex' : 'none'}} >
                    <FlatList
                    data={openChatData}
                    renderItem={renderChat}
                    keyExtractor={(item) => item.key}
                    />
                    <View style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexDirection:'row',marginTop:10}} >
                        <TextInput value={message} placeholder="Enter some text here" onChangeText={setMessage} 
                        style={{backgroundColor:'white',flex:1,padding:20,paddingVertical:10,borderRadius:20,marginRight:10}} />
                        <TouchableOpacity onPress={sendMessage}>
                            <FontisoIcon name="paper-plane" size={20} color="#000" style={{backgroundColor:Colors.primary,padding:13,borderRadius:30}} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    

    const clearChat = () =>{
        setOpenChatName('');
        setOpenChatNumber('');
        setOpenChatData([]);
        setChatList([])
        storage.clearAll()
    }

    return(
        <View style={{padding:10,borderTopLeftRadius:10,borderTopRightRadius:10,marginTop:-30,display:'flex',flex:1}} >
            
            <View style={{display:'flex',flexDirection:"column",flex:1,borderRadius:10}} >
                <TextInput 
                    placeholder="Search" 
                    onChangeText={(text)=>searchContacts(text)}
                    onFocus={getContacts}
                    style={{
                        flex:1,
                        backgroundColor:'white',
                        borderRadius:10,
                        paddingVertical:5,
                        paddingHorizontal:10,
                        borderColor:Colors.primary,
                        borderWidth:1,
                        fontFamily:Colors.Reg}} />
                <View style={{display:searcedContactDisplay ? 'flex' : 'none',maxHeight:300}} >
                    <FlatList
                    data={searchedContact}
                    renderItem={renderItemContacts}
                    keyExtractor={(item) => item.number}
                    />
                </View>
                <View>
                    <FlatList
                    data={chatList}
                    renderItem={renderItemChatlist}
                    keyExtractor={(item) => item.number}
                    />
                </View>
                
            </View>
            <View style={{display:chatList === undefined || chatList === 'undefined' ? 'flex' :'none',flex:1,justifyContent:'center',alignItems:'center',marginTop:10}}>
                <Icon name="up" size={30} color="#000" />
                <Text>Select Contact and Start Chating.</Text>
            </View>
            <TouchableOpacity onPress={clearChat} style={{backgroundColor:'red'}} >
                <Text>Clear data</Text>
            </TouchableOpacity>

        </View>
    )
}

export default Chat;