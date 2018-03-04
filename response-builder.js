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

// All platforms
const PLATFORMS = {
  UNSPECIFIED: 'PLATFORM_UNSPECIFIED',
  FACEBOOK: 'FACEBOOK',
  SLACK: 'SLACK',
  TELEGRAM: 'TELEGRAM',
  KIK: 'KIK',
  SKYPE: 'SKYPE',
  LINE: 'LINE',
  VIBER: 'VIBER',
  ACTIONS_ON_GOOGLE: 'ACTIONS_ON_GOOGLE',
};

// Platforms that support Rich messaging
const SUPPORTED_RICH_MESSAGE_PLATFORMS = [
  PLATFORMS.FACEBOOK,
  PLATFORMS.SLACK,
  PLATFORMS.TELEGRAM,
  PLATFORMS.KIK,
  PLATFORMS.SKYPE,
  PLATFORMS.LINE,
  PLATFORMS.VIBER,
  PLATFORMS.ACTIONS_ON_GOOGLE,
];

// Map from v2 platform names to v1 platform names
let V2_TO_V1_PLATFORM_NAME = {};
V2_TO_V1_PLATFORM_NAME[PLATFORMS.FACEBOOK] = 'facebook';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.SLACK] = 'slack';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.TELEGRAM] = 'telegram';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.KIK] = 'kik';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.SKYPE] = 'skype';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.LINE] = 'line';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.VIBER] = 'viber';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.ACTIONS_ON_GOOGLE] = 'google';

// Map from v1 platform names to v2 platform names
const V1_TO_V2_PLATFORM_NAME = {
  facebook: PLATFORMS.FACEBOOK,
  slack: PLATFORMS.SLACK,
  slack_testbot: PLATFORMS.SLACK,
  telegram: PLATFORMS.TELEGRAM,
  kik: PLATFORMS.KIK,
  skype: PLATFORMS.SKYPE,
  line: PLATFORMS.LINE,
  viber: PLATFORMS.VIBER,
  google: PLATFORMS.ACTIONS_ON_GOOGLE,
};

/**
 * Enum for Dialogflow v1 message object values
 * https://dialogflow.com/docs/reference/agent/message-objects
 * @readonly
 * @enum {number}
 */
const v1MessageObject = {
    Text: 0,
    Card: 1,
    Suggestion: 2,
    Image: 3,
};

/**
 * Class representing a rich response
 *
 * These classes construct v1&v2 message objects for Dialogflow
 * v1 Message object docs:
 * https://dialogflow.com/docs/reference/agent/message-objects
 * v2 Message object docs:
 * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
 */
class RichResponse {
  /**
   * Set the platform for a specific RichResponse (optional)
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform representing desired rich response target platform
   * @return {RichResponse}
   */
  setPlatform(platform) {
    if (
      typeof platform !== 'string' ||
      (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) < 0 &&
        platform !== PLATFORMS.UNSPECIFIED)
    ) {
      throw new Error(`Platform '${platform}' not supported.`);
    }
    this.platform = platform;
    return this;
  }
}

/**
 * Class representing a text response
 * @extends RichResponse
 */
