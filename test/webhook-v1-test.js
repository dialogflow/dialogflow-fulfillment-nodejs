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
const {Text, Card, Image, Suggestion, Payload} = require('../src/dialogflow-fulfillment');
const {PLATFORMS} = require('../src/rich-responses/rich-response');

const imageUrl =
  'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png';
const linkUrl = 'https://assistant.google.com/';

test('Test v1 AoG responses', async (t) => {
  // TextResponse and CardResponse
  let googleRequest = {body: mockGoogleV1Request};
  webhookTest(googleRequest, textAndCard, (responseJson) => {
    t.deepEqual(responseJson, responseGoogleV1TextAndCard);
  });

  // ImageResponse
  webhookTest(
    googleRequest,
    function(agent) {
      agent.add(new Image(imageUrl));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseGoogleV1Image);
    }
  );

  // QuickRepliesResponse
  webhookTest(
    googleRequest,
    (agent) => {
      agent.add(new Suggestion('sample reply'));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseGoogleV1Suggestion);
    }
  );

  // PayloadResponse
  webhookTest(
    googleRequest,
    (agent) => {
      agent.add(new Payload(agent.ACTIONS_ON_GOOGLE, googlePayload));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseGoogleV1Payload);
    }
  );
});

test('Test v1 Slack responses', async (t) => {
  // TextResponse and CardResponse
  let slackRequest = {body: mockSlackV1Request};
  webhookTest(
    slackRequest,
    textAndCard,
    (responseJson) => {
      t.deepEqual(responseJson, responseSlackV1TextAndCard);
    }
  );

  // ImageResponse
  webhookTest(
    slackRequest,
    (agent) => {
      agent.add(new Image(imageUrl));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseSlackV1Image);
    }
  );

  // SuggetionsResponse
  webhookTest(
    slackRequest,
    (agent) => {
      agent.add( new Suggestion('sample reply'));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseSlackV1Suggestion);
    }
  );

  // PayloadResponse
  webhookTest(
    slackRequest,
    (agent) => {
      agent.add( new Payload(agent.SLACK, slackPayload));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseSlackV1Payload);
    }
  );
});

test('Test v1 Facebook responses', async (t) => {
  // QuickRepliesResponse
  const facebookRequest = {body: mockFacebookV1Request};
  webhookTest(
    facebookRequest,
    (agent) => {
      agent.add( new Suggestion('sample reply'));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responsefacebookV1Suggestion);
    }
  );

  // PayloadResponse
  webhookTest(
    facebookRequest,
    (agent) => {
      agent.add( new Payload(agent.FACEBOOK, facebookPayload));
    },
    (responseJson) => {
      t.deepEqual(responseJson, responseFacebookV1Payload);
    }
  );
});

test('Test v1 Twitter requestSource', async (t) => {
  let twitterRequest = {body: mockTwitterV1Request};
  let response = new ResponseMock();
  let agent = new WebhookClient({
    request: twitterRequest,
    response: response,
  });

  t.deepEqual(agent.requestSource, 'twitter');
});

test('Test v1 Twitter text-only response', async (t) => {
  let twitterRequest = {body: mockTwitterV1Request};
  const textResponse = 'twitter text response';

  webhookTest(
    twitterRequest,
    (agent) => {
      agent.add(textResponse);
    },
    (responseJson) => {
      t.deepEqual(responseJson, {speech: textResponse, displayText: textResponse, contextOut: []});
    }
  );
});

test('Test v1 Twitter payload response', async (t) => {
  let twitterRequest = {body: mockTwitterV1Request};

  webhookTest(
    twitterRequest,
    (agent) => {
      agent.add(new Payload('twitter', {test: 'payload'}));
    },
    (responseJson) => {
      t.deepEqual(responseJson, {data: {twitter: {test: 'payload'}}, contextOut: []});
    }
  );
});

