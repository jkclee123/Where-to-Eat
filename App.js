import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {GiftedChat, Actions, Bubble, SystemMessage} from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';

const openrice_data = require('./openrice_data.json');
const districts_list = require('./districts_list.json')

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      typingText: null
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.message_state = 0;
    this.json_position = 0;
    this.blacklist_cuisine = [];
    this.district = null;
  }

  componentWillMount() {
    this._isMounted = true;
    this.message_state = 1;

    // fetch('https://firebasestorage.googleapis.com/v0/b/eatwhatho-cd3ea.appspot.com/o/openrice_data2.json?alt=media&token=b172c8bc-7ff1-469d-8f09-4f42fdff0737')
    //   .then((response) => response.json())
    //   .then((responseJson) => {
    //     this.openrice_json = responseJson;
    //   });

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
    // var result = JSON.parse(this.openrice_json);
    // var employees = {}
    // for (var i = 0, emp; i < result.employees.length; i++) {
    //   emp = result.districts[i];
    //   this.onReceive(emp.firstName);
    // }

    if (messages.length > 0) {
      this.setState((previousState) => {
        return {
          typingText: 'React Native is typing...'
        };
      });
    }

    setTimeout(() => {
      /*
      if (this._isMounted === true) {
        if (messages.length > 0) {
          if (messages[0].image) {
            this.onReceive('Nice picture!');
          } else if (messages[0].location) {
            this.onReceive('My favorite place');
          } else {
            if (!this._isAlright) {
              this._isAlright = true;
              this.onReceive('Alright');
            }
          }
        }
      }
      */
      if (this.message_state == 1){
        var working_districts_list = districts_list.districts;
        if (!(this.not_in([messages[0].text.toLowerCase()], districts_list.districts))){
          this.district = messages[0].text.toLowerCase();
          this.message_state = 2;
        }
        else
          this.onReceive('Tell me the district you are search resturant from!')
      }
      if (this.message_state == 3){
        if (messages[0].text.toLowerCase.substring(0, 1) == 'n')
          this.message_state = 2o
      }
      if (this.message_state == 2){
        for (var i = this.json_position; i < openrice_data.resturants.length; i++) {
          if (this.district != openrice_data.resturants[i].district.toLowerCase())
            continue
          if (this.not_in(this.blacklist_cuisine, openrice_data.resturants[i].cuisine))
            break;
        }
        if (i >= openrice_data.resturants.length)
          this.message_state = 4;
        else{
          this.json_position = i + 1;
          this.onReceive('Is the resturant you are looking for called ' + openrice_data.resturants[i].name + '?');
          this.onReceive('Located in ' + openrice_data.resturants[i].district);
          this.onReceive(openrice_data.resturants[i].cuisine);
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

  renderCustomActions(props) {
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
        />
      );
    }
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
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
});
