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

const Debug = require('debug');
const debug = new Debug('dialogflow:debug');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);

// Response Builder classes
const {
  RichResponse,
  TextResponse,
  CardResponse,
  ImageResponse,
  SuggestionsResponse,
  PayloadResponse,
  PLATFORMS,
} = require('./response-builder');
const V1Agent = require('./v1-agent');
const V2Agent = require('./v2-agent');

const RESPONSE_CODE_BAD_REQUEST = 400;

/**
 * This is the class that handles the communication with Dialogflow's webhook
 * fulfillment API v1 & v2 with support for rich responses across 8 platforms and
 * Dialogflow's simulator
 */
class WebhookClient {
  /**
   * Constructor for WebhookClient object.
   * To be used in the Dialogflow fulfillment webhook logic.
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.request Express HTTP request object.
   * @param {Object} options.response Express HTTP response object.
   */
  constructor(options) {
    if (!options.request) {
      throw new Error('Request can NOT be empty.');
    }
    if (!options.response) {
      throw new Error('Response can NOT be empty.');
    }

    /**
     * The Express HTTP request that the endpoint receives from the Assistant.
     * @private
     * @type {Object}
     */
    this.request_ = options.request;

    /**
     * The Express HTTP response the endpoint will return to Assistant.
     * @private
     * @type {Object}
     */
    this.response_ = options.response;

    /**
     * The agent version (v1 or v2) based on Dialogflow webhook request
     * https://dialogflow.com/docs/reference/v2-comparison
     * @type {number}
     */
    this.agentVersion = null;
    if (this.request_.body.result) {
      this.agentVersion = 1;
    } else if (this.request_.body.queryResult) {
      this.agentVersion = 2;
    }

    /**
     * List of response messages defined by the developer
     *
     * @private
     * @type {RichResponse[]}
     */
    this.responseMessages_ = [];

    /**
     * List of outgoing contexts defined by the developer
     *
     * @private
     * @type {Object[]}
     */
    this.outgoingContexts_ = [];

    /**
     * Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters
     * @type {string}
     */
    this.action = null;

    /**
     * Dialogflow parameters included in the request or null if no value
     * https://dialogflow.com/docs/actions-and-parameters
     * @type {Object[]}
     */
    this.parameters = null;

    /**
     * Dialogflow input contexts included in the request or null if no value
     * https://dialogflow.com/docs/contexts
     * @type {string}
     */
    this.inputContexts = null;

    /**
     * Dialogflow source included in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {string}
     */
    this.requestSource = null;

    /**
     * Original user query as indicated by Dialogflow or null if no value
     * @type {string}
     */
    this.query = null;

    /**
     * Original request language code (i.e. "en")
     * @type {string} locale language code indicating the spoken/written language of the original request
     */
    this.locale = null;

    /**
     * Dialogflow input contexts included in the request or null if no value
     * Dialogflow v2 API only
     * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest#FIELDS.session
     * @type {string}
     */
    this.session = null;

    /**
     * Platform contants, to define platforms, includes supported platforms and unspecified
     * @example
     * const { WebhookClient } = require('dialogflow-webhook');
     * const agent = new WebhookClient({request: request, response: response});
     * const SLACK = agent.SLACK;
     *
     * @type {string}
     */
    for (let platform in PLATFORMS) {
      if (platform) {
        this[platform] = PLATFORMS[platform];
      }
    }

    if (this.agentVersion === 2) {
      this.client = new V2Agent(this);
    } else if (this.agentVersion === 1) {
      this.client = new V1Agent(this);
    } else {
      throw new Error(
        'Invalid or unknown request type (not a Dialogflow v1 or v2 webhook request).'
      );
    }
    debug(`Webhook request version ${this.agentVersion}`);

    this.client.processRequest_();
  }

  // ---------------------------------------------------------------------------
  //                   Generic Methods
  // ---------------------------------------------------------------------------

