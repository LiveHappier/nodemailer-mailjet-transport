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
  var sendEmail = this.mailjetClient.post('send');
  
  var data = mail.data || {};
  
  var email = {
    
  }
   
  email['Html-part']  = data.html || '';
  email['Text-part']  = data.text || '';
  email['Headers']    = data.headers || '';
  email['Subject']    = data.subject || '';

  // fetch envelope data from the message object
  var addresses = mail.message.getAddresses();
  
  var from = [].concat(addresses.from || addresses.sender || addresses['reply-to'] || []).shift();
  var to = [].concat(addresses.to || []);
  var cc = [].concat(addresses.cc || []);
  var bcc = [].concat(addresses.bcc || []);
  var recipients = to.concat(cc).concat(bcc)
      
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
  //email.to = to.map(function(rcpt) {
  //   return rcpt.address || '';
  //});

  //email.toname = to.map(function(rcpt) {
  //  return rcpt.name || '';
  //});

  // // populate cc and bcc arrays
  // email.cc = cc.map(function(rcpt) {
  //   return rcpt.address || '';
  // });

  // email.bcc = bcc.map(function(rcpt) {
  //   return rcpt.address || '';
  // });

  // // a list for processing attachments
  // var contents = [];

 

  sendEmail
  .request(email)
  .then(response => {
    callback(null, response)
  })
  .catch(err => {
    callback(err, null)
  });
}

