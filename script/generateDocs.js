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

const templateData = jsdoc2md.getTemplateDataSync({files: inputFiles});
const classNames = templateData.reduce((classNames, identifier) => {
  if (identifier.kind === 'class') {
classNames.push(identifier.name);
};
  return classNames;
}, []);

for (const className of classNames) {
  const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;
  const output = jsdoc2md.renderSync({data: templateData, template: template});
  fs.writeFileSync(path.resolve(outputDir, `${className}.md`), output);
}
