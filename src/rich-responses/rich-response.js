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

// All platforms
const PLATFORMS = {
  UNSPECIFIED: 'PLATFORM_UNSPECIFIED',
  FACEBOOK: 'FACEBOOK',
  SLACK: 'SLACK',
  TELEGRAM: 'TELEGRAM',
  KIK: 'KIK',
  SKYPE: 'SKYPE',
  LINE: 'LINE',
  VIBER: 'VIBER',
  ACTIONS_ON_GOOGLE: 'ACTIONS_ON_GOOGLE',
};

// All platform values
const SUPPORTED_PLATFORMS = Object.keys(PLATFORMS).map((key) => PLATFORMS[key]);

// Platforms that support Rich messaging
const SUPPORTED_RICH_MESSAGE_PLATFORMS = [
  PLATFORMS.FACEBOOK,
  PLATFORMS.SLACK,
  PLATFORMS.TELEGRAM,
  PLATFORMS.KIK,
  PLATFORMS.SKYPE,
  PLATFORMS.LINE,
  PLATFORMS.VIBER,
  PLATFORMS.ACTIONS_ON_GOOGLE,
];

// Map from v2 platform names to v1 platform names
let V2_TO_V1_PLATFORM_NAME = {};
V2_TO_V1_PLATFORM_NAME[PLATFORMS.FACEBOOK] = 'facebook';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.SLACK] = 'slack';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.TELEGRAM] = 'telegram';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.KIK] = 'kik';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.SKYPE] = 'skype';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.LINE] = 'line';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.VIBER] = 'viber';
V2_TO_V1_PLATFORM_NAME[PLATFORMS.ACTIONS_ON_GOOGLE] = 'google';

// Map from v1 platform names to v2 platform names
const V1_TO_V2_PLATFORM_NAME = {
  facebook: PLATFORMS.FACEBOOK,
  slack: PLATFORMS.SLACK,
  slack_testbot: PLATFORMS.SLACK,
  telegram: PLATFORMS.TELEGRAM,
  kik: PLATFORMS.KIK,
  skype: PLATFORMS.SKYPE,
  line: PLATFORMS.LINE,
  viber: PLATFORMS.VIBER,
  google: PLATFORMS.ACTIONS_ON_GOOGLE,
};

/**
 * Class representing a rich response
 *
 * These classes construct v1&v2 message objects for Dialogflow
 * v1 Message object docs:
 * https://dialogflow.com/docs/reference/agent/message-objects
 * v2 Message object docs:
 * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
 */
class RichResponse {
  /**
   * Set the platform for a specific RichResponse (optional)
   *
   * @example
   * let richResponse = new RichResponse();
   * richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
   *
   * @param {string} platform representing desired rich response target platform
   * @return {RichResponse}
   */
  setPlatform(platform) {
    if (
      typeof platform !== 'string' ||
      (SUPPORTED_RICH_MESSAGE_PLATFORMS.indexOf(platform) < 0 &&
        platform !== PLATFORMS.UNSPECIFIED)
    ) {
      throw new Error(`Platform '${platform}' not supported.`);
    }
    this.platform = platform;
    return this;
  }
}

module.exports = {
  RichResponse,
  PLATFORMS,
  SUPPORTED_PLATFORMS,
  SUPPORTED_RICH_MESSAGE_PLATFORMS,
  V2_TO_V1_PLATFORM_NAME,
  V1_TO_V2_PLATFORM_NAME,
};
