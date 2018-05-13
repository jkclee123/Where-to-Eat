import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  WebView,
  Dimensions,
  Button,
  Image,
  YellowBox,
  AsyncStorage,
  TextInput
} from 'react-native';
import {GiftedChat, Actions, Bubble, SystemMessage} from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';
import { createStackNavigator } from 'react-navigation';
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

const openrice_data = require('./openrice_data.json');
const districts_list = require('./districts_list.json')
const choice_list = require('./choice_list.json')

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      typingText: null,
      PicturePath: ""
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderCustomView = this.renderCustomView.bind(this);
    this.onLocationReceive = this.onLocationReceive.bind(this);
    this.message_state = 0;
    this.position = 0;
    this.blacklist_cuisine = [];
    this.district = null;
    this.prev_position = [];
    this.choice = null;
    this.maxprice = 801.5;
    this.distance = 99;
    this.prev_state = 0;
    this.calories = 0;
    this.gram = 0;
  }

  componentWillMount() {
    this._isMounted = true;
    this.message_state = 1;

    this.setState(() => {
      return {
        messages: require('./data/messages.js')
      };
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
    this.answerDemo(messages);
  }

  answerDemo(messages) {
    if (messages.length > 0) {
      this.setState((previousState) => {
        return {
          typingText: 'React Native is typing...'
        };
      });
    }

    setTimeout(() => {
      global.consumed = 5
      global.date = "13"
      this.onReceive(global.consumed.toString())
      this.onReceive(global.date)
      AsyncStorage.setItem('consumed', global.consumed.toString());
      AsyncStorage.setItem('date', (new Date()).getDate().toString());  

      if (this.message_state == 1){
        for (var key in districts_list.districts){
          if (!this.not_in([messages[0].text.toLowerCase()], districts_list.districts[key])){
            this.district = key
            this.message_state = 2
          }
        }
        if (this.message_state == 1)
          this.onReceive('Tell me the district you are search resturant from!')
      }

      if (this.message_state == 3){
        this.choice = null
        for (var key in choice_list.choices){
          if (!this.not_in(messages[0].text.toLowerCase().split(" "), choice_list.choices[key]))
            this.choice = key
        }
        
        if (this.choice == null)
          this.onReceive('Sorry I do not understand :(');

        else if (this.choice == "pass"){
          this.prev_position[this.prev_position.length] = this.position - 1;
          this.message_state = 2          
        }


        else if (this.choice == "previous"){
          if (!(this.not_in(messages[0].text.toLowerCase().split(" "), choice_list.choices.pass))){
            this.prev_position[this.prev_position.length] = this.position - 1;
            this.message_state = 2
          }
        }

        else if (this.choice == "cuisine"){
          this.prev_position[this.prev_position.length] = this.position - 1;
          this.blacklist_cuisine = this.blacklist_cuisine.concat(openrice_data[this.position - 1].cuisine)
          this.message_state = 2
        }

        else if (this.choice == "accept"){
          this.onLocationReceive(this.position - 1)
          this.onReceive(openrice_data[this.position - 1].address)
          this.onReceive(openrice_data[this.position - 1].url)
          this.message_state = 5
        }

        else if (this.choice == "price"){
          this.maxprice = parseFloat(openrice_data[this.position - 1].price.slice(1));
          this.message_state = 2
        }

        else if (this.choice == "location"){
          if (openrice_data[this.position - 1].mtr.includes("-"))
            this.distance = parseInt(openrice_data[this.position - 1].mtr.split("-")[0])
          this.message_state = 2
        }
      }

      if (this.message_state == 2){
        for (var i = this.position; i < openrice_data.length; i++) {
          if (this.district != openrice_data[i].district.toLowerCase())
            continue
          if (!this.not_in(this.blacklist_cuisine, openrice_data[i].cuisine))
            continue;
          if (openrice_data[i].mtr.includes("-"))
            if (this.distance <= parseInt(openrice_data[i].mtr.split("-")[0]))
              continue;
          if (!openrice_data[i].mtr.includes("-") && this.distance != 99)
            continue;
          if (this.maxprice <= openrice_data[i].price.slice(1))
            continue;
          break;
        }
        if (i >= openrice_data.length){
          this.message_state = 2;
          this.onReceive("No resturant available :(\nRestarting search");
          this.blacklist_cuisine = []
          this.maxprice = 801.5
          this.choice = null
          this.prev_position = []
          this.position = 0
          this.distance = 99
        }
        else{
          this.position = i + 1;
          this.display(i)
          this.message_state = 3;
        }
      }

      if (this.message_state == 11){
        if (isNaN(parseInt(messages[0].text)))
          this.onReceive("How many grams did you consume?")
        else{
          this.onReceive("You have consumed " + Math.round(parseInt(messages[0].text) / this.gram * this.calories) + " calories.")
          this.message_state = this.prev_state
          if (global.date != (new Date()).getDate().toString()){
            global.date = new Date().getDate().toString()
            global.consumed = 0
          }
          global.consumed += Math.round(parseInt(messages[0].text) / this.gram * this.calories);
          AsyncStorage.setItem('consumed', global.consumed.toString());
          AsyncStorage.setItem('date', (new Date()).getDate().toString());  
        }
      }

      this.setState((previousState) => {
        return {
          typingText: null
        };
      });
    }, 1000);
  }

  not_in(sublist, list){
    for (var i = 0; i < sublist.length; i++){
      for (var j = 0; j < list.length; j++){
        if (sublist[i] == list[j])
          return false;
      }
    }
    return true;
  }

  handleClick(){
    if (this.message_state == 10 || this.message_state == 11){
      this.onReceive("Cannot choose image now.")
      return;
    }
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };

        this.setState({
          uploaded: true,
          PicturePath: response.path
        });

        this.prev_state = this.message_state
        this.message_state = 10
        this.onImageSend("file://" + this.state.PicturePath)

        var data = new FormData();
        data.append('file', {
          uri: "file://" + this.state.PicturePath, 
          name: 'food.jpg', 
          type: 'image/jpg' 
        });

        const config = {
          method: "POST",
          headers:{
            'Accept': 'text/plain',
            'Content-Type': 'multipart/form-data;'
          },
          body: data
        }
        this.onReceive('Processing request...\nThis may take a few minutes.')

        fetch('http://ir-api.ironsout.com:8080/cgi-bin/upload/upload.cgi', config)
          .then((responseData) => {
            return responseData.text()
          }).then((text) => { 
            var result_list = text.split(" ")
            // this.onReceive(result_list[5].split("\n")[0])
            if (parseFloat(result_list[5].split("\n")[0]) < 0.5){
              this.onReceive('Sorry I could not recognise that.') 
              this.message_state = this.prev_state
            }
            else{
              this.onReceive("This is " + result_list[1] + "\nContaining " + result_list[2] + " calories per " + result_list[3].slice(0, -1) + "\nHow many grams did you consume?")
              this.calories = parseInt(result_list[2])
              this.gram = parseInt(result_list[3].slice(0, -2))
              this.message_state = 11
            }
          })
          .catch(err => { 
            this.onReceive('Invalid image. Try another one :)') 
            this.message_state = this.prev_state
          })
      }
    });
  }

  display(pos){
    var text = ""
    for (var i = 0; i < openrice_data[pos].cuisine.length; i++){
      text += openrice_data[pos].cuisine[i];
      if (openrice_data[pos].cuisine.length > (i - 2) )
        text += ', '
    }
    this.onReceive('Is the resturant you are looking for called ' + openrice_data[pos].name + '?');
    // this.onLocationReceive(pos)
    this.onReceive('You can get there by ' + openrice_data[pos].mtr);
    this.onReceive("They serve " + text + "food");
  }

  onReceive(text) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            // avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        }),
      };
    });
  }

  onImageSend(source){
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          image: source,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Developer',
            // avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        }),
      };
    });
  }

  onLocationReceive(pos){
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            // avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
          location: {
            latitude: openrice_data[pos].location.latitude,
            longitude: openrice_data[pos].location.longitude
          }
        }),
      };
    });    
  }

  renderCustomActions(props) {
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
        />  
      );
    }
    const options = {
      'Food consultant': (props) => {
        this.handleClick();
      },
      'Calorie Meter': (props) => {
        this.props.navigation.navigate('First')
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }
//
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        // loadEarlier={this.state.loadEarlier}
        // onLoadEarlier={this.onLoadEarlier}
        // isLoadingEarlier={this.state.isLoadingEarlier}
        user={{
          _id: 1, // sent messages should have same user._id
        }}

        renderActions={this.renderCustomActions}
        renderBubble={this.renderBubble}
        renderSystemMessage={this.renderSystemMessage}
        renderCustomView={this.renderCustomView}
        renderFooter={this.renderFooter}
      />
    );
  }
}
//

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  }
});