class TextResponse extends RichResponse {
  /**
   * Constructor for TextResponse object
   *
   * @example
   * let textResponse = new TextResponse('response string');
   * let anotherTextResponse = new TextResponse({
   *     text:'response string',
   *     platform: "ACTIONS_ON_GOOGLE"
   * });
   *
   * @param {string|Object} text response string or an object representing a text response
   */
  constructor(text) {
    super();
    if (text === undefined || (typeof text === 'object' && !text.text)) {
      throw new Error(
        'text response string required by TextResponse constructor'
      );
    }
    if (typeof text === 'string') {
      this.text = text;
    } else if (typeof text === 'object') {
      this.text = text.text;
      this.ssml = text.ssml;
      if (
        typeof text.platform !== 'undefined' &&
        text.platform !== PLATFORMS.UNSPECIFIED
      ) {
        if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(text.platform) < 0) {
          throw new Error(`Platform '${text.platform}' not supported.`);
        } else {
          this.platform = text.platform;
        }
      }
    }
  }

  /**
   * Set the text for a TextResponse
   *
   * @example
   * let textResponse = new TextResponse();
   * textResponse.setText('sample text response')
   *
   * @param {string} text containing the text response content
   * @return {TextResponse}
   */
  setText(text) {
    if (typeof text !== 'string') {
      throw new Error('setText requires a string of the text');
    }
    this.text = text;
    return this;
  }

  /**
   * Set the SSML for a TextResponse
   *
   * @example
   * let textResponse = new TextResponse();
   * textResponse.setSsml('<speak>This is <say-as interpret-as="characters">SSML</say-as>.</speak>')
   *
   * @param {string} ssml containing the SSML response content
   * @return {TextResponse}
   */
  setSsml(ssml) {
    if (typeof ssml !== 'string') {
      throw new Error('setSsml requires a single string argument');
    }
    this.ssml = ssml;
    return this;
  }

  /**
   * Get the v1 response object for the rich response
   * https://dialogflow.com/docs/reference/agent/message-objects
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v1 response object
   * @private
   */
  getV1ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    //
    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a simple response
      // {"type": "simple_response","platform": "google","textToSpeech": "simple response text"}
      response = {
        type: 'simple_response',
        platform: V2_TO_V1_PLATFORM_NAME[PLATFORMS.ACTIONS_ON_GOOGLE],
      };
      response.textToSpeech = this.ssml || this.text;
      response.displayText = this.text;
    } else {
      // { 'type': 0, 'platform': 'facebook', 'speech': 'text response'};
      response = {type: v1MessageObject.Text};
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      }
      response.speech = this.text;
    }
    return response;
  }

  /**
   * Get the v2 response object for the rich response
   * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v2 response object
   * @private
   */
  getV2ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    // If the response is for the specific platform or has no platform specified, return proper response
    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      response = {
        platform: 'ACTIONS_ON_GOOGLE',
        simpleResponses: {simpleResponses: [{}]},
      };
      if (this.ssml) {
        response.simpleResponses.simpleResponses[0].ssml = this.ssml;
      } else {
        response.simpleResponses.simpleResponses[0].textToSpeech = this.text;
      }
      response.simpleResponses.simpleResponses[0].displayText = this.text;
    } else {
      // {"text": {"text": ["text response"]},"platform": "FACEBOOK"}
      response = {text: {text: []}};
      response.text.text = [this.text];
      // response is the same for generic responses without the platform attribute
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = platform;
      }
    }
    return response;
  }
}

/**
 * Class representing a card response
 * @extends RichResponse
 */
