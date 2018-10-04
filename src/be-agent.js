const V2Agent = require('./v2-agent');
const debug = require('debug')('dialogflow:debug');

class BEAgent extends V2Agent {
    sendResponses_(requestSource) {
        let responseJson = this.responseJson_;
        if (!responseJson) {
          throw new Error(`No responses defined for platform: ${requestSource}`);
        }
    
        responseJson.outputContexts = this.agent.context.getV2OutputContextsArray();
        if (this.agent.followupEvent_) {
          responseJson.followupEventInput = this.agent.followupEvent_;
        }
        if (this.agent.endConversation_) {
          responseJson.triggerEndOfConversation = this.agent.endConversation_;
        }
    
        debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
        return responseJson;
    }
}

module.exports = BEAgent;
