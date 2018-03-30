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
const v1MessageObjectImage = 3;

/**
 * Class representing a image response.
 * @extends RichResponse
 */
class Image extends RichResponse {
  /**
   * Constructor for Image object
   *
   * @example
   * const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
   * let image = new Image(imageUrl);
   * const anotherImage = new Image({
   *     imageUrl: imageUrl,
   *     platform: 'ACTIONS_ON_GOOGLE'
   * });
   *
   * @param {string|Object} image URL string or an object representing a image response
   */
  constructor(image) {
    super();
    if (image === undefined || (typeof image === 'object' && !image.imageUrl)) {
      throw new Error('image url string required by Image constructor');
    }
    if (typeof image === 'string') {
      this.imageUrl = image;
    } else if (typeof image === 'object') {
      this.imageUrl = image.imageUrl;
      if (
        typeof image.platform !== 'undefined' &&
        image.platform !== PLATFORMS.UNSPECIFIED
      ) {
        if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(image.platform) < 0) {
          throw new Error(`Platform '${image.platform}' not supported.`);
        } else {
          this.platform = image.platform;
        }
      }
    }
  }

  /**
   * Set the image for a Image
   *
   * @example
   * let image = new Image('https://example.com/placeholder.png');
   * image.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
   *
   * @param {string} imageUrl
   * @return {Image}
   */
  setImage(imageUrl) {
    if (typeof imageUrl !== 'string') {
      throw new Error('setImage requires a string of the image URL');
    }
    this.imageUrl = imageUrl;
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
      response = {
        type: 'basic_card',
        platform: V2_TO_V1_PLATFORM_NAME[platform],
      };
      if (this.imageUrl) {
        response.image = {};
        response.image.url = this.imageUrl;
        response.image.accessibilityText = 'accessibility text';
      }
    } else {
      response = {type: v1MessageObjectImage};
      if (this.imageUrl) response.imageUrl = this.imageUrl;
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
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
      // if it is and is not for the specific platform return null
      return null;
    }

    let response;
    if (platform === PLATFORMS.ACTIONS_ON_GOOGLE) {
      // If the platform is Actions on Google use a basic card response
      response = {basicCard: {}};
      response.platform = PLATFORMS.ACTIONS_ON_GOOGLE;
      if (this.imageUrl) {
        response.basicCard.image = {};
        response.basicCard.image.imageUri = this.imageUrl;
        response.basicCard.image.accessibilityText = 'accessibility text';
      }
    } else {
      response = {image: {}};
      if (this.imageUrl) {
        response.image.imageUri = this.imageUrl;
      }
      // response is the same for generic responses without the platform attribute
      // if the platform is not undefined or the platform is not unspecified
      if (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) > -1) {
        response.platform = platform;
      }
    }
    return response;
  }
}

module.exports = Image;