test('Test v1 contexts', async (t) => {
  const sampleContextName = 'sample context name';
  const secondContextName = 'second context name';
  const complexContext = {
    name: 'weather',
    lifespan: 2,
    parameters: {city: 'Rome'},
  };

  let googleResponse = new ResponseMock();
  let googleRequest = {body: mockGoogleV1Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  // setContext
  agent.setContext(sampleContextName);
  t.deepEqual({name: sampleContextName}, agent.outgoingContexts_[0]);
  agent.setContext(secondContextName);
  t.deepEqual({name: secondContextName}, agent.outgoingContexts_[1]);
  agent.setContext(complexContext);
  t.deepEqual(complexContext, agent.outgoingContexts_[2]);
  // clearContext
  agent.clearContext(sampleContextName);
  t.deepEqual({name: secondContextName}, agent.outgoingContexts_[0]);
  // clearAllContext
  agent.clearOutgoingContexts();
  t.deepEqual([], agent.outgoingContexts_);
});

test('Test v1 getContext', async (t) => {
  let googleResponse = new ResponseMock();
  let googleRequest = {body: mockGoogleV1Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });

  let context = agent.getContext('actions_capability_screen_output');
  t.deepEqual({name: 'actions_capability_screen_output',
    parameters: {},
    lifespan: 0,
  },
    context
  );

  context = agent.getContext('nonsense');
  t.deepEqual(null, context);
});

test('Test v1 followup events', async (t) => {
  const sampleEventName = 'sample event name';
  const secondEventName = 'second Event name';
  const complexEvent = {
    name: 'weather',
    parameters: {city: 'Rome'},
    languageCode: 'en',
  };
  const complexEventJson = {
    name: 'weather',
    data: {city: 'Rome'},
  };

  let googleResponse = new ResponseMock();
  let googleRequest = {body: mockGoogleV1Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  // setFollowupEvent
  agent.setFollowupEvent(sampleEventName);
  t.deepEqual({name: sampleEventName}, agent.followupEvent_);
  agent.setFollowupEvent(secondEventName);
  t.deepEqual({name: secondEventName}, agent.followupEvent_);
  agent.setFollowupEvent(complexEvent);
  t.deepEqual(complexEventJson, agent.followupEvent_);
});

test('Test v1 original request', async (t) => {
  let response = new ResponseMock();


  let googleRequest = {body: mockGoogleV1Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: response,
  });

  // Rename 'data' attr to 'payload' to be consistent with v2
  let mockGoogleV1RequestOrigReq = Object.assign({}, mockGoogleV1Request.originalRequest);
  Object.defineProperty(mockGoogleV1RequestOrigReq, 'payload',
    Object.getOwnPropertyDescriptor(mockGoogleV1RequestOrigReq, 'data'));
  delete mockGoogleV1RequestOrigReq['data'];

  t.deepEqual(mockGoogleV1RequestOrigReq,
    agent.originalRequest
  );

  let facebookRequest = {body: mockFacebookV1Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: response,
  });

  // Rename 'data' attr to 'payload' to be consistent with v2
  let mockFacebookV1RequestOrigReq = Object.assign({}, mockFacebookV1Request.originalRequest);
  Object.defineProperty(mockFacebookV1RequestOrigReq, 'payload',
    Object.getOwnPropertyDescriptor(mockFacebookV1RequestOrigReq, 'data'));
  delete mockFacebookV1RequestOrigReq['data'];


  t.deepEqual(mockFacebookV1RequestOrigReq,
    agent.originalRequest
  );
});

test('Test v1 no handler defined', async (t) => {
  let response = new ResponseMock();
  let agent = new WebhookClient({
    request: {body: mockSlackV1Request},
    response: response,
  });

  const noHandlerDefinedError = await t.throws(agent.handleRequest(new Map()));
  t.is(
    noHandlerDefinedError.message,
    'No handler for requested intent'
  );
});

/**
 * utility function to setup webhook test
 * @param {Object} request express object
 * @param {function} handler for agent.add commands
 * @param {function} callback for after response is complied
 */
function webhookTest(request, handler, callback) {
  let response = new ResponseMock(callback);
  let agent = new WebhookClient({
    request: request,
    response: response,
  });
  agent.handleRequest(handler);
}

