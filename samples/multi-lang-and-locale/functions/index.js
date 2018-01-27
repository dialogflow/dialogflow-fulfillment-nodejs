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

exports.dialogflowFulfillmentMultiLocale = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  // English handler functions and action map
  function welcome(agent) {
    agent.send(`Welcome to my agent!`);
  }
  function fallback(agent) {
    agent.addText(`I didn't understand`);
    agent.addText(`I'm sorry, can you try again?`);
    agent.send();
  }
  let enActionMap = new Map();
  enActionMap.set(WELCOME_ACTION, welcome);
  enActionMap.set(FALLBACK_ACTION, fallback);

  // French handler functions and action map
  function bienvenue(agent) {
    agent.send(`Bienvenue à mon agent!`);
  }
  function secours(agent) {
    agent.addText(`Je n'ai pas compris`);
    agent.addText(`Pouvez-vous essayer encore?`);
    agent.send();
  }
  let frActionMap = new Map();
  frActionMap.set(WELCOME_ACTION, bienvenue);
  frActionMap.set(FALLBACK_ACTION, secours);

  // Chose which action map to use based on the language of the request
  console.log(`Request locale: ${agent.locale}`);
  if (agent.locale === 'en') {
    agent.handleRequest(enActionMap);
  } else if (agent.locale === 'fr') {
    agent.handleRequest(frActionMap);
  }

});