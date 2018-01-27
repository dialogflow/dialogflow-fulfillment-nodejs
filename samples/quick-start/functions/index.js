/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const functions = require('firebase-functions');
const WebhookClient = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug';

const WELCOME_ACTION = 'input.welcome';
const FALLBACK_ACTION = 'input.unknown';
const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png';
const linkUrl = 'https://assistant.google.com/';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.send(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.addText(`I didn't understand`);
    agent.addText(`I'm sorry, can you try again?`);
    agent.send();
  }

  function other(agent) {
    agent.addText(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    agent.addCard(agent.buildCard(`Title: this is a card title`)
        .setImage(imageUrl)
        .setText(`This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`)
        .setButton({text: 'This is a button', url: linkUrl})
    );
    agent.addSuggestion(`Quick Reply`);
    agent.addSuggestion(`Suggestion`);
    agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    agent.send();
  }

  let actionMap = new Map();
  actionMap.set(WELCOME_ACTION, welcome);
  actionMap.set(FALLBACK_ACTION, fallback);
  actionMap.set(null, other);
  agent.handleRequest(actionMap);
});