test('Test v1 getResponseMessages', async (t) => {
  let response = new ResponseMock();
  let agent = new WebhookClient({
    request: {body: mockV1MultipleConsoleMessagesRequest},
    response: response,
  });

  const consoleMessages = agent.consoleMessages;

  // Slack text messages
  const slackTextMessage = consoleMessages[0];
  t.true(slackTextMessage instanceof Text);
  t.is(slackTextMessage.text, 'yo');
  t.is(slackTextMessage.platform, PLATFORMS.SLACK);
  // Slack cards
  const slackCard = consoleMessages[1];
  t.true(slackCard instanceof Card);
  t.is(slackCard.title, 'card title');
  // Facebook text
  const facebookText = consoleMessages[2];
  t.true(facebookText instanceof Text);
  t.is(facebookText.text, 'hi');
  t.is(facebookText.platform, PLATFORMS.FACEBOOK);
  // Facebook image
  const facebookImage = consoleMessages[3];
  t.true(facebookImage instanceof Image);
  t.is(facebookImage.imageUrl,
    'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
  );
  // Actions on Google text
  const actionsOnGoogleText = consoleMessages[4];
  t.true(actionsOnGoogleText instanceof Text);
  t.is(actionsOnGoogleText.text, 'simple response');
  t.is(actionsOnGoogleText.platform, PLATFORMS.ACTIONS_ON_GOOGLE);
  // Actions on Google card
  const actionsOnGoogleCard = consoleMessages[5];
  t.true(actionsOnGoogleCard instanceof Text);
  t.is(actionsOnGoogleCard.text, 'another simple response');
  // Actions on Google text
  const actionsOnGoogleBasicCard = consoleMessages[6];
  t.true(actionsOnGoogleBasicCard instanceof Card);
  t.is(actionsOnGoogleBasicCard.text, 'basic card');

  const actionsOnGoogleSuggestion = consoleMessages[7];
  t.true(actionsOnGoogleSuggestion instanceof Suggestion);
  t.is(actionsOnGoogleSuggestion.replies[0], 'suggestion');
  // Actions on Google text 2
  const actionsOnGoogleSuggestion2 = consoleMessages[8];
  t.true(actionsOnGoogleSuggestion2 instanceof Suggestion);
  t.is(actionsOnGoogleSuggestion2.replies[0], 'another suggestion');
});

/**
 * handler to add text and card responses
 * @param {Object} agent
 */
function textAndCard(agent) {
  agent.add('text response');
  agent.add(new Card({
      title: 'card title',
      text: 'card text',
      imageUrl: imageUrl,
      buttonText: 'button text',
      buttonUrl: linkUrl,
    })
  );
};

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

const responseFacebookV1Payload = {
  data: {
    facebook: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Title: this is a title',
              image_url:
                'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
              subtitle: 'This is a subtitle',
              default_action: {
                type: 'web_url',
                url: 'https://assistant.google.com/',
              },
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://assistant.google.com/',
                  title: 'This is a button',
                },
              ],
            },
          ],
        },
      },
    },
  },
  contextOut: [],
};
const responsefacebookV1Suggestion = {
  messages: [{type: 2, replies: ['sample reply'], platform: 'facebook'}],
  contextOut: [],
};

const responseSlackV1Payload = {
  data: {
    slack: {
      text: 'This is a text response for Slack.',
      attachments: [
        {
          title: 'Title: this is a title',
          title_link: 'https://assistant.google.com/',
          text: `This is an attachment.  Text in attachments can include \
\'quotes\' and most other unicode characters including emoji 📱.  \
Attachments also upport line\nbreaks.`,
          image_url:
            'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
          fallback: 'This is a fallback.',
        },
      ],
    },
  },
  contextOut: [],
};
const responseSlackV1Suggestion = {
  messages: [{type: 2, replies: ['sample reply'], platform: 'slack'}],
  contextOut: [],
};
const responseSlackV1Image = {
  contextOut: [],
  messages: [
    {
      platform: 'slack',
      imageUrl:
        'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png',
      type: 3,
    },
  ],
};
const responseSlackV1TextAndCard = {
  messages: [
    {type: 0, platform: 'slack', speech: 'text response'},
    {
      type: 1,
      title: 'card title',
      subtitle: 'card text',
      imageUrl:
        'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png',
      buttons: [
        {text: 'button text', postback: 'https://assistant.google.com/'},
      ],
      platform: 'slack',
    },
  ],
  contextOut: [],
};

