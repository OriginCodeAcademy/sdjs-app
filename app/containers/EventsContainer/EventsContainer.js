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
  updateRSVPList,
  updateEventDetailsRSVP,
  updateCheckedInStatus,
  addRSVPToEvent,
  removeRSVPFromEvent,
  updateEventDetailsRSVPEventId,
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
    // this.profilePageHandler = this.profilePageHandler.bind(this);
    this.handleButtons = this.handleButtons.bind(this);
    this.handleUnRSVP = this.handleUnRSVP.bind(this);
    this.handleRSVP = this.handleRSVP.bind(this);


  }
  componentDidMount() {
    const { dispatch, user } = this.props
    const launch = null;

    dispatch(updateEventsData(launch));
    dispatch(updateRSVPList(user.id));
  }

  selectionHandler(id, rsvpEventDetails, rsvpEventId) {
    const { navigate } = this.props.navigation;
    const { dispatch } = this.props;
    selectedEventId = id;
    dispatch(updateSelectedEvent(selectedEventId));
    if(!!rsvpEventDetails){dispatch(updateEventDetailsRSVP(rsvpEventDetails));}
    if(!rsvpEventDetails){dispatch(updateEventDetailsRSVP(false));}
    if(!!rsvpEventId){dispatch(updateEventDetailsRSVPEventId(rsvpEventId));}
    if(!rsvpEventId){dispatch(updateEventDetailsRSVPEventId(false));}
    navigate('EventDetails')

  }
  _getLocationAsync = async () => {

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
      if (result[0] === undefined) {
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
  // profilePageHandler() {
  //   const { user, dispatch } = this.props;
  //   const { navigate } = this.props.navigation;
  //   dispatch(profileQuery(user.id))
  // }
  handleRSVP() {
    const { dispatch, user, eventsData } = this.props;

    eventObj = {
      "event_title": eventsData[0].name,
      "meetup_id": eventsData[0].id,
      "url": eventsData[0].group.urlname + ".org",
      "location": {
        "latitude": eventsData[0].venue.lat,
        "longitude": eventsData[0].venue.lon
      }
    };

    dispatch(addRSVPToEvent(eventObj, user.id))
    dispatch(rsvpTrue(true));
  }

  handleUnRSVP() {
    const { dispatch, rsvpEventId, userRSVPs, eventsData } = this.props;
    for(let i = 0; i <userRSVPs.length; i++){
      if(eventsData[0].id === userRSVPs[i].meetup_id){
        dispatch(removeRSVPFromEvent(userRSVPs[i].id));
      }
    }
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

    currentTime = 1300//parseInt(hours+mins);  currently set to 1230 for testing


    if (currentTime >= hoursPriorToEvent && currentTime <= hoursAfterEventStart && exampleDate == nextEvent.local_date) {
      //if(!!checkedInStatus) is true
      if (checkedIn) {
        nextEventButton = <Button
          large
          backgroundColor={'#D95351'}
          borderRadius={3}
          style={styles.checkInButton}
          icon={{ name: 'undo', type: 'font-awesome' }}
          title=' UNDO CHECK-IN'
          onPress={this.handleUnCheckIn}
        />
      }
      //if(!checkedInStatus) is false
      if (!checkedIn) {
        nextEventButton = <Button
          large
          backgroundColor={'#346abb'}
          borderRadius={3}
          style={styles.checkInButton}
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
    const { eventsData, locationError, userRSVPs, user, dispatch } = this.props;
    for(let i = 0; i <eventsData.length; i++){
      for(let j = 0; j < userRSVPs.length; j++){
        if(eventsData[i].id === userRSVPs[j].meetup_id){
          eventsData[i].rsvpEventDetails = true;
          eventsData[i].rsvpEventId = userRSVPs[j].id;
        }
      }
    }
    
    console.log("rsvpList", userRSVPs)
    console.log("eventsData inside the render", eventsData)

    let locationErrorMessage = null;
    if (!!locationError) {
      locationErrorMessage = <Text style={styles.locationErrorMessage}>{locationError}</Text>
    }
    if (!!eventsData) {
      for(let i = 0; i <userRSVPs.length; i++){
        if(eventsData[0].id === userRSVPs[i].meetup_id){
          dispatch(rsvpTrue(true));
        }
      }
      return (
        <View
        style={styles.listWrapper}
        >
          <Text style={{ textAlign: 'center', paddingTop: 10, fontWeight: 'bold' }}>Next Event: {eventsData[0].name} </Text>
          {this.handleButtons()}
          {locationErrorMessage}
          <Text style={{ textAlign: 'center', paddingTop: 20, marginBottom: 0 }}>Upcoming Events</Text>
          <List>
            <FlatList
              data={eventsData}
              renderItem={({ item }) => <ListItem
                key={item.id}
                title={`${getDayOfTheWeek(item.local_date)}, ${getMonthString(item.local_date)} ${getDateString(item.local_date)}, ${getYearString(item.local_date)}, ${standardTime(item.local_time)}`}
                subtitle={item.name}
                onPress={() => this.selectionHandler(item.id, item.rsvpEventDetails, item.rsvpEventId)
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
  listWrapper: {
    marginBottom: 457
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
    userRSVPs: store.eventsData.userRSVPs,
    checkedInStatus: store.eventsData.checkedInStatus,
    rsvpEventId: store.eventsData.rsvpEventId

  };
}


export default connect(mapStoreToProps)(EventsContainer);


