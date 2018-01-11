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

const WebhookClient = require('../dialogflow-webhook');

const imageUrl =
  'https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png';
const linkUrl = 'https://assistant.google.com/';

test('Test v1 AoG responses', async (t) => {
  // TextResponse and CardResponse
  let googleResponse = new ResponseMock();
  let googleRequest = {body: mockGoogleV1Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addText('text response');
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  let responseGoogleV1 = {
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
  t.deepEqual(googleResponse.get(), responseGoogleV1);

  // ImageResponse
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV1Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addImage(imageUrl);
  agent.send();
  responseGoogleV1 = {
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
  t.deepEqual(googleResponse.get(), responseGoogleV1);

  // QuickRepliesResponse
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV1Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addSuggestion('sample reply');
  agent.send();
  responseGoogleV1 = {
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
  t.deepEqual(googleResponse.get(), responseGoogleV1);

  // PayloadResponse
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV1Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayload);
  agent.send();
  responseGoogleV1 = {
    messages: [
      {
        type: 'custom_payload',
        payload: {
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
        platform: 'google',
      },
    ],
    contextOut: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV1);
});

test('Test v1 Slack responses', async (t) => {
  // TextResponse and CardResponse
  let slackResponse = new ResponseMock();
  let slackRequest = {body: mockSlackV1Request};
  let agent = new WebhookClient({
    request: slackRequest,
    response: slackResponse,
  });
  agent.addText('text response');
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  let responseSlackV1 = {
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
  t.deepEqual(slackResponse.get(), responseSlackV1);

  // ImageResponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV1Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addImage(imageUrl);
  agent.send();
  responseSlackV1 = {
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
  t.deepEqual(slackResponse.get(), responseSlackV1);

  // QuickRepliesResponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV1Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addSuggestion('sample reply');
  agent.send();
  responseSlackV1 = {
    messages: [{type: 2, replies: ['sample reply'], platform: 'slack'}],
    contextOut: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV1);

  // PayloadResponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV1Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addPayload(agent.SLACK, slackPayload);
  agent.send();
  responseSlackV1 = {
    messages: [
      {
        type: 4,
        payload: {
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
        platform: 'slack',
      },
    ],
    contextOut: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV1);
});

test('Test v1 Facebook responses', async (t) => {
  // QuickRepliesResponse
  let facebookResponse = new ResponseMock();
  let facebookRequest = {body: mockFacebookV1Request};
  let agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addSuggestion('sample reply');
  agent.send();
  let responsefacebookV1 = {
    messages: [{type: 2, replies: ['sample reply'], platform: 'facebook'}],
    contextOut: [],
  };
  t.deepEqual(facebookResponse.get(), responsefacebookV1);

  // PayloadResponse
  facebookResponse = new ResponseMock();
  facebookRequest = {body: mockFacebookV1Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addPayload(agent.FACEBOOK, facebookPayload);
  agent.send();
  responsefacebookV1 = {
    messages: [
      {
        type: 4,
        payload: {
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
        platform: 'facebook',
      },
    ],
    contextOut: [],
  };
  t.deepEqual(facebookResponse.get(), responsefacebookV1);
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

/**
 * Class to mock a express response object for testing
 */
class ResponseMock {
  /**
   * constructor
   * @param {repsonseJson} JSON of the respones from WebhookClient
   */
  constructor() {
    this.responseJson = {};
  }
  /**
   * Store JSON repsonse from WebhookClient
   * @param {Object} responseJson
   */
  json(responseJson) {
    this.responseJson = responseJson;
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
    this.responseJson += message;
  }
}

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