  /**
   * Sends a response back to a Dialogflow fulfillment webhook request
   *
   * @param {string[]|RichResponse[]} response additional responses to send
   * @return {undefined}
   */
  send(response) {
    // If AoG response and the first response isn't a text response,
    // add a empty text response as the first item
    if (
      this.requestSource === PLATFORMS.ACTIONS_ON_GOOGLE &&
      this.responseMessages_[0] &&
      !(this.responseMessages_[0] instanceof TextResponse) &&
      !this.existingPayload_(PLATFORMS.ACTIONS_ON_GOOGLE)
    ) {
      this.responseMessages_ = [this.buildText(' ')].concat(
        this.responseMessages_
      );
    }

    // If no response is defined in send args, send the existing responses
    if (!response) {
      this.client.sendResponse_();
      return;
    }

    // If there is a response in the response arg,
    // add it to the response and then send all responses
    const responseType = typeof response;
    // If it's a string, make a text response and send it with the other rich responses
    if (responseType === 'string') {
      this.addText(response);
    } else if (response instanceof RichResponse) {
      this.addResponse_(response);
    } else if (response.isArray) {
      // Of it's a list of RichResponse objects or strings (or a mix) add them
      response.forEach(function(element) {
        addResponse_(element);
      });
    }
    this.client.sendResponse_();
  }

  /**
   * Add a response to be sent to Dialogflow
   *
   * @param {RichResponse} richResponse an object representing the rich response to be added
   * @private
   */
  addResponse_(richResponse) {
    switch (richResponse.constructor.name) {
      case 'TextResponse':
        this.addText(richResponse);
        break;
      case 'CardResponse':
        this.addCard(richResponse);
        break;
      case 'ImageResponse':
        this.addImage(richResponse);
        break;
      case 'QuickReplyResponse':
        this.addQuickReply(richResponse);
        break;
      case 'PayloadResponse':
        this.addPayload(richResponse);
        break;
      case 'String':
        this.addText(richResponse);
        break;
      default:
        throw new Error('unknown response type');
    }
  }

  /**
   * Handles the incoming Dialogflow request using a handler or Map of handlers.
   * Each handler must be a function callback.
   *
   * @param {Map|requestCallback} handler map of Dialogflow action name to handler function or
   *     function to handle all requests (regaurdless of Dialogflow action).
   * @return {undefined}
   */
  handleRequest(handler) {
    if (typeof handler === 'function') {
      handler(this);
      return;
    }

    if (!(handler instanceof Map)) {
      return new Error(
        'handleRequest must contain a map of Dialogflow action names to function handlers'
      );
    }

    if (handler.get(this.action)) {
      handler.get(this.action)(this);
    } else if (handler.get(null)) {
      handler.get(null)(this);
    } else {
      debug('No handler for requested action');
      this.response_
        .status(RESPONSE_CODE_BAD_REQUEST)
        .status('No handler for requested action');
    }
  }

  // ---------------------------------------------------------------------------
  //                   Rich Response Adders
  // ---------------------------------------------------------------------------

  /**
   * Add a text response to be sent to Dialogflow via message objects
   * v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#text_response
   * v1 Google: https://dialogflow.com/docs/reference/agent/message-objects#simple_response
   * v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#text
   * v2 Google: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#simpleresponse
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.addText('sample text response');
   * const googleTextResponse = {text: 'sample text response', platform: agent.ACTIONS_ON_GOOGLE};
   * agent.addText(googleTextResponse);
   * const textResponse = agent.buildText('sample text response');
   * agent.addText(textResponse);
   *
   * @param {string|Object} textResponse text response string or an object representing a text response
   * @return {WebhookClient}
   */
  addText(textResponse) {
    if (typeof textResponse === 'string') {
      textResponse = new TextResponse(textResponse);
      this.responseMessages_.push(textResponse);
    } else if (textResponse instanceof TextResponse) {
      this.responseMessages_.push(textResponse);
    } else {
      throw new Error(
        'Unknown text response type. Please use a string or TextResponse object'
      );
    }

    return this;
  }

  /**
   * Add a card response to be sent to Dialogflow via message objects
   * v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#card_message_object
   * v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#basic_card_response
   * v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#card
   * v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#basiccard
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.addCard('sample text response');
   * const googleCardResponse = {title: 'sample text response', platform: agent.ACTIONS_ON_GOOGLE}
   * agent.addCard(googleCardResponse);
   * const cardResponse = agent.buildCard('sample text response')
   * agent.addCard(cardResponse);
   *
   * @param {string|Object} cardResponse text response string or an object representing a text response
   * @return {WebhookClient}
   */
  addCard(cardResponse) {
    if (cardResponse instanceof CardResponse) {
      this.responseMessages_.push(cardResponse);
    } else if (
      typeof cardResponse === 'string' ||
      typeof cardResponse === 'object'
    ) {
      cardResponse = new CardResponse(cardResponse);
      this.responseMessages_.push(cardResponse);
    } else {
      throw new Error(
        'Unknown text response type. Please use a string or CardResponse object'
      );
    }

    return this;
  }

