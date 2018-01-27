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

const WebhookClient = require('../dialogflow-fulfillment');

const imageUrl = `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`;
const linkUrl = 'https://assistant.google.com/';

test('Test v2 Google Assistant responses', async (t) => {
  // Google Assistant Request: text and card response
  let googleResponse = new ResponseMock();
  let googleRequest = {body: mockGoogleV2Request};
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
  let responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [
            {textToSpeech: 'text response', displayText: 'text response'},
          ],
        },
      },
      {
        basicCard: {
          title: 'card title',
          formattedText: 'card text',
          image: {
            imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
            accessibilityText: 'accessibility text',
          },
        },
        platform: 'ACTIONS_ON_GOOGLE',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);

  // Google Assistant Request: text response
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV2Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addText('text response');
  agent.send();
  responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [
            {textToSpeech: 'text response', displayText: 'text response'},
          ],
        },
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);

  // Google Assistant Request: card response
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV2Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  // Card response requires simiple response first
  // so add a simple reponse first consisting of a space (' ')
  responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [{textToSpeech: ' ', displayText: ' '}],
        },
      },
      {
        basicCard: {
          title: 'card title',
          formattedText: 'card text',
          image: {
            imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
            accessibilityText: 'accessibility text',
          },
        },
        platform: 'ACTIONS_ON_GOOGLE',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);

  // Image response
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV2Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addImage(imageUrl);
  agent.send();
  responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [{textToSpeech: ' ', displayText: ' '}],
        },
      },
      {
        basicCard: {
          image: {
            imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
            accessibilityText: 'accessibility text',
          },
        },
        platform: 'ACTIONS_ON_GOOGLE',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);

  // quick reply
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV2Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addSuggestion('sample reply');
  agent.send();
  responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {
          simpleResponses: [{textToSpeech: ' ', displayText: ' '}],
        },
      },
      {
        suggestions: {suggestions: [{title: 'sample reply'}]},
        platform: 'ACTIONS_ON_GOOGLE',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);

  // Payload
  googleResponse = new ResponseMock();
  googleRequest = {body: mockGoogleV2Request};
  agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayload);
  agent.send();
  responseGoogleV2 = {
    fulfillmentMessages: [
      {
        platform: 'ACTIONS_ON_GOOGLE',
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
      },
    ],
    fulfillmentText: '',
    outputContexts: [],
  };
  t.deepEqual(googleResponse.get(), responseGoogleV2);
});