class CardResponse extends RichResponse {
  /**
   * Constructor for CardResponse object.
   *
   * @example
   * let cardResponse = new CardResponse('card title');
   * cardResponse.setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png');
   * cardResponse.setText('This is the body text of a card.  You can even use line\nbreaks and emoji! 💁');
   * cardResponse.setButton({text: 'This is a button', url: 'https://assistant.google.com/'});
   * const anotherCardResponse = new CardResponse({
   *     title: 'card title',
   *     text: 'card text',
   *     imageUrl: https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png,
   *     buttonText: This is a button',
   *     buttonUrl: 'https://assistant.google.com/',
   *     platform: 'ACTIONS_ON_GOOGLE'
   * });
   *
   * @param {string|Object} card response title string or an object representing a card response
   */
  constructor(card) {
    super();
    if (card === undefined || (typeof card === 'object' && !card.title)) {
      throw new Error('card title string required by CardResponse constructor');
    }
    if (typeof card === 'string') {
      this.title = card;
    } else if (typeof card === 'object') {
      this.title = card.title;
      this.text = card.text;
      this.imageUrl = card.imageUrl;
      if (
        (!card.buttonText && card.buttonUrl) ||
        (!card.buttonUrl && card.buttonText)
      ) {
        throw new Error('card button requires both title and link');
      }
      this.buttonText = card.buttonText;
      this.buttonUrl = card.buttonUrl;
      if (
        typeof card.platform !== 'undefined' &&
        card.platform !== PLATFORMS.UNSPECIFIED
      ) {
        if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(card.platform) < 0) {
          throw new Error(`Platform '${card.platform}' not supported.`);
        } else {
          this.platform = card.platform;
        }
      }
    }
  }

  /**
   * Set the title for a CardResponse
   *
   * @example
   * let cardResponse = new CardResponse();
   * cardResponse.setTitle('sample card title')
   *
   * @param {string} title containing the title content
   * @return {CardResponse}
   */
  setTitle(title) {
    if (typeof title !== 'string') {
      throw new Error('setText requires a string of the text');
    }
    this.title = title;
    return this;
  }

  /**
   * Set the text for a CardResponse
   *
   * @example
   * let cardResponse = new CardResponse();
   * cardResponse.setText('sample card body text')
   *
   * @param {string} text containing the card body text content
   * @return {CardResponse}
   */
  setText(text) {
    if (typeof text !== 'string') {
      throw new Error('setText requires a string of the text');
    }
    this.text = text;
    return this;
  }

  /**
   * Set the image for a CardResponse
   *
   * @example
   * let cardResponse = new CardResponse();
   * cardResponse.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
   *
   * @param {string} imageUrl
   * @return {CardResponse}
   */
  setImage(imageUrl) {
    if (typeof imageUrl !== 'string') {
      throw new Error('setImage requires a string of the image URL');
    }
    this.imageUrl = imageUrl;
    return this;
  }

  /**
   * Set the button for a CardResponse
   *
   * @example
   * let cardResponse = new CardResponse();
   * cardResponse.setButton({
   *     text: 'button text',
   *     url: 'https://assistant.google.com/'
   * });
   *
   * @param {Object} button JSON configuration
   * @param {Object} options.text button text
   * @param {Object} options.url button link URL
   * @return {CardResponse}
   */
  setButton(button) {
    if ((!button.text && button.url) || (!button.url && button.text)) {
      throw new Error(
        `card button requires button title and url. \
\nUsage: setButton({text: \'button text\', url: \'http://yoururlhere.com\'}`
      );
    }
    this.buttonText = button.text;
    this.buttonUrl = button.url;
    return this;
  }

  /**
   * Get the v1 response object for the rich response
   * https://dialogflow.com/docs/reference/agent/message-objects
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v1 response object
   * @private
   */
  getV1ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    //
    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a simple response
      response = {
        type: 'basic_card',
        platform: V2_TO_V1_PLATFORM_NAME[platform],
      };
      response.title = this.title;
      if (!this.text && !this.imageUrl) {
        response.formattedText = ' '; // AoG requires text or image in card
      }
      if (this.text) response.formattedText = this.text;
      if (this.imageUrl) {
        response.image = {};
        response.image.url = this.imageUrl;
        response.image.accessibilityText = 'accessibility text';
      }

      if (this.buttonText && this.buttonUrl) {
        response.buttons = [{openUrlAction: {}}];
        response.buttons[0].title = this.buttonText;
        response.buttons[0].openUrlAction.url = this.buttonUrl;
      }
    } else {
      response = {type: v1MessageObject.Card};
      response.title = this.title;
      if (this.text) response.subtitle = this.text;
      if (this.imageUrl) response.imageUrl = this.imageUrl;
      // this is required in the response even if there are no buttons for some reason
      if (platform === PLATFORMS.SLACK) response.buttons = [];
      if (this.buttonText && this.buttonUrl) {
        response.buttons = [];
        response.buttons[0] = {};
        response.buttons[0].text = this.buttonText;
        response.buttons[0].postback = this.buttonUrl;
      }
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      }
    }
    return response;
  }

  /**
   * Get the v2 response object for the rich response
   * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v2 response object
   * @private
   */
  getV2ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a basic card response
      response = {basicCard: {}};
      response.basicCard.title = this.title;
      response.platform = PLATFORMS.ACTIONS_ON_GOOGLE;
      if (this.text) response.basicCard.formattedText = this.text;
      if (this.imageUrl) {
        response.basicCard.image = {};
        response.basicCard.image.imageUri = this.imageUrl;
        response.basicCard.image.accessibilityText = 'accessibility text';
      }
      if (this.buttonText && this.buttonUrl) {
        response.basicCard.buttons = [{}];
        response.basicCard.buttons[0].title = this.buttonText;
        response.basicCard.buttons[0].open_uri_action = {};
        response.basicCard.buttons[0].open_uri_action.uri = this.buttonUrl;
      }
    } else {
      response = {card: {}};
      response.card.title = this.title;
      if (this.text) response.card.subtitle = this.text;
      if (this.imageUrl) response.card.imageUri = this.imageUrl;
      if (this.buttonText && this.buttonUrl) {
        response.card.buttons = [];
        response.card.buttons[0] = {};
        response.card.buttons[0].text = this.buttonText;
        response.card.buttons[0].postback = this.buttonUrl;
      }
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = platform;
      }
    }
    return response;
  }
}

