/** @format */

const _ = require('ramda');
const { App } = require('@slack/bolt');

const dotenv = require('dotenv');
dotenv.config();

const { WebClient, LogLevel } = require('@slack/web-api');
const stp_1_message_config = require('./message_config/step_1');
const stp_2_message_config = require('./message_config/step_2');

const oauth_token = process.env.PROD_OAUTH_TOKEN;
const app_token = process.env.PROD_APP_TOKEN;

const client = new WebClient(oauth_token, {
  logLevel: LogLevel.DEBUG,
});

const app = new App({
  token: oauth_token,
  appToken: app_token,
  socketMode: true,
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();

app.event('app_mention', async ({ event, context, client, say }) => {
  const user_id = event.user;

  try {
    client.chat.postMessage({
      channel: event.channel,
      ...stp_1_message_config(user_id),
      thread_ts: event.ts,
    });
  } catch (error) {
    console.error(error);
  }
});

app.action('button_click', async ({ body, context, ack, say }) => {
  await ack();

  try {
    const { location, service } = body.state.values;

    const location_val = location?.select.selected_option.value;
    const service_val = service?.select.selected_option.value;

    //console.log('location is', location_val, 'serive is', service_val);

    const user_id = body.user.id;

    const message = await stp_2_message_config(
      user_id,
      location_val,
      service_val
    );

    client.chat.postMessage({
      channel: body.container.channel_id,
      ...message,
      thread_ts: body.container.thread_ts,
    });
  } catch (err) {
    const values = body.state.values;
    const location_val = values.location.select.selected_option;
    const service_val = values.service.select.selected_option;
    const user_id = body.user.id;

    const message_gen = (ext_config) => ({
      channel: body.container.channel_id,
      thread_ts: body.container.thread_ts,
      ...ext_config,
    });

    const post_message = _.pipe(message_gen, client.chat.postMessage);

    if (_.isNil(location_val) && _.isNil(service_val)) {
      const message = `Hey <@${user_id}> :wave: please make sure that _you select both options_ :simple_smile: `;
      post_message({ text: message });
      return 0;
    }

    if (_.isNil(location_val)) {
      const message = `Hey <@${user_id}> :wave: please _make sure that you select the continent in which you live_ :simple_smile: `;
      post_message({ text: message });
      return 0;
    }

    if (_.isNil(service_val)) {
      const message = `Hey <@${user_id}> :wave: please make sure _that you select what you need help in_ :simple_smile:`;
      post_message({ text: message });
      return 0;
    }

    const message = `Hey <@${user_id}> :wave: Something went wrong! please make sure that you contact <@U010XUNLX40> to get this fixed ASPA :zap:`;
    post_message({ text: message });
  }
});

app.action('select', async ({ body, context, ack, say }) => {
  await ack();
});
