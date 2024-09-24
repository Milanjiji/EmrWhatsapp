import React, { useEffect, useState,useRef } from "react";
import { View, Text, TextInput,PermissionsAndroid, FlatList, Animated, TouchableOpacity, ScrollView,Alert } from "react-native";
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import SmsListener,{SmsRetriever} from 'react-native-android-sms-listener-background';
import Icon from 'react-native-vector-icons/AntDesign';
import FontisoIcon from 'react-native-vector-icons/Fontisto';
import base64 from 'react-native-base64'
import SendSms from "./SendSms";
import colors from '../colors.json'
const Colors = colors[0];

const key = '06060606'

const Chat = (props) => {

    const animatedWidth = useRef(new Animated.Value(0)).current;
    const animatedHeight = useRef(new Animated.Value(40)).current;
    const animatedHeightScrollView = useRef(new Animated.Value(0)).current;
    const inputRef = useRef(null);
    
    const [addContactState,setAddContactState] = useState(false);

    const [chatList,setChatList] = useState([]);

    const [contactNumber,setContactNumber] = useState('');
    const [contactName,setContactName] = useState('');

    const [OpenChatNumber,setOpenChatNumber] = useState('');
    const [openChatData,setOpenChatData] = useState([]);

    const [chatState,setChatState] = useState(false);

    const [message,setMessage] = useState('');

    const [listnerState,setListnerState] = useState(false);

    const [editMenuNumber,setEditMenuNumber] = useState('');

    const [editTextInputNumber,setEditTextInputNumber] = useState('');
    const [editNewNumber,setEditNewNumber] = useState('');

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

    const reorderChatList = (contacts, number) =>{
        const index = contacts.findIndex(contact => contact.number === number);
        console.log(index);
        
        if (index !== -1) {
            const [item] = contacts.splice(index, 1);  
            contacts.unshift(item);                    
        }
        return contacts;
    }
    
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
                    const cheak = base64.decode(message.body);
                    console.log(cheak.slice(0,3),"cheak system");
                    
                    if(cheak.slice(0,3) === '000'){
                        message.body = base64.decode(message.body).slice(3)
                        console.log(message.body);
                        
                        if(message.originatingAddress.slice(0,1) == '+'){
                            message.originatingAddress = message.originatingAddress.slice(3);
                        }
                        
                        const displayNotification = async (name,body) =>{
                            try {
                                const channelId = await notifee.createChannel({
                                    id: 'default',
                                    name: 'Default Channel',
                                    importance: AndroidImportance.HIGH, 
                                });
                            
                                await notifee.displayNotification({
                                    title: name,
                                    body: body,
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
                        
    
                        const rawData = storage.getString('chatlist');
                        const forFindingNumberRawData = [[]];
                        
                        if(rawData !== undefined){
                            console.log("raw data is definded",rawData);
                            forFindingNumberRawData.push(JSON.parse(rawData)); 
                        }else{
                            forFindingNumberRawData.push([{name:'Smaple name',number:'0000000000'}])
                        }
                        console.log(forFindingNumberRawData,"for finding raw data");
                        
                        
                        const contactFinder = forFindingNumberRawData[1].find(contact => contact.number.replace(/[^\d]/g, '') == message.originatingAddress);
                        console.log(contactFinder,forFindingNumberRawData[0],"contact finder");
                        
                        if(contactFinder === undefined){
                            //if number if not identified
                            console.log("contact finder undefined");
                            
                            const getChatList = () =>{
                                console.log("gvetting chatlist started");
                                
                                if( !rawData || rawData === undefined){
                                    // if there is no existing chat
                                    const keygenerator = Math.floor(Math.random() * 10000);
                                    const msgData = [{message:base64.decode(message.body),key:keygenerator,author:'user'}];
    
                                    storage.set(message.originatingAddress,JSON.stringify(msgData));
            
                                    data = [{name:message.originatingAddress,number:message.originatingAddress}];
                                    const reorderedList = reorderChatList([...data],message.originatingAddress);
                                    
                                    storage.set('chatlist',JSON.stringify(reorderedList))
                                    setChatList(reorderedList);
                                    displayNotification(message.originatingAddress,message.body)
                                    
                                }else{
                                    //if there is existing chat
                                    const data = JSON.parse(rawData)
                                    const newData = [...data,{name:message.originatingAddress,number:message.originatingAddress}]
                                    const reorderedList = reorderChatList([...newData],message.originatingAddress);
                                    
                                    setChatList(reorderedList);
                                    storage.set('chatlist',JSON.stringify(reorderedList));
    
                                    const getChatData = storage.getString(message.originatingAddress);
    
                                    if( !getChatData || getChatData === undefined){
    
                                        const keygenerator = Math.floor(Math.random() * 10000);
                                        const data = [{message:message.body,key:keygenerator,author:'user'}];
                                        storage.set(message.originatingAddress,JSON.stringify(data));
                                        console.log(data,"storage setting if there is no chat data for specific number recived");
                                    }else{
                                        const data = JSON.parse(getChatData);
                                        const keygenerator = Math.floor(Math.random() * 10000);
                                        const newData = [...data,{message:message.body,key:keygenerator,author:'user'}];
                                        console.log(newData,"sorage setting if there is chat data");
                                        storage.set(message.originatingAddress,JSON.stringify(newData));
                                    }
                                    displayNotification(message.originatingAddress,message.body)
                                }
                              }
                              getChatList();
            
                        }else{
                            // if number is identified 
                            const getChatData = storage.getString(message.originatingAddress);
                            const OpenChatNumber = storage.getString('openChatNumber');
                            
                            if(getChatData === undefined || getChatData === 'undefined'){
                                //if there is no messages 
                                const keygenerator = Math.floor(Math.random() * 10000);
                                const newData = [{message:message.body,key:keygenerator,author:'user'}];
                                console.log([...chatList],"initial Chatlist")
                                
                                const chatlist = JSON.parse(rawData);
    
                                const reOrderedChatList = reorderChatList([...chatList],message.originatingAddress)
                                setChatList(reOrderedChatList)
                                storage.set('chatlist',JSON.stringify(reOrderedChatList))
                                console.log("New reorderd ChatList",reOrderedChatList);
                                
                                storage.set(message.originatingAddress,JSON.stringify(newData));
                                if(OpenChatNumber === message.originatingAddress){
                                    console.log("open chat is currently using ");
                                    getOpenChatData(message.originatingAddress);
                                }else{
                                    displayNotification(contactFinder.name.message.body)
                                }
    
                            }else{
                                
                                const data = JSON.parse(getChatData);
                                const keygenerator = Math.floor(Math.random() * 10000);
                                const newData = [...data,{message:message.body,key:keygenerator,author:'user'}];
                                storage.set(message.originatingAddress,JSON.stringify(newData));
                                
                                const chatlist = JSON.parse(rawData);
    
                                const reOrderedChatList = reorderChatList([...chatlist],message.originatingAddress)
                                setChatList(reOrderedChatList)
                                storage.set('chatlist',JSON.stringify(reOrderedChatList))
                                console.log("New reorderd ChatList",reOrderedChatList);
    
                                if(OpenChatNumber === message.originatingAddress){
                                    console.log("open chat is currently using ");
                                    getOpenChatData(message.originatingAddress);
                                }else{
                                    displayNotification(contactFinder.name,message.body)
                                }
                            }
                        }
    
                    }
                });
                //
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
                Animated.timing(animatedHeightScrollView, {
                    toValue: 300,
                    duration: 200, 
                    useNativeDriver: false, 
                  }).start();
                Animated.timing(animatedHeight, {
                    toValue: 40,
                    duration: 500, 
                    useNativeDriver: false, 
                }).start();
            }else{
                if(chatState){
                    setOpenChatNumber('');
                    getOpenChatData('');
                    setChatState(!chatState)
                }else{
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
                    Animated.timing(animatedHeight, {
                        toValue: 40,
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
            Animated.timing(animatedHeight, {
                toValue: 40,
                duration: 500, 
                useNativeDriver: false, 
            }).start();
        }

        
        
        setOpenChatNumber(contactNumber);
        getOpenChatData(contactNumber);
        storage.set('openChatNumber',contactNumber)
       
        setChatState(true)
    }
    

    const normalizePhoneNumber = (phoneNumber) => {
        return phoneNumber.replace(/[^\d]/g, ''); 
      };
    const DeleteContact = (number) =>{
        Alert.alert(
            "Delete Chat ?", 
            "Do you want to delete the contact and the chat...",
            [
              {
                text: "No",
                onPress: () => console.log("No Pressed"),  
                style: "cancel"  
              },
              { 
                text: "Yes", 
                onPress: () => {
                    const newData = chatList.filter(contact => contact.number != number);
                    setChatList(newData);
                    storage.set('chatlist',JSON.stringify(newData))
                    storage.set(number,'')} 
              }
            ],
            { cancelable: false }  
          );
    }

    const EditContact = (number) =>{
        console.log(chatList);
        const newContact = chatList.map(contact =>{
            if (contact.number == number){
                return {...contact,name:editNewNumber}
            }
            return contact;
        })
        setChatList(newContact);
        storage.set('chatlist',JSON.stringify(newContact))
        setEditNewNumber('');
        setEditTextInputNumber('')
    }
    const renderItemChatlist = (data) =>{
        const item  = data.item;

        const renderChatChata = () =>{
            
            if(chatState){
                if(OpenChatNumber == item.number){
                    Animated.timing(animatedHeightScrollView, {
                        toValue: 0,
                        duration: 200, 
                        useNativeDriver: false, 
                      }).start(()=>{
                        setOpenChatNumber('');
                        getOpenChatData('');
                        storage.set('openChatNumber','');
                      });
                }else{
                    setOpenChatNumber(item.number);
                    getOpenChatData(item.number);
                    storage.set('openChatNumber',item.number)
                    Animated.timing(animatedHeightScrollView, {
                        toValue: 300,
                        duration: 200, 
                        useNativeDriver: false, 
                      }).start();
                }
                setChatState(false)
            }else{
                if(OpenChatNumber == item.number){
                    setOpenChatNumber(item.number);
                    getOpenChatData(item.number);
                    storage.set('openChatNumber',item.number)
                    Animated.timing(animatedHeightScrollView, {
                        toValue: 300,
                        duration: 200, 
                        useNativeDriver: false, 
                      }).start();
                }else{
                    Animated.timing(animatedHeightScrollView, {
                        toValue: 0,
                        duration: 200, 
                        useNativeDriver: false, 
                      }).start(()=>{
                        setOpenChatNumber('');
                        getOpenChatData('');
                        storage.set('openChatNumber','');
                      });
                }
            }
            setChatState(true)

        }

        const renderChat = (data) =>{
            const item = data.item;
            
            return(
                <View style={{display:'flex',flex:0,marginVertical:3}} >
                    <Text style={{flex: 0,alignSelf: item.author == 'me' ? 'flex-end' : 'flex-start',backgroundColor:Colors.secondary,paddingHorizontal:10,paddingVertical:4,borderRadius:4,elevation:1,color:'black'}}>{item.message}</Text>
                </View>
            )
        }

        const sendMessage = () =>{

            const phoneNumber = normalizePhoneNumber(OpenChatNumber);
            const result =  SendSms.SendSMS(phoneNumber, base64.encode("000"+message));
            const keygenerator = Math.floor(Math.random() * 10000);
            const data = [...openChatData,{message:message,key:keygenerator,author:'me'}];

            if (result.success) {
                console.log('SMS sent successfully:', result.response);
                setOpenChatData(data);
                console.log(data);
                
                storage.set(item.number,JSON.stringify(data));
                setMessage('');
              } else {
                console.error('Failed to send SMS:', result.error);
                if(result.error == undefined){
                    console.log('SMS sent successfully:', result.response);
                    setOpenChatData(data);
                    console.log(data);
                    
                    storage.set(item.number,JSON.stringify(data));
                    setMessage('');
                }
              }

            
        }
        const EditTextInput = () =>{
            if(editTextInputNumber == item.number){
                setEditTextInputNumber('')
            }else{
                setEditTextInputNumber(item.number);
                inputRef.current?.focus();
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
                marginBottom:0
            }}
            >
                <TouchableOpacity onPress={renderChatChata} style={{display:'flex',flexDirection:'row',alignItems:'center'}} >
                    <View style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:Colors.primary,borderRadius:40,marginRight:10}} >
                        <Text style={{color:'black',fontFamily:Colors.Med,display:'flex',alignItems:'center'}} >{item.name.charAt(0)}</Text>
                    </View>
                    <View style={{display:'flex',flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}} >
                        <View>
                            <Text style={{color:'black',display:editTextInputNumber == item.number ? 'none' :'flex'}} >{item.name}</Text>
                            <TextInput onBlur={()=>{setEditTextInputNumber('');setEditMenuNumber('')}} ref={inputRef}  value={editNewNumber} onChangeText={setEditNewNumber} style={{display:editTextInputNumber == item.number ? 'flex' :'none',borderBottomColor:Colors.primary,borderBottomWidth:1,flex:1}}  placeholder="Enter new name..." />
                        </View>
                        
                        <View style={{display:'flex',flexDirection:'row',}} >
                            <TouchableOpacity onPress={()=>EditContact(item.number)} style={{marginRight:10,display:editNewNumber.length > 1 && editMenuNumber == item.number ? 'flex' : 'none',paddingHorizontal:10}} >
                                <Icon name="check" size={15} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>DeleteContact(item.number)} style={{marginRight:10,display:editMenuNumber == item.number ? 'flex' : 'none'}} >
                                <Icon name="delete" size={15} color="#ff6666" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={EditTextInput} style={{marginRight:10,display:editMenuNumber == item.number ? 'flex' : 'none'}} >
                                <Icon name="edit" size={15} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{editMenuNumber == item.number ? setEditMenuNumber('') : setEditMenuNumber(item.number)}} style={{transform:[{rotate:"90deg"}],marginRight:10}} >
                                <Icon name="ellipsis1" size={15} color="#000" />
                            </TouchableOpacity>
                            <Icon name="down" size={15} color="#000" />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{display:OpenChatNumber === item.number ? 'flex' : 'none',}} >
                    <Animated.ScrollView style={{height:animatedHeightScrollView,overflow:'scroll'}} >
                        <FlatList
                        style={{marginVertical:0}}
                        data={openChatData}
                        renderItem={renderChat}
                        keyExtractor={(item) => item.key}
                        />
                    </Animated.ScrollView>
                    <View style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexDirection:'row',marginTop:10}} >
                        <TextInput placeholder="message..." value={message}  onChangeText={setMessage} 
                        style={{backgroundColor:Colors.secondary,flex:1,paddingHorizontal:chatState ? 20 : 0,paddingVertical:chatState ? 10 : 0,borderRadius:20,marginRight:10}} />
                        <TouchableOpacity onPress={sendMessage}>
                            <FontisoIcon name="paper-plane" size={20} color="#000" style={{backgroundColor:Colors.primary,padding:13,borderRadius:30}} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    

    


    const animateWidth = () => {
       if(addContactState){
        Animated.timing(animatedWidth, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
          Animated.timing(animatedHeight, {
            toValue: 40,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
       }else{
        Animated.timing(animatedWidth, {
            toValue: 300,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
          Animated.timing(animatedHeight, {
            toValue: 100,
            duration: 500, 
            useNativeDriver: false, 
          }).start();
       }
       setAddContactState(!addContactState)
      };

  
    
    
    return(
        <ScrollView style={{borderTopLeftRadius:10,borderTopRightRadius:10,display:'flex',flex:1}} >
            
            <View style={{display:'flex',flexDirection:"column",flex:1,borderRadius:10}} >
                <View style={{display:'flex',flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:10}} >
                    <Animated.View style={{width:animatedWidth}} >
                        <TextInput  value={contactName} onChangeText={setContactName} style={{flex:1,backgroundColor:'white',borderRadius:10,paddingHorizontal:addContactState ? 20 : 0,paddingVertical:addContactState ? 10 :0,opacity:addContactState ? 1 : 0,marginRight:10}} placeholder="Enter name" />
                        <TextInput value={contactNumber} onChangeText={setContactNumber} style={{flex:1,backgroundColor:'white',borderRadius:10,paddingHorizontal:addContactState ? 20 : 0,paddingVertical:addContactState ? 10 :0,opacity:addContactState ? 1 : 0,marginTop:10,marginRight:10}} placeholder="Enter number" />
                    </Animated.View>
                    <Animated.View style={{flex:1,display:'flex',height:animatedHeight,backgroundColor:Colors.secondary,borderRadius:10,elevation:2}}  >
                        <TouchableOpacity style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center'}} onPress={!addContactState ? animateWidth : AddContact}>
                            <Icon name={ !addContactState ? "pluscircleo" : 'check'} size={20} color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
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
            

        </ScrollView>
    )
}

export default Chat;