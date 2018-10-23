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

const debug = require('debug')('dialogflow:debug');

// Configure logging for hosting platforms agent only support console.log and console.error
debug.log = console.log.bind(console);

// Response Builder classes
const {
  V1_TO_V2_PLATFORM_NAME,
  PLATFORMS,
} = require('./rich-responses/rich-response');
const Text = require('./rich-responses/text-response');
const Card = require('./rich-responses/card-response');
const Image = require('./rich-responses/image-response');
const Suggestion = require('./rich-responses/suggestions-response');
const PayloadResponse = require('./rich-responses/payload-response');

// Contexts class
const Contexts = require('./contexts');

/**
 * Class representing a v1 Dialogflow agent
 */
class V1Agent {
  /**
   * Constructor for V1Agent object
   * To be used in with WebhookClient class
   *
   * @param {Object} agent instance of WebhookClient class
   */
  constructor(agent) {
    this.agent = agent;
    return this;
  }

  /**
   * Process a v1 Dialogflow webhook request to set class varibles
   * for action, parameters, contexts, request source and orignal user query
   *
   * @private
   */
  processRequest_() {
    /**
     * Dialogflow intent or null if no value
     * https://dialogflow.com/docs/intents
     * @type {string}
     */
    this.agent.intent = this.agent.request_.body.result.metadata.intentName;
    debug(`Intent: ${this.agent.intent}`);

    /**
     * Dialogflow action or null if no value
     * https://dialogflow.com/docs/actions-and-parameters
     * @type {string}
     */
    this.agent.action = this.agent.request_.body.result.action;
    debug(`Action: ${this.agent.action}`);

    /**
     * Dialogflow parameters included in the request or null if no value
     * https://dialogflow.com/docs/actions-and-parameters
     * @type {Object[]}
     */
    this.agent.parameters = this.agent.request_.body.result.parameters;
    debug(`Parameters: ${JSON.stringify(this.agent.parameters)}`);

    /**
     * Dialogflow contexts included in the request or null if no value
     * https://dialogflow.com/docs/contexts
     * @type {string}
     */
    this.agent.contexts = this.agent.request_.body.result.contexts;
    debug(`Input contexts: ${JSON.stringify(this.agent.contexts)}`);

    /**
     * Instance of Dialogflow contexts class to provide an API to set/get/delete contexts
     *
     * @type {Contexts}
     */
    this.agent.context = new Contexts(this.agent.request_.body.result.contexts);

    /**
     * Dialogflow source included in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {string}
     */
    let originalRequest = this.agent.request_.body.originalRequest;
    if (originalRequest) {
      const v1RequestSource = originalRequest.source || originalRequest.data.source;
      this.agent.requestSource = V1_TO_V2_PLATFORM_NAME[v1RequestSource] || v1RequestSource;
    }
    debug(`Request source: ${JSON.stringify(this.agent.requestSource)}`);

    /**
     * Dialogflow original request object from detectIntent/query or platform integration
     * (Google Assistant, Slack, etc.) in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {object}
     */
    let originalRequestPayloadRenameRename = Object.assign({}, originalRequest);
    if (originalRequest && originalRequest.data) {
      // Rename 'data' attr to 'payload' to be consistent with v2
      const data = Object.getOwnPropertyDescriptor(originalRequestPayloadRenameRename, 'data');
      Object.defineProperty(originalRequestPayloadRenameRename, 'payload', data);
      delete originalRequestPayloadRenameRename['data'];
    }
    this.agent.originalRequest = originalRequestPayloadRenameRename;
    debug(`Original Request: ${JSON.stringify(this.agent.originalRequest)}`);

    /**
     * Original user query as indicated by Dialogflow or null if no value
     * @type {string}
     */
    this.agent.query = this.agent.request_.body.result.resolvedQuery;
    debug(`Original query: ${JSON.stringify(this.agent.query)}`);

    /**
     * Original request language code (i.e. "en")
     * @type {string} locale language code indicating the spoken/written language of the original request
     */
     this.agent.locale = this.agent.request_.body.lang;

    /**
     * List of messages defined in Dialogflow's console for the matched intent
     * https://dialogflow.com/docs/rich-messages
     *
     * @type {RichResponse[]}
     */
    if (this.agent.request_.body.result.fulfillment.messages) {
      const consoleMessages = this.agent.request_.body.result.fulfillment.messages;
      this.agent.consoleMessages = this.getConsoleMessages_(consoleMessages);
    } else {
      this.agent.consoleMessages = [];
    }
    debug(`Console messages: ${JSON.stringify(this.agent.consoleMessages)}`);
  }