  /**
   * Add a image response to be sent to Dialogflow via message objects
   * v1 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#image
   * v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#basic_card_response
   * v2 Generic: https://dialogflow.com/docs/reference/agent/message-objects#image_message_object
   * v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#basiccard
   *
   * @example
   * const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.addImage(imageUrl);
   * const googleImageResponse = {imageUrl: imageUrl, platform: agent.ACTIONS_ON_GOOGLE}
   * agent.addImage(googleImageResponse);
   * const imageResponse = agent.buildImage(imageUrl)
   * agent.addImage(imageResponse);
   *
   * @param {string|Object} imageResponse image URL string or an object representing a image response
   * @return {WebhookClient}
   */
  addImage(imageResponse) {
    if (imageResponse instanceof ImageResponse) {
      this.responseMessages_.push(imageResponse);
    } else if (
      typeof imageResponse === 'string' ||
      typeof imageResponse === 'object'
    ) {
      imageResponse = new ImageResponse(imageResponse);
      this.responseMessages_.push(imageResponse);
    } else {
      throw new Error(
        'Unknown text response type. Please use a string or ImageResponse object'
      );
    }

    return this;
  }

  /**
   * Add a suggestion response to be sent to Dialogflow via message objects
   * v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#quick_replies_message_object
   * v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#suggestion_chip_response
   * v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#quickreplies
   * v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#suggestion
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.addSuggestion('suggestion');
   * const googleSuggestionResponse = {title: 'suggestion', platform: agent.ACTIONS_ON_GOOGLE}
   * agent.addSuggestion(googleSuggestionResponse);
   * const suggestionResponse = agent.buildSuggestion('suggestion')
   * agent.addSuggestion(suggestionResponse);
   *
   * @param {string|Object} suggestion title string or an object representing a suggestion response
   * @return {WebhookClient}
   */
  addSuggestion(suggestion) {
    const platform = suggestion.platform;
    const existingQuickReply = this.existingSuggestion_(platform);
    if (existingQuickReply) {
      if (typeof suggestion === 'string') {
        existingQuickReply.addReply_(suggestion);
      } else if (suggestion instanceof SuggestionsResponse) {
        existingQuickReply.addReply_(suggestion.replies[0]);
      } else {
        throw new Error(
          'Unknown QuickReply response type. Please use a string or suggestion object'
        );
      }
    } else {
      if (typeof suggestion === 'string') {
        this.responseMessages_.push(
          new SuggestionsResponse(suggestion)
        );
      } else if (suggestion instanceof SuggestionsResponse) {
        this.responseMessages_.push(suggestion);
      } else {
        throw new Error(
          'Unknown QuickReply response type. Please use a string or SuggestionsResponse object'
        );
      }
    }
    return this;
  }

  /**
   * Find a existing suggestion response message object for a specific platform
   *
   * @param {string} platform of incoming request
   * @return {SuggestionsResponse|null} quick reply response of corresponding platform or null if no value
   * @private
   */
  existingSuggestion_(platform) {
    let existingQuickReply;
    for (let response of this.responseMessages_) {
      if (response instanceof SuggestionsResponse) {
        if (
          (!response.platform || response.platform === PLATFORMS.UNSPECIFIED) &&
          (!platform || platform === PLATFORMS.UNSPECIFIED)
        ) {
          existingQuickReply = response;
          break;
        }
        if (platform === response.platform) {
          existingQuickReply = response;
          break;
        }
      }
    }
    return existingQuickReply;
  }

  /**
   * Add a suggestion response to be sent to Dialogflow via message objects
   * v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#quick_replies_message_object
   * v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#suggestion_chip_response
   * v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#quickreplies
   * v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#suggestion
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
   * };
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson);
   * const googlePyaload = agent.buildPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson)
   * agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayload);
   *
   * @param {string} platform representing the payload to be sent to target platform
   * @param {Object} payload object representing payload's target platform
   * @return {WebhookClient}
   */
  addPayload(platform, payload) {
    this.responseMessages_.push(new PayloadResponse(platform, payload));
    return this;
  }

  /**
   * Find a existing payload response message object for a specific platform
   *
   * @param {string} platform of incoming request
   * @return {PayloadResponse|null} Payload response of corresponding platform or null if no value
   * @private
   */
  existingPayload_(platform) {
    let existingPayload;
    for (let response of this.responseMessages_) {
      if (response instanceof PayloadResponse) {
        if (
          (!response.platform || response.platform === PLATFORMS.UNSPECIFIED) &&
          (!platform || platform === PLATFORMS.UNSPECIFIED)
        ) {
          existingPayload = response;
          break;
        }
        if (platform === response.platform) {
          existingPayload = response;
          break;
        }
      }
    }
    return existingPayload;
  }

