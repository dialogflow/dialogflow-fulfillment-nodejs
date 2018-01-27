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

const functions = require('firebase-functions');
const WebhookClient = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug';

// Dialogflow action names
const WELCOME_ACTION = 'input.welcome';
const CONVERT_COMMON_TEMP = 'convert.common.temperature';
const CONVERT_ABSOLUTE_TEMP = 'convert.absolute.temperature';
const FALLBACK_ACTION = 'input.unknown';

// Wikipedia link and image URLs
const wikipediaTemperatureUrl = 'https://en.wikipedia.org/wiki/Temperature';
const wikipediaTemperatureImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Thermally_Agitated_Molecule.gif';
const wikipediaCelsiusUrl = 'https://en.wikipedia.org/wiki/Celsius';
const wikipediaCelsiusImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Celsius_original_thermometer.png';
const wikipediaFahrenheitUrl = 'https://en.wikipedia.org/wiki/Fahrenheit';
const wikipediaFahrenheitImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Fahrenheit_small.jpg';
const wikipediaKelvinUrl = 'https://en.wikipedia.org/wiki/Kelvin';
const wikipediaKelvinImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lord_Kelvin_photograph.jpg';
const wikipediaRankineUrl = 'https://en.wikipedia.org/wiki/Rankine_scale';
const wikipediaRankineImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/58/Rankine_William_signature.jpg';

exports.dialogflowFulfillmentAdvancedSample = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.addText(`Welcome to the temperature converter!`);
    agent.addCard(agent.buildCard(`Vibrating molecules`)
        .setImage(wikipediaTemperatureImageUrl)
        .setText(`Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`)
        .setButton({text: 'Temperature Wikipedia Page', url: wikipediaTemperatureUrl})
    );
    agent.addText(`I can convert Celsuis to Fahrenheit and Fahrenheit to Celsius!`);
    agent.addText(`What temperature would you like to convert?`);
    agent.addSuggestion(`27° Celsius`);
    agent.addSuggestion(`-40° Fahrenheit`);
    agent.addSuggestion(`Cancel`);
    agent.send();
  }

  function convertFahrenheitAndCelsius(agent) {
    // Get parameters from Dialogflow to convert
    const temperature = agent.parameters.temperature;
    const unit = agent.parameters.unit;
    console.log(`User requested to convert ${temperature}° ${unit}`)

    let convertedTemp, convertedUnit, temperatureHistory;
    if (unit === `Celsius`) {
      convertedTemp = temperature*(9/5) + 32;
      convertedUnit = `Fahrenheit`;
      temperatureHistory = agent.buildCard(`Fahrenheit`)
        .setImage(wikipediaFahrenheitImageUrl)
        .setText(`Daniel Gabriel Fahrenheit, invented the Fahrenheit scale (first widely used, standardized temperature scale) and the mercury thermometer.`)
        .setButton({text: 'Fahrenheit Wikipedia Page', url: wikipediaFahrenheitUrl})
    } else if (unit === `Fahrenheit`) {
      convertedTemp = (temperature-32)*(5/9);
      convertedUnit = `Celsius`;
      temperatureHistory = agent.buildCard(`Celsius`)
        .setImage(wikipediaCelsiusImageUrl)
        .setText(`The original Celsius thermometer had a reversed scale, where 100 is the freezing point of water and 0 is its boiling point.`)
        .setButton({text: 'Celsius Wikipedia Page', url: wikipediaCelsiusUrl})
    }

    // Sent the context to store the parameter information
    // and make sure the followup Rankine
    agent.setContext({
      name: 'temperature',
      lifespan: 1,
      parameters:{temperature: temperature, unit: unit}
    })

    // Compile and send response
    agent.addText(`${temperature}° ${unit} is  ${convertedTemp}° ${convertedUnit}`)
    agent.addCard(temperatureHistory)
    agent.addText(`Would you like to know what this temperature is in Kelvin or Rankine?`)
    agent.addSuggestion(`Kelvin`);
    agent.addSuggestion(`Rankine`);
    agent.addSuggestion(`Cancel`);
    agent.send();
  }

  function convertRankineAndKelvin(agent) {
    const secondUnit = agent.parameters.absoluteTempUnit;
    const tempContext = agent.getContext('temperature');
    const originalTemp = tempContext.parameters.temperature;
    const originalUnit = tempContext.parameters.unit;

    // Convert temperature
    let convertedTemp, convertedUnit, temperatureHistoryText, temperatureHistoryImage
    if (secondUnit === `Kelvin`) {
      convertedTemp = originalTemp === 'Celsius' ? originalTemp + 273.15 : (originalTemp-32)*(5/9) + 273.15;
      convertedUnit = `Kelvin`;
      temperatureHistoryText = agent.buildText('Here is a picture of the namesake of the Rankine unit, William John Macquorn Rankine:')
      temperatureHistoryImage = agent.buildImage(wikipediaKelvinImageUrl);
    } else if (secondUnit === `Rankine`) {
      convertedTemp = originalTemp === 'Fahrenheit' ? originalTemp + 459.67 : originalTemp*(9/5) + 32 + 459.67; 
      convertedUnit = `Rankine`;
      temperatureHistoryText = agent.buildText('Here is a picture of the namesake of the Kelvin unit, Lord Kelvin:')
      temperatureHistoryImage = agent.buildImage(wikipediaRankineImageUrl);
    }

    // Set `temperature` context lifetime to zero
    // to reset the conversational state and parameters
    agent.setContext({name: 'temperature', lifespan: 0})

    // Compile and send response
    agent.addText(`${originalTemp}° ${originalUnit} is  ${convertedTemp}° ${convertedUnit}`)
    agent.addText(temperatureHistoryText)
    agent.addImage(temperatureHistoryImage)
    agent.addText(`Go ahead and say another temperature to get the conversion.`)
    agent.addSuggestion(`27° Celsius`);
    agent.addSuggestion(`-40° Fahrenheit`);
    agent.addSuggestion(`Cancel`);
    agent.send();
  }

  function fallback(agent) {
    agent.addText(`Woah! Its getting a little hot in here.`);
    agent.send(`I didn't get that, can you try again?`);
  }

  let actionMap = new Map();
  actionMap.set(WELCOME_ACTION, welcome);
  actionMap.set(CONVERT_COMMON_TEMP, convertFahrenheitAndCelsius);
  actionMap.set(CONVERT_ABSOLUTE_TEMP, convertRankineAndKelvin);
  actionMap.set(FALLBACK_ACTION, fallback);
  agent.handleRequest(actionMap);
});