  /**
   * Add v1 text response to Dialogflow fulfillment webhook request based on
   * single, developer defined text response
   *
   * @private
   */
  addTextResponse_() {
    const message = this.agent.responseMessages_[0];
    const speech = message.ssml || message.text;
    this.addJson_({speech: speech, displayText: message.text});
  }

  /**
   * Add v1 payload response to Dialogflow fulfillment webhook request based
   * on developer defined payload response
   *
   * @param {Object} payload to back to requestSource (i.e. Google, Slack, etc.)
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  addPayloadResponse_(payload, requestSource) {
    this.addJson_({data: payload.getPayload_(requestSource)});
  }

  /**
   * Add v1 response to Dialogflow fulfillment webhook request based on developer
   * defined response messages and original request source
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  addMessagesResponse_(requestSource) {
    let messages = this.buildResponseMessages_(requestSource);
    if (messages.length > 0) {
      this.addJson_({messages: messages});
    }
  }

  /**
   * Add v1 response to Dialogflow fulfillment webhook request
   *
   * @param {Object} responseJson JSON to send to Dialogflow
   * @private
   */
  addJson_(responseJson) {
    if (!this.responseJson_) {
      this.responseJson_ = {};
    }
    Object.assign(this.responseJson_, responseJson);
  }

  /**
   * Send v1 response to Dialogflow fulfillment webhook request
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  sendResponses_(requestSource) {
    let responseJson = this.responseJson_;
    if (!responseJson) {
      throw new Error(`No responses defined for platform: ${requestSource}`);
    }

    responseJson.contextOut = this.agent.context.getV1OutputContextsArray();
    this.agent.followupEvent_ ? responseJson.followupEvent = this.agent.followupEvent_ : undefined;

    debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
    this.agent.response_.json(responseJson);
  }

  /**
   * Builds a list of v1 message objects to send back to Dialogflow based on
   * developer defined responses and the request source
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @return {Object[]} message objects
   * @private
   */
  buildResponseMessages_(requestSource) {
    // Get all the messages and filter out null/undefined objects
    const responseMessages = this.agent.responseMessages_
      .map((message) => message.getV1ResponseObject_(requestSource))
      .filter((arr) => arr);
    return responseMessages;
  }

  /**
   * Add an v1 outgoing context
   *
   * @param {Object} context an object representing a v1 outgoing context
   * @private
   */
  addContext_(context) {
    // v1 contexts have the same structure as used by the library
    this.agent.context.set(context);
  }

  /**
   * Add an v1 followup event
   *
   * @param {Object} event an object representing a followup event
   * @private
   */
  setFollowupEvent_(event) {
    let eventJson = {
      name: event.name,
    };
    if (event.parameters) {
      eventJson.data = event.parameters;
    }
    this.agent.followupEvent_ = eventJson;
  }

  /**
   * Add a response or list of responses to be sent to Dialogflow and end the conversation
   * Note: not support on v1
   */
  end_() {
    throw new Error('"end" method is not supported on Dialogflow API V1.  Please migrate to Dialogflow API V2.');
  }

  /**
   * Add an v1 Actions on Google response
   *
   * @param {Object} response a Actions on Google Dialogflow v1 webhook response
   * @private
   */
  addActionsOnGoogle_(response) {
    if (response.contextOut) {
      response.contextOut.forEach( (context) => {
        this.addContext_(context);
      });
    }

    this.agent.add(new PayloadResponse(
      PLATFORMS.ACTIONS_ON_GOOGLE,
      response.data.google)
    );
  }

