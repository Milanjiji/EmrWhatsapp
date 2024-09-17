import React, { useEffect, useState,useRef } from "react";
import { View, Text, TextInput,PermissionsAndroid, FlatList, Animated, TouchableOpacity, LogBox } from "react-native";
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import SmsListener from 'react-native-android-sms-listener-background';
import Contacts from 'react-native-contacts';
import Icon from 'react-native-vector-icons/AntDesign';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import SendSms from "./SendSms";
import colors from '../colors.json'
const Colors = colors[0];

const Chat = (props) => {

    const animatedWidth = useRef(new Animated.Value(0)).current;
    const animatedHeight = useRef(new Animated.Value(0)).current;

    const [addContactState,setAddContactState] = useState(false);

    const [chatList,setChatList] = useState([]);

    const [contactNumber,setContactNumber] = useState('');
    const [contactName,setContactName] = useState('');

    const [openChatName,setOpenChatName] = useState('');
    const [OpenChatNumber,setOpenChatNumber] = useState('');
    const [openChatData,setOpenChatData] = useState([]);

    const [chatState,setChatState] = useState(false);

    const [message,setMessage] = useState('');

    const [listnerState,setListnerState] = useState(false);

    const storage = props.storage;

    useEffect(() => {

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

      const findContactByNumber = (number) => {
        return chatList.find(contact => contact.number.replace(/[^\d]/g, '') == number);
      };
    useEffect(()=>{

        async function requestNotificationPermission() {
            const settings = await notifee.requestPermission();
            if (settings.authorizationStatus < 1) {
              console.log('Notification permissions not granted');
            }
          }
          requestNotificationPermission();
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
                    setChatList(JSON.parse(data));
                }
            } catch (error) {
                console.log(error);
            }
          }
          getChatList();
          storage.set('openChatNumber','')
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
                    displayNotification();

                    const rawData = storage.getString('chatlist');
                    const forFindingNumberRawData = [[]];
                    
                    if(rawData !== undefined){
                        console.log("raw data is not undefinded",rawData);
                        forFindingNumberRawData.push(JSON.parse(rawData)); 
                    }else{
                        forFindingNumberRawData.push([{name:'Smaple name',number:'0000000000'}])
                    }
                    console.log(forFindingNumberRawData,"for finding raw data");
                    
                    
                    const contactFinder = forFindingNumberRawData[1].find(contact => contact.number.replace(/[^\d]/g, '') == message.originatingAddress);
                    console.log(contactFinder,forFindingNumberRawData[0],"contact finder");
                    
                    if(contactFinder === 'undefined' || contactFinder === undefined){
                        console.log("contact finder undefined");
                        
                        const getChatList = () =>{
                            console.log("gvetting chatlist started");
                            
                            if( !rawData || rawData === 'undefined'){
                                const keygenerator = Math.floor(Math.random() * 10000);
                                const msgData = [...openChatData,{message:message.body,key:keygenerator}];

                                storage.set(message.originatingAddress,JSON.stringify(msgData));
        
                                data = [{name:message.originatingAddress,number:message.originatingAddress}];
                                
                                storage.set('chatlist',JSON.stringify(data))
                                setChatList(data);
                                
                            }else{
                                const data = JSON.parse(rawData)
                                const newData = [...data,{name:message.originatingAddress,number:message.originatingAddress}]
                                console.log(newData,"else data is defined");
                                
                                setChatList(data);
                                storage.set('chatlist',JSON.stringify(data));

                                const getChatData = storage.getString(message.originatingAddress);

                                if( !getChatData || getChatData === 'undefined'){

                                    const keygenerator = Math.floor(Math.random() * 10000);
                                    const data = [{message:message.body,key:keygenerator}];
                                    storage.set(message.originatingAddress,JSON.stringify(data));
                                    console.log(data,"storage setting if there is no chat data for specific number recived");
                                }else{
                                    const data = JSON.parse(getChatData);
                                    const keygenerator = Math.floor(Math.random() * 10000);
                                    const newData = [...data,{message:message.body,key:keygenerator}];
                                    console.log(newData,"sorage setting if there is chat data");
                                    storage.set(message.originatingAddress,JSON.stringify(newData));
                                }
                            }
                          }
                          getChatList();
        
                    }else{
                        console.log("already number ideentified");
                        
                        const getChatData = storage.getString(message.originatingAddress);
                        const OpenChatNumber = storage.getString('openChatNumber');
                        
                        if(getChatData === undefined || getChatData === 'undefined'){
                            const keygenerator = Math.floor(Math.random() * 10000);
                            const newData = [{message:message.body,key:keygenerator}];
                            storage.set(message.originatingAddress,JSON.stringify(newData));
                            if(OpenChatNumber === message.originatingAddress){
                                console.log("open chat is currently using ");
                                getOpenChatData(message.originatingAddress);
                            }
                        }else{
                            const data = JSON.parse(getChatData);
                            const keygenerator = Math.floor(Math.random() * 10000);
                            const newData = [...data,{message:message.body,key:keygenerator}];
                            storage.set(message.originatingAddress,JSON.stringify(newData));
                            if(OpenChatNumber === message.originatingAddress){
                                console.log("open chat is currently using ");
                                getOpenChatData(message.originatingAddress);
                            }
                        }
                    }

                });
                setListnerState(true)
                } catch (error) {
                console.log(error);
                }
            };

            if(!listnerState){
                addListener();
                console.log("listner startede");
            }else{
                console.log("listner already running"); 
            }

            
    },[])


    const getOpenChatData = (number) =>{
        const getChatData = storage.getString(number);

        if(getChatData === undefined || getChatData === 'undefined'){
            setOpenChatData([])
        }else{
            const data = JSON.parse(getChatData);
            setOpenChatData(data)
        }
    }

    
    const AddContact = () =>{

        const contactFinder = findContactByNumber(contactNumber);
        if(contactNumber.length >= 10 && contactName.length > 1){
            if( contactFinder=== undefined || contactFinder === 'undefined'){
                const data = [...chatList,{name:contactName,number:contactNumber}]
                setChatList(data)
                storage.set('chatlist',JSON.stringify(data));
                setContactName('');
                setContactNumber('');
                setAddContactState(false);
                Animated.timing(animatedWidth, {
                    toValue: 0,
                    duration: 500, 
                    useNativeDriver: false, 
                }).start();
            }else{
                if(chatState){
                    setOpenChatName('');
                    setOpenChatNumber('');
                    getOpenChatData('');
                    setChatState(!chatState)
                }else{
                    setOpenChatName(contactFinder.name);
                    setOpenChatNumber(contactFinder.number);
                    getOpenChatData(contactFinder.number);
                    setChatState(!chatState);
                    setContactName('');
                    setContactNumber('');
                    setAddContactState(false);
                    Animated.timing(animatedWidth, {
                        toValue: 0,
                        duration: 500, 
                        useNativeDriver: false, 
                    }).start();
                }
            }
        }else{
            setAddContactState(false);
            Animated.timing(animatedWidth, {
                toValue: 0,
                duration: 500, 
                useNativeDriver: false, 
            }).start();
        }
    }
    

    const normalizePhoneNumber = (phoneNumber) => {
        return phoneNumber.replace(/[^\d]/g, ''); 
      };
    const renderItemChatlist = (data) =>{
        const item  = data.item;

        const renderChatChata = () =>{
            
            if(chatState){
                setOpenChatName('');
                setOpenChatNumber('');
                getOpenChatData('');
                storage.set('openChatNumber','');
            }else{
                setOpenChatName(item.name);
                setOpenChatNumber(item.number);
                getOpenChatData(item.number);
                storage.set('openChatNumber',item.number)
            }
            setChatState(!chatState)
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

            const phoneNumber = normalizePhoneNumber(OpenChatNumber);
            const result =  SendSms.SendSMS(phoneNumber, message);
            const keygenerator = Math.floor(Math.random() * 10000);
            const data = [...openChatData,{message:message,key:keygenerator}];

            if (result.success) {
                console.log('SMS sent successfully:', result.response);
                setOpenChatData(data);
                storage.set(item.number,JSON.stringify(data));
                setMessage('');
              } else {
                console.error('Failed to send SMS:', result.error);
              }

            
        }

        return (
            <View
            style={{
                paddingHorizontal:10,
                paddingVertical:10,
                elevation:1,
                backgroundColor:'white',
                marginTop:10,
                borderRadius:10,
                marginHorizontal:10,
                marginBottom:10
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
                <View style={{display:OpenChatNumber === item.number ? 'flex' : 'none'}} >
                    <FlatList
                    data={openChatData}
                    renderItem={renderChat}
                    keyExtractor={(item) => item.key}
                    />
                    <View style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexDirection:'row',marginTop:10}} >
                        <TextInput value={message} placeholder="Enter some text here" onChangeText={setMessage} 
                        style={{backgroundColor:'white',flex:1,padding:chatState ? 20 : 0,paddingVertical:chatState ? 20 : 0,borderRadius:20,marginRight:10}} />
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


    const animateWidth = () => {
       if(addContactState){
        Animated.timing(animatedWidth, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
       }else{
        Animated.timing(animatedWidth, {
            toValue: 300,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
       }
       setAddContactState(!addContactState)
      };
    
    return(
        <View style={{borderTopLeftRadius:10,borderTopRightRadius:10,marginTop:0,display:'flex',flex:1}} >
            
            <View style={{display:'flex',flexDirection:"column",flex:1,borderRadius:10,marginVertical:10}} >
                <View style={{display:'flex',flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:10}} >
                    <Animated.View style={{width:animatedWidth}} >
                        <TextInput  value={contactName} onChangeText={setContactName} style={{flex:1,backgroundColor:'white',borderRadius:10,paddingHorizontal:addContactState ? 20 : 0,paddingVertical:addContactState ? 10 :0,opacity:addContactState ? 1 : 0,marginRight:10}} placeholder="Enter name" />
                        <TextInput value={contactNumber} onChangeText={setContactNumber} style={{flex:1,backgroundColor:'white',borderRadius:10,paddingHorizontal:addContactState ? 20 : 0,paddingVertical:addContactState ? 10 :0,opacity:addContactState ? 1 : 0,marginTop:10,marginRight:10}} placeholder="Enter number" />
                    </Animated.View>

                    <TouchableOpacity style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',height:100,backgroundColor:Colors.secondary,borderRadius:10,elevation:2}} onPress={!addContactState ? animateWidth : AddContact}>
                        <Icon name={ !addContactState ? "pluscircleo" : 'check'} size={30} color="#000" />
                    </TouchableOpacity>
                    
                </View>
                <View>
                    <FlatList
                    data={chatList}
                    renderItem={renderItemChatlist}
                    keyExtractor={(item) => item.number }
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