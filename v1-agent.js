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

// Response Builder classes
const {TextResponse, V1_TO_V2_PLATFORM_NAME} = require('./response-builder');

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
     * Dialogflow source included in the request or null if no value
     * https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields
     * @type {string}
     */
    if (this.agent.request_.body.originalRequest) {
      this.agent.requestSource =
        V1_TO_V2_PLATFORM_NAME[this.agent.request_.body.originalRequest.source];
    }
    // Use request source from original request if present
    if (
      !this.agent.requestSource &&
      this.agent.request_.body.originalRequest &&
      this.agent.request_.body.originalRequest.data
    ) {
      const requestSource = this.agent.request_.body.originalRequest.data
        .source;
      this.agent.requestSource = V1_TO_V2_PLATFORM_NAME[requestSource] || requestSource;
    }
    debug(`Request source: ${JSON.stringify(this.agent.requestSource)}`);

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
  }

  /**
   * Send v1 response to Dialogflow fulfillment webhook request based on developer
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
      responseJson.speech = responseMessages[0].speech; // spoken response
      responseJson.displayText = responseMessages[0].textToSpeech; // displayed response
    } else {
      responseJson.messages = responseMessages;
    }

    responseJson.contextOut = this.agent.outgoingContexts_;

    debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
    this.agent.response_.json(responseJson);
  }

  /**
   * Builds a list of v1 message objects to send back to Dialogflow based on
   * developer defined responses and the request source
   *
   * @return {Object[]} message objects
   * @private
   */
  buildResponseMessages_() {
    // Get all the messages and filter out null/undefined objects
    const responseMessages = this.agent.responseMessages_
      .map((message) => message.getV1ResponseObject_(this.agent.requestSource))
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
    this.agent.outgoingContexts_.push(context);
  }
}

module.exports = V1Agent;
