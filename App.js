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

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.message_state = 0;
    this._isAlright = null;
    this.json_position = 0;
    this.blacklist_cuisine = [];
    this.openrice_json = '{ "resturants" : [' +
      '{ "name":"Deluxe" , "cuisine":["Hong Kong Style", "International", "Hot Pot", "Chicken Hot Pot"], "districts":"Causeway Bay", "price-range":"normal"},' +
      '{ "name":"The Grill Room" , "cuisine":["Western", "Steak House"], "districts":"Mong Kok", "price-range":"expensive" },' +
      '{ "name":"HeSheEat" , "cuisine":["Western", "Dessert", "All Day Breakfast", "Coffee Shop"], "districts":"Central", "price-range": "cheap"} ]}';
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
        messages: require('./data/messages.js'),
      };
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });
  
    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState((previousState) => {
          return {
            // messages: GiftedChat.prepend(previousState.messages, require('./data/old_messages.js')),
            loadEarlier: false,
            isLoadingEarlier: false,
          };
        });
      }
    }, 1000); // simulating network
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });

    // for demo purpose
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
        var result = JSON.parse(this.openrice_json);
        var i = this.json_position;
        for (; i < result.resturants.length; i++) {
          if (this.not_in_cuisine(result.resturants[i].cuisine))
            break;
        }
        if (i >= result.resturants.length)
          this.message_state = 4;
        else{
          this.json_position = i + 1;
          this.onReceive('Is the resturant you are looking for called ' + result.resturants[i].name + '?');
          this.onReceive('Located in ' + result.resturants[i].districts);
          this.onReceive(result.resturants[i].cuisine);
        }
      }

      this.setState((previousState) => {
        return {
          typingText: null,
        };
      });
    }, 1000);
  }

  not_in_cuisine(json_cuisine){
    for (var i = 0; i < this.blacklist_cuisine.length; i++){
      for (var j = 0; j < json_cuisine.length; j++){
        if (this.blacklist_cuisine[i] == json_cuisine[j])
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
