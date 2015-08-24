
audioTimeout = false;
playAudioForSpan = function(span) {
  //console.log('want to play', span.attr('audio'));
  if(span && !Session.get('mute-audio')) {
    span.parents('table,.row').find('.playing').removeClass('playing');

    var audioUrl = span.attr('audio');
    if(audioUrl) {
      var $audio = $('.global-audio');
      var audio = $audio.get(0);
      if(audio) {
        audio.src = audioUrl;
        //TODO: Might need to setup load binding once live
        $audio.off('playing');
        $audio.on('playing', function() {
          span.addClass('playing');
        });
        $audio.off('ended suspend error emptied interruptbegin pause seeked waiting');
        $audio.on('ended suspend error emptied interruptbegin pause seeked waiting', function(e) {
          span.removeClass('playing');
        });

        audio.play();
      }
    }
  }
};


celebrateWin = function(cb) {
  $('.fixed-message').addClass('show');
  if(cb) {
    window.setTimeout(cb, 1000);
  } else {
    window.setTimeout(function() {
      $('.fixed-message').removeClass('show');
    }, 1000);
  }
};

changePlayerScore = function(by, scoreLangs, lastGlyphset) {
  var userId = Meteor.userId();
  var score = 0;

  if(userId) {
    var user = Meteor.user();
    score = ((user && user.profile && user.profile.score)||score)+(by||0);
    
    var set = { 'profile.score': score };
    if(lastGlyphset) {
      set['profile.lastPair'] = lastGlyphset;
    }
    var update = {
      $set: set
    };
    var incs = {}, incCount = 0;
    if(scoreLangs) {
      Object.keys(scoreLangs).forEach(function(gsId) {
        Object.keys(scoreLangs[gsId]).forEach(function(lang) {
          incs['strength.'+gsId+'.'+lang] = scoreLangs[gsId][lang];
          incCount++;
        });
      });
    }
    if(incCount) {
      update['$inc'] = incs;
    }
    Meteor.users.update(userId, update);

    Session.set("playerScore", score);
  } else {
    Session.set("playerScore", Session.get("playerScore")+(by||0));
  }

  score = Session.get('playerScore');
  score = score <= 0 ? 1 : score;
};



Template.languageSelection.events({
  'click .toggle-language': function(e, t) {
    var lang = (''+this);
    var langs = Session.get('langs');
    var langPos = (langs && langs.indexOf && langs.indexOf(lang));
    if(langPos > -1) {
      langs.splice(langPos, 1);
    } else {
      langs.push(lang);
    }

    var userId = Meteor.userId();
    if(userId) {
      Meteor.users.update(userId, { $set: { 'profile.langs': langs }});
    }
    Session.set('langs', langs);
  }
});

