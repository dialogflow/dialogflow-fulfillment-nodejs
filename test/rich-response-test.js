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

const TextResponse = require('../src/rich-responses/text-response');
const CardResponse = require('../src/rich-responses/card-response');
const ImageResponse = require('../src/rich-responses/image-response');
const SuggestionsResponse = require('../src/rich-responses/suggestions-response');
const {
  PLATFORMS,
  SUPPORTED_RICH_MESSAGE_PLATFORMS,
  V2_TO_V1_PLATFORM_NAME,
} = require('../src/rich-responses/rich-response');

test('Test v1 and v2 generic responses', async (t) => {
  // TextResponse generic response
  let textResponse = new TextResponse('sample text');
  t.deepEqual(textResponse.getV1ResponseObject_(), {
    type: 0,
    speech: 'sample text',
  });
  t.deepEqual(textResponse.getV2ResponseObject_(), {
    text: {text: ['sample text']},
  });

  // CardResponse generic response
  let cardResponse = new CardResponse('sample title');
  t.deepEqual(cardResponse.getV1ResponseObject_(), {
    type: 1,
    title: 'sample title',
  });
  t.deepEqual(cardResponse.getV2ResponseObject_(), {
    card: {title: 'sample title'},
  });
});

test('Test creation of without required args/params', (t) => {
  // text response will no args in constructor
  const textNoArgsError = t.throws(() => {
    new TextResponse();
  }, Error);
  t.is(
    textNoArgsError.message,
    'string required by Text constructor'
  );

  // text response with object with no text attr
  const textNoAttrError = t.throws(() => {
    new TextResponse({platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7]});
  }, Error);
  t.is(
    textNoAttrError.message,
    'string required by Text constructor'
  );

  // card response with no args in constructor
  const cardNoArgsError = t.throws(() => {
    new CardResponse();
  }, Error);
  t.is(
    cardNoArgsError.message,
    'title string required by Card constructor'
  );

  // card response with object with no title attr
  const cardNoAttrError = t.throws(() => {
    new CardResponse({platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7]});
  }, Error);
  t.is(
    cardNoAttrError.message,
    'title string required by Card constructor'
  );
});

test('Test v1 and v2 platform responses', async (t) => {
  // Text v1 and v2 response messages for AoG, non-AoG and unspecified platform
  let textResponse = new TextResponse('sample text');
  t.deepEqual(
    textResponse.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      displayText: 'sample text',
      textToSpeech: 'sample text',
      type: 'simple_response',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[7]],
    }
  );
  t.deepEqual(
    textResponse.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {
      type: 0,
      speech: 'sample text',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[6]],
    }
  );
  t.deepEqual(textResponse.getV1ResponseObject_(PLATFORMS.UNSPECIFIED), {
    type: 0,
    speech: 'sample text',
  });
  t.deepEqual(
    textResponse.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      platform: 'ACTIONS_ON_GOOGLE',
      simpleResponses: {
        simpleResponses: [
          {textToSpeech: 'sample text', displayText: 'sample text'},
        ],
      },
    }
  );
  t.deepEqual(
    textResponse.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[2]),
    {
      text: {text: ['sample text']},
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[2],
    }
  );
  t.deepEqual(textResponse.getV2ResponseObject_(PLATFORMS.UNSPECIFIED), {
    text: {text: ['sample text']},
  });

  // Card v1 and v2 response messages for AoG, non-AoG and unspecified platform
  const cardTitle = 'sample title';
  const cardResponse = new CardResponse(cardTitle);
  t.deepEqual(
    cardResponse.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      type: 'basic_card',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[7]],
      title: cardTitle,
      formattedText: ' ',
    }
  );
  t.deepEqual(
    cardResponse.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {
      type: 1,
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[6]],
      title: cardTitle,
    }
  );
  t.deepEqual(cardResponse.getV1ResponseObject_(PLATFORMS.UNSPECIFIED), {
    type: 1,
    title: cardTitle,
  });
  t.deepEqual(
    cardResponse.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7],
      basicCard: {title: cardTitle},
    }
  );
  t.deepEqual(
    cardResponse.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[2]),
    {
      card: {title: cardTitle},
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[2],
    }
  );
  t.deepEqual(cardResponse.getV2ResponseObject_(PLATFORMS.UNSPECIFIED), {
    card: {title: cardTitle},
  });
});

test('Test v1 and v2 platform specific responses', async (t) => {
  // Text AoG text response
  let textResponseAoG = new TextResponse({
    platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7],
    text: 'sample text',
  });
  t.deepEqual(
    textResponseAoG.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      textToSpeech: 'sample text',
      displayText: 'sample text',
      type: 'simple_response',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[7]],
    }
  );
  t.deepEqual(
    textResponseAoG.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7],
      simpleResponses: {
        simpleResponses: [
          {textToSpeech: 'sample text', displayText: 'sample text'},
        ],
      },
    }
  );
  t.deepEqual(
    textResponseAoG.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    null
  );

  // Text non-AoG text response
  let textResponseOther = new TextResponse({
    platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[6],
    text: 'sample text',
  });
  t.deepEqual(
    textResponseOther.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {
      type: 0,
      speech: 'sample text',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[6]],
    }
  );
  t.deepEqual(
    textResponseOther.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {
      text: {text: ['sample text']},
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[6],
    }
  );
  t.deepEqual(
    textResponseOther.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    null
  );

  // Card AoG text response
  const title = 'sample title';
  let cardResponseAoG = new CardResponse({
    platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7],
    title: title,
  });
  t.deepEqual(
    cardResponseAoG.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      formattedText: ' ',
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[7]],
      title: title,
      type: 'basic_card',
    }
  );
  t.deepEqual(
    cardResponseAoG.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    {
      basicCard: {title: title},
      platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7],
    }
  );
  t.deepEqual(
    cardResponseAoG.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    null
  );

  // Card non-AoG text response
  let cardResponseOther = new CardResponse({
    platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[6],
    title: title,
  });
  t.deepEqual(
    cardResponseOther.getV1ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {
      type: 1,
      title: title,
      platform: V2_TO_V1_PLATFORM_NAME[SUPPORTED_RICH_MESSAGE_PLATFORMS[6]],
    }
  );
  t.deepEqual(
    cardResponseOther.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[6]),
    {card: {title: title}, platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[6]}
  );
  t.deepEqual(
    cardResponseOther.getV2ResponseObject_(SUPPORTED_RICH_MESSAGE_PLATFORMS[7]),
    null
  );
});