  /**
   * Get messages defined in Dialogflow's console for matched intent
   *
   * @param {Object[]} consoleMessageList is a list of v1 Dialogflow messages from Dialogflow's console
   * @return {RichResponse[]} list of RichResponse objects
   * @private
   */
  getConsoleMessages_(consoleMessageList) {
    // Functions to transpose fulfillment messages from Dialogflow's console to fulfillment library classes
    const richResponseMapping = {
      '0': this.convertTextJson_,
      '1': this.convertCardJson_,
      '2': this.convertQuickRepliesJson_,
      '3': this.convertImageJson_,
      '4': this.convertPayloadJson_,
      'custom_payload': this.convertPayloadJson_,
      'simple_response': this.convertSimpleResponsesJson_,
      'basic_card': this.convertBasicCardJson_,
      'suggestion_chips': this.convertSuggestionsJson_,
    };

    let richConsoleMessages = []; // list of messages to be returned

    // iterate through each message recived in the webhook request
    consoleMessageList.forEach( (consoleMessageJson) => {
      if (richResponseMapping[consoleMessageJson.type]) {
        // convert the JSON to fufillment classes
        let richResponse = richResponseMapping[consoleMessageJson.type](
          consoleMessageJson,
          V1_TO_V2_PLATFORM_NAME[consoleMessageJson.platform]
        );
        richResponse ? richConsoleMessages = richConsoleMessages.concat(richResponse): null;
      } else {
        debug(`Unsupported console message type "${richMessageType}"`);
      }
    });
    return richConsoleMessages;
  }

  /**
   * Convert incoming text message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertTextJson_(messageJson, platform) {
    if (!messageJson.speech) return null;
    else return new Text({text: messageJson.speech, platform: platform});
  }

  /**
   * Convert incoming card message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertCardJson_(messageJson, platform) {
   return new Card({
          title: messageJson.title || ' ',
          text: messageJson.subtitle,
          imageUrl: messageJson.imageUrl,
          buttonText: messageJson.buttons ? messageJson.buttons[0].text: null,
          buttonUrl: messageJson.buttons ? messageJson.buttons[0].postback: null,
          platform: platform,
        });
  }

  /**
   * Convert incoming quick reply message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertQuickRepliesJson_(messageJson, platform) {
    if (!messageJson.suggestions) return null;
    let suggestions = [];
    messageJson.suggestions.forEach( (consoleMessageJson, iterator) => {
      suggestions.push(new Suggestion({
         title: messageJson.replies[iterator],
         platform: platform,
       }));
    });
    return suggestions;
  }

  /**
   * Convert incoming image message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertImageJson_(messageJson, platform) {
    return new Image({
      imageUrl: messageJson.imageUrl,
      platform: platform,
    });
  }

  /**
   * Convert incoming payload message object JSON into a Payload rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertPayloadJson_(messageJson, platform) {
    return new PayloadResponse(platform, messageJson.payload, {
      rawPayload: true,
      sendAsMessage: true,
    });
  }

  /**
   * Convert incoming simple response message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertSimpleResponsesJson_(messageJson, platform) {
    return new Text({
      text: messageJson.textToSpeech,
      platform: platform,
    });
  }

  /**
   * Convert incoming basic card message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertBasicCardJson_(messageJson, platform) {
    return new Card({
           title: messageJson.title || ' ',
           text: messageJson.formattedText,
           imageUrl: messageJson.image ? messageJson.image.url : null,
           buttonText: messageJson.buttons.length != 0 ? messageJson.buttons[0].title : null,
           buttonUrl: messageJson.buttons.length != 0 ? messageJson.buttons[0].openUrlAction.url : null,
           platform: platform,
         });
  }

  /**
   * Convert incoming suggestions message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertSuggestionsJson_(messageJson, platform) {
    if (!messageJson.suggestions) return null;
    let suggestions = [];
    messageJson.suggestions.forEach( (consoleMessageJson, iterator) => {
     suggestions.push(new Suggestion({
       title: messageJson.suggestions[iterator].title,
       platform: platform,
     }));
    });
    return suggestions;
  }
}

module.exports = V1Agent;
