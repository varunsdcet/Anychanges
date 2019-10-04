import React, {Component} from 'react';
import { StyleSheet, Text, View, Button,Dimensions,Image,TouchableOpacity } from 'react-native';
import Backend from "./Backend.js";
import { GiftedChat } from "react-native-gifted-chat";
import ImagePicker from 'react-native-image-picker';

import {NavigationActions, StackActions} from "react-navigation";
import Voice from "react-native-voice";
const GLOBAL = require('./Global');
const window = Dimensions.get('window');
type Props = {};
const options = {
    title: 'Select Avatar',
    maxWidth:300,
    maxHeight:500,
    customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};
export default class Chat extends Component<Props> {


    constructor(props) {
        super(props);


        this.state = {
            modalVisible: false,
            recognized: '',
            started: '',
            text :'',
            mystatus:false,
            results: [],
            messages: []

        };

    }





    renderBubble(props) {

        return (
            <View>
                <Text style={{color:'black'}}>{props.currentMessage.user.name}</Text>
            </View>
        );
    }
    componentWillMount() {


    }

    uploadImage = () => {
        const ext = this.state.imageUri.split('.').pop(); // Extract image extension
        const filename = `${uuid()}.${ext}`; // Generate unique name
        this.setState({ uploading: true });
        firebase
            .storage()
            .ref(`tutorials/images/${filename}`)
            .putFile(this.state.imageUri)
            .on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                    let state = {};
                    state = {
                        ...state,
                        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
                    };
                    if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
                        const allImages = this.state.images;
                        allImages.push(snapshot.downloadURL);
                        state = {
                            ...state,
                            uploading: false,
                            imgSource: '',
                            imageUri: '',
                            progress: 0,
                            images: allImages
                        };
                        AsyncStorage.setItem('images', JSON.stringify(allImages));
                    }
                    this.setState(state);
                },
                error => {
                    unsubscribe();
                    alert('Sorry, Try again.');
                }
            );
    };

    showActionSheet= ()=>{
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.uri };




                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    avatarSource: source,
                });
            }
        });
    }


    getlog = ()=>{


        const url =  GLOBAL.BASE_URL  + 'lat_long_address'

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },


            body: JSON.stringify({
                "latitude": GLOBAL.lat,
                "longitude":GLOBAL.long,





            }),
        }).then((response) => response.json())
            .then((responseJson) => {




                if (responseJson.status == true) {
                    GLOBAL.chatstatus = true

           //this.setState({mystatus:true})
                    this.getlog()

                }else{
                    GLOBAL.chatstatus = false
                    this.setState({mystatus:false})
                }
            })
            .catch((error) => {
                console.error(error);
                this.hideLoading()
            });

    }


    renderActions=() =>{
        return(
            <TouchableOpacity onPress={()=>this.showActionSheet()}>
                <Image style={{width:22, height:22, resizeMode:'contain', marginLeft:9, marginBottom:12}}
                       source={require('./paperclip.png')}/>
            </TouchableOpacity>
        )
    }
    login = () => {
        this.props
            .navigation
            .dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({
                        routeName: 'Landing',
                        params: { someParams: 'parameters goes here...' },
                    }),
                ],
            }))
    }

    render() {

        return (




                    <GiftedChat
                        renderActions={this.renderActions}

                        renderUsernameOnMessage = {true}
                        messages={this.state.messages}
                        onSend={message => {
                            Backend.sendMessage(message);
                        }}

                        user={{
                            _id: GLOBAL.user_id,
                            name: GLOBAL.myname
                        }}
                    />

        );
    }


    componentDidMount() {
        this.getlog()

        Backend.loadMessages(message => {
            this.setState(previousState => {
                return {
                    messages: GiftedChat.append(previousState.messages, message)
                };
            });
        });
    }
    componentWillUnmount() {
        Backend.closeChat();
    }
}
const styles = StyleSheet.create({
    wrapper: {
    },
    container: {
        flex: 1,
        backgroundColor :'#001739'
    },
    slide1: {

        marginLeft : 50,

        width: window.width - 50,
        height:300,
        resizeMode:'contain',
        marginTop : window.height/2 - 200


    },
    loading: {
        position: 'absolute',
        left: window.width/2 - 30,

        top: window.height/2,

        opacity: 0.5,

        justifyContent: 'center',
        alignItems: 'center'
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9',
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    }
})