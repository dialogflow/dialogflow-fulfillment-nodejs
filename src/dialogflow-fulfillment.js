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
const {DialogflowConversation} = require('actions-on-google');
const debug = require('debug')('dialogflow:debug');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);

// Response and agent classes
const Text = require('./rich-responses/text-response');
const Card = require('./rich-responses/card-response');
const Image = require('./rich-responses/image-response');
const Suggestion = require('./rich-responses/suggestions-response');
const Payload = require('./rich-responses/payload-response');
const {
  RichResponse,
  PLATFORMS,
  SUPPORTED_RICH_MESSAGE_PLATFORMS,
} = require('./rich-responses/rich-response');
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
   * Constructor for WebhookClient object
   * To be used in the Dialogflow fulfillment webhook logic
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
     * Followup event as defined by the developer
     *
     * @private
     * @type {Object}
     */
    this.followupEvent_ = null;


    /**
     * Boolean indicating whether the conversation should continue after the Dialogflow agent's response
     *
     * @private
     * @type Boolean
     */
    this.endConversation_ = false;

    /**
     * List of outgoing contexts defined by the developer
     *
     * @private
     * @type {Object[]}
     */
    this.outgoingContexts_ = [];

    /**
     * Dialogflow intent name or null if no value: https://dialogflow.com/docs/intents
     * @type {string}
     */
    this.intent = null;

    /**
     * Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters
     * @type {string}
     */
    this.action = null;

    /**
     * Dialogflow parameters included in the request or null if no value
     * https://dialogflow.com/docs/actions-and-parameters
     * @type {Object}
     */
    this.parameters = null;

    /**
     * Dialogflow contexts included in the request or null if no value
     * https://dialogflow.com/docs/contexts
     * @type {string}
     */
    this.contexts = null;

    /**
     * Dialogflow source included in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {string}
     */
    this.requestSource = null;

    /**
     * Dialogflow original request object from detectIntent/query or platform integration
     * (Google Assistant, Slack, etc.) in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {object}
     */
    this.originalRequest = null;

    /**
     * Original user query as indicated by Dialogflow or null if no value
     * @type {string}
     */
    this.query = null;

    /**
     * Original request language code or locale (i.e. "en" or "en-US")
     * @type {string} locale language code indicating the spoken/written language of the original request
     */
    this.locale = null;

    /**
     * Dialogflow input contexts included in the request or null if no value
     * Dialogflow v2 API only
     * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest#FIELDS.session
     *
     * @type {string}
     */
    this.session = null;

    /**
     * List of messages defined in Dialogflow's console for the matched intent
     * https://dialogflow.com/docs/rich-messages
     *
     * @type {RichResponse[]}
     */
    this.consoleMessages = [];

    /**
     * List of alternative query results
     * Query results can be from other Dialogflow intents or Knowledge Connectors
     * https://cloud.google.com/dialogflow-enterprise/alpha/docs/knowledge-connectors
     * Note:this feature only availbe in Dialogflow v2
     *
     * @type {object}
     */
    this.alternativeQueryResults = null;

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
   * Add a response or list of responses to be sent to Dialogflow
   *
   * @param {RichResponse|string|RichResponse[]|string[]} responses (list) or single responses
   */
  add(responses) {
    if (responses instanceof Array) {
      responses.forEach( (singleResponse) => this.addResponse_(singleResponse) );
    } else {
      this.addResponse_(responses);
    }
  }

  /**
   * Add a response or list of responses to be sent to Dialogflow and end the conversation
   * Note: Only supported on Dialogflow v2's telephony gateway, Google Assistant and Alexa integrations
   *
   * @param {RichResponse|string|RichResponse[]|string[]} responses (list) or single responses
   */
  end(responses) {
    this.client.end_(responses);
  }

  /**
   * Add a response to be sent to Dialogflow
   *
   * @param {RichResponse|string} response an object or string representing the rich response to be added
   */
  addResponse_(response) {
    if (typeof response === 'string') {
      response = new Text(response);
    }
    if (response instanceof DialogflowConversation) {
      this.client.addActionsOnGoogle_(response.serialize());
    } else if (response instanceof Suggestion && this.existingSuggestion_(response.platform)) {
      this.existingSuggestion_(response.platform).addReply_(response.replies[0]);
    } else if (response instanceof Payload && this.existingPayload_(response.platform)) {
      throw new Error(`Payload response for ${response.platform} already defined.`);
    } else if (response instanceof RichResponse) {
      this.responseMessages_.push(response);
    } else {
      throw new Error(`Unknown response type: "${JSON.stringify(response)}"`);
    }
  }

  /**
   * Handles the incoming Dialogflow request using a handler or Map of handlers
   * Each handler must be a function callback.
   *
   * @param {Map|requestCallback} handler map of Dialogflow action name to handler function or
   *     function to handle all requests (regardless of Dialogflow action).
   * @return {Promise}
   */
  handleRequest(handler) {
    if (typeof handler === 'function') {
      let result = handler(this);
      let promise = Promise.resolve(result);
      return promise.then(() => this.send_());
    }

    if (!(handler instanceof Map)) {
      return Promise.reject( new Error(
        'handleRequest must contain a map of Dialogflow intent names to function handlers'
      ));
    }

    if (handler.get(this.intent)) {
      let result = handler.get(this.intent)(this);
      // If handler is a promise use it, otherwise create use default (empty) promise
      let promise = Promise.resolve(result);
      return promise.then(() => this.send_());
    } else if (handler.get(null)) {
      let result = handler.get(null)(this);
      // If handler is a promise use it, otherwise create use default (empty) promise
      let promise = Promise.resolve(result);
      return promise.then(() => this.send_());
    } else {
      debug('No handler for requested intent');
      this.response_
        .status(RESPONSE_CODE_BAD_REQUEST)
        .status('No handler for requested intent');
      return Promise.reject(new Error('No handler for requested intent'));
    }
  }

  // --------------------------------------------------------------------------
  //          Context and follow-up event methods
  // --------------------------------------------------------------------------
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

  /**
   * Get an context from the Dialogflow webhook request: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let context = agent.getContext('sample context name');
   *
   * @param {string} contextName name of an context present in the Dialogflow webhook request
   * @return {Object} context context object with the context name
   */
  getContext(contextName) {
    return this.contexts.filter( (context) => context.name === contextName )[0] || null;
  }

  /**
   * Set the followup event
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let event = agent.setFollowupEvent('sample event name');
   *
   * @param {string|Object} event string with the name of the event or an event object
   */
  setFollowupEvent(event) {
    if (typeof event === 'string') {
      event = {name: event};
    } else if (typeof event.name !== 'string' || !event.name) {
      throw new Error('Followup event must be a string or have a name string');
    }

    this.client.setFollowupEvent_(event);
  }

  // ---------------------------------------------------------------------------
  //              Actions on Google methods
  // ---------------------------------------------------------------------------
  /**
   * Get Actions on Google DialogflowConversation object
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let conv = agent.conv();
   * conv.ask('Hi from the Actions on Google client library');
   * agent.add(conv);
   *
   * @return {DialogflowConversation|null} DialogflowConversation object or null
   */
  conv() {
    if (this.requestSource === PLATFORMS.ACTIONS_ON_GOOGLE) {
      return new DialogflowConversation(this.request_);
    } else {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  //              Private utility methods
  // ---------------------------------------------------------------------------
  /**
   * Sends a response back to a Dialogflow fulfillment webhook request
   *
   * @param {string[]|RichResponse[]} response additional responses to send
   * @return {void}
   * @private
   */
  send_() {
    const requestSource = this.requestSource;
    const messages = this.responseMessages_;

    // If AoG response and the first response isn't a text response,
    // add a empty text response as the first item
    if (
      requestSource === PLATFORMS.ACTIONS_ON_GOOGLE && messages[0] &&
      !(messages[0] instanceof Text) &&
      !this.existingPayload_(PLATFORMS.ACTIONS_ON_GOOGLE)
    ) {
      this.responseMessages_ = [new Text(' ')].concat(messages);
    }

    // if there is only text, send response
    // if there is a payload, send the payload for the repsonse
    // if platform supports messages, send messages
    const payload = this.existingPayload_(requestSource);
    if (messages.length === 1 &&
      messages[0] instanceof Text) {
      this.client.sendTextResponse_();
    } else if (payload) {
      this.client.sendPayloadResponse_(payload, requestSource);
    } else if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(this.requestSource) > -1
      || this.requestSource === null) {
      this.client.sendMessagesResponse_(requestSource);
    } else {
      throw new Error(`No responses defined for platform: ${this.requestSource}`);
    }
  }

  /**
   * Find a existing suggestion response message object for a specific platform
   *
   * @param {string} platform of incoming request
   * @return {Suggestion|null} quick reply response of corresponding platform or null if no value
   * @private
   */
  existingSuggestion_(platform) {
    let existingSuggestion;
    for (let response of this.responseMessages_) {
      if (response instanceof Suggestion) {
        if (
          (!response.platform || response.platform === PLATFORMS.UNSPECIFIED) &&
          (!platform || platform === PLATFORMS.UNSPECIFIED)
        ) {
          existingSuggestion = response;
          break;
        }
        if (platform === response.platform) {
          existingSuggestion = response;
          break;
        }
      }
    }
    return existingSuggestion;
  }

  /**
   * Find a existing payload response message object for a specific platform
   *
   * @param {string} platform of incoming request
   * @return {Payload|null} Payload response of corresponding platform or null if no value
   * @private
   */
  existingPayload_(platform) {
    let existingPayload;
    for (let response of this.responseMessages_) {
      if (response instanceof Payload) {
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
}

module.exports = {WebhookClient, Text, Card, Image, Suggestion, Payload};
