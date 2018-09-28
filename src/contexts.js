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
const _ = require('lodash');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);

const DELETED_LIFESPAN_COUNT = 0; // Lifespan of a deleted context


/**
 * This is the class that handles Dialogflow's contexts for the WebhookClient class
 */
class Context {
  /**
   * Constructor for Context object
   * To be used in by Dialogflow's webhook client class
   * context objects take are formatted as follows:
   *   { "context-name": {
   *        "lifespan": 5,
   *        "parameters": {
   *          "param": "value"
   *        }
   *     }
   *   }
   *
   * @example
   * const context = new Context(inputContexts);
   * context.get('name of context')
   * context.set('another context name', 5, {param: 'value'})
   * context.delete('name of context') // set context lifespan to 0
   *
   * @param {Object} inputContexts input contexts of a v1 or v2 webhook request
   * @param {string} session for a v2 webhook request & response
   */
  constructor(inputContexts, session) {
    /**
     * Dialogflow contexts included in the request or empty object if no value
     * https://dialogflow.com/docs/contexts
     * @type {object}
     */
    this.contexts = {};
    this.session = session;
    if (inputContexts && session) {
      this.inputContexts = this._processV2InputContexts(inputContexts);
      this.contexts = this._processV2InputContexts(inputContexts);
    } else if (inputContexts) {
      this.contexts = this._processV1InputContexts(inputContexts);
      this.inputContexts = this._processV1InputContexts(inputContexts);
    }
  }
  // ---------------------------------------------------------------------------
  //              Public CRUD methods
  // ---------------------------------------------------------------------------
  /**
   * Set a new Dialogflow outgoing context: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.context.set('sample context name');
   * const context = {'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}};
   *
   * @param {string|Object} name of context or an object representing a context
   * @param {number} [lifespan=5] lifespan of context, number with a value of 0 or greater
   * @param {Object} [params] parameters of context (can be arbitrary key-value pairs)
   */
  set(name, lifespan, params) {
    if (!name || (typeof name !== 'string' && typeof name['name'] !== 'string')) {
      throw new Error('Required "name" argument must be a string or an object with a string attribute "name"');
    }
    if (typeof name !== 'string') {
      params = name['parameters'];
      lifespan = name['lifespan'];
      name = name['name'];
    }
    if (!this.contexts[name]) {
      this.contexts[name] = {name: name};
    }
    if (lifespan !== undefined && lifespan !== null) {
      this.contexts[name].lifespan = lifespan;
    }
    if (params !== undefined) {
      this.contexts[name].parameters = params;
    }
  }

  /**
   * Get an context from the Dialogflow webhook request: https://dialogflow.com/docs/contexts
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * let context = agent.context.get('sample context name');
   *
   * @param {string} name of an context present in the Dialogflow webhook request
   * @return {Object|null} context object with lifespan and parameters (if defined) or null
   */
  get(name) {
    return this.contexts[name];
  }
  /**
   * Delete an context a Dialogflow session (set the lifespan to 0)
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.context.delete('no-longer-relevant-context-name');
   *
   * @param {string} name of context to be deleted
   *
   * @public
   */
  delete(name) {
    this.set(name, DELETED_LIFESPAN_COUNT);
  }
  /**
   * Returns contexts as an iterator.
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * for (const context of agent.context) {
   *   // do something with the contexts
   * }
   *
   * @return {iterator} iterator of all context objects
   * @public
   */
  [Symbol.iterator]() {
    let contextArray = [];
    for (const contextName of Object.keys(this.contexts)) {
      contextArray.push(this.contexts[contextName]);
    }
    return contextArray[Symbol.iterator]();
    // suppose to be Array.prototype.values(), but can't use because of bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=615873
  }
  // ---------------------------------------------------------------------------
  //              Private methods
  // ---------------------------------------------------------------------------
  /**
   * Remove an context from Dialogflow's outgoing context webhook response
   * used to maintain compatibility with legacy clearContext methods
   *
   * @example
   * const { WebhookClient } = require('dialogflow-webhook');
   * const agent = new WebhookClient({request: request, response: response});
   * agent.context._removeOutgoingContext('no-longer-sent-context-name');
   *
   * @param {string} name of context to be removed from outgoing contexts
   *
   * @private
   */
  _removeOutgoingContext(name) {
    delete this.contexts[name];
  }
  // ---------------------------------------------------------------------------
  //              Private v2 <--> v1 translation methods
  // ---------------------------------------------------------------------------
  /**
   * Translate context object from v1 webhook request format to class format
   *
   * @param {Array} v1InputContexts to be used by the Contexts class
   *
   * @return {Object} internal representation of contexts
   * @private
   */
  _processV1InputContexts(v1InputContexts) {
    let contexts = {};
    for (let index = 0; index<v1InputContexts.length; index++) {
      const context = v1InputContexts[index];
      contexts[context['name']] = {
        name: context['name'],
        parameters: context['parameters'],
        lifespan: context['lifespan'],
      };
    }
    return contexts;
  }
  /**
   * Translate context object from v2 webhook request format to class format
   *
   * @param {Array} v2InputContexts to be used by the Contexts class
   *
   * @return {Object} internal representation of contexts
   * @private
   */
  _processV2InputContexts(v2InputContexts) {
    let contexts = {};
    for (let index = 0; index<v2InputContexts.length; index++) {
      let context = v2InputContexts[index];
      const name = context['name'].split('/')[6];
      contexts[name] = {
        name: name,
        lifespan: context['lifespanCount'],
        parameters: context['parameters']};
    }
    return contexts;
  }
  /**
   * Get array of context objects formatted for v1 webhook response
   *
   * @return {Object[]} array of v1 context objects for webhook response
   */
  getV1OutputContextsArray() {
    let v1OutputContexts = [];
    for (const ctx of this) {
      // Skip context if it is the same as the input context
      if (this.inputContexts &&
        this.inputContexts[ctx.name] &&
        _.isEqual(ctx, this.inputContexts[ctx.name])) {
        continue;
      }
      let v1Context = {name: ctx.name};
      if (ctx.lifespan !== undefined) {
        v1Context['lifespan'] = ctx.lifespan;
      }
      if (ctx.parameters) {
        v1Context['parameters'] = ctx.parameters;
      }
      v1OutputContexts.push(v1Context);
    }
    return v1OutputContexts;
  }
  /**
   * Get array of context objects formatted for v2 webhook response
   *
   * @return {Object[]} array of v2 context objects for webhook response
   */
  getV2OutputContextsArray() {
    let v2OutputContexts = [];
    for (const ctx of this) {
      // Skip context if it is the same as the input context
      if (this.inputContexts &&
        this.inputContexts[ctx.name] &&
        _.isEqual(ctx, this.inputContexts[ctx.name])) {
        continue;
      }
      let v2Context = {name: `${this.session}/contexts/${ctx.name}`};
      if (ctx.lifespan !== undefined) {
        v2Context['lifespanCount'] = ctx.lifespan;
      }
      if (ctx.parameters) {
        v2Context['parameters'] = ctx.parameters;
      }
      v2OutputContexts.push(v2Context);
    }
    return v2OutputContexts;
  }
}

module.exports = Context;
