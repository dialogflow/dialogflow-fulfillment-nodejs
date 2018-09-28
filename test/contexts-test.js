/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
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

'use strict';

// Enable dialogflow debug logging
// process.env.DEBUG = 'dialogflow:*';

const test = require('ava');

const Context = require('../src/contexts');

test('Test Context constructor', async (t) => {
  // TextResponse generic response
  let context = new Context();
  t.deepEqual(context.contexts, {});

  context = new Context(v1IncomingContexts);
  t.deepEqual(context.contexts, contextObjects);

  context = new Context(v2IncomingContexts, v2Session);
  t.deepEqual(context.contexts, contextObjects);
});

test('Test v1& v2 JSON output', async (t) => {
  // TextResponse generic response
  let context = new Context();
  t.deepEqual(context.getV1OutputContextsArray(), []);
  t.deepEqual(context.getV2OutputContextsArray(), []);

  context = new Context(v1IncomingContexts);
  t.deepEqual(context.getV1OutputContextsArray(), []);

  context = new Context();
  context.set(contextObject1);
  context.set(contextObject2);
  context.set(contextObject3);
  t.deepEqual(context.getV1OutputContextsArray(), v1IncomingContexts);

  context = new Context(v2IncomingContexts, v2Session);
  t.deepEqual(context.getV2OutputContextsArray(), []);

  context = new Context(null, v2Session);
  context.set(contextObject1);
  context.set(contextObject2);
  context.set(contextObject3);
  t.deepEqual(context.getV2OutputContextsArray(), v2IncomingContexts);
});

test('Test set method', async (t) => {
  // Set contexts using context objects
  let context = new Context();
  context.set(contextObject1);
  t.deepEqual(context.contexts['context name'], contextObject1);
  context.set(contextObject2);
  context.set(contextObject3);
  t.deepEqual(context.contexts, contextObjects);

  // Set contexts using method arguments
  context = new Context();
  context.set('context name', 0, {});
  t.deepEqual(context.contexts['context name'], contextObject1);
  context.set('another context name', 99, {parameter: 'value'});
  context.set(
    'yet another context name',
    4,
    {parameter: 'value', anotherParam: 'another value', yetAnotherParam: 'yet another value'}
  );
  t.deepEqual(context.contexts, contextObjects);

  // Overwriting existing context values with context objects
  context = new Context();
  context.set(contextObject1);
  t.deepEqual(context.contexts['context name'], contextObject1);
  // overwrite lifespan
  contextObject1.lifespan = 45;
  context.set(contextObject1);
  t.deepEqual(context.contexts['context name'], contextObject1);
  // overwrite parameters
  contextObject1.parameters = {param: 'value'};
  context.set(contextObject1);
  t.deepEqual(context.contexts['context name'], contextObject1);

  // Overwriting existing context values with method arguments
  context = new Context();
  context.set(contextObject2);
  t.deepEqual(context.contexts['another context name'], contextObject2);
  // overwrite lifespan
  contextObject2.lifespan = 45;
  context.set('another context name', 45);
  t.deepEqual(context.contexts['another context name'], contextObject2);
  // overwrite parameters
  contextObject2.parameters = {param: 'value'};
  context.set('another context name', null, {param: 'value'});
  t.deepEqual(context.contexts['another context name'], contextObject2);

  // Cleanup
  contextObject1 = {name: 'context name', lifespan: 0, parameters: {}};
  contextObject2 = {name: 'another context name', parameters: {parameter: 'value'}, lifespan: 99};
});

test('Test error for set method required argument', async (t) => {
  let context = new Context();
  const noNameDefinedError = t.throws(() => {
   context.set();
  });
  t.is(
    noNameDefinedError.message,
    'Required "name" argument must be a string or an object with a string attribute "name"'
  );
});

