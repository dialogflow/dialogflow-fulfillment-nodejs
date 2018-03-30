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
const {
  RichResponse,
  PLATFORMS,
  SUPPORTED_RICH_MESSAGE_PLATFORMS,
  V2_TO_V1_PLATFORM_NAME,
} = require('./rich-response');

/**
 * Enum for Dialogflow v1 text message object https://dialogflow.com/docs/reference/agent/message-objects
 */
const v1MessageObjectSuggestions = 2;

/**
 * Class representing a suggestions response
 * @extends RichResponse
 */
class Suggestion extends RichResponse {
  /**
   * Constructor for Suggestion object
   *
   * @example
   * let suggestion = new Suggestion('suggestion');
   * const anotherSuggestion = new Suggestion({
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
        'Reply string required by Suggestion constructor'
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
   * Set the reply for a Suggestion
   *
   * @example
   * let suggestion = new Suggestion('reply to be overwritten');
   * suggestion.setReply('reply overwritten');
   *
   * @param {string} reply
   * @return {Suggestion}
   */
  setReply(reply) {
    if (typeof reply !== 'string') {
      throw new Error(`setReply requires a string but found ${typeof reply}`);
    }
    if (this.replies.length !== 1) {
      throw new Error(
        `Expected one reply in Suggestion object but found ${
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
   * let suggestion = new Suggestion('first reply');
   * suggestion.addReply_('another reply');
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
      response = {type: v1MessageObjectSuggestions};
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

module.exports = Suggestion;
