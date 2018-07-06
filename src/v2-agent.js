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

const DEFAULT_CONTEXT_LIFESPAN = 5;

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

/**
 * Class representing a v2 Dialogflow agent
 */
class V2Agent {
  /**
   * Constructor for V2Agent object
   * To be used in with WebhookClient class
   *
   * @param {Object} agent instance of WebhookClient class
   */
  constructor(agent) {
    this.agent = agent;
    return this;
  }

  /**
   * Process a v2 Dialogflow webhook request to set class varibles
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
    this.agent.intent = this.agent.request_.body.queryResult.intent.displayName;
    debug(`Intent: ${this.agent.intent}`);

    /**
     * Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters
     * @type {string}
     */
    this.agent.action = this.agent.request_.body.queryResult.action
      ? this.agent.request_.body.queryResult.action
      : null;
    debug(`Action: ${this.agent.action}`);

    /**
     * Dialogflow input contexts included in the request or null if no value
     * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest#FIELDS.session
     * @type {string}
     */
    this.agent.session = this.agent.request_.body.session;
    debug(`v2 Session: ${JSON.stringify(this.agent.session)}`);

    /**
     * Dialogflow parameters included in the request or null if no value
     * https://dialogflow.com/docs/actions-and-parameters
     * @type {Object[]}
     */
    this.agent.parameters =
      this.agent.request_.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
    debug(`Parameters: ${JSON.stringify(this.agent.parameters)}`);

    /**
     * Dialogflow input contexts included in the request or null if no value
     * convert v2 contexts to v1 contexts
     * https://dialogflow.com/docs/contexts
     * @type {string}
     */
    if (this.agent.request_.body.queryResult.outputContexts) {
      this.agent.contexts = this.agent.request_.body.queryResult.outputContexts
        .map((context) => this.convertV2ContextToV1Context_(context));
    } else {
      this.agent.contexts = [];
    }
    debug(`Request contexts: ${JSON.stringify(this.agent.contexts)}`);

    /**
     * Dialogflow source included in the request or null if no value
     * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Platform
     * @type {string}
     */
    const detectIntentRequest = this.agent.request_.body.originalDetectIntentRequest;
    if (detectIntentRequest) {
      const requestSource =
        detectIntentRequest.source ||
        (detectIntentRequest.payload && detectIntentRequest.payload.source) ||
        null;
      this.agent.requestSource = V1_TO_V2_PLATFORM_NAME[requestSource] || requestSource;
    }
    debug(`Request source: ${JSON.stringify(this.agent.requestSource)}`);

    /**
     * Dialogflow original request object from detectIntent/query or platform integration
     * (Google Assistant, Slack, etc.) in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {object}
     */
    this.agent.originalRequest = this.agent.request_.body.originalDetectIntentRequest;
    debug(`Original Request: ${JSON.stringify(this.agent.originalRequest)}`);

    /**
     * Original user query as indicated by Dialogflow or null if no value
     * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/
     * projects.agent.sessions/detectIntent#QueryResult.FIELDS.query_text
     * @type {string}
     */
    this.agent.query = this.agent.request_.body.queryResult.queryText;
    debug(`Original query: ${JSON.stringify(this.agent.query)}`);

    /**
     * Original request language code (i.e. "en")
     * @type {string} locale language code indicating the spoken/written language of the original request
     */
     this.agent.locale = this.agent.request_.body.queryResult.languageCode;
     debug(`Request locale: ${JSON.stringify(this.agent.query)}`);

    /**
     * List of messages defined in Dialogflow's console for the matched intent
     * https://dialogflow.com/docs/rich-messages
     *
     * @type {RichResponse[]}
     */
    if (this.agent.request_.body.queryResult.fulfillmentMessages) {
      const consoleMessages = this.agent.request_.body.queryResult.fulfillmentMessages;
      this.agent.consoleMessages = this.getConsoleMessages_(consoleMessages);
    } else {
      this.agent.consoleMessages = [];
    }
    debug(`Console messages: ${JSON.stringify(this.agent.consoleMessages)}`);