test('Test get method', async (t) => {
  // Get contexts set with constructor
  let context = new Context(v2IncomingContexts, v2Session);
  t.deepEqual(context.get('context name'), contextObject1);
  t.deepEqual(context.get('another context name'), contextObject2);
  t.deepEqual(context.get('yet another context name'), contextObject3);

  // Get contexts set with set (context object)
  context = new Context();
  context.set(contextObject3);
  t.deepEqual(context.get('yet another context name'), contextObject3);

  // Get contexts set with set (method parameters)
  context = new Context();
  context.set(
    'yet another context name',
    4,
    {parameter: 'value', anotherParam: 'another value', yetAnotherParam: 'yet another value'}
  );
  t.deepEqual(context.get('yet another context name'), contextObject3);
});

test('Test delete method', async (t) => {
  // delete with incoming contexts
  let context = new Context(v2IncomingContexts, v2Session);
  context.delete('another context name');
  t.deepEqual(context.contexts['another context name'].lifespan, 0);
  t.deepEqual(context.contexts['yet another context name'].lifespan, 4);

  // delete with contexts set via context object
  context = new Context();
  context.set(contextObject2);
  context.delete('another context name');
  t.deepEqual(context.contexts['another context name'].lifespan, 0);

  // delete with contexts set via method parameters
  context = new Context();
  context.set('another context name', 45, null);
  context.delete('another context name');
  t.deepEqual(context.contexts['another context name'].lifespan, 0);
});

test('Test context iterator', async (t) => {
  let context = new Context(v2IncomingContexts, v2Session);
  let i = 0;
  for (const ctx of context) {
    t.deepEqual(ctx, [contextObject1, contextObject2, contextObject3][i]);
    i++;
  }
});

test('Test _removeOutgoingContext method', async (t) => {
  let context = new Context(v2IncomingContexts, v2Session);
  context._removeOutgoingContext('another context name');
  t.deepEqual(context.contexts, {'context name': contextObject1, 'yet another context name': contextObject3});
});


// ---------------------------------------------------------------------------
//              Context test helper objects
// ---------------------------------------------------------------------------
let contextObject1 = {
  name: 'context name',
  lifespan: 0,
  parameters: {},
};

let contextObject2 = {
  name: 'another context name',
  parameters: {
    parameter: 'value',
  },
  lifespan: 99,
};

let contextObject3 = {
  name: 'yet another context name',
  parameters: {
    parameter: 'value',
    anotherParam: 'another value',
    yetAnotherParam: 'yet another value',
  },
  lifespan: 4,
};

const v1IncomingContexts = [
  {
    name: 'context name',
    parameters: {},
    lifespan: 0,
  },
  {
    name: 'another context name',
    parameters: {
      parameter: 'value',
    },
    lifespan: 99,
  },
  {
    name: 'yet another context name',
    parameters: {
      parameter: 'value',
      anotherParam: 'another value',
      yetAnotherParam: 'yet another value',
    },
    lifespan: 4,
  },
];

const v2Session = 'projects/project-id/agent/sessions/88d1...a0';

const v2IncomingContexts = [
  {
    name: 'projects/project-id/agent/sessions/88d1...a0/contexts/context name',
    parameters: {},
    lifespanCount: 0,
  },
  {
    name: 'projects/project-id/agent/sessions/88d1...a0/contexts/another context name',
    parameters: {
      parameter: 'value',
    },
    lifespanCount: 99,
  },
  {
    name: 'projects/project-id/agent/sessions/88d1...a0/contexts/yet another context name',
    parameters: {
      parameter: 'value',
      anotherParam: 'another value',
      yetAnotherParam: 'yet another value',
    },
    lifespanCount: 4,
  },
];

const contextObjects = {
  'context name': {
    name: 'context name',
    lifespan: 0,
    parameters: {},
  },
  'another context name': {
    name: 'another context name',
    parameters: {
      parameter: 'value',
    },
    lifespan: 99,
  },
  'yet another context name': {
    name: 'yet another context name',
    parameters: {
      parameter: 'value',
      anotherParam: 'another value',
      yetAnotherParam: 'yet another value',
    },
    lifespan: 4,
  },
};