test('Card specific features (title, text, image and button)', async (t) => {
  const imageUrl = `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`;
  const linkUrl = 'https://assistant.google.com/';

  let card = new CardResponse('sample title');
  // setTitle test
  card.setTitle('card title');
  t.deepEqual({type: 1, title: 'card title'}, card.getV1ResponseObject_());
  t.deepEqual({card: {title: 'card title'}}, card.getV2ResponseObject_());
  // setText test
  card.setText('card text');
  t.deepEqual(
    {type: 1, title: 'card title', subtitle: 'card text'},
    card.getV1ResponseObject_()
  );
  t.deepEqual(
    {card: {title: 'card title', subtitle: 'card text'}},
    card.getV2ResponseObject_()
  );
  // setImage test
  card.setImage(imageUrl);
  t.deepEqual(
    {
      type: 1,
      title: 'card title',
      subtitle: 'card text',
      imageUrl: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
    },
    card.getV1ResponseObject_()
  );
  t.deepEqual(
    {
      card: {
        title: 'card title',
        subtitle: 'card text',
        imageUri: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
      },
    },
    card.getV2ResponseObject_()
  );
  // setButton test
  card.setButton({url: linkUrl, text: 'button text'});
  t.deepEqual(
    {
      type: 1,
      title: 'card title',
      subtitle: 'card text',
      imageUrl: `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`,
      buttons: [
        {text: 'button text', postback: 'https://assistant.google.com/'},
      ],
    },
    card.getV1ResponseObject_()
  );
  t.deepEqual(
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
    },
    card.getV2ResponseObject_()
  );
});

test('ImageResponse (setImage and setPlatform)', async (t) => {
  const imageUrl = `https://assistant.google.com/static/images/molecule/\
Molecule-Formation-stop.png`;

  // ImageResponse with no constructor arg should throw error attr
  const cardNoAttrError = t.throws(() => {
    new ImageResponse();
  }, Error);
  t.is(
    cardNoAttrError.message,
    'image url string required by Image constructor'
  );

  // ImageResponse no imageUrl in constructor args should throw error attr
  const cardNoUrlError = t.throws(() => {
    new ImageResponse({platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7]});
  }, Error);
  t.is(
    cardNoUrlError.message,
    'image url string required by Image constructor'
  );

  let image = new ImageResponse('https://google.com');
  // setImage test
  image.setImage(imageUrl);
  t.deepEqual({type: 3, imageUrl: imageUrl}, image.getV1ResponseObject_());
  t.deepEqual({image: {imageUri: imageUrl}}, image.getV2ResponseObject_());
});

test('QuickReplies (setReply and setPlatform)', async (t) => {
  const reply = 'sample reply';

  // SuggestionsResponse with no constructor arg should throw error attr
  const replyNoAttrError = t.throws(() => {
    new SuggestionsResponse();
  }, Error);
  t.is(
    replyNoAttrError.message,
    'Reply string required by Suggestion constructor'
  );

  // SuggestionsResponse no reply in constructor args should throw error attr
  const replyNoUrlError = t.throws(() => {
    new SuggestionsResponse({platform: SUPPORTED_RICH_MESSAGE_PLATFORMS[7]});
  }, Error);
  t.is(
    replyNoUrlError.message,
    'Reply string required by Suggestion constructor'
  );

  let quickReply = new SuggestionsResponse('quick reply');
  // setImage test
  quickReply.setReply(reply);
  t.deepEqual({type: 2, replies: [reply]}, quickReply.getV1ResponseObject_());
  t.deepEqual(
    {quickReplies: {quickReplies: [reply]}},
    quickReply.getV2ResponseObject_()
  );
});

test('TextResponse SSML', async (t) => {
  // TextResponse generic response
  let textResponse = new TextResponse({
    text: 'sample text',
    ssml: '<speak>This is <say-as interpret-as="characters">SSML</say-as>.</speak>',
  });
  t.deepEqual(textResponse.getV1ResponseObject_(), {
    type: 0,
    speech: 'sample text',
  });
  t.deepEqual(textResponse.getV2ResponseObject_(), {
    text: {text: ['sample text']},
  });
  t.deepEqual(textResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE), {
    type: 'simple_response',
    platform: 'google',
    textToSpeech: '<speak>This is <say-as interpret-as="characters">SSML</say-as>.</speak>',
    displayText: 'sample text',
  });

  textResponse.setSsml('<speak>This is SSML</speak>');
  t.deepEqual(textResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE), {
    platform: 'ACTIONS_ON_GOOGLE',
    simpleResponses: {simpleResponses: [{
      ssml: '<speak>This is SSML</speak>',
      displayText: 'sample text',
    }]},
  });
});
