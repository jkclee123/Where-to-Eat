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
  AsyncStorage
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
const state_get_district = 1
const state_fetch_result = 2
const state_get_next_choice = 3
var nlp = require('compromise')

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      typingText: null,
      target: null,
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
    this.districts = [];
    this.prev_position = [];
    this.choice = "";
    this.maxprice = 801.5;
    this.distance = 99;
    this.prev_state = 0;
    this.calories = 0;
    this.gram = 0;
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

    global.date = (new Date()).getDate().toString()
    AsyncStorage.getItem("date").then((value) => {
      if (value != global.date || value == null)
        global.consumed = 0
      else{
        AsyncStorage.getItem("consumed").then((value) => {
          global.consumed = parseInt(value)
        }).done();
      }
    }).done()    
    AsyncStorage.getItem("target").then((value) => {
      if (value != null)
        global.target = parseInt(value)
      else
        global.target = 0
    }).done()

    // AsyncStorage.setItem('date', global.date);
    // AsyncStorage.setItem('consumed', global.consumed.toString());
    // AsyncStorage.setItem('target', global.target.toString());

    if (global.target != 0)
      global.progress = parseFloat(global.consumed / global.target)
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchResult(){
    for (var i = this.position; i < openrice_data.length; i++) {
      let districts_flag = false
      for (let d in this.districts){
        if (this.districts[d] == openrice_data[i].district.toLowerCase())
          districts_flag = true
      }
      if (!districts_flag)
        continue
      if (!this.not_in(this.blacklist_cuisine, openrice_data[i].cuisine))
        continue;
      if (openrice_data[i].mtr != null)
        if (openrice_data[i].mtr.includes("-"))
          if (this.distance <= parseInt(openrice_data[i].mtr.split("-")[0]))
            continue;
      if (openrice_data[i].mtr != null)
        if (!openrice_data[i].mtr.includes("-") && this.distance != 99)
          continue;
      if (this.maxprice <= openrice_data[i].price.slice(1))
        continue;
      break
    }
    //restart state_fetch_result
    if (i >= openrice_data.length){
      this.message_state = state_fetch_result;
      this.answerOutput("No resturant available :(\nRestarting search");
      this.blacklist_cuisine = []
      this.maxprice = 801.5
      this.choice = ""
      this.prev_position = []
      this.position = 0
      this.distance = 99
    }
    else{
      this.position = i + 1;
      this.display(i)
      this.message_state = state_get_next_choice;
    }
          
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });

    if (messages.length > 0) {
      switch(this.message_state) {
        case state_get_district:
          nlp_input = nlp(messages[0].text.toLowerCase())
          for (let key in districts_list.districts){
            for (let k2 in districts_list.districts[key]){
              if (nlp_input.has(districts_list.districts[key][k2])){
                this.districts[this.districts.length] = key
                break
              }
            }
          }
          if (this.districts.length>0){
            let out = ""
            for (let d in this.districts){
              out+=this.districts[d]+", "
            }
            out = out.slice(0, -2); //remove last 2 char
            this.answerOutput("You have chosen: "+out)

            //change state
            this.fetchResult()
            this.message_state = state_get_next_choice
          }
          else{
            this.answerOutput('Tell me the district you wanna search!')
            break
          }
                  
        case state_get_next_choice:
          nlp_input = nlp(messages[0].text.toLowerCase())

          if (nlp_input.has("(pass|not|know)")){
            this.prev_position[this.prev_position.length] = this.position - 1;
            this.fetchResult()         
          }

          else if (nlp_input.has("(previous|last)")){
            if (!(this.not_in(messages[0].text.toLowerCase().split(" "), choice_list.choices.pass))){
              this.prev_position[this.prev_position.length] = this.position - 1;
              this.fetchResult()
            }
          }

          else if (nlp_input.has("(cuisine|taste)")){
            this.prev_position[this.prev_position.length] = this.position - 1;
            this.blacklist_cuisine = this.blacklist_cuisine.concat(openrice_data[this.position - 1].cuisine)
            this.fetchResult()
          }

          else if (nlp_input.has("(good|nice|yes)")){
            this.onLocationReceive(this.position - 1)
            this.answerOutput(openrice_data[this.position - 1].address)
            this.answerOutput(openrice_data[this.position - 1].url)
            this.message_state = 5
          }

          //else if (this.choice == "price"){
          else if (nlp_input.has('(expensive|cost)')){
            this.answerOutput('I know it\'s expensive!')
            this.maxprice = parseFloat(openrice_data[this.position - 1].price.slice(1));
            this.fetchResult()
          }

          else if (nlp_input.has("(far)")){
            if (openrice_data[this.position - 1].mtr != null)
              if (openrice_data[this.position - 1].mtr.includes("-"))
                this.distance = parseInt(openrice_data[this.position - 1].mtr.split("-")[0])
            this.fetchResult()
          }
          break
        default:
          this.answerOutput("Something went wrong!")
          break
      }
      
        
      
    }
  }
  //For output Img
  answerOutputImg(output, source) {
      this.setState((previousState) => {
        return {
          typingText: 'React Native is typing...'
        };
      });
    

    setTimeout(() => {
      this.onReceiveImg(output, source)
      this.setState((previousState) => {
        return {
          typingText: null
        };
      });
    }, 1000);
  }
  //For output message
  answerOutput(output) {
      this.setState((previousState) => {
        return {
          typingText: 'React Native is typing...'
        };
      });
    

    setTimeout(() => {
      this.onReceive(output)
      this.setState((previousState) => {
        return {
          typingText: null
        };
      });
    }, 1000);
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
      //check district until found
      if (this.message_state == 1){
        
      }

      //go to next choice
      if (this.message_state == 3){
        
        
      }

      //do corresponding action
      if (this.message_state == 2){
        
      }

      // calculate calories
      if (this.message_state == 11){
        if (isNaN(parseInt(messages[0].text)))
          this.answerOutput("How many grams did you consume?")
        else{
          this.answerOutput("You have consumed " + parseInt(messages[0].text) / this.gram * this.calories + " kcal.")
          this.message_state = this.prev_state
          if (global.date != (new Date()).getDate().toString()){
            global.date = (new Date()).getDate().toString()
            global.consumed = 0
          }
          global.consumed += Math.round(parseInt(messages[0].text) / this.gram * this.calories);
          AsyncStorage.setItem('consumed', global.consumed.toString());
          AsyncStorage.setItem('date', global.date); 
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
      this.answerOutput("Cannot choose image now.")
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
        this.answerOutput('Processing request...\nThis may take a few minutes.')

        fetch('http://ir-api.ironsout.com:8080/cgi-bin/upload/upload.cgi', config)
          .then((responseData) => {
            return responseData.text()
          }).then((text) => { 
            var result_list = text.split(" ")
            // this.answerOutput(result_list[5].split("\n")[0])
            if (parseFloat(result_list[5].split("\n")[0]) < 0.5){
              this.answerOutput('Sorry I could not recognise that.') 
              this.message_state = this.prev_state
            }
            else{
              this.answerOutput("It is " + result_list[1] + "\nContaining " + result_list[2] + " calories per " + result_list[3].slice(0, -1) + "\nHow many grams did you consume?")
              this.calories = parseInt(result_list[2])
              this.gram = parseInt(result_list[3].slice(0, -2))
              this.message_state = 11
            }
          })
          .catch(err => { 
            this.answerOutput('Invalid image. Try another one :)') 
            this.message_state = this.prev_state
          })
      }
    });
  }

  display(pos){
    var text = ""
    for (var i = 0; i < openrice_data[pos].cuisine.length; i++){
      text += openrice_data[pos].cuisine[i];
      text += ', '
    }
    text = text.slice(0, -2); //remove last 2 char
    this.answerOutputImg(openrice_data[pos].name, openrice_data[pos].pic)
    setTimeout(() => {
      this.answerOutput('Is the resturant you are looking for called ' + openrice_data[pos].name + '?');
      // this.onLocationReceive(pos)
      setTimeout(() => {
        this.answerOutput('You can get there by ' + openrice_data[pos].mtr);
        setTimeout(() => {
          
            if (openrice_data[pos].cuisine.length > 1 ){
              this.answerOutput("Cuisine keywords are: " + text);
            }
            else{
              this.answerOutput("Cuisine keyword is: " + text);
            }
        }, 1000);
      }, 1000);
    
   }, 1000);
    
    
    
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
  onReceiveImg(text,source) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          image: source,
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
  },
  firstText: {
    fontFamily: 'Cochin',
    fontSize: 20,
    color: 'black'
  },
  firstView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
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

  render(){
    return(
      <View style={styles.firstView}>
        <Text style={styles.firstText}>You have consumed {global.consumed.toString()} kcal today</Text>
        <Text style={styles.firstText}>You can only consume {global.target.toString()} kcal daily</Text>
        <Progress.Circle style={{marginTop: 50}} progress={global.progress} size={350} thickness={10} showsText={true}/>
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