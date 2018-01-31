const defaultState = {
    eventsData:'',
    selectedEvent: '',
    locationError:'',
    checkedIn: false,
    attendeeId: '',
  };
  
  export default function EventsReducer (state = defaultState, action) {
    const { type, payload } = action;
  
    switch (type) {
      
      
  
      case 'UPDATE_EVENTS_DATA_FULFILLED': {
        return {
          ...state,
          eventsData: payload
        };
      }

      case 'UPDATE_SELECETED_EVENT': {
        return {
          ...state,
          selectedEvent: payload
        }
      };
      case 'SET_LOCATION_ERROR': {
        return {
          ...state,
          locationError: payload
        };
      }
      case 'CHECKED_IN_TRUE': {
        return {
          ...state,
          checkedIn: payload
        };
      }
      case 'CHECKED_IN_FALSE': {
        return {
          ...state,
          checkedIn: payload
        };
      }
      case 'ADD_ATTENDEE_TO_EVENT_FULFILLED': {
        return {
          ...state,
          attendeeId: payload
        };
      }
      default: {
        return state;
      }
    }
  };