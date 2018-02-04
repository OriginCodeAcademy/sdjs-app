import React from 'react';
import Geofence from 'react-native-expo-geofence';
import { connect } from 'react-redux';
import { Constants, Location, Permissions, LinearGradient } from 'expo';
import {
  updateEventsData,
  updateSelectedEvent,
  setLocationError,
  checkedInTrue,
  checkedInFalse,
  addAttendeeToEvent,
  removeAttendee,
  profileQuery,
  rsvpTrue,
  rsvpFalse,
} from './eventsActions';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { List, ListItem, Button } from "react-native-elements";
import { getDayOfTheWeek, getMonthString, getMonthAbr, getDateString, getYearString, standardTime } from './eventsDateAndTime';

class EventsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.selectionHandler = this.selectionHandler.bind(this)
    this.handleUnCheckIn = this.handleUnCheckIn.bind(this);
    this.profilePageHandler = this.profilePageHandler.bind(this);
    this.handleButtons = this.handleButtons.bind(this);
    this.handleUnRSVP = this.handleUnRSVP.bind(this);
    this.handleRSVP = this.handleRSVP.bind(this);


  }
  componentWillMount() {
    const { dispatch } = this.props
    const eventsData = null;

    dispatch(updateEventsData(eventsData));

  }

  selectionHandler(id) {
    const { navigate } = this.props.navigation;
    const { dispatch } = this.props;
    selectedEventId = id;
    dispatch(updateSelectedEvent(selectedEventId));
    navigate('EventDetails')

  }
  _getLocationAsync = async () => {
    console.log("inside check in ")

    const { dispatch, eventsData, user } = this.props;
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      let errorMessage = 'Permission to access location was denied';
      dispatch(setLocationError(errorMessage));
    } else {


      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

      var points = [
        {//REMOVE & UPDATE currently set to location off site of 350 10th Ave SD 92101
          latitude: 32.717793.toFixed(6),//location.coords.latitude.toFixed(6)
          longitude: -117.155565.toFixed(6)//location.coords.longitude.toFixed(6)
        }
      ]

      var startPoint = { //venue lat lon
        latitude: 32.70893096923828,//todaysEvents.venue.lat
        longitude: -117.15599060058594//todaysEvents.venue.lon
      }

      var maxDistanceInKM = 5; // 500m distance
      // startPoint - center of perimeter
      // points - array of points
      // maxDistanceInKM - max point distance from startPoint in KM's
      // result - array of points inside the max distance
      var result = Geofence.filterByProximity(startPoint, points, maxDistanceInKM);
      console.log('result', result)
      if (result[0] === undefined) {
        console.log("Geolocation cannot confirm your location to the event, please try again")
      } else {
        eventObj = {
          "event_title": eventsData[0].name,
          "meetup_id": eventsData[0].id,
          "url": eventsData[0].group.urlname + ".org",
          "location": startPoint
        };
        dispatch(checkedInTrue(true));
        dispatch(addAttendeeToEvent(eventObj, user.id));

      }
    }
  };

  handleUnCheckIn() {
    const { dispatch, attendeeId } = this.props;
    dispatch(removeAttendee(attendeeId))
    dispatch(checkedInFalse(false));
  }

  //Queries DB with user ID and sends to profile page
  profilePageHandler() {
    const { user, dispatch } = this.props;
    const { navigate } = this.props.navigation;
    dispatch(profileQuery(user.id))
    navigate('Profile')
  }
  handleRSVP() {
    const { dispatch } = this.props;
    dispatch(rsvpTrue(true));
  }

  handleUnRSVP() {
    const { dispatch } = this.props;
    dispatch(rsvpFalse(false));
  }

  handleButtons() {
    const { eventsData, checkedIn, rsvp } = this.props;

    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }



    var d = new Date();
    var todaysISOdate = d.toISOString().slice(0, 10);

    var exampleDate = "2018-02-06";// for testing, REMOVE and update to todaysISODate
    var nextEvent = eventsData[0];

    var hours = addZero(d.getHours());
    var mins = addZero(d.getMinutes());




    var currentTime = null;//parseInt(hours+mins);  currently set to 1230 for testing
    var eventTime = parseInt(nextEvent.local_time.replace(':', ''));
    var hoursPriorToEvent = eventTime - 100;
    var hoursAfterEventStart = eventTime + 400;

    currentTime = 2300//parseInt(hours+mins);  currently set to 1230 for testing
    console.log("current", currentTime);
    console.log("before", hoursPriorToEvent);
    console.log("after", hoursAfterEventStart);
    console.log('event start time', eventTime);


    if (currentTime >= hoursPriorToEvent && currentTime <= hoursAfterEventStart && exampleDate == nextEvent.local_date) {
      if (checkedIn) {
        nextEventButton = <Button
          large
          backgroundColor={'#D95351'}
          borderRadius={3}
          style={styles.checkInButton}
          raised
          icon={{ name: 'undo', type: 'font-awesome' }}
          title=' UNDO CHECK-IN'
          onPress={this.handleUnCheckIn}
        />
      }
      if (!checkedIn) {
        nextEventButton = <Button
          large
          backgroundColor={'#346abb'}
          borderRadius={3}
          style={styles.checkInButton}
          raised
          icon={{ name: 'check-circle', type: 'font-awesome' }}
          title=' CHECK-IN'
          onPress={this._getLocationAsync}
        />
      }
    }

    if (currentTime < hoursPriorToEvent || exampleDate != nextEvent.local_date) {
      if (rsvp) {
        nextEventButton = <Button
          large
          backgroundColor={'#D95351'}
          borderRadius={3}
          style={styles.checkInButton}
          raised
          icon={{ name: 'undo', type: 'font-awesome' }}
          title=' UN-RVSP'
          onPress={this.handleUnRSVP}
        />
      }

      if (!rsvp) {
        nextEventButton = <Button
          large
          backgroundColor={'green'}
          borderRadius={3}
          style={styles.checkInButton}
          raised
          icon={{ name: 'check-circle', type: 'font-awesome' }}
          title=' RSVP'
          onPress={this.handleRSVP}
        />
      }
    }
    if (currentTime > hoursAfterEventStart && exampleDate == nextEvent.local_date) {
      nextEventButton = "null"
    }

    return nextEventButton;
  }


  render() {
    const { eventsData, locationError } = this.props;
    let locationErrorMessage = null;
    if (!!locationError) {
      locationErrorMessage = <Text style={styles.locationErrorMessage}>{locationError}</Text>
    }
    if (!!eventsData) {
      return (
        <View>
          <Text style={{ textAlign: 'center', paddingVertical: 10, fontWeight: 'bold' }}>Next Event: {eventsData[0].name} </Text>
          {this.handleButtons()}
          {locationErrorMessage}
          <Text style={{ textAlign: 'center', paddingTop: 10, marginBottom: 0 }}>Upcoming Events</Text>
          <List>
            <FlatList
              data={eventsData}
              renderItem={({ item }) => <ListItem
                key={item.id}
                title={`${getDayOfTheWeek(item.local_date)}, ${getMonthString(item.local_date)} ${getDateString(item.local_date)}, ${getYearString(item.local_date)}, ${standardTime(item.local_time)}`}
                subtitle={item.name}
                onPress={() => this.selectionHandler(item.id)
                }
              />}
            />
          </List>
        </View>
      );
    } else {
      return (
        <Text></Text>
      )
    }
  }
};

const styles = StyleSheet.create({
  green: {
    backgroundColor: '#008000'
  },
  purple: {
    backgroundColor: '#551a8b'
  },
  locationErrorMessage: {
    textAlign: 'center'
  },
  checkInButton: {
    marginTop: 25
  },
  mainContainer: {
    paddingTop: 15
  },
  listContainer: {
    paddingBottom: 200
  }
});

function mapStoreToProps(store) {
  return {
    eventsData: store.eventsData.eventsData,
    locationError: store.eventsData.locationError,
    checkedIn: store.eventsData.checkedIn,
    user: store.signupData.user,
    attendeeId: store.eventsData.attendeeId,
    rsvp: store.eventsData.rsvp,

  };
}


export default connect(mapStoreToProps)(EventsContainer);