    /**
     * Alternative query results that have a high match score
     * Query results can be from other Dialogflow intents or Knowledge Connectors
     * https://cloud.google.com/dialogflow-enterprise/alpha/docs/knowledge-connectors
     * Note:this feature is only available in Dialogflow API V2
     *
     * @type {object}
     */
    if (this.agent.request_.body.alternativeQueryResults) {
      this.agent.alternativeQueryResults = this.agent.request_.body.alternativeQueryResults;
    }
    debug(`Alternative query result: ${JSON.stringify(this.agent.alternativeQueryResults)}`);
  }

  /**
   * Send v2 text response to Dialogflow fulfillment webhook request based on
   * single, developer defined text response
   *
   * @private
   */
  sendTextResponse_() {
    const message = this.agent.responseMessages_[0];
    const fulfillmentText = message.ssml || message.text;
    this.sendJson_({fulfillmentText: fulfillmentText});
  }

  /**
   * Send v2 payload response to Dialogflow fulfillment webhook request based
   * on developer defined payload response
   *
   * @param {Object} payload to back to requestSource (i.e. Google, Slack, etc.)
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  sendPayloadResponse_(payload, requestSource) {
    this.sendJson_({payload: payload.getPayload_(requestSource)});
  }

  /**
   * Send v2 response to Dialogflow fulfillment webhook request based on developer
   * defined response messages and original request source
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  sendMessagesResponse_(requestSource) {
    this.sendJson_({
      fulfillmentMessages: this.buildResponseMessages_(requestSource),
    });
  }

  /**
   * Send v2 response to Dialogflow fulfillment webhook request
   *
   * @param {Object} responseJson JSON to send to Dialogflow
   * @private
   */
  sendJson_(responseJson) {
    responseJson.outputContexts = this.agent.outgoingContexts_;
    if (this.agent.followupEvent_) {
      responseJson.followupEventInput = this.agent.followupEvent_;
    }
    if (this.agent.endConversation_) {
      responseJson.triggerEndOfConversation = this.agent.endConversation_;
    }

    debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
    this.agent.response_.json(responseJson);
  }

  /**
   * Builds a list of v2 message objects to send back to Dialogflow based on
   * developer defined responses and the request source
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @return {Object[]} message objects
   * @private
   */
  buildResponseMessages_(requestSource) {
    return this.agent.responseMessages_
      .map((message) => message.getV2ResponseObject_(requestSource))
      .filter((arr) => arr);
  }

  /**
   * Add an v2 outgoing context
   *
   * @param {object} context an object representing a v1 or v2 outgoing context
   * @private
   */
  addContext_(context) {
    // Check and see if a v2 context object was added
    if (context.name.match('/contexts/')) {
      context = this.convertV2ContextToV1Context_(context);
    }

    // v2 contexts require the use of the session name and a transformation
    // from a v1 context object to a v2 context object before adding
    let v2Context = {};
    v2Context.name = this.agent.session + '/contexts/' + context.name;
    v2Context.lifespanCount = context.lifespan || DEFAULT_CONTEXT_LIFESPAN;
    v2Context.parameters = context.parameters;

    this.agent.outgoingContexts_.push(v2Context);
  }

  /**
   * Convert a v2 context object to a v1 context object
   *
   * @param {object} v2Context an object representing a v2 context
   * @return {object} v1Context an object representing a v1 context
   * @private
   */
  convertV2ContextToV1Context_(v2Context) {
    let v1Context = {};
    const v2ContextNamePrefixLength = this.agent.session.length + '/contexts/'.length;
    v1Context.name = v2Context.name.slice(v2ContextNamePrefixLength);
    v1Context.lifespan = v2Context.lifespanCount;
    v1Context.parameters = v2Context.parameters;
    return v1Context;
  }

  /**
   * Add an v2 followup event
   *
   * @param {Object} event an object representing a followup event
   * @private
   */
  setFollowupEvent_(event) {
    if (!event.languageCode) {
      event.languageCode = this.agent.locale;
    }

    this.agent.followupEvent_ = event;
  }

  /**
   * Add a response or list of responses to be sent to Dialogflow and end the conversation
   * Note: Only supported on Dialogflow v2's telephony gateway, Google Assistant and Alexa integrations
   *
   * @param {RichResponse|string|RichResponse[]|string[]} responses (list) or single responses
   */
  end_(responses) {
    this.agent.endConversation_ = true;
    this.agent.add(responses);
  }

  /**
   * Add an v2 Actions on Google response
   *
   * @param {Object} response a Actions on Google Dialogflow v2 webhook response
   * @private
   */
  addActionsOnGoogle_(response) {
    response.outputContexts.forEach( (context) => {
      this.addContext_(context);
    });

    this.agent.add(new PayloadResponse(
      PLATFORMS.ACTIONS_ON_GOOGLE,
      response.payload.google)
    );
  }

  /**
   * Get messages defined in Dialogflow's console for matched intent
   *
   * @param {Object[]} consoleMessageList is a list of v2 Dialogflow messages from Dialogflow's console
   * @return {RichResponse[]} list of RichResponse objects
   * @private
   */
  getConsoleMessages_(consoleMessageList) {
    // Functions to transpose fulfillment messages from Dialogflow's console to fulfillment library classes
    const richResponseMapping = {
      text: this.convertTextJson_,
      card: this.convertCardJson_,
      image: this.convertImageJson_,
      quickReplies: this.convertQuickRepliesJson_,
      simpleResponses: this.convertSimpleResponsesJson_,
      basicCard: this.convertBasicCardJson_,
      suggestions: this.convertSuggestionsJson_,
    };

    let richConsoleMessages = []; // list of messages to be returned

    // iterate through each message recived in the webhook request
    consoleMessageList.forEach( (consoleMessageJson) => {
      const richMessageType = Object.keys(consoleMessageJson).find((key) => key !== 'platform');
      if (richResponseMapping[richMessageType]) {
        const messagePlatform = consoleMessageJson.platform ? consoleMessageJson.platform : undefined;
        // convert the JSON to fufillment classes
        let richResponse = richResponseMapping[richMessageType](consoleMessageJson, messagePlatform);
        richResponse ? richConsoleMessages = richConsoleMessages.concat(richResponse): null;
      } else {
        debug(`Unsupported console message type "${richMessageType}"`);
      }
    });
    return richConsoleMessages;
  };

  /**
   * Convert incoming text message object JSON into a Text rich response
   *
   * @param {Object} messageJson is a the JSON implementation of the message
   * @param {string} platform is the platform of the message object
   * @return {RichResponse} richResponse implementation of the message
   * @private
   */
  convertTextJson_(messageJson, platform) {
    if (!messageJson.text.text[0]) return null;
    else return new Text({text: messageJson.text.text[0], platform: platform});
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
          title: messageJson.card.title || ' ',
          text: messageJson.card.subtitle,
          imageUrl: messageJson.card.imageUri,
          buttonText: messageJson.card.buttons ? messageJson.card.buttons[0].text: null,
          buttonUrl: messageJson.card.buttons ? messageJson.card.buttons[0].postback: null,
          platform: platform,
        });
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
     imageUrl: messageJson.image.imageUri,
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
       title: messageJson.quickReplies.quickReplies[iterator],
       platform: platform,
     }));
    });
    return suggestions;
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
     text: messageJson.simpleResponses.simpleResponses[0].textToSpeech,
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
          title: messageJson.basicCard.title || ' ',
          text: messageJson.basicCard.formattedText,
          imageUrl: messageJson.basicCard.image ? messageJson.basicCard.image.imageUri : null,
          buttonText: messageJson.basicCard.buttons ? messageJson.basicCard.buttons[0].title : null,
          buttonUrl: messageJson.basicCard.buttons ? messageJson.basicCard.buttons[0].openUriAction.uri : null,
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
    messageJson.suggestions.suggestions.forEach( (consoleMessageJson, iterator) => {
     suggestions.push(new Suggestion({
       title: messageJson.suggestions.suggestions[iterator].title,
       platform: platform,
     }));
    });
    return suggestions;
  }
}

module.exports = V2Agent;
