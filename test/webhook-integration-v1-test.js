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

test('v1 Integration test', async (t) => {
  // v1 Google Welcome
  let googleV1WelcomeRequest = {body: mockGoogleV1RequestWelcome};
  webhookTest(googleV1WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV1ResponseWelcome);
  });

  // v1 Slack Welcome
  let slackV1WelcomeRequest = {body: mockSlackV1RequestWelcome};
  webhookTest(slackV1WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV1ResponseWelcome);
  });

  // v1 Facebook Welcome
  let facebookV1WelcomeRequest = {body: mockFacebookV1RequestWelcome};
  webhookTest(facebookV1WelcomeRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV1ResponseWelcome);
  });

  // v1 Google Fallback
  let googleV1RequestFallback = {body: mockGoogleV1RequestFallback};
  webhookTest(googleV1RequestFallback, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV1ResponseFallback);
  });

  // v1 Slack Fallback
  let slackV1FallbackRequest = {body: mockSlackV1RequestFallback};
  webhookTest(slackV1FallbackRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV1ResponseFallback);
  });

  // v1 Facebook Fallback
  let facebookV1FallbackRequest = {body: mockFacebookV1RequestFallback};
  webhookTest(facebookV1FallbackRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV1ResponseFallback);
  });

  // v1 Google Webhook
  let googleV1WebhookRequest = {body: mockGoogleV1RequestWebhook};
  webhookTest(googleV1WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockGoogleV1ResponseWebhook);
  });

  // v1 Slack Webhook
  let slackV1WebhookRequest = {body: mockSlackV1RequestWebhook};
  webhookTest(slackV1WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSlackV1ResponseWebhook);
  });

  // v1 Facebook Webhook
  let facebookV1WebhookRequest = {body: mockFacebookV1RequestWebhook};
  webhookTest(facebookV1WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockFacebookV1ResponseWebhook);
  });

  // v1 simulator Webhook
  let simulatorV1WebhookRequest = {body: mockSimulatorV1RequestOther};
  webhookTest(simulatorV1WebhookRequest, (responseJson) => {
    t.deepEqual(responseJson, mockSimulatorV1ReponseWebhook);
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

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set(null, other);
  agent.handleRequest(intentMap);
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

const mockSimulatorV1RequestOther = {
  'id': '9c43750a-f5e2-4f6f-8452-f22d13fc4cfe',
  'timestamp': '2018-04-07T03:58:15.346Z',
  'lang': 'en',
  'result': {
    'source': 'agent',
    'resolvedQuery': 'google intent',
    'speech': '',
    'action': '',
    'actionIncomplete': false,
    'parameters': {},
    'contexts': [],
    'metadata': {
      'intentId': '3ca26fa9-ee85-458b-98e0-c42452d9775c',
      'webhookUsed': 'true',
      'webhookForSlotFillingUsed': 'false',
      'intentName': 'Google Intent',
    },
    'fulfillment': {
      'speech': '',
      'messages': [
        {
          'type': 0,
          'speech': '',
        },
      ],
    },
    'score': 1,
  },
  'status': {
    'code': 200,
    'errorType': 'success',
    'webhookTimedOut': false,
  },
  'sessionId': '669d7da3-de6f-4b1d-8394-d79c6973e516',
};

const mockSimulatorV1ReponseWebhook = {
  messages: [
    {
      type: 0,
      speech:
        'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
    },
    {
      type: 1,
      title: 'Title: this is a card title',
      subtitle:
        'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
      imageUrl:
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      buttons: [
        {text: 'This is a button', postback: 'https://assistant.google.com/'},
      ],
    },
    {type: 2, replies: ['Quick Reply', 'Suggestion']},
  ],
  contextOut: [{name: 'weather', lifespan: 2, parameters: {city: 'Rome'}}],
};

// Mock webhook request and reponse from Dialogflow for sample v1
// welcome
const mockGoogleV1RequestWelcome = {
  originalRequest: {
    source: 'google',
    version: '2',
    data: {
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
          rawInputs: [{query: 'talk to my test app', inputType: 'KEYBOARD'}],
          intent: 'actions.intent.MAIN',
        },
      ],
      user: {
        lastSeen: '2018-01-05T22:28:06Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {conversationId: '1515191296300', type: 'NEW'},
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
  id: '106ebbf4-06c4-441c-8d4a-819be69bad98',
  timestamp: '2018-01-05T22:28:16.365Z',
  lang: 'en-us',
  result: {
    source: 'agent',
    resolvedQuery: 'GOOGLE_ASSISTANT_WELCOME',
    speech: '',
    action: 'input.welcome',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {name: 'google_assistant_welcome', parameters: {}, lifespan: 0},
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
      intentId: '01299577-6c6b-4010-8a52-608208a731aa',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      nluResponseTime: 0,
      intentName: 'Default Welcome Intent',
    },
    fulfillment: {speech: 'Hi!', messages: [{type: 0, speech: 'Hello!'}]},
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '1515191296300',
};
const mockGoogleV1ResponseWelcome = {
  speech: 'Welcome to my agent!',
  displayText: 'Welcome to my agent!',
  contextOut: [],
};

const mockSlackV1RequestWelcome = {
  originalRequest: {
    source: '',
    data: {
      data: {
        event_ts: '1515191286.000256',
        channel: 'D3XQ6AF9A',
        text: 'hi',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515191286.000256',
      },
      source: 'slack_testbot',
    },
  },
  id: '4cc8a100-7220-40ba-bf98-6911d9fefab6',
  timestamp: '2018-01-05T22:28:07.342Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'hi',
    speech: '',
    action: 'input.welcome',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '01299577-6c6b-4010-8a52-608208a731aa',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'Default Welcome Intent',
    },
    fulfillment: {speech: 'Hi!', messages: [{type: 0, speech: 'Hello!'}]},
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV1ResponseWelcome = {
  speech: 'Welcome to my agent!',
  displayText: 'Welcome to my agent!',
  contextOut: [],
};

const mockFacebookV1RequestWelcome = {
  originalRequest: {
    source: '',
    data: {
      data: {
        sender: {id: '1534862223272449'},
        recipient: {id: '958823367603818'},
        message: {
          mid: 'mid.$cAAMy_rGG1eZm-bWL5FgyHBDQXtpi',
          text: 'hi',
          seq: 910,
        },
        timestamp: 1515191288804,
      },
      source: 'facebook',
    },
  },
  id: '1ef8461a-e33b-4403-bc91-ed416ec777f9',
  timestamp: '2018-01-05T22:28:09.044Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'hi',
    speech: '',
    action: 'input.welcome',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {facebook_sender_id: '1534862223272449'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '01299577-6c6b-4010-8a52-608208a731aa',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'Default Welcome Intent',
    },
    fulfillment: {speech: 'Hello!', messages: [{type: 0, speech: 'Hi!'}]},
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '3c32f610-3f2b-4bd8-9712-43eb69c06c43',
};
const mockFacebookV1ResponseWelcome = {
  speech: 'Welcome to my agent!',
  displayText: 'Welcome to my agent!',
  contextOut: [],
};

// fallback
const mockGoogleV1RequestFallback = {
  originalRequest: {
    source: 'google',
    version: '2',
    data: {
      isInSandbox: true,
      surface: {
        capabilities: [
          {name: 'actions.capability.WEB_BROWSER'},
          {name: 'actions.capability.AUDIO_OUTPUT'},
          {name: 'actions.capability.SCREEN_OUTPUT'},
        ],
      },
      inputs: [
        {
          rawInputs: [{query: '4io3jrlkwenf,m', inputType: 'KEYBOARD'}],
          arguments: [
            {
              rawText: '4io3jrlkwenf,m',
              textValue: '4io3jrlkwenf,m',
              name: 'text',
            },
          ],
          intent: 'actions.intent.TEXT',
        },
      ],
      user: {
        lastSeen: '2018-01-05T22:28:06Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {
        conversationId: '1515191296300',
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
  id: '1e537cc6-057d-47f7-8413-ca3654b72466',
  timestamp: '2018-01-05T22:33:25.096Z',
  lang: 'en-us',
  result: {
    source: 'agent',
    resolvedQuery: '4io3jrlkwenf,m',
    speech: '',
    action: 'input.unknown',
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
      intentId: '1688c84d-878d-4fbb-9065-d06a7e553c4f',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      nluResponseTime: 14,
      intentName: 'Default Fallback Intent',
    },
    fulfillment: {
      speech: 'I missed that.',
      messages: [{type: 0, speech: 'I missed what you said. Say it again?'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '1515191296300',
};
const mockGoogleV1ResponseFallback = {
  messages: [
    {
      type: 'simple_response',
      platform: 'google',
      textToSpeech: 'I didn\'t understand',
      displayText: 'I didn\'t understand',
    },
    {
      type: 'simple_response',
      platform: 'google',
      textToSpeech: 'I\'m sorry, can you try again?',
      displayText: 'I\'m sorry, can you try again?',
    },
  ],
  contextOut: [],
};

const mockSlackV1RequestFallback = {
  originalRequest: {
    source: '',
    data: {
      data: {
        event_ts: '1515191605.000083',
        channel: 'D3XQ6AF9A',
        text: '34uoirwejlfkn',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515191605.000083',
      },
      source: 'slack_testbot',
    },
  },
  id: '2759004f-672e-4f7c-9e56-46a8829161e1',
  timestamp: '2018-01-05T22:33:25.967Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: '34uoirwejlfkn',
    speech: '',
    action: 'input.unknown',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '1688c84d-878d-4fbb-9065-d06a7e553c4f',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'Default Fallback Intent',
    },
    fulfillment: {
      speech: 'Sorry, can you say that again?',
      messages: [{type: 0, speech: 'Sorry, I didn\'t get that.'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV1ResponseFallback = {
  messages: [
    {type: 0, platform: 'slack', speech: 'I didn\'t understand'},
    {type: 0, platform: 'slack', speech: 'I\'m sorry, can you try again?'},
  ],
  contextOut: [],
};

const mockFacebookV1RequestFallback = {
  originalRequest: {
    source: '',
    data: {
      data: {
        sender: {id: '1534862223272449'},
        recipient: {id: '958823367603818'},
        message: {
          mid: 'mid.$cAAMy_rGG1eZm-bpla1gyHUcz0rSB',
          text: '43utpoiwjrefknd,ms',
          seq: 914,
        },
        timestamp: 1515191606635,
      },
      source: 'facebook',
    },
  },
  id: 'c090d51e-6b16-42d6-be49-e5be8a7b11cb',
  timestamp: '2018-01-05T22:33:27.754Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: '43utpoiwjrefknd,ms',
    speech: '',
    action: 'input.unknown',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {facebook_sender_id: '1534862223272449'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '1688c84d-878d-4fbb-9065-d06a7e553c4f',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'Default Fallback Intent',
    },
    fulfillment: {
      speech: 'I didn\'t get that. Can you say it again?',
      messages: [{type: 0, speech: 'I missed that.'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '2ea4d4d8-b6e8-4bcd-8e08-d427eb83e75d',
};
const mockFacebookV1ResponseFallback = {
  messages: [
    {type: 0, platform: 'facebook', speech: 'I didn\'t understand'},
    {type: 0, platform: 'facebook', speech: 'I\'m sorry, can you try again?'},
  ],
  contextOut: [],
};

// webhook
const mockGoogleV1RequestWebhook = {
  originalRequest: {
    source: 'google',
    version: '2',
    data: {
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
          rawInputs: [{query: 'webhook', inputType: 'KEYBOARD'}],
          arguments: [
            {rawText: 'webhook', textValue: 'webhook', name: 'text'},
          ],
          intent: 'actions.intent.TEXT',
        },
      ],
      user: {
        lastSeen: '2018-01-05T22:28:06Z',
        locale: 'en-US',
        userId:
          'ABwppHHixRyLmiAcc4IihWQOCUfSLS1Dw6OezP3e0_CqqJNkbXFCTxGNi_Zi_oc3r86CR0nyHwcDRqIEHQ',
      },
      conversation: {
        conversationId: '1515191296300',
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
  id: '7811ac58-5bd5-4e44-8d06-6cd8c67f5406',
  timestamp: '2018-01-05T22:35:05.903Z',
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
  sessionId: '1515191296300',
};
const mockGoogleV1ResponseWebhook = {
  messages: [
    {
      type: 'simple_response',
      platform: 'google',
      textToSpeech:
        'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
      displayText:
        'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
    },
    {
      type: 'basic_card',
      platform: 'google',
      title: 'Title: this is a card title',
      formattedText:
        'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
      image: {
        url:
          'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        accessibilityText: 'accessibility text',
      },
      buttons: [
        {
          openUrlAction: {url: 'https://assistant.google.com/'},
          title: 'This is a button',
        },
      ],
    },
    {
      suggestions: [{title: 'Quick Reply'}, {title: 'Suggestion'}],
      type: 'suggestion_chips',
      platform: 'google',
    },
  ],
  contextOut: [{name: 'weather', lifespan: 2, parameters: {city: 'Rome'}}],
};

const mockSlackV1RequestWebhook = {
  originalRequest: {
    source: '',
    data: {
      data: {
        event_ts: '1515191706.000272',
        channel: 'D3XQ6AF9A',
        text: 'webhook',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515191706.000272',
      },
      source: 'slack_testbot',
    },
  },
  id: 'db7d64c8-46e6-44ba-be27-0e56bca4278e',
  timestamp: '2018-01-05T22:35:07.25Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'webhook',
    speech: '',
    action: '',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '29bcd7f8-f717-4261-a8fd-2d3e451b8af8',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'webhook',
    },
    fulfillment: {
      speech: 'webhook failure',
      messages: [{type: 0, speech: 'webhook failure'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '88d13aa8-2999-4f71-b233-39cbf3a824a0',
};
const mockSlackV1ResponseWebhook = {
  messages: [
    {
      type: 0,
      platform: 'slack',
      speech:
        'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
    },
    {
      type: 1,
      title: 'Title: this is a card title',
      subtitle:
        'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
      imageUrl:
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      buttons: [
        {text: 'This is a button', postback: 'https://assistant.google.com/'},
      ],
      platform: 'slack',
    },
    {type: 2, replies: ['Quick Reply', 'Suggestion'], platform: 'slack'},
  ],
  contextOut: [{name: 'weather', lifespan: 2, parameters: {city: 'Rome'}}],
};

const mockFacebookV1RequestWebhook = {
  originalRequest: {
    source: '',
    data: {
      data: {
        sender: {id: '1534862223272449'},
        recipient: {id: '958823367603818'},
        message: {
          mid: 'mid.$cAAMy_rGG1eZm-bv1_VgyHatXuBFn',
          text: 'webhook',
          seq: 919,
        },
        timestamp: 1515191709181,
      },
      source: 'facebook',
    },
  },
  id: 'ca123766-9b17-495f-9752-072cdf57ed8f',
  timestamp: '2018-01-05T22:35:09.428Z',
  lang: 'en',
  result: {
    source: 'agent',
    resolvedQuery: 'webhook',
    speech: '',
    action: '',
    actionIncomplete: false,
    parameters: {},
    contexts: [
      {
        name: 'generic',
        parameters: {facebook_sender_id: '1534862223272449'},
        lifespan: 4,
      },
    ],
    metadata: {
      intentId: '29bcd7f8-f717-4261-a8fd-2d3e451b8af8',
      webhookUsed: 'true',
      webhookForSlotFillingUsed: 'false',
      intentName: 'webhook',
    },
    fulfillment: {
      speech: 'webhook failure',
      messages: [{type: 0, speech: 'webhook failure'}],
    },
    score: 1,
  },
  status: {code: 200, errorType: 'success', webhookTimedOut: false},
  sessionId: '2ea4d4d8-b6e8-4bcd-8e08-d427eb83e75d',
};
const mockFacebookV1ResponseWebhook = {
  messages: [
    {
      type: 0,
      platform: 'facebook',
      speech:
        'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
    },
    {
      type: 1,
      title: 'Title: this is a card title',
      subtitle:
        'This is the body text of a card.  You can even use line\nbreaks and emoji! 💁',
      imageUrl:
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      buttons: [
        {text: 'This is a button', postback: 'https://assistant.google.com/'},
      ],
      platform: 'facebook',
    },
    {type: 2, replies: ['Quick Reply', 'Suggestion'], platform: 'facebook'},
  ],
  contextOut: [{name: 'weather', lifespan: 2, parameters: {city: 'Rome'}}],
};
