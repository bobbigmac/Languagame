//SEE https://github.com/ongoworks/meteor-security

Security.defineMethod("ownerIsLoggedInUser", {
  fetch: ['owner'],
  deny: function (type, arg, userId, doc) {
    return userId !== doc.owner;
  }
});

Security.defineMethod("ownerIsNotLoggedInUser", {
  fetch: ['owner'],
  deny: function (type, arg, userId, doc) {
    return userId === doc.owner;
  }
});

Security.defineMethod("ownerUpdate", {
  fetch: ['owner'],
  deny: function (type, arg, userId, doc, fields, modifier) {
    var allowedFields = ['target'];
    var okay = fields.every(function(field) {
      return allowedFields.indexOf(field) > -1;
    });
    return !okay;
  }
});

Security.defineMethod("idIsLoggedInUser", {
  fetch: ['_id'],
  deny: function (type, arg, userId, doc) {
    return userId !== doc._id;
  }
});

// Sets the owner property of document, and sets created date.
Security.defineMethod("setOwnerUser", {
  fetch: ['created', 'owner', 'modified', 'owner'],
  deny: function (type, arg, userId, doc) {
    doc.owner = userId;
    if(!doc.created) {
	    doc.created = new Date();
  	}
  	doc.modified = new Date();
    return false;
  }
});
