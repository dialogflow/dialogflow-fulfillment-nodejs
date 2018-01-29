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

// Configure logging for hosting platforms agent only support console.log and console.error
debug.log = console.log.bind(console);

const DEFAULT_CONTEXT_LIFESPAN = 5;

// Response Builder classes
const {TextResponse, V1_TO_V2_PLATFORM_NAME} = require('./response-builder');

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
     * Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters
     * @type {string}
     */
    this.agent.action = this.agent.request_.body.queryResult.action
      ? this.agent.request_.body.queryResult.action
      : 'default';
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
    if (this.agent.request_.body.originalDetectIntentRequest) {
      const requestSource = this.agent.request_.body.originalDetectIntentRequest
        .source;
      this.agent.requestSource = V1_TO_V2_PLATFORM_NAME[requestSource];
    }
    // Use request source from original request if present
    if (
      !this.agent.requestSource &&
      this.agent.request_.body.originalDetectIntentRequest &&
      this.agent.request_.body.originalDetectIntentRequest.payload
    ) {
      const v1SourceName = this.agent.request_.body.originalDetectIntentRequest
        .payload.source;
      this.agent.requestSource = V1_TO_V2_PLATFORM_NAME[v1SourceName] || v1SourceName;
    }
    debug(`Request source: ${JSON.stringify(this.agent.requestSource)}`);

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
  }

  /**
   * Send v2 response to Dialogflow fulfillment webhook request based on developer
   * defined response messages and original request source
   *
   * @private
   */
  sendResponse_() {
    let responseJson = {};

    // Set response content
    const responseMessages = this.buildResponseMessages_();
    if (responseMessages.length < 1) {
      throw new Error(`No responses defined for ${this.agent.requestSource}`);
    }
    if (
      responseMessages.length === 1 &&
      responseMessages[0] instanceof TextResponse
    ) {
      responseJson.fulfillmentText =
        responseMessages[0].text.text[0] ||
        responseMessages[0].simpleResponses[0].textToSpeech;
    } else {
      responseJson.fulfillmentMessages = responseMessages;
    }
    // If the message is a payload and doesn't have fulfillmentText Dialogflow breaks
    if (
      this.agent.existingPayload_(this.agent.requestSource) &&
      !responseJson.fulfillmentText
    ) {
      responseJson.fulfillmentText = '';
    }

    responseJson.outputContexts = this.agent.outgoingContexts_;

    debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
    this.agent.response_.json(responseJson);
  }

  /**
   * Builds a list of v2 message objects to send back to Dialogflow based on
   * developer defined responses and the request source
   *
   * @return {Object[]} message objects
   * @private
   */
  buildResponseMessages_() {
    const responseMessages = this.agent.responseMessages_
      .map((message) => message.getV2ResponseObject_(this.agent.requestSource))
      .filter((arr) => arr);
    return responseMessages;
  }

  /**
   * Add an v2 outgoing context
   *
   * @param {object} context an object representing a v1 outgoing context
   * @private
   */
  addContext_(context) {
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
}

module.exports = V2Agent;
