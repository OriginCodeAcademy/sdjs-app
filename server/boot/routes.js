'use strict';

const axios = require('axios');

module.exports = function (app) {
  app.post('/signup', (req, res) => {
    const baseUrl = app.get('url').replace(/\/$/, '');
    const { email, password } = req.body;
    axios
      .post(`${baseUrl}/api/users`, req.body)
      .then((response) => {
        axios.post(`${baseUrl}/api/users/login`, { email, password })
          .then(r => res.json({
            token: r.data.id,
            id: r.data.userId
          }))
          .catch(e => res.send(e.message));
      })
      .catch(error => res.send(error.message));
  });

  app.post('/checkin', (req, res) => {
    const baseUrl = app.get('url').replace(/\/$/, '');
    const { eventObj, userId } = req.body;
    axios
      .get(`${baseUrl}/api/events?filter[where][meetup_id]=${eventObj.meetup_id}`)
      .then((response) => {
        // if no event exists, create event through api/events,
        // then create new attendee of that event; pass attendee id back to action
        // attendee id will be used to delete attendee should they hit the un-checkin button.
        // Legacy code used api/users/{id}/events url to create event and attendee at the same time,
        // but this did not allow for the attendee id to be received in the response meaning
        // the delete would not function properly.
        if (!!response.data && !response.data.length) {
          axios
            .post(`${baseUrl}/api/events`, eventObj)
            .then((r) => {
              const attendeeInfoObj = {
                eventId: r.data.id,
                userId
              };
              return axios
                .post(`${baseUrl}/api/attendees`, attendeeInfoObj)
                .then((resp) => {
                  const attendeeId = resp.data.id;
                  res.send(attendeeId);
                })
                .catch(e => console.log('error on post attendee', e));
            })
            .catch(error => console.log('error on post event/attendee', error));
          // else create attendee
        } else {
          const attendeeObj = {
            eventId: response.data[0].id,
            userId
          };
          axios
            .post(`${baseUrl}/api/attendees`, attendeeObj)
            .then(response => response.data.id)
            .catch(error => console.log('error on post attendee', error));
        }
      })
      .catch(error => console.log(error));
  });
  // Below route from original authors. Doesn't seem to be used. All done in actions.
  // the url path seems to be wrong.
  // should hit /api/attendees with attendeeId to delete attendee
  app.delete('/deleteattendee', (req, res) => {
    const baseUrl = app.get('url').replace(/\/$/, '');
    const { attendeeId } = req.body;
    axios
      .delete(`${baseUrl}/api/users`, { attendeeId })
      .then((response) => {
        res.send(response.data);
      })
      .catch(error => res.send(error.message));
  });

  app.post('/loginthirdparty', (req, res) => {
    const baseUrl = app.get('url').replace(/\/$/, '');
    const {
      email, password, first_name, last_name
    } = req.body;

    axios.get(`${baseUrl}/api/users?filter[where][email]=${email}`)
      .then((r) => {
        if (!!r.data && !r.data.length) {
          axios.post(`${baseUrl}/signup`, {
            first_name, last_name, email, password
          })
            .then(r => res.json({
              token: r.data.token,
              id: r.data.id
            }))
            .catch(e => res.send(e.message));
        } else {
          axios.post(`${baseUrl}/login`, { email, password })
            .then(r => res.json({
              token: r.data.token,
              id: r.data.id
            }))
            .catch(e => res.send(e.message));
        }
      })
      .catch(e => res.send(e.message));
  });
  app.post('/rsvp', (req, res) => {
    const baseUrl = app.get('url').replace(/\/$/, '');
    const { eventObj, userId } = req.body;
    // Create a new user
    axios
      .get(`${baseUrl}/api/events?filter[where][meetup_id]=${eventObj.meetup_id}`)
      .then((response) => {
        // if no event exist create event through api/events
        if (!!response.data && !response.data.length) {
          axios
            .post(`${baseUrl}/api/events`, eventObj)
            .then((response) => {
              const rsvpObj = {
                eventId: response.data.id,
                userId,
                meetup_id: response.data.meetup_id
              };
              axios
                .post(`${baseUrl}/api/rsvps`, rsvpObj)
                .then((response) => {
                  res.send(response.data.id);
                })
                .catch(error => console.log('error on post attendee', error));
            })
            .catch(error => console.log('error on post event/attendee', error));
        } else {
          const rsvpObj = {
            eventId: response.data[0].id,
            userId,
            meetup_id: response.data[0].meetup_id
          };
          axios
            .post(`${baseUrl}/api/rsvps`, rsvpObj)
            .then((response) => {
              res.send(response.data.id);
            })
            .catch(error => console.log('error on post attendee', error));
        }
        return response.data;
      })
      .catch(e => res.send(e.message));
  });

  app.get('/reset-password/', (req, res, next) => {
    const { access_token: token } = req.query;
    if (!token) { return res.sendStatus(401); }
    res.render('password-reset', {
      redirectUrl: `/api/users/reset-password?access_token=${token}`
    });
  });
};
