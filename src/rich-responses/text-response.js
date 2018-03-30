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
const v1MessageObjectText = 0;

/**
 * Class representing a text response
 * @extends RichResponse
 */
class Text extends RichResponse {
  /**
   * Constructor for Text object
   *
   * @example
   * let text = new Text('response string');
   * let anotherText = new Text({
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
        'string required by Text constructor'
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
   * Set the text for a Text
   *
   * @example
   * let text = new Text();
   * text.setText('sample text response')
   *
   * @param {string} text containing the text response content
   * @return {Text}
   */
  setText(text) {
    if (typeof text !== 'string') {
      throw new Error('setText requires a string of the text');
    }
    this.text = text;
    return this;
  }

  /**
   * Set the SSML for a Text
   *
   * @example
   * let text = new Text();
   * text.setSsml('<speak>This is <say-as interpret-as="characters">SSML</say-as>.</speak>')
   *
   * @param {string} ssml containing the SSML response content
   * @return {Text}
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
      response = {type: v1MessageObjectText};
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

module.exports = Text;
