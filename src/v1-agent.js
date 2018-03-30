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
const PayloadResponse = require('./rich-responses/payload-response');

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
  }

  /**
   * Send v1 text response to Dialogflow fulfillment webhook request based on
   * single, developer defined text response
   *
   * @private
   */
  sendTextResponse_() {
    const message = this.agent.responseMessages_[0];
    const speech = message.ssml || message.text;
    this.sendJson_({speech: speech, displayText: message.text});
  }

  /**
   * Send v1 payload response to Dialogflow fulfillment webhook request based
   * on developer defined payload response
   *
   * @param {Object} payload to back to requestSource (i.e. Google, Slack, etc.)
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  sendPayloadResponse_(payload, requestSource) {
    this.sendJson_({data: payload.getPayload_(requestSource)});
  }

  /**
   * Send v1 response to Dialogflow fulfillment webhook request based on developer
   * defined response messages and original request source
   *
   * @param {string} requestSource string indicating the source of the initial request
   * @private
   */
  sendMessagesResponse_(requestSource) {
    this.sendJson_({messages: this.buildResponseMessages_(requestSource)});
  }

  /**
   * Send v1 response to Dialogflow fulfillment webhook request
   *
   * @param {Object} responseJson JSON to send to Dialogflow
   * @private
   */
  sendJson_(responseJson) {
    responseJson.contextOut = this.agent.outgoingContexts_;
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
    this.agent.outgoingContexts_.push(context);
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
    event.parameters ? eventJson.data = event.parameters : undefined;

    this.agent.followupEvent_ = eventJson;
  }

  /**
   * Add an v1 Actions on Google response
   *
   * @param {Object} response a Actions on Google Dialogflow v1 webhook response
   * @private
   */
  addActionsOnGoogle_(response) {
    response.contextOut.forEach( (context) => {
      this.addContext_(context);
    });

    this.agent.add(new PayloadResponse(
      PLATFORMS.ACTIONS_ON_GOOGLE,
      response.data.google)
    );
  }
}

module.exports = V1Agent;
