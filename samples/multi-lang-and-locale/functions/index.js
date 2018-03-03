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
const { WebhookClient } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  // English handler functions and intent map
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  let enIntentMap = new Map(); // Map functions to English Dialogflow intent names
  enIntentMap.set('Default Welcome Intent', welcome);
  enIntentMap.set('Default Fallback Intent', fallback);

  // French handler functions and intent map
  function bienvenue(agent) {
    agent.add(`Bienvenue à mon agent!`);
  }
  function secours(agent) {
    agent.add(`Je n'ai pas compris`);
    agent.add(`Pouvez-vous essayer encore?`);
  }
  let frIntentMap = new Map(); // Map functions to French Dialogflow intent names
  frIntentMap.set('Default Welcome Intent', bienvenue);
  frIntentMap.set('Default Fallback Intent', secours);

  // Chose which intent map to use based on the language of the request
  console.log(`Request locale: ${agent.locale}`);
  if (agent.locale === 'en') {
    agent.handleRequest(enIntentMap);
  } else if (agent.locale === 'fr') {
    agent.handleRequest(frIntentMap);
  }
});
