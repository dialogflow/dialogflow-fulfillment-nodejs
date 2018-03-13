/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
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

// Enable dialogflow debug logging
// process.env.DEBUG = 'dialogflow:*';

const test = require('ava');

const {WebhookClient} = require('../src/dialogflow-fulfillment');
const {Suggestion} = require('../src/dialogflow-fulfillment');

test('Quick Replies Response test', async (t) => {
  // v1 simulator webhook request
  let simulatorRequest = {body: mockSimulatorV1Request}; // mockV1SimulatorRequest
  webhookSuggestionTest(simulatorRequest, (responseJson) => {
    t.deepEqual(
      {
        messages: [{type: 2, replies: ['Quick Reply', 'Suggestion']}],
        contextOut: [],
      },
      responseJson
    );
  });

  // v2 facebook webhook request
  let mockFacebookV2Request = {body: mockFacebookV2RequestWebhook}; // mockV1SimulatorRequest
  webhookSuggestionTest(mockFacebookV2Request, (responseJson) => {
    t.deepEqual(
      {
        fulfillmentMessages: [
          {
            quickReplies: {quickReplies: ['Quick Reply', 'Suggestion']},
            platform: 'FACEBOOK',
          },
        ],
        outputContexts: [],
      },
      responseJson
    );
  });
});

test('Language Code test', async (t) => {
  // v1 simulator webhook request
  let simulatorResponse = new ResponseMock();
  let simulatorRequest = {body: mockSimulatorV1Request}; // mockV1SimulatorRequest
  let agent = new WebhookClient({
    request: simulatorRequest,
    response: simulatorResponse,
  });
  t.deepEqual('en', agent.locale);

  // v2 facebook webhook request
  let mockFacebookV2Response = new ResponseMock();
  let mockFacebookV2Request = {body: mockFacebookV2RequestWebhook}; // mockV1SimulatorRequest
  agent = new WebhookClient({
    request: mockFacebookV2Request,
    response: mockFacebookV2Response,
  });
  t.deepEqual('en', agent.locale);
});

test('Actions on Google lib integration test', async (t) => {
  // // v1 Actions on Google library integration
  const googleV1Request = {body: mockGoogleV1Request}; // mockV1SimulatorRequest
  actionsOnGoogleTest(googleV1Request, (responseJson) => {
    t.deepEqual(responseJson, {
      'contextOut': [{
        lifespan: 99,
        name: '_actions_on_google',
        parameters: {
          data: '{}',
        },
      }],
      'data': {
        'google': {
          'expectUserResponse': true,
          'richResponse': {
            'items': [
              {
                'simpleResponse': {
                  'textToSpeech': 'Hi',
                },
              },
            ],
          },
          'userStorage': '{"data":{}}',
        },
      },
    });
  });

  // v2 Actions on Google library integration
  const googleV2Request = {body: mockGoogleV2Request}; // mockV1SimulatorRequest
  actionsOnGoogleTest(googleV2Request, (responseJson) => {
    t.deepEqual(responseJson, {
      'outputContexts': [{
        lifespanCount: 99,
        name: 'projects/stagent-f2236/agent/sessions/1515017715285/contexts/_actions_on_google',
        parameters: {
          data: '{}',
        },
      }],
      'payload': {
        'google': {
          'expectUserResponse': true,
          'richResponse': {
            'items': [
              {
                'simpleResponse': {
                  'textToSpeech': 'Hi',
                },
              },
            ],
          },
          'userStorage': '{"data":{}}',
        },
      },
    });
  });
});

/**
 * Adds suggestions to response
 * @param {Object} request express object
 * @param {function} callback
 */
function actionsOnGoogleTest(request, callback) {
  // v1 simulator webhook request
  let response = new ResponseMock(callback);
  let agent = new WebhookClient({
    request: request,
    response: response,
  });

  agent.handleRequest( (agent) => {
    let conv = agent.conv();
    conv.ask('Hi');
    agent.add(conv);
  });
}

/**
 * Adds suggestions to response
 * @param {Object} request express object
 * @param {function} callback
 */
function webhookSuggestionTest(request, callback) {
  // v1 simulator webhook request
  let response = new ResponseMock(callback);
  let agent = new WebhookClient({
    request: request,
    response: response,
  });
  /**
   * Handler function to other
   * @param {Object} agent
   */
  function handler(agent) {
    agent.add(new Suggestion('Quick Reply'));
    agent.add(new Suggestion('Suggestion'));
  }

  agent.handleRequest(handler);
}

/**
 * Class to mock a express response object for testing
 */
class ResponseMock {
  /**
   * constructor
   * @param {function} callback
   */
  constructor(callback) {
    this.callback = callback;
    this.responseJson = {};
  }
  /**
   * Store JSON repsonse from WebhookClient
   * @param {Object} responseJson
   */
  json(responseJson) {
    this.callback(responseJson);
  }
  /**
   * Get JSON response for testing comparison
   * @return {Object} response JSON from WebhookClient
   */
  get() {
    return this.responseJson;
  }
  /**
   * Get status code for testing comparison
   * @param {number} code HTTP status code of response
   * @return {number} resposne status code from WebhookClient
   */
  status(code) {
    this.responseJson += code;
    return this;
  }
  /**
   * Store JSON repsonse from WebhookClient
   * @param {Object} message response object
   */
  send(message) {
    this.callback(message);
  }
}