const responseGoogleV1Payload = {
  data: {
    google: {
      expectUserResponse: true,
      isSsml: false,
      noInputPrompts: [],
      richResponse: {
        items: [
          {simpleResponse: {textToSpeech: 'hello', displayText: 'hi'}},
        ],
        suggestions: [{title: 'Say this'}, {title: 'or this'}],
      },
      systemIntent: {
        intent: 'actions.intent.OPTION',
        data: {
          '@type':
            'type.googleapis.com/google.actions.v2.OptionValueSpec',
          'listSelect': {
            items: [
              {
                optionInfo: {key: 'key1', synonyms: ['key one']},
                title: 'must not be empty',
              },
              {
                optionInfo: {key: 'key2', synonyms: ['key two']},
                title: 'must not be empty, but unquie, for some reason',
              },
            ],
          },
        },
      },
    },
  },
  contextOut: [],
};

const responseGoogleV1Suggestion = {
  messages: [
    {
      type: 'simple_response',
      platform: 'google',
      textToSpeech: ' ',
      displayText: ' ',
    },
    {
      suggestions: [{title: 'sample reply'}],
      type: 'suggestion_chips',
      platform: 'google',
    },
  ],
  contextOut: [],
};

const responseGoogleV1Image = {
    messages: [
      {
        type: 'simple_response',
        platform: 'google',
        textToSpeech: ' ',
        displayText: ' ',
      },
      {
        type: 'basic_card',
        platform: 'google',
        image: {
          url:
            'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png',
          accessibilityText: 'accessibility text',
        },
      },
    ],
    contextOut: [],
  };

const responseGoogleV1TextAndCard = {
  messages: [
    {
      type: 'simple_response',
      platform: 'google',
      textToSpeech: 'text response',
      displayText: 'text response',
    },
    {
      type: 'basic_card',
      platform: 'google',
      title: 'card title',
      formattedText: 'card text',
      image: {
        url:
          'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png',
        accessibilityText: 'accessibility text',
      },
      buttons: [
        {
          openUrlAction: {url: 'https://assistant.google.com/'},
          title: 'button text',
        },
      ],
    },
  ],
  contextOut: [],
};

// Mock v1 webhook request from Dialogflow
const mockSlackV1Request = {
  originalRequest: {
    source: '',
    data: {
      data: {
        event_ts: '1515099044.000018',
        channel: 'D3XQ6AF9A',
        text: 'webhook',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515099044.000018',
      },
      source: 'slack_testbot',
    },
  },
  id: '2775c542-1873-4ba9-9095-b2c99c4c5dea',
  timestamp: '2018-01-04T20:50:44.673Z',
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
const mockFacebookV1Request = {
  originalRequest: {
    source: '',
    data: {
      data: {
        sender: {id: '1534862223272449'},
        recipient: {id: '958823367603818'},
        message: {
          mid: 'mid.$cAAMy_rGG1eZm9K6sR1gw2lkouosm',
          text: 'webhook',
          seq: 750,
        },
        timestamp: 1515106952263,
      },
      source: 'facebook',
    },
  },
  id: 'fafcf014-fe27-4b01-a1d4-494b8d5de3ca',
  timestamp: '2018-01-04T23:02:33.033Z',
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
  sessionId: '95fc48d7-ea9a-4273-9503-4cf2e1b4d33a',
};

// Custom JSON payload for Google, Slack and Facebook for PayloadMessage type
const googlePayload = {
  expectUserResponse: true,
  isSsml: false,
  noInputPrompts: [],
  richResponse: {
    items: [{simpleResponse: {textToSpeech: 'hello', displayText: 'hi'}}],
    suggestions: [{title: 'Say this'}, {title: 'or this'}],
  },
  systemIntent: {
    intent: 'actions.intent.OPTION',
    data: {
      '@type': 'type.googleapis.com/google.actions.v2.OptionValueSpec',
      'listSelect': {
        items: [
          {
            optionInfo: {key: 'key1', synonyms: ['key one']},
            title: 'must not be empty',
          },
          {
            optionInfo: {key: 'key2', synonyms: ['key two']},
            title: 'must not be empty, but unquie, for some reason',
          },
        ],
      },
    },
  },
};
const slackPayload = {
  text: 'This is a text response for Slack.',
  attachments: [
    {
      title: 'Title: this is a title',
      title_link: 'https://assistant.google.com/',
      text: `This is an attachment.  Text in attachments can include \
\'quotes\' and most other unicode characters including emoji 📱.  \
Attachments also upport line\nbreaks.`,
      image_url:
        'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      fallback: 'This is a fallback.',
    },
  ],
};
const facebookPayload = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'generic',
      elements: [
        {
          title: 'Title: this is a title',
          image_url:
            'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
          subtitle: 'This is a subtitle',
          default_action: {
            type: 'web_url',
            url: 'https://assistant.google.com/',
          },
          buttons: [
            {
              type: 'web_url',
              url: 'https://assistant.google.com/',
              title: 'This is a button',
            },
          ],
        },
      ],
    },
  },
};

