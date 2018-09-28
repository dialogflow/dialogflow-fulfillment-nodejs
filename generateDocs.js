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

'use strict';

const fs = require('fs');
const path = require('path');
const jsdoc2md = require('jsdoc-to-markdown');

const inputFiles = ['./src/*.js', './src/rich-responses/*.js'];
const outputDir = './docs/';

const webhookFilename = 'webhook-client.md';
const webhookClientClassNames = ['WebhookClient', 'V2Agent', 'V1Agent', 'Context'];
const richResponseFilename = 'rich-responses.md'
const richRepsonseClassNames = [ 'RichResponse', 'Card', 'Suggestion', 'Image', 'Payload', 'Text'];

const templateData = jsdoc2md.getTemplateDataSync({files: inputFiles});

let output = ''
for (const className of webhookClientClassNames) {
  const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;
  output += jsdoc2md.renderSync({data: templateData, template: template});
  fs.writeFileSync(webhookFilename, output);
}

output = ''
for (const className of richRepsonseClassNames) {
  const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;
  output += jsdoc2md.renderSync({data: templateData, template: template});
  fs.writeFileSync(richResponseFilename, output);
}

exports.rewriteAnchor = function (anchor) {
  if (typeof anchor !== 'string') return null;
  return anchor.toLowerCase().replace('+', '_');
};