/**
 * Class representing a image response.
 * @extends RichResponse
 */
class ImageResponse extends RichResponse {
  /**
   * Constructor for ImageResponse object
   *
   * @example
   * const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
   * let imageResponse = new ImageResponse(imageUrl);
   * const anotherImageResponse = new ImageResponse({
   *     imageUrl: imageUrl,
   *     platform: 'ACTIONS_ON_GOOGLE'
   * });
   *
   * @param {string|Object} image URL string or an object representing a image response
   */
  constructor(image) {
    super();
    if (image === undefined || (typeof image === 'object' && !image.imageUrl)) {
      throw new Error('image url string required by ImageResponse constructor');
    }
    if (typeof image === 'string') {
      this.imageUrl = image;
    } else if (typeof image === 'object') {
      this.imageUrl = image.imageUrl;
      if (
        typeof image.platform !== 'undefined' &&
        image.platform !== PLATFORMS.UNSPECIFIED
      ) {
        if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(image.platform) < 0) {
          throw new Error(`Platform '${image.platform}' not supported.`);
        } else {
          this.platform = image.platform;
        }
      }
    }
  }

  /**
   * Set the image for a ImageResponse
   *
   * @example
   * let imageResponse = new ImageResponse('https://example.com/placeholder.png');
   * imageResponse.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
   *
   * @param {string} imageUrl
   * @return {ImageResponse}
   */
  setImage(imageUrl) {
    if (typeof imageUrl !== 'string') {
      throw new Error('setImage requires a string of the image URL');
    }
    this.imageUrl = imageUrl;
    return this;
  }

  /**
   * Get the v1 response object for the rich response
   * https://dialogflow.com/docs/reference/agent/message-objects
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v1 response object
   * @private
   */
  getV1ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    //
    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      response = {
        type: 'basic_card',
        platform: V2_TO_V1_PLATFORM_NAME[platform],
      };
      if (this.imageUrl) {
        response.image = {};
        response.image.url = this.imageUrl;
        response.image.accessibilityText = 'accessibility text';
      }
    } else {
      response = {type: v1MessageObject.Image};
      if (this.imageUrl) response.imageUrl = this.imageUrl;
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      }
    }
    return response;
  }

  /**
   * Get the v2 response object for the rich response
   * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v2 response object
   * @private
   */
  getV2ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a basic card response
      response = {basicCard: {}};
      response.platform = PLATFORMS.ACTIONS_ON_GOOGLE;
      if (this.imageUrl) {
        response.basicCard.image = {};
        response.basicCard.image.imageUri = this.imageUrl;
        response.basicCard.image.accessibilityText = 'accessibility text';
      }
    } else {
      response = {image: {}};
      if (this.imageUrl) {
        response.image.imageUri = this.imageUrl;
      }
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = platform;
      }
    }
    return response;
  }
}