var options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class FirstScreen extends React.Component{
  state = {
    progress: 0.3
  }

  componentWillMount(){
    AsyncStorage.getItem("date").then((value) => {
      if (value == null || (new Date()).getDate().toString() != value){
        global.date = (new Date()).getDate().toString()
        global.consumed = 0
      }
      else{
        global.date = value
        AsyncStorage.getItem("consumed").then((value) => {
          if (value == null)
            global.consumed = 0
          else
            global.consumed = value
        }).done();
      }
    }).done();

    AsyncStorage.getItem("target").then((value) => {
      if (value == null)
        global.target = 0
      else{
        global.target = value
      }
    }).done();
    if (global.target != 0){
      this.state.progress = global.consumed / global.target 
      this.state.progress = 0.3
    }
    else
      this.state.progress = 0.3
      // this.state.progress = 0
  }

  handleInput = (text) => {
    global.target = text
    AsyncStorage.setItem('target', text);
    if (global.target != 0)
      this.state.progress = global.consumed / global.target 
    else
      this.state.progress = 0
  }

  render(){
    return(
      <View>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText = { this.handleInput }
          placeholder="Enter Your Calorie Target"
        />

        <Progress.Circle progress={this.state.progress} size={100} showsText={true} animated={true}/>
        <Text>{global.consumed}</Text>
        <Text>{global.target}</Text>
        <Text>{global.date}</Text>
        <Text>{this.state.progress}</Text>
        <Button title='GO TO CHATBAT' onPress={this.handleClick} />
      </View>
    )
  }
}
//

export default createStackNavigator(
  {
    Home: HomeScreen,
    First: FirstScreen
  }, {
    initialRouteName: 'Home'
  }
);