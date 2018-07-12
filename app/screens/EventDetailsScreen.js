import React from 'react';
import { StyleSheet, Text, View, Button, BackHandler } from 'react-native';
import EventDetailsContainer from '../containers/EventDetailsContainer/EventDetailsContainer';

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
}

componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
}

componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
}

handleBackButtonClick() {
    this.props.navigation.goBack(null);
    return true;
}
  static navigationOptions = {
    title: 'Event Details',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <EventDetailsContainer />
    );
  }
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });