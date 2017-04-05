'use strict';

var Mailjet = require('node-mailjet');
var packageData = require('../package.json');

module.exports = function(options) {
  return new MailjetTransport(options);
};

function MailjetTransport(options) {
  this.name = 'Mailjet';
  this.version = packageData.version;

  options = options || {};
  var auth = options.auth || {};
  this.mailjetClient = Mailjet.connect(auth.api_key, auth.api_secret);
}

MailjetTransport.prototype.send = function(mail, callback) {
  
  var data = mail.data || {};
 
  // fetch envelope data from the message object
  var addresses = mail.message.getAddresses();
  
  var from = [].concat(addresses.from || addresses.sender || addresses['reply-to'] || []).shift();
  var to = [].concat(addresses.to || []);
  var cc = [].concat(addresses.cc || []);
  var bcc = [].concat(addresses.bcc || []);
  var recipients = to.concat(cc).concat(bcc)
 
   var email = {
    
  }
   
  email['Html-part']  = data.html || '';
  email['Text-part']  = data.text || '';
  email['Headers']    = data.headers || '';
  email['Subject']    = data.subject || '';

  // populate from and fromname
  if (from) {
    if (from.address) {
       email['FromEmail'] = from.address;
    }

     if (from.name) {
        email['FromName'] = from.name;
     }
  }
  
  email['Recipients'] = recipients.map(function(rcpt) {
     return {
       Email : rcpt.address || '',
       Name : rcpt.name || '',
     };
  });


  // populate to and toname arrays
  email["To"] = to.map(function(rcpt) {
     return rcpt.address || '';
  }).join(";");

  
  // populate cc and bcc arrays
  email["Cc"] = cc.map(function(rcpt) {
    return rcpt.address || '';
  }).join(";");

  email["Bcc"] = bcc.map(function(rcpt) {
    return rcpt.address || '';
  }).join(";");


  this.mailjetClient
  .post('send')
  .request(email)
  .then(response => {
    callback(null, response)
  })
  .catch(err => {
    callback(err, null)
  });
}

