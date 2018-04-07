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
const {Card, Suggestion} = require('../src/dialogflow-fulfillment');

test('v2 Integration test', async (t) => {
  // v2 Google welcome
  let googleV2WelcomeRequest = {body: mockGoogleV2RequestWelcome};
  webhookTest(googleV2WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV2ResponseWelcome);
  });

  // v2 Slack welcome
  let slackV2WelcomeRequest = {body: mockSlackV2RequestWelcome};
  webhookTest(slackV2WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV2ResponseWelcome);
  });

  // v2 Facebook welcome
  let facebookV2WelcomeRequest = {body: mockFacebookV2RequestWelcome};
  webhookTest(facebookV2WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV2ResponseWelcome);
  });

  // v2 Google fallback
  let googleV2FallbackRequest = {body: mockGoogleV2RequestFallback};
  webhookTest(googleV2FallbackRequest, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV2ResponseFallback);
  });

  // v2 Slack fallback
  let slackV2FallbackRequest = {body: mockSlackV2RequestFallback};
  webhookTest(slackV2FallbackRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV2ResponseFallback);
  });

  // v2 Facebook fallback
  let facebookV2FallbackRequest = {body: mockFacebookV2RequestFallback};
  webhookTest(facebookV2FallbackRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV2ResponseFallback);
  });

  // v2 Google webhook
  let googleV2WebhookRequest = {body: mockGoogleV2RequestWebhook};
  webhookTest(googleV2WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV2ResponseWebhook);
  });

  // v2 Slack webhook
  let slackV2WebhookRequest = {body: mockSlackV2RequestWebhook};
  webhookTest(slackV2WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV2ResponseWebhook);
  });

  // v2 Facebook webhook
  let facebookV2WebhookRequest = {body: mockFacebookV2RequestWebhook};
  webhookTest(facebookV2WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV2ResponseWebhook);
  });

  // v2 simulator webhook
  let simulatorV2WebhookRequest = {body: mockSimulatorV2RequestOther};
  webhookTest(simulatorV2WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSimulatorV2ResponseOther);
  });
});

/**
 * Helper function to perform WebhookClient options for testing
 * @param {Object} request mock express request object
 * @param {function} callback
 */