const mockTwitterV1Request = {
  'id': 'db8e179c-cb56-4aa8-956e-7ee3a2ae8526',
  'lang': 'en',
  'originalRequest': {
    'data': {
      'data': {
        'direct_message': {
          'created_at': 'Sun Jan 28 21:47:11 +0000 2018',
          'entities': {
            'hashtags': [],
            'symbols': [],
            'urls': [],
            'user_mentions': [],
          },
          'id': 957731807536889900,
          'id_str': '957731807536889860',
          'recipient': {
            'contributors_enabled': false,
            'created_at': 'Fri Sep 23 03:16:06 +0000 2011',
            'default_profile': false,
            'default_profile_image': false,
            'description': 'Dialogflow Developer Relations 🏗 💬➕🗣 🤖',
            'favourites_count': 141,
            'follow_request_sent': false,
            'followers_count': 157,
            'following': false,
            'friends_count': 283,
            'geo_enabled': true,
            'id': 378380992,
            'id_str': '378380992',
            'is_translation_enabled': false,
            'is_translator': false,
            'lang': 'en',
            'listed_count': 7,
            'location': 'California',
            'name': 'Matt Carroll',
            'notifications': false,
            'profile_background_color': 'C0DEED',
            'profile_background_tile': false,
            'profile_banner_url': 'https://pbs.twimg.com/profile_banners/378380992/1397077040',
            'profile_image_url': 'http://pbs.twimg.com/profile_images/909341545056350208/oHrAs6pz_normal.jpg',
            'profile_image_url_https': 'https://pbs.twimg.com/profile_images/909341545056350208/oHrAs6pz_normal.jpg',
            'profile_link_color': '0084B4',
            'profile_sidebar_border_color': 'FFFFFF',
            'profile_sidebar_fill_color': 'DDEEF6',
            'profile_text_color': '333333',
            'profile_use_background_image': true,
            'protected': false,
            'screen_name': 'matthewayne',
            'statuses_count': 199,
            'time_zone': 'Arizona',
            'translator_type': 'none',
            'url': 'https://matthewayne.com',
            'utc_offset': -25200,
            'verified': false,
          },
          'recipient_id': 378380992,
          'recipient_id_str': '378380992',
          'recipient_screen_name': 'matthewayne',
          'sender': {
            'contributors_enabled': false,
            'created_at': 'Wed Aug 27 20:58:16 +0000 2014',
            'default_profile': false,
            'default_profile_image': false,
            'favourites_count': 694,
            'follow_request_sent': false,
            'followers_count': 7078,
            'following': false,
            'friends_count': 1588,
            'geo_enabled': false,
            'id': 2774598458,
            'id_str': '2774598458',
            'is_translation_enabled': false,
            'is_translator': false,
            'lang': 'en',
            'listed_count': 317,
            'name': 'Dialogflow',
            'notifications': false,
            'profile_background_color': '000000',
            'profile_background_image_url': 'http://abs.twimg.com/images/themes/theme15/bg.png',
            'profile_background_image_url_https': 'https://abs.twimg.com/images/themes/theme15/bg.png',
            'profile_background_tile': false,
            'profile_banner_url': 'https://pbs.twimg.com/profile_banners/2774598458/1516905644',
            'profile_image_url': 'http://pbs.twimg.com/profile_images/880147119528476672/S7C-2C6t_normal.jpg',
            'profile_image_url_https': 'https://pbs.twimg.com/profile_images/880147119528476672/S7C-2C6t_normal.jpg',
            'profile_link_color': 'EF6C00',
            'profile_sidebar_border_color': '000000',
            'profile_sidebar_fill_color': '000000',
            'profile_text_color': '000000',
            'profile_use_background_image': false,
            'protected': false,
            'screen_name': 'Dialogflow',
            'statuses_count': 737,
            'translator_type': 'none',
            'verified': false,
          },
          'sender_id': 2774598458,
          'sender_id_str': '2774598458',
          'sender_screen_name': 'Dialogflow',
          'text': 'hello!?',
        },
      },
      'source': 'twitter',
    },
    'source': '',
  },
  'result': {
    'action': 'input.welcome',
    'actionIncomplete': false,
    'contexts': [],
    'fulfillment': {
      'messages': [
        {
          'speech': 'Hello!',
          'type': 0,
        },
      ],
      'speech': 'Hi!',
    },
    'metadata': {
      'intentId': '01299577-6c6b-4010-8a52-608208a731aa',
      'intentName': 'Default Welcome Intent',
      'webhookForSlotFillingUsed': 'false',
      'webhookUsed': 'true',
    },
    'parameters': {},
    'resolvedQuery': 'hello!?',
    'score': 1,
    'source': 'agent',
    'speech': '',
  },
  'sessionId': '63b45955-131a-41d6-9b10-590f1e78ddd5',
  'status': {
    'code': 200,
    'errorType': 'success',
    'webhookTimedOut': false,
  },
  'timestamp': '2018-01-28T21:47:11.653Z',
};

