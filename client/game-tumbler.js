
nudgeColumn = function(ind, nudges, playAudio) {
  nudges = nudges || 1;
  for(nudged = 0; nudged < nudges; nudged++)
  {
    var columnCells = $('#tumbler').find('tbody td:nth-child(' + (ind + 1) + ')');
    columnCells.each(function(pos, el) {
      var span = $(columnCells[pos]).children('span:last');
      if(playAudio && pos === 0) {
        if(audioTimeout) {
          Meteor.clearTimeout(audioTimeout);
          audioTimeout = false;
        }
        audioTimeout = Meteor.setTimeout(function() {
          playAudioForSpan(span);
        }, 300);
      }
      var moveTo = pos + 1;
      moveTo = (moveTo >= columnCells.length ? 0 : moveTo);

      var moveToCell = $(columnCells[moveTo]);

      var detached = span.detach();
      moveToCell.prepend(detached);
    });
  }
};

nudgeColumns = function() {
  var columns = $('#tumbler').find('tbody tr:first td');
  columns.each(function(pos, el) {
    el = $(el);
    var nudges = Math.floor(Math.random() * (columns.length * 2));

    nudgeColumn(el.index(), nudges);
  });
};


Template.tumbler.rendered = function() {
  $(document).off('keypress');
  $(document).keypress(function(e) {
    if(e.which >= 49 && e.which <= 57) {
      nudgeColumn(e.which - 49, 1, true);
    }
    if(e.which == 13) {
      $('.checkresults').trigger('click');
    }
  });
}

Template.tumbler.helpers({
  score: function(e, t) {
    return Session.get('playerScore')||0;
  },
  glyphsets: function(e, t) {
    var glyphsetset = Glyphsetsets.findOne();
    return (glyphsetset && glyphsetset.sets);
  },
  loading: function() {
    return Session.get('loading');
  },
  muted: function() {
    return Session.get('mute-audio');
  }
});

Template.tumbler.events({
  'click .mute-audio': function (e, t) {
    Session.set('mute-audio', !Session.get('mute-audio'));
    return Session.get('mute-audio');
  },
  'click .checkresults': function (e, t) {
    var self = this;
    //TODO: want to have this work from data-model
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

    var pass = (rows.length > 1 ? true : false);
    for(var i=0; i<rows.length && pass; i++) {
      if(!rows[i]) {
        pass = false;
      }
    }

    var langs = Session.get('langs');
    if(!langs || (langs && langs.length < 2)) {
      pass = false;
    }

    if(pass) {
      var glyphsetsets = Glyphsetsets.findOne();
      var sets = glyphsetsets && glyphsetsets.sets;
      var langKeys = ['j', 'k', 'e', 'sc', 'tc', 'pt', 'es', 'fr'];
      var scoreLangs = false;

      if(sets) {
        scoreLangs = {};
        sets.forEach(function(set) {
          var langs = _.intersection(langKeys, Object.keys(set));
          scoreLangs[set._id] = {};
          langs.forEach(function(lang) {
            scoreLangs[set._id][lang] = 1;
          });
        });
      }

      Session.set('loading', true);
      celebrateWin();
      changePlayerScore(1, scoreLangs);
    }

    return pass;
  }
});

Template.glyphsetsrows.events({
  'click td': function (e, t) {
    var el = $(e.currentTarget);
    var ind = el.index();

    //This plays the glyph that was clicked.
    //var span = el.find('span[audio]');
    //playAudioForSpan(span);

    nudgeColumn(ind, 1);

    if(audioTimeout) {
      Meteor.clearTimeout(audioTimeout);
      audioTimeout = false;
    }
    audioTimeout = Meteor.setTimeout(function() {
      //This plays the glyph that was moved into the place that was clicked (so the one that plays is the one the mouse pointer is over)
      var span = el.find('span[audio]');
      playAudioForSpan(span);
    }, 300);
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

var nudgeColumnsTimer = false;
Template.glyphsetsrow.rendered = function() {
  if(nudgeColumnsTimer) {
    Meteor.clearTimeout(nudgeColumnsTimer);
    nudgeColumnsTimer = false;
  }
  nudgeColumnsTimer = Meteor.setTimeout(nudgeColumns, 30);
};