function webhookTest(request, callback) {
  let response = new ResponseMock(callback);
  const agent = new WebhookClient({request: request, response: response});
  /**
   * Handler function to welcome
   * @param {Object} agent
   */
  function welcome(agent) {
    agent.add('Welcome to my agent!');
  }
  /**
   * Handler function to fallback
   * @param {Object} agent
   */
  function fallback(agent) {
    agent.add('I didn\'t understand');
    agent.add('I\'m sorry, can you try again?');
  }
  /**
   * Handler function to other
   * @param {Object} agent
   */
  function other(agent) {
    agent.add('This message is from Dialogflow\'s Cloud Functions for Firebase editor!');
    agent.setContext({
      name: 'weather',
      lifespan: 2,
      parameters: {city: 'Rome'},
    });
    agent.add(new Card({
        title: 'Title: this is a card title',
        text: 'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
        imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        buttonText: 'This is a button',
        buttonUrl: 'https://assistant.google.com/',
      })
    );
    agent.add(new Suggestion('Quick Reply'));
    agent.add(new Suggestion('Suggestion'));
  }

  let actionMap = new Map();
  actionMap.set('Default Welcome Intent', welcome);
  actionMap.set('Default Fallback Intent', fallback);
  actionMap.set(null, other);
  agent.handleRequest(actionMap);
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

const mockSimulatorV2RequestOther = {
  'responseId': 'b131a1bb-513b-44d0-928b-47c49a2569f8',
  'queryResult': {
    'queryText': 'custom intent',
    'parameters': {},
    'allRequiredParamsPresent': true,
    'fulfillmentMessages': [
      {
        'text': {
          'text': [
            '',
          ],
        },
      },
    ],
    'outputContexts': [
      {
        'name': 'projects/agent52-3e1ea/agent/sessions/669d7da3-de6f-4b1d-8394-d79c6973e516/contexts/weather',
        'parameters': {
          'city': 'Rome',
        },
      },
    ],
    'intent': {
      'name': 'projects/agent52-3e1ea/agent/intents/ee4efd90-1021-42ee-8ff5-78463d461d86',
      'displayName': 'Custom Intent',
    },
    'intentDetectionConfidence': 1,
    'diagnosticInfo': {},
    'languageCode': 'en',
  },
  'originalDetectIntentRequest': {
    'payload': {},
  },
  'session': 'projects/agent52-3e1ea/agent/sessions/669d7da3-de6f-4b1d-8394-d79c6973e516',
};

const mockSimulatorV2ResponseOther = {
  fulfillmentMessages: [
    {
      text: {
        text: [
          'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
        ],
      },
    },
    {
      card: {
        title: 'Title: this is a card title',
        subtitle:
          'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
        imageUri:
          'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        buttons: [
          {
            text: 'This is a button',
            postback: 'https://assistant.google.com/',
          },
        ],
      },
    },
    {
      quickReplies: {quickReplies: ['Quick Reply', 'Suggestion']},
    },
  ],
  outputContexts: [
    {
      name:
        'projects/agent52-3e1ea/agent/sessions/669d7da3-de6f-4b1d-8394-d79c6973e516/contexts/weather',
      lifespanCount: 2,
      parameters: {city: 'Rome'},
    },
  ],
};
// Mock webhook request and reponse from Dialogflow for sample v2
// welcome
const mockGoogleV2RequestWelcome = {
  responseId: '9a0f8811-574e-4fab-adfe-c76b3dd7769d',
  queryResult: {
    queryText: 'GOOGLE_ASSISTANT_WELCOME',
    action: 'input.welcome',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'Greetings!',
    fulfillmentMessages: [{text: {text: ['Hi!']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515179321602/contexts/google_assistant_welcome',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515179321602/contexts/actions_capability_screen_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515179321602/contexts/actions_capability_audio_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515179321602/contexts/google_assistant_input_type_keyboard',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515179321602/contexts/actions_capability_web_browser',
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/01299577-6c6b-4010-8a52-608208a731aa',
      displayName: 'Default Welcome Intent',
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
          {name: 'actions.capability.WEB_BROWSER'},
          {name: 'actions.capability.SCREEN_OUTPUT'},
        ],
      },
      inputs: [
        {
          rawInputs: [{query: 'talk to my test app', inputType: 'KEYBOARD'}],
          intent: 'actions.intent.MAIN',
        },
      ],
      user: {
        lastSeen: '2018-01-05T19:07:01Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {conversationId: '1515179321602', type: 'NEW'},
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
  session: 'projects/stagent-f2236/agent/sessions/1515179321602',
};
const mockGoogleV2ResponseWelcome = {
  fulfillmentText: 'Welcome to my agent!',
  outputContexts: [],
};

const mockSlackV2RequestWelcome = {
  responseId: '188f19d3-80de-43e9-b32a-00503940944a',
  queryResult: {
    queryText: 'hi',
    action: 'input.welcome',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'Good day!',
    fulfillmentMessages: [{text: {text: ['Greetings!']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0/contexts/generic',
        lifespanCount: 4,
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/01299577-6c6b-4010-8a52-608208a731aa',
      displayName: 'Default Welcome Intent',
    },
    intentDetectionConfidence: 1,
    diagnosticInfo: {},
    languageCode: 'en',
  },
  originalDetectIntentRequest: {
    payload: {
      data: {
        event_ts: '1515188734.000166',
        channel: 'D3XQ6AF9A',
        text: 'hi',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515188734.000166',
      },
      source: 'slack_testbot',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV2ResponseWelcome = {
  fulfillmentText: 'Welcome to my agent!',
  outputContexts: [],
};

const mockFacebookV2RequestWelcome = {
  responseId: '1a931c02-8f3e-4000-a4c6-3e4aa5d73582',
  queryResult: {
    queryText: 'hi',
    action: 'input.welcome',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'Greetings!',
    fulfillmentMessages: [{text: {text: ['Hello!']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43/contexts/weather',
        parameters: {city: 'Rome'},
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43/contexts/generic',
        lifespanCount: 4,
        parameters: {facebook_sender_id: '1534862223272449'},
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/01299577-6c6b-4010-8a52-608208a731aa',
      displayName: 'Default Welcome Intent',
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
          mid: 'mid.$cAAMy_rGG1eZm-Y6amVgyElUX6Wlk',
          text: 'hi',
          seq: 899,
        },
        timestamp: 1515188736665,
      },
      source: 'facebook',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43',
};
const mockFacebookV2ResponseWelcome = {
  fulfillmentText: 'Welcome to my agent!',
  outputContexts: [],
};

// fallback
const mockGoogleV2RequestFallback = {
  responseId: '02a1cefa-c324-4f3c-9b89-8899c571c237',
  queryResult: {
    queryText: '4t3pouiewjflknsd',
    action: 'input.unknown',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'I missed what you said. Say it again?',
    fulfillmentMessages: [
      {text: {text: ['Sorry, could you say that again?']}},
    ],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_screen_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_audio_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/google_assistant_input_type_keyboard',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_web_browser',
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/1688c84d-878d-4fbb-9065-d06a7e553c4f',
      displayName: 'Default Fallback Intent',
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
          {name: 'actions.capability.SCREEN_OUTPUT'},
          {name: 'actions.capability.AUDIO_OUTPUT'},
          {name: 'actions.capability.WEB_BROWSER'},
        ],
      },
      inputs: [
        {
          rawInputs: [{query: '4t3pouiewjflknsd', inputType: 'KEYBOARD'}],
          arguments: [
            {
              rawText: '4t3pouiewjflknsd',
              textValue: '4t3pouiewjflknsd',
              name: 'text',
            },
          ],
          intent: 'actions.intent.TEXT',
        },
      ],
      user: {
        lastSeen: '2018-01-05T21:36:04Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {
        conversationId: '1515187868717',
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
  session: 'projects/stagent-f2236/agent/sessions/1515187868717',
};
const mockGoogleV2ResponseFallback = {
  fulfillmentMessages: [
    {
      platform: 'ACTIONS_ON_GOOGLE',
      simpleResponses: {
        simpleResponses: [
          {
            textToSpeech: 'I didn\'t understand',
            displayText: 'I didn\'t understand',
          },
        ],
      },
    },
    {
      platform: 'ACTIONS_ON_GOOGLE',
      simpleResponses: {
        simpleResponses: [
          {
            textToSpeech: 'I\'m sorry, can you try again?',
            displayText: 'I\'m sorry, can you try again?',
          },
        ],
      },
    },
  ],
  outputContexts: [],
};

const mockSlackV2RequestFallback = {
  responseId: 'ede3d6bf-b371-4d2a-a973-5b1f153cb308',
  queryResult: {
    queryText: 'tp4huwefjksdn',
    action: 'input.unknown',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'Can you say that again?',
    fulfillmentMessages: [
      {text: {text: ['I missed what you said. Say it again?']}},
    ],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0/contexts/generic',
        lifespanCount: 4,
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/1688c84d-878d-4fbb-9065-d06a7e553c4f',
      displayName: 'Default Fallback Intent',
    },
    intentDetectionConfidence: 1,
    diagnosticInfo: {},
    languageCode: 'en',
  },
  originalDetectIntentRequest: {
    payload: {
      data: {
        event_ts: '1515188859.000041',
        channel: 'D3XQ6AF9A',
        text: 'tp4huwefjksdn',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515188859.000041',
      },
      source: 'slack_testbot',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV2ResponseFallback = {
  fulfillmentMessages: [
    {text: {text: ['I didn\'t understand']}, platform: 'SLACK'},
    {text: {text: ['I\'m sorry, can you try again?']}, platform: 'SLACK'},
  ],
  outputContexts: [],
};

const mockFacebookV2RequestFallback = {
  responseId: '4d73e257-404b-4632-998a-7faa0b8bdf27',
  queryResult: {
    queryText: 'tiourejflkdn',
    action: 'input.unknown',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'Sorry, could you say that again?',
    fulfillmentMessages: [{text: {text: ['Sorry, I didn\'t get that.']}}],
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
        'projects/stagent-f2236/agent/intents/1688c84d-878d-4fbb-9065-d06a7e553c4f',
      displayName: 'Default Fallback Intent',
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
          mid: 'mid.$cAAMy_rGG1eZm-ZB_c1gyEs5OzmmF',
          text: 'tiourejflkdn',
          seq: 903,
        },
        timestamp: 1515188860787,
      },
      source: 'facebook',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43',
};
const mockFacebookV2ResponseFallback = {
  fulfillmentMessages: [
    {text: {text: ['I didn\'t understand']}, platform: 'FACEBOOK'},
    {text: {text: ['I\'m sorry, can you try again?']}, platform: 'FACEBOOK'},
  ],
  outputContexts: [],
};

// webhook
const mockGoogleV2RequestWebhook = {
  responseId: 'af9cef56-e500-4c00-8014-a19a0153ab13',
  queryResult: {
    queryText: 'webhook',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'webhook failure',
    fulfillmentMessages: [{text: {text: ['webhook failure']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_screen_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_audio_output',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/google_assistant_input_type_keyboard',
      },
      {
        name:
          'projects/stagent-f2236/agent/sessions/1515187868717/contexts/actions_capability_web_browser',
      },
    ],
    intent: {
      name:
        'projects/stagent-f2236/agent/intents/29bcd7f8-f717-4261-a8fd-2d3e451b8af8',
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
        lastSeen: '2018-01-05T21:36:04Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {
        conversationId: '1515187868717',
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
  session: 'projects/stagent-f2236/agent/sessions/1515187868717',
};
const mockGoogleV2ResponseWebhook = {
  fulfillmentMessages: [
    {
      platform: 'ACTIONS_ON_GOOGLE',
      simpleResponses: {
        simpleResponses: [
          {
            textToSpeech:
              'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
            displayText:
              'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
          },
        ],
      },
    },
    {
      basicCard: {
        title: 'Title: this is a card title',
        formattedText:
          'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
        image: {
          imageUri:
            'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
          accessibilityText: 'accessibility text',
        },
        buttons: [{openUriAction: {uri: 'https://assistant.google.com/'}, title: 'This is a button'}],
      },
      platform: 'ACTIONS_ON_GOOGLE',
    },
    {
      suggestions: {
        suggestions: [{title: 'Quick Reply'}, {title: 'Suggestion'}],
      },
      platform: 'ACTIONS_ON_GOOGLE',
    },
  ],
  outputContexts: [
    {
      name:
        'projects/stagent-f2236/agent/sessions/1515187868717/contexts/weather',
      lifespanCount: 2,
      parameters: {city: 'Rome'},
    },
  ],
};

const mockSlackV2RequestWebhook = {
  responseId: 'ea3d77e8-ae27-41a4-9e1d-174bd461b68c',
  queryResult: {
    queryText: 'webhook',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'webhook failure',
    fulfillmentMessages: [{text: {text: ['webhook failure']}}],
    outputContexts: [
      {
        name:
          'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0/contexts/generic',
        lifespanCount: 4,
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
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
        event_ts: '1515190802.000347',
        channel: 'D3XQ6AF9A',
        text: 'webhook',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515190802.000347',
      },
      source: 'slack_testbot',
    },
  },
  session:
    'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV2ResponseWebhook = {
  fulfillmentMessages: [
    {
      text: {
        text: [
          'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
        ],
      },
      platform: 'SLACK',
    },
    {
      card: {
        title: 'Title: this is a card title',
        subtitle:
          'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
        imageUri:
          'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        buttons: [
          {
            text: 'This is a button',
            postback: 'https://assistant.google.com/',
          },
        ],
      },
      platform: 'SLACK',
    },
    {
      quickReplies: {quickReplies: ['Quick Reply', 'Suggestion']},
      platform: 'SLACK',
    },
  ],
  outputContexts: [
    {
      name:
        'projects/stagent-f2236/agent/sessions/88d13aa8-2999-4f71-b233-39cbf3a824a0/contexts/weather',
      lifespanCount: 2,
      parameters: {city: 'Rome'},
    },
  ],
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
const mockFacebookV2ResponseWebhook = {
  fulfillmentMessages: [
    {
      text: {
        text: [
          'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
        ],
      },
      platform: 'FACEBOOK',
    },
    {
      card: {
        title: 'Title: this is a card title',
        subtitle:
          'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
        imageUri:
          'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        buttons: [
          {
            text: 'This is a button',
            postback: 'https://assistant.google.com/',
          },
        ],
      },
      platform: 'FACEBOOK',
    },
    {
      quickReplies: {quickReplies: ['Quick Reply', 'Suggestion']},
      platform: 'FACEBOOK',
    },
  ],
  outputContexts: [
    {
      name:
        'projects/stagent-f2236/agent/sessions/3c32f610-3f2b-4bd8-9712-43eb69c06c43/contexts/weather',
      lifespanCount: 2,
      parameters: {city: 'Rome'},
    },
  ],
};
