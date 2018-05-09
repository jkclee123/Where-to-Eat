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
  YellowBox
} from 'react-native';

import {GiftedChat, Actions, Bubble, SystemMessage} from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';
import { createStackNavigator } from 'react-navigation';
import AndroidWebView from './AndroidWebView'
import ImagePicker from 'react-native-image-picker'

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
      target: null
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
  }

  componentWillMount() {
    this._isMounted = true;
    this.message_state = 1;

    this.setState({ target: require('./data/messages.js') })
    this.setState(() => {
      return {
        messages: require('./data/messages.js')
      };
    });
  }

  componentDidMount(){
    if (this.target == null)
      this.props.navigation.navigate('First')
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
          if (this.prev_position.length >= 1){
            this.position = this.prev_position[this.prev_position.length - 1] + 1
            this.display(this.prev_position[this.prev_position.length - 1])
            this.prev_position.splice(this.prev_position.length - 1, 1)
          }
          else
            this.onReceive('No previous search result.')
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
          if (this.maxprice <= parseFloat(openrice_data[i].price.slice(1)))
            continue
          if (!this.not_in(this.blacklist_cuisine, openrice_data[i].cuisine))
            continue;
          if (openrice_data[i].mtr.includes("-"))
            if (this.distance <= parseInt(openrice_data[i].mtr.split("-")[0]))
              continue;
          if (!openrice_data[i].mtr.includes("-") && this.distance != 99)
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

      this.setState((previousState) => {
        return {
          typingText: null,
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
        this.props.navigation.navigate('Details');
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
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class DetailsScreen extends React.Component {
  handleClick = () => {
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

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source
        });
      }
    });
  }

  render() {
    return (
      <View>
        <Button title='UPLOAD' onPress={this.handleClick} />
      </View>
    );
  }  
}
//

class FirstScreen extends React.Component{
  render(){
    return(
      <Text>First</Text>
    )
  }
}
//

export default createStackNavigator(
  {
    Home: HomeScreen,
    Details: DetailsScreen,
    First: FirstScreen
  }, {
    initialRouteName: 'Home'
  }
);