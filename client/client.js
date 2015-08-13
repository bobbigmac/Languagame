
//TODO: Should work with package- yogiben:tts. Needs to be integrated into glyph manager
//TODO: http://translate.google.com/translate_tts?ie=utf-8&tl=ja&q=%E3%81%AA.%E3%82%81%E3%82%8B
// Speak = function(what, lang, site) {
//   what = what||'tell me what to say';
//   lang = lang||'en';
//   site = site||'com';
//   console.log('speaking', what, lang, site);
//   tts.speak(what, lang, site);
// }

Template.glyphsetsrows.helpers({
  glyphsets: function(e, t) {
    var setsCursor = Glyphsets.find();
    if(setsCursor.count() === 3) {
      return setsCursor;
    }
  }
});

nudgeColumn = function(ind, nudges) {
  nudges = nudges || 1;
  for(nudged = 0; nudged < nudges; nudged++)
  {
    var columnCells = $('#glyphsetstable').find('tbody td:nth-child(' + (ind + 1) + ')');
    columnCells.each(function(pos, el) {
      var span = $(columnCells[pos]).children('span:last');
      var moveTo = pos + 1;
      moveTo = (moveTo >= columnCells.length ? 0 : moveTo);

      var moveToCell = $(columnCells[moveTo]);

      var detached = span.detach();
      moveToCell.prepend(detached);
    });
  }
};

nudgeColumns = function() {
  //glyphsetSet ready, randomise
  var columns = $('#glyphsetstable').find('tbody tr:first td');
  columns.each(function(pos, el) {
    el = $(el);
    var nudges = Math.floor(Math.random() * (columns.length * 2));

    nudgeColumn(el.index(), nudges);
  });
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

getNewGlyphsets = function() {
  $('#glyphsetstable td.incorrect').removeClass('incorrect');
  $('#glyphsetstable td.correct').removeClass('correct');

  //Session.set('loadingNewGlyphsets', true);
  window.setTimeout(function() {
    $('.fixed-message').removeClass('show');
    Session.set("atGlyphSet", !Session.get("atGlyphSet"));
  }, 1000);
};

changePlayerScore = function(by) {
  var userId = Meteor.userId();
  var score = 0;

  if(userId) {
    var user = Meteor.user();
    score = ((user && user.profile && user.profile.score)||score)+(by||0);
    
    Meteor.users.update(userId, { $set: { 'profile.score': score }});

    Session.set("playerScore", score);
  } else {
    Session.set("playerScore", Session.get("playerScore")+(by||0));
  }

  score = Session.get('playerScore');
  score = score <= 0 ? 1 : score;

  var endNum = (Session.get('startNum') + ((score * 2) + 4));
  Session.set('endNum', endNum);
}

Template.glyphsetstable.rendered = function() {
  $(document).keypress(function(e) {
    if(e.which >= 49 && e.which <= 52) {
      nudgeColumn(e.which - 49, 1);
    }
    if(e.which == 13) {
      $('.checkresults').trigger('click');
    }
  });
}

Template.glyphsetstable.helpers({
  endNum: function(e, t) {
    return Session.get('endNum')||5;
  },
  score: function(e, t) {
    return Session.get('playerScore')||0;
  }
});

Template.glyphsetstable.events({
  'click .checkresults': function (e, t) {
    var rows = $('tr.glyphsetrow td:last-child span').map(function(pos, el) {
      el = $(el);
      var glyphsetId = $(el).attr('glyphsetid');

      var res = $(el).parents('tr').find('td span[glyphsetid]').map(function(sPos, sEl) {
        sEl = $(sEl);
        var sParent = sEl.parent();
        var sGlyphsetId = sEl.attr('glyphsetId');

        var matches = (sGlyphsetId == glyphsetId);
        sParent.removeClass('correct');
        sParent.removeClass('incorrect');
        if(matches) {
          sParent.addClass('correct');
        }
        else
        {
          sParent.addClass('incorrect');
        }

        return matches;
      });

      var pass = true;
      for(var i=0; i<res.length && pass; i++) {
        if(!res[i]) {
          pass = false;
        }
      }
      return pass;
    });

    var pass = true;
    for(var i=0; i<rows.length && pass; i++) {
      if(!rows[i]) {
        pass = false;
      }
    }

    if(pass) {
      celebrateWin(/*getNewGlyphsets*/);
      changePlayerScore(1);
    }

    //changePlayerScore(pass ? 1 : -1);

    return pass;
  },
  // 'click .open-create-account': function() {
  //   $('#login-dropdown-list .dropdown-toggle').dropdown('toggle');
  // }
});

Template.glyphsetsrows.events({
  'click td': function (e, t) {
    var el = $(e.currentTarget);
    var ind = el.index();

    nudgeColumn(ind, 1);
  },
  'mouseover td': function (e, t) {
    var el = $(e.currentTarget);
    var ind = el.index();
    el.siblings().css('background-color', '#eee');
    el.parents('table').find('tbody td:nth-child(' + (ind + 1) + ')').css('background-color', '#ddd');
  },
  'mouseleave td': function (e, t) {
    var el = $(e.currentTarget);
    var ind = el.index();
    el.siblings().css('background-color', '');
    el.parents('table').find('tbody td:nth-child(' + (ind + 1) + ')').css('background-color', '');
  },
});

Template.notFound.rendered = function() {
  Router.go('/');
};