test('Test v2 Slack responses', async (t) => {
  // CardResponse
  let slackResponse = new ResponseMock();
  let slackRequest = {body: mockSlackV2Request};
  let agent = new WebhookClient({
    request: slackRequest,
    response: slackResponse,
  });
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  let responseSlackV2 = {
    fulfillmentMessages: [
      {
        card: {
          title: 'card title',
          subtitle: 'card text',
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
          buttons: [
            {text: 'button text', postback: 'https://assistant.google.com/'},
          ],
        },
        platform: 'SLACK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);

  // TextResponse and CardResponse
  slackResponse = new ResponseMock();
  slackRequest = {};
  slackRequest = {body: mockSlackV2Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addText('text response');
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  responseSlackV2 = {
    fulfillmentMessages: [
      {text: {text: ['text response']}, platform: 'SLACK'},
      {
        card: {
          title: 'card title',
          subtitle: 'card text',
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
          buttons: [
            {text: 'button text', postback: 'https://assistant.google.com/'},
          ],
        },
        platform: 'SLACK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);

  // TextReponse
  slackResponse = new ResponseMock();
  slackRequest = {};
  slackRequest = {body: mockSlackV2Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addText('text response');
  agent.send();
  responseSlackV2 = {
    fulfillmentMessages: [
      {platform: 'SLACK', text: {text: ['text response']}},
    ],
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);

  // ImageResponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV2Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addImage(imageUrl);
  agent.send();
  responseSlackV2 = {
    fulfillmentMessages: [
      {
        image: {
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
        },
        platform: 'SLACK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);

  // QuickRepliesReponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV2Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addSuggestion('sample reply');
  agent.send();
  responseSlackV2 = {
    fulfillmentMessages: [
      {quickReplies: {quickReplies: ['sample reply']}, platform: 'SLACK'},
    ],
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);

  // PayloadReponse
  slackResponse = new ResponseMock();
  slackRequest = {body: mockSlackV2Request};
  agent = new WebhookClient({request: slackRequest, response: slackResponse});
  agent.addPayload(agent.SLACK, slackPayload);
  agent.send();
  responseSlackV2 = {
    fulfillmentMessages: [
      {
        platform: 'SLACK',
        payload: {
          slack: {
            text: 'This is a text response for Slack.',
            attachments: [
              {
                title: 'Title: this is a title',
                title_link: 'https://assistant.google.com/',
                text: `This is an attachment.  Text in attachments can include \
\'quotes\' and most other unicode characters including emoji 📱.  \
Attachments also upport line\n  breaks.`,
                image_url: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
                fallback: 'This is a fallback.',
              },
            ],
          },
        },
      },
    ],
    fulfillmentText: '',
    outputContexts: [],
  };
  t.deepEqual(slackResponse.get(), responseSlackV2);
});

test('Test v2 Facebook responses', async (t) => {
  // CardReponse
  let facebookResponse = new ResponseMock();
  let facebookRequest = {body: mockFacebookV2Request};
  let agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addCard(
    agent
      .buildCard('card title')
      .setText('card text')
      .setImage(imageUrl)
      .setButton({text: 'button text', url: linkUrl})
  );
  agent.send();
  let responseFacebookV2 = {
    fulfillmentMessages: [
      {
        card: {
          title: 'card title',
          subtitle: 'card text',
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
          buttons: [
            {text: 'button text', postback: 'https://assistant.google.com/'},
          ],
        },
        platform: 'FACEBOOK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);

  // TextResponse and CardResponse
  facebookResponse = new ResponseMock();
  facebookRequest = {};
  facebookRequest = {body: mockFacebookV2Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
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
  responseFacebookV2 = {
    fulfillmentMessages: [
      {text: {text: ['text response']}, platform: 'FACEBOOK'},
      {
        card: {
          title: 'card title',
          subtitle: 'card text',
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
          buttons: [
            {text: 'button text', postback: 'https://assistant.google.com/'},
          ],
        },
        platform: 'FACEBOOK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);

  // TextResponse
  facebookResponse = new ResponseMock();
  facebookRequest = {};
  facebookRequest = {body: mockFacebookV2Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addText('text response');
  agent.send();
  responseFacebookV2 = {
    fulfillmentMessages: [
      {platform: 'FACEBOOK', text: {text: ['text response']}},
    ],
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);

  // ImageResponse
  facebookResponse = new ResponseMock();
  facebookRequest = {body: mockFacebookV2Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addImage(imageUrl);
  agent.send();
  responseFacebookV2 = {
    fulfillmentMessages: [
      {
        image: {
          imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
        },
        platform: 'FACEBOOK',
      },
    ],
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);

  // QuickRepliesReponse
  facebookResponse = new ResponseMock();
  facebookRequest = {body: mockFacebookV2Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addSuggestion('sample reply');
  agent.send();
  responseFacebookV2 = {
    fulfillmentMessages: [
      {quickReplies: {quickReplies: ['sample reply']}, platform: 'FACEBOOK'},
    ],
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);

  // PayloadReponse
  facebookResponse = new ResponseMock();
  facebookRequest = {body: mockFacebookV2Request};
  agent = new WebhookClient({
    request: facebookRequest,
    response: facebookResponse,
  });
  agent.addPayload(agent.FACEBOOK, facebookPayload);
  agent.send();
  responseFacebookV2 = {
    fulfillmentMessages: [
      {
        platform: 'FACEBOOK',
        payload: {
          facebook: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [
                  {
                    title: 'Title: this is a title',
                    image_url: `https://assistant.google.com/static/images/\
molecule/Molecule-Formation-stop.png`,
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
      },
    ],
    fulfillmentText: '',
    outputContexts: [],
  };
  t.deepEqual(facebookResponse.get(), responseFacebookV2);
});

test('Test v2 incompatible platform', async (t) => {
  // Twitter request/response
  let twitterResponse = new ResponseMock();
  let twitterRequest = {body: mockTwitterV2Request};
  let agent = new WebhookClient({
    request: twitterRequest,
    response: twitterResponse,
  });

  // Sending a response to Twitter (unsupported platform) will fail
  const unsupportedPlatformError = t.throws(() => {
    agent.send('this will never get sent');
  }, Error);
  t.is(
    unsupportedPlatformError.message,
    `Platform is not supported.`
  );
});

test('Test v2 contexts', async (t) => {
  const v2Request = mockGoogleV2Request;
  const sampleContextName = 'sample context name';
  const sampleV2ContextName =
    v2Request.session + '/contexts/' + sampleContextName;
  const secondContextName = 'second context name';
  const secondV2ContextName =
    v2Request.session + '/contexts/' + secondContextName;
  const complexContext = {
    name: 'weather',
    lifespan: 2,
    parameters: {city: 'Rome'},
  };
  const complexV2ContextName =
    v2Request.session + '/contexts/' + complexContext.name;
  const complexV2Context = {
    name: complexV2ContextName,
    lifespanCount: 2,
    parameters: {city: 'Rome'},
  };

  let googleResponse = new ResponseMock();
  let googleRequest = {body: v2Request};
  let agent = new WebhookClient({
    request: googleRequest,
    response: googleResponse,
  });
  // setContext
  agent.setContext(sampleContextName);
  t.deepEqual(
    {name: sampleV2ContextName, lifespanCount: 5, parameters: undefined},
    agent.outgoingContexts_[0]
  );
  agent.setContext(secondContextName);
  t.deepEqual(
    {name: secondV2ContextName, lifespanCount: 5, parameters: undefined},
    agent.outgoingContexts_[1]
  );
  agent.setContext(complexContext);
  t.deepEqual(complexV2Context, agent.outgoingContexts_[2]);
  // clearContext
  agent.clearContext(sampleContextName);
  t.deepEqual(
    {name: secondV2ContextName, lifespanCount: 5, parameters: undefined},
    agent.outgoingContexts_[0]
  );
  // clearAllContext
  agent.clearOutgoingContexts();
  t.deepEqual([], agent.outgoingContexts_);
});

test('Test converstion of v2 contexts to v1 contexts', async (t) => {
  const v2Request = mockSlackV2Request;
  let slackResponse = new ResponseMock();
  let slackRequest = {body: v2Request};
  let agent = new WebhookClient({
    request: slackRequest,
    response: slackResponse,
  });

  t.deepEqual([{
    name: 'generic',
    lifespan: 4,
    parameters: {
      slack_user_id: 'U2URF86K1',
      slack_channel: 'D3XQ6AF9A'},
  }],
    agent.contexts
  );
});

test('Test v2 getContext', async (t) => {
  const v2Request = mockSlackV2Request;
  let slackResponse = new ResponseMock();
  let slackRequest = {body: v2Request};
  let agent = new WebhookClient({
    request: slackRequest,
    response: slackResponse,
  });

  let context = agent.getContext('generic');
  t.deepEqual({
    name: 'generic',
    lifespan: 4,
    parameters: {
      slack_user_id: 'U2URF86K1',
      slack_channel: 'D3XQ6AF9A'},
  },
    context
  );

  context = agent.getContext('nonsense');
  t.deepEqual(null, context);
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

// Mock v2 webhook request from Dialogflow
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
const mockSlackV2Request = {
  responseId: '4b85257c-c12e-4eef-ae1f-0916e6f5dc0d',
  queryResult: {
    queryText: 'webhook',
    parameters: {},
    allRequiredParamsPresent: true,
    fulfillmentText: 'webhook failure',
    fulfillmentMessages: [{text: {text: ['webhook failure']}}],
    outputContexts: [
      {
        name: `projects/stagent-f2236/agent/sessions/\
88d13aa8-2999-4f71-b233-39cbf3a824a0/contexts/generic`,
        lifespanCount: 4,
        parameters: {slack_user_id: 'U2URF86K1', slack_channel: 'D3XQ6AF9A'},
      },
    ],
    intent: {
      name: `projects/stagent-f2236/agent/intents/\
29bcd7f8-f717-4261-a8fd-2d3e451b8af81`,
      displayName: 'webhook',
    },
    intentDetectionConfidence: 1,
    diagnosticInfo: {},
    languageCode: 'en',
  },
  originalDetectIntentRequest: {
    payload: {
      data: {
        event_ts: '1515094024.000379',
        channel: 'D3XQ6AF9A',
        text: 'webhook',
        type: 'message',
        user: 'U2URF86K1',
        ts: '1515094024.000379',
      },
      source: 'slack_testbot',
    },
  },
  session: `projects/stagent-f2236/agent/sessions/\
88d13aa8-2999-4f71-b233-39cbf3a824a0`,
};
const mockFacebookV2Request = {
  originalDetectIntentRequest: {
    payload: {
      data: {
        message: {
          mid: 'mid.$cAAMy_rGG1eZm9AmoMlgwsRgQIImP',
          seq: 714,
          text: 'webhook',
        },
        recipient: {id: '958823367603818'},
        sender: {id: '1534862223272449'},
        timestamp: 1515096137778,
      },
      source: 'facebook',
    },
  },
  queryResult: {
    allRequiredParamsPresent: true,
    diagnosticInfo: {},
    fulfillmentMessages: [{text: {text: ['webhook failure']}}],
    fulfillmentText: 'webhook failure',
    intent: {
      displayName: 'webhook',
      name: `projects/stagent-f2236/agent/intents/\
29bcd7f8-f717-4261-a8fd-2d3e451b8af8`,
    },
    intentDetectionConfidence: 1,
    languageCode: 'en',
    outputContexts: [
      {
        lifespanCount: 4,
        name: `projects/stagent-f2236/agent/sessions/\
83920c5d-0caa-4d58-b16a-6b257e8f4192/contexts/generic`,
        parameters: {facebook_sender_id: '1534862223272449'},
      },
    ],
    parameters: {},
    queryText: 'webhook',
  },
  responseId: '2ecc0896-de2a-4b5e-9995-5ffe88bb2ca4',
  session: `projects/stagent-f2236/agent/sessions/\
83920c5d-0caa-4d58-b16a-6b257e8f4192`,
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
Attachments also upport line\n  breaks.`,
      image_url: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
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
          image_url: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
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

const mockTwitterV2Request = {
  'originalDetectIntentRequest': {
    'payload': {
      'data': {
        'direct_message': {
          'created_at': 'Sun Jan 28 21:43:34 +0000 2018',
          'entities': {
            'hashtags': [],
            'symbols': [],
            'urls': [],
            'user_mentions': [],
          },
          'id': 957730899029733400,
          'id_str': '957730899029733381',
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
            'location': null,
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
            'time_zone': null,
            'translator_type': 'none',
            'url': null,
            'utc_offset': null,
            'verified': false,
          },
          'sender_id': 2774598458,
          'sender_id_str': '2774598458',
          'sender_screen_name': 'Dialogflow',
          'text': 'wat',
        },
      },
      'source': 'twitter',
    },
  },
  'queryResult': {
    'action': 'input.unknown',
    'allRequiredParamsPresent': true,
    'diagnosticInfo': {},
    'fulfillmentMessages': [
      {
        'text': {
          'text': [
            'Sorry, what was that?',
          ],
        },
      },
    ],
    'fulfillmentText': 'I didn"t get that. Can you say it again?',
    'intent': {
      'displayName': 'Default Fallback Intent',
      'name': 'projects/stagent-f2236/agent/intents/1688c84d-878d-4fbb-9065-d06a7e553c4f',
    },
    'intentDetectionConfidence': 1,
    'languageCode': 'en',
    'parameters': {},
    'queryText': 'wat',
  },
  'responseId': '5590c31b-f719-4ccd-9a02-81c2a1f8c84b',
  'session': 'projects/stagent-f2236/agent/sessions/63b45955-131a-41d6-9b10-590f1e78ddd5',
};