/**
 * Class representing a suggestions response
 * @extends RichResponse
 */
class SuggestionsResponse extends RichResponse {
  /**
   * Constructor for SuggestionsResponse object
   *
   * @example
   * let suggestionsResponse = new SuggestionsResponse('suggestion');
   * const anotherSuggestionsResponse = new SuggestionsResponse({
   *     title: 'suggestion',
   *     platform: 'ACTIONS_ON_GOOGLE'
   * });
   *
   * @param {string|Object} suggestion title string or an object representing a suggestion response
   */
  constructor(suggestion) {
    super();
    this.platform = undefined;
    this.replies = [];
    if (
      suggestion === undefined ||
      (typeof suggestion === 'object' && !suggestion.title)
    ) {
      throw new Error(
        'QuickReply reply string required by QuickReplyResponse constructor'
      );
    }
    if (typeof suggestion === 'string') {
      this.replies.push(suggestion);
    } else if (typeof suggestion === 'object') {
      this.replies.push(suggestion.title);
      if (
        typeof suggestion.platform !== 'undefined' &&
        suggestion.platform !== PLATFORMS.UNSPECIFIED
      ) {
        if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(suggestion.platform) < 0) {
          throw new Error(`Platform '${suggestion.platform}' not supported.`);
        } else {
          this.platform = suggestion.platform;
        }
      }
    }
  }

  /**
   * Set the reply for a SuggestionsResponse
   *
   * @example
   * let suggestionsResponse = new SuggestionsResponse('reply to be overwritten');
   * suggestionsResponse.setReply('reply overwritten');
   *
   * @param {string} reply
   * @return {SuggestionsResponse}
   */
  setReply(reply) {
    if (typeof reply !== 'string') {
      throw new Error(`setReply requires a string but found ${typeof reply}`);
    }
    if (this.replies.length !== 1) {
      throw new Error(
        `Expected one reply in SuggestionsResponse object but found ${
          this.replies.length
        }`
      );
    } else {
      this.replies[0] = reply;
    }
    return this;
  }

  /**
   * Add another reply to an existing suggestion object
   *
   * @example
   * let suggestionsResponse = new SuggestionsResponse('first reply');
   * suggestionsResponse.addReply_('another reply');
   *
   * @param {string} reply
   * @private
   */
  addReply_(reply) {
    if (typeof reply !== 'string') {
      throw new Error(`addReply requires a string but found ${typeof reply}`);
    }
    this.replies.push(reply);
  }

  /**
   * Get the v1 response object for the rich response
   * https://dialogflow.com/docs/reference/agent/message-objects
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v1 response object
   * @private
   */
  getV1ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // If it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      response = {
        suggestions: [],
        type: 'suggestion_chips',
        platform: V2_TO_V1_PLATFORM_NAME[platform],
      };
      if (this.replies) {
        this.replies.forEach((reply) => {
          response.suggestions.push({title: reply});
        });
      }
    } else {
      response = {type: v1MessageObject.Suggestion};
      if (this.replies) response.replies = this.replies;
      // Response is the same for generic responses without the platform attribute
      // If the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      }
    }
    return response;
  }

  /**
   * Get the v2 response object for the rich response
   * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v2 response object
   * @private
   */
  getV2ResponseObject_(platform) {
    // Check if response is platform specific
    if (this.platform && this.platform !== platform) {
      // If it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a basic card response
      response = {suggestions: {suggestions: []}};
      response.platform = PLATFORMS.ACTIONS_ON_GOOGLE;
      this.replies.forEach((reply) => {
        response.suggestions.suggestions.push({title: reply});
      });
    } else {
      response = {quickReplies: {quickReplies: this.replies}};
      // Response is the same for generic responses without the platform attribute
      // If the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = platform;
      }
    }
    return response;
  }
}