const mockV1MultipleConsoleMessagesRequest = {
  'id': '16a423d8-75d1-477a-8a2a-c52054473f77',
  'timestamp': '2018-05-29T20:48:45.889Z',
  'lang': 'en',
  'result': {
    'source': 'agent',
    'resolvedQuery': 'every rich response',
    'action': '',
    'actionIncomplete': false,
    'parameters': {},
    'contexts': [],
    'metadata': {
      'intentId': '96f2305b-1cd0-4d73-97c0-3cfe669ec79b',
      'webhookUsed': 'false',
      'webhookForSlotFillingUsed': 'false',
      'intentName': 'every rich response',
    },
    'fulfillment': {
      'speech': '',
      'messages': [
        {
          'type': 0,
          'platform': 'slack',
          'speech': 'yo',
        },
        {
          'type': 1,
          'platform': 'slack',
          'title': 'card title',
          'subtitle': 'subtitle',
          'imageUrl': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
          'buttons': [
            {
              'text': 'button',
              'postback': 'https://assistant.google.com/',
            },
          ],
        },
        {
          'type': 0,
          'platform': 'facebook',
          'speech': 'hi',
        },
        {
          'type': 3,
          'platform': 'facebook',
          'imageUrl': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        },
        {
          'type': 2,
          'platform': 'facebook',
          'title': 'suggestions',
          'replies': [],
        },
        {
          'type': 'simple_response',
          'platform': 'google',
          'textToSpeech': 'simple response',
        },
        {
          'type': 'simple_response',
          'platform': 'google',
          'textToSpeech': 'another simple response',
        },
        {
          'type': 'basic_card',
          'platform': 'google',
          'title': 'basic card',
          'formattedText': 'basic card',
          'buttons': [],
        },
        {
          'type': 'suggestion_chips',
          'platform': 'google',
          'suggestions': [
            {
              'title': 'suggestion',
            },
            {
              'title': 'another suggestion',
            },
          ],
        },
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
  },
  'sessionId': '411071be-50c9-4550-9f2d-a1dfe5cb9d57',
};
