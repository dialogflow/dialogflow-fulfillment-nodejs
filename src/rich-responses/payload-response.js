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
  V2_TO_V1_PLATFORM_NAME,
} = require('./rich-response');

/**
 * Class representing a payload response
 * @extends RichResponse
 */
class Payload extends RichResponse {
  /**
   * Constructor for Payload object
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
   * const payload = new Payload(
   *     'ACTIONS_ON_GOOGLE',
   *     googlePayloadJson
   * });
   *
   * @param {string} platform string indicating target platform of payload
   * @param {Object} payload contents for indicated platform
   * @param {boolean} options.sendAsMessage to include the payload in the
   *   messages field. Defaults to false to only send in the payload data field.
   * @param {boolean} options.rawPayload to prevent nesting the payload under
   *   the platform string, e.g. {"google": payload}.
   */
  constructor(platform, payload, {sendAsMessage=false, rawPayload=false}={}) {
    super();
    if (!payload || (typeof platform === 'object' && !platform.payload)) {
      throw new Error('Payload can NOT be empty');
    }
    if (!platform) {
      throw new Error('Platform can NOT be empty');
    }

    if (!payload) {
      this.platform = platform.platform;
      this.payload = JSON.parse(JSON.stringify(platform.payload));
    } else {
      this.platform = platform;
      this.payload = JSON.parse(JSON.stringify(payload));
    }
    this.sendAsMessage = sendAsMessage;
    this.rawPayload = rawPayload;
  }

  /**
   * Set the payload contents for a Payload
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
   * let payload = new Payload(PLATFORMS.ACTIONS_ON_GOOGLE, {});
   * payload.setPayload(googlePayloadJson);
   *
   * @param {string} payload
   * @return {Payload}
   */
  setPayload(payload) {
    this.payload = payload;
    return this;
  }

  /**
   * Get the the contents of the payload
   *
   * @param {string} platform desired message object platform
   * @return {Object} payload
   * @private
   */
  getPayload_(platform) {
    if (this.rawPayload) {
      return this.payload;
    }

    let response = {};
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      response['google'] = this.payload;
    } else {
      const responsePlatform = V2_TO_V1_PLATFORM_NAME[platform] || platform;
      response[responsePlatform] = this.payload;
    }
    return response;
  }

  /**
   * Get the the response object of the payload
   *
   * @return {Object?} message payload, only if initialized with sendAsMessage
   * @private
   */
  getV1ResponseObject_() {
    if (!this.sendAsMessage) {
      return null;
    }

    let platform = V2_TO_V1_PLATFORM_NAME[this.platform] || this.platform;
    return {
      type: platform === 'google' ? 'custom_payload' : 4,
      platform: platform,
      payload: this.getPayload_(this.platform),
    };
  }

  /**
   * Get the the response object of the payload
   *
   * @return {Object?} message payload, only if initialized with sendAsMessage
   * @private
   */
  getV2ResponseObject_() {
    if (!this.sendAsMessage) {
      return null;
    }

    return {
      payload: this.getPayload_(this.platform),
      platform: this.platform,
    };
  }
}

module.exports = Payload;