/**
 * Class representing a payload response
 * @extends RichResponse
 */
class PayloadResponse extends RichResponse {
  /**
   * Constructor for PayloadResponse object
   *
   * @example
   * const googlePayloadJson = {
   *   expectUserResponse: true,
   *   isSsml: false,
   *   noInputPrompts: [],
   *   richResponse: {
   *     items: [{ simpleResponse: { textToSpeech: 'hello', displayText: 'hi' } }]
   *   },
   *   systemIntent: {
   *     intent: 'actions.intent.OPTION',
   *   }
   * }
   * const payloadResponse = new PayloadResponse(
   *     'ACTIONS_ON_GOOGLE',
   *     googlePayloadJson
   * });
   *
   * @param {string} platform string indicating target platform of payload
   * @param {Object} payload contents for indicated platform
   */
  constructor(platform, payload) {
    super();
    if (!payload || (typeof platform === 'object' && !platform.payload)) {
      throw new Error('Payload can NOT be empty');
    }
    if (!platform) {
      throw new Error('Platform can NOT be empty');
    }
    if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) < 0) {
      throw new Error(`Platform '${platform}' not supported.`);
    }

    if (!payload) {
      this.platform = platform.platform;
      this.payload = platform.payload;
    } else {
      this.platform = platform;
      this.payload = payload;
    }
  }

  /**
   * Set the payload contents for a PayloadResponse
   *
   * @example
   * const googlePayloadJson = {
   *   expectUserResponse: true,
   *   isSsml: false,
   *   noInputPrompts: [],
   *   richResponse: {
   *     items: [{ simpleResponse: { textToSpeech: 'hello', displayText: 'hi' } }]
   *   },
   *   systemIntent: {
   *     intent: 'actions.intent.OPTION',
   *   }
   * }
   * let payloadResponse = new PayloadResponse(PLATFORMS.ACTIONS_ON_GOOGLE, {});
   * payloadResponse.setPayload(googlePayloadJson);
   *
   * @param {string} payload
   * @return {PayloadResponse}
   */
  setPayload(payload) {
    this.payload = payload;
    return this;
  }

  /**
   * Get the v1 response object for the rich response
   * https://dialogflow.com/docs/reference/agent/message-objects
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV1ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v1 response object
   * @private
   */
  getV1ResponseObject_(platform) {
    // If response is not for the inteded platform return null
    if (platform !== this.platform) {
      // if it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      response = {type: 'custom_payload', payload: {}};
      response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      response.payload[V2_TO_V1_PLATFORM_NAME[platform]] = this.payload;
    } else {
      response = {type: 4, payload: {}};
      response.platform = V2_TO_V1_PLATFORM_NAME[platform];
      response.payload[V2_TO_V1_PLATFORM_NAME[platform]] = this.payload;
    }
    return response;
  }

  /**
   * Get the v2 response object for the rich response
   * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.getV2ResponseObject_(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform desired message object platform
   * @return {Object} v2 response object
   * @private
   */
  getV2ResponseObject_(platform) {
    // If response is not for the inteded platform return null
    if (platform !== this.platform) {
      // If it is and is not for the specific platform return null
      return null;
    } else {
      let response = {};
      response.platform = this.platform;
      response.payload = {};
      response.payload[V2_TO_V1_PLATFORM_NAME[this.platform]] = this.payload;
      return response;
    }
  }
}

module.exports = {
  RichResponse,
  TextResponse,
  CardResponse,
  ImageResponse,
  SuggestionsResponse,
  PayloadResponse,
  PLATFORMS,
  SUPPORTED_RICH_MESSAGE_PLATFORMS,
  V2_TO_V1_PLATFORM_NAME,
  V1_TO_V2_PLATFORM_NAME,
};
