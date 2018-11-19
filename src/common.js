/**
 * Copyright 2018 Google Inc. All Rights Reserved.
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
const {DialogflowConversation} = require('actions-on-google');

// Set library name for debug statements
const name = 'dialogflow-fulfillment';
// Setup debug library for error and debug statements
const debug = require('debug')(`${name}:debug`);
const error = require('debug')(`${name}:error`);
// bind error and debug to error and log consoles
error.log = console.error.bind(console);
debug.log = console.log.bind(console);

module.exports = {debug, error, DialogflowConversation};
