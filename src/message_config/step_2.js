/** @format */

const map = require('../../lib/map');
const _ = require('ramda');

const for_each = _.addIndex(_.forEach);

const list_gen = (location, service) => {
  const person_list = map[location][service]['person_list'];
  // console.log(person_list, 'it is');
  let message = '';

  for_each((slack_id, idx) => {
    console.log('slack id is', slack_id);
    message += `${_.inc(idx)}. <@${slack_id}> \n`;
  })(person_list);

  return message;
};

module.exports = (user_id, location, service) => ({
  type: 'message',

  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${user_id}> :wave:`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `You can contact any of the below people for help:`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: list_gen(location, service),
      },
    },
  ],
});