const mockSimulatorV1Request = {
  id: '2b3b2324-672e-4e2f-880f-8c987fdf9b4f',
  timestamp: '2018-01-09T23:06:18.858Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'webhook',
    speech: '',
    action: '',
    actionIncomplete: false,
    parameters: {},
    contexts: [],
    metadata: {
      intentId: 'a59d982d-6556-4049-a460-6d5b1a2e5fd6',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'webhook',
    },
    fulfillment: {
      speech: 'webhook failed',
      messages: [{type: 0, speech: 'webhook failed'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '30ff2e36-e068-4c86-af74-6fe3cadb3fca',
};

const mockFacebookV2RequestWebhook = {
  responseId: '45f752fe-bfcf-46c7-a546-745fadd78227',
  queryResult: {
    queryText: 'webhook',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'webhook failure',
    fulfillmentMessages: [{text: {text: ['webhook failure']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43/contexts/generic',
        lifespanCount: 4,
        parameters: {facebook_sender_id: '1534862223272449'},
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/29bcd7f8-f717-4261-a8fd-2d3e451b8af8',
      displayName: 'webhook',
    },
    intentDetectionConfidence: 1,
    diagnosticInfo: {},
    languageCode: 'en',
  },
  originalDetectIntentRequest: {
    payload: {
      data: {
        sender: {id: '1534862223272449'},
        recipient: {id: '958823367603818'},
        message: {
          mid: 'mid.$cAAMy_rGG1eZm-RHbmlgx8yTpzmWk',
          text: 'webhook',
          seq: 842,
        },
        timestamp: 1515180561306,
      },
      source: 'facebook',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43',
};

const mockGoogleV1Request = {
  originalRequest: {
    source: 'google',
    version: '2',
    data: {
      isInSandbox: true,
      surface: {
        capabilities: [
          {name: 'actions.capability.SCREEN_OUTPUT'},
          {name: 'actions.capability.WEB_BROWSER'},
          {name: 'actions.capability.AUDIO_OUTPUT'},
        ],
      },
      inputs: [
        {
          rawInputs: [{query: 'webhook', inputType: 'KEYBOARD'}],
          arguments: [
            {rawText: 'webhook', textValue: 'webhook', name: 'text'},
          ],
          intent: 'actions.intent.TEXT',
        },
      ],
      user: {
        lastSeen: '2018-01-04T03:08:14Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {
        conversationId: '1515038445071',
        type: 'ACTIVE',
        conversationToken: '[]',
      },
      availableSurfaces: [
        {
          capabilities: [
            {name: 'actions.capability.SCREEN_OUTPUT'},
            {name: 'actions.capability.AUDIO_OUTPUT'},
          ],
        },
      ],
    },
  },
  id: '08fb66e1-366f-4f78-8e22-f38271599f32',
  timestamp: '2018-01-04T20:50:41.718Z',
  lang: 'en-us',
  result: {
    source: 'agent',
    resolvedQuery: 'webhook',
    speech: '',
    action: '',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {name: 'actions_capability_screen_output', parameters: {}, lifespan: 0},
      {name: 'actions_capability_audio_output', parameters: {}, lifespan: 0},
      {
        name: 'google_assistant_input_type_keyboard',
        parameters: {},
        lifespan: 0,
      },
      {name: 'actions_capability_web_browser', parameters: {}, lifespan: 0},
    ],
    metadata: {
      intentId: '29bcd7f8-f717-4261-a8fd-2d3e451b8af8',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      nluResponseTime: 6,
      intentName: 'webhook',
    },
    fulfillment: {
      speech: 'webhook failure',
      messages: [{type: 0, speech: 'webhook failure'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '1515038445071',
};

const mockGoogleV2Request = {
  responseId: '07424698-0149-430a-9b9c-157402568343',
  queryResult: {
    queryText: 'webhook',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: '',
    fulfillmentMessages: [],
    outputContexts: [],
    intent: {
      name: `projects/stagent-f2236/agent/intents/\
29bcd7f8-f717-4261-a8fd-2d3e451b8af8`,
      displayName: 'webhook',
    },
    intentDetectionConfidence: 1,
    diagnosticInfo: {},
    languageCode: 'en-us',
  },
  originalDetectIntentRequest: {
    source: 'google',
    version: '2',
    payload: {
      isInSandbox: true,
      surface: {
        capabilities: [
          {name: 'actions.capability.AUDIO_OUTPUT'},
          {name: 'actions.capability.SCREEN_OUTPUT'},
          {name: 'actions.capability.WEB_BROWSER'},
        ],
      },
      inputs: [
        {
          rawInputs: [{query: 'webhook', inputType: 'KEYBOARD'}],
          arguments: [
            {rawText: 'webhook', textValue: 'webhook', name: 'text'},
          ],
          intent: 'actions.intent.TEXT',
        },
      ],
      user: {
        lastSeen: '2018-01-03T05:01:42Z',
        locale: 'en-US',
        userId: `ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_\
CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ`,
      },
      conversation: {
        conversationId: '1515017715285',
        type: 'ACTIVE',
        conversationToken: '[]',
      },
      availableSurfaces: [
        {
          capabilities: [
            {name: 'actions.capability.AUDIO_OUTPUT'},
            {name: 'actions.capability.SCREEN_OUTPUT'},
          ],
        },
      ],
    },
  },
  session: 'projects/stagent-f2236/agent/sessions/1515017715285',
};