  // ---------------------------------------------------------------------------
  //                   Rich Response Builders
  // ---------------------------------------------------------------------------

  /**
   * Build a text response message object
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * const textResponse = agent.buildText('a sample text response');
   * const googleTextResponse = agent.buildText({
   *     text: 'sample text response',
   *     platform: agent.ACTIONS_ON_GOOGLE
   * });
   *
   * @param {string|Object} text response string or an object representing a text response
   * @return {TextResponse}
   */
  buildText(text) {
    return new TextResponse(text);
  }

  /**
   * Build a card response message object
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let cardResponse = agent.buildCard('a sample card title');
   * cardResponse.setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png');
   * cardResponse.setText('sample card text');
   * cardResponse.setButton({text: 'Button Text', url: 'https://assistant.google.com/'});
   * const googleCardResponse = agent.buildText({
   *     title: 'a sample card title',
   *     text: 'sample card text',
   *     imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
   *     button: {text: 'Button Text', url: 'https://assistant.google.com/'},
   *     platform: agent.ACTIONS_ON_GOOGLE
   * });
   *
   * @param {string|Object} title card title string or an object representing a card
   * @return {CardResponse}
   */
  buildCard(title) {
    return new CardResponse(title);
  }

  /**
   * Build a image response message object
   *
   * @example
   * const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let cardResponse = agent.buildImage(imageUrl);
   * const googleCardResponse = agent.buildText({
   *     imageUrl: imageUrl,
   *     platform: agent.ACTIONS_ON_GOOGLE
   * });
   *
   * @param {string|Object} imageUrl string or an object representing a image response
   * @return {ImageResponse}
   */
  buildImage(imageUrl) {
    return new ImageResponse(imageUrl);
  }

  /**
   * Build a suggestion response message object
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * const suggestionResponse = agent.buildSuggestion('suggestion');
   * const googleCardResponse = agent.buildSuggestion({
   *     title: 'suggestion',
   *     platform: agent.ACTIONS_ON_GOOGLE
   * });
   *
   * @param {string|Object} suggestion title string or an object representing a suggestion response
   * @return {SuggestionsResponse}
   */
  buildSuggestion(suggestion) {
    return new SuggestionsResponse(suggestion);
  }

  /**
   * Build a payload response message object
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
   * };
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * const googlePyaload = agent.buildPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson)
   *
   * @param {string} platform representing the payload to be sent to target platform
   * @param {Object} payload object representing payload's target platform
   * @return {PayloadResponse}
   */
  buildPayload(platform, payload) {
    return new PayloadResponse(payload);
  }

  // ---------------------------------------------------------------------------
  //                            Contexts
  // ---------------------------------------------------------------------------

  /**
   * Set a new Dialogflow outgoing context: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.setContext('sample context name');
   * const context = {'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}};
   * agent.setContext(context);
   *
   * @param {string|Object} context name of context or an object representing a context
   * @return {WebhookClient}
   */
  setContext(context) {
    // If developer provides a string, transform to context object, using string as the name
    if (typeof context === 'string') {
      context = {name: context};
    }
    if (context && !context.name) {
      throw new Error('context must be provided and must have a name');
    }

    this.client.addContext_(context);

    return this;
  }

  /**
   * Clear all existing outgoing contexts: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.clearOutgoingContexts();
   *
   * @return {WebhookClient}
   */
  clearOutgoingContexts() {
    this.outgoingContexts_ = [];
    return this;
  }

  /**
   * Clear an existing outgoing context: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.clearContext('sample context name');
   *
   * @param {string} context name of an existing outgoing context
   * @return {WebhookClient}
   */
  clearContext(context) {
    if (this.agentVersion === 1) {
      this.outgoingContexts_ = this.outgoingContexts_.filter(
        (ctx) => ctx.name !== context
      );
    } else if (this.agentVersion === 2) {
      // Take all existing outgoing contexts and filter out the context that needs to be cleared
      this.outgoingContexts_ = this.outgoingContexts_.filter(
        (ctx) => ctx.name.slice(-context.length) !== context
      );
    } else {
      debug('Couldn\'t find context');
    }
    return this;
  }
}

module.exports = WebhookClient;
