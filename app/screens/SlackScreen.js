import React from 'react';
import SlackContainer from '../containers/SlackContainer/SlackContainer';

export default class SlackScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Slack',
    headerTitle: 'Join us at Slack',
    headerLeft: null,
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <SlackContainer />
    );
  }
};
