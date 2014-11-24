

UI.registerHelper('not', function (val) {
  return !val;
});
UI.registerHelper('equals', function (a, b) {
  return a == b;
});
UI.registerHelper('propOfObj', function (key, obj) {
  return obj[key];
});
var googleLangs = {
  e: 'en',
  tc: 'zh-TW',
  sc: 'zh-CN',
  j: 'ja',
};
UI.registerHelper('googleLangOf', function (lang) {
  return googleLangs[lang];
});

Session.setDefault("playerScore", 0);
Session.setDefault("atGlyphSet", 0);
Session.setDefault("startNum", 0);
Session.setDefault("endNum", 5);
Session.setDefault('loadingNewGlyphs', true);

/*Template.glyphsrows.helpers({
});*/

//TODO: Move to a collection (and make it cleverer)
var languages = [{ key: 'tc', name: 'Chinese (T)' }, 
    { key: 'sc', name: 'Chinese (S)' }, 
    { key: 'j', name: 'Japanese' }, 
    { key: 'e', name: 'English' }];
Template.glyphstable.langs = Template.glyphsrows.langs = function(e, t) {
  return languages;
}
Template.glyphstable.loaded = function(e, t) {
  return !Session.get('loadingNewGlyphs');
}
Template.glyphsrows.rendered = function() {
  window.setTimeout(nudgeColumns, 20);//bodgety bodge (shouldn't 'strictly' be necessary)
}
Template.glyphsrows.glyphs = function(e, t) {
  return glyphs.find();
}

function nudgeColumn(ind, nudges) {
  nudges = nudges || 1;
  for(nudged = 0; nudged < nudges; nudged++)
  {
    var columnCells = $('#glyphstable').find('tbody td:nth-child(' + (ind + 1) + ')');
    columnCells.each(function(pos, el) {
      var span = $(columnCells[pos]).children('span:last');
      var moveTo = pos + 1;
      moveTo = (moveTo >= columnCells.length ? 0 : moveTo);

      var moveToCell = $(columnCells[moveTo]);

      var detached = span.detach();
      moveToCell.prepend(detached);
    });
  }
}
function nudgeColumns() {
  //glyphSet ready, randomise
  var columns = $('#glyphstable').find('tbody tr:first td');
  columns.each(function(pos, el) {
    el = $(el);
    var nudges = Math.floor(Math.random() * (columns.length * 2));

    nudgeColumn(el.index(), nudges);
  });
}

function celebrateWin(cb) {
  $('.fixed-message').addClass('show');
  if(cb) {
    window.setTimeout(cb, 1000);
  }
}
function getNewGlyphs() {
  $('#glyphstable td.incorrect').removeClass('incorrect');
  $('#glyphstable td.correct').removeClass('correct');

  Session.set('loadingNewGlyphs', true);
  window.setTimeout(function() {
    $('.fixed-message').removeClass('show');
    Session.set("atGlyphSet", !Session.get("atGlyphSet"));
  }, 1000);
}
function changePlayerScore(by) {
  Session.set("playerScore", Session.get("playerScore")+(by||0));

  var score = Session.get('playerScore');
  score = score <= 0 ? 1 : score;
  
  var endNum = Session.get('startNum') + ((score * 2) + 4);
  Session.set('endNum', endNum);
}

Template.glyphstable.rendered = function() {
  $(document).keypress(function(e) {
    //console.log('e.which', e.which);
    if(e.which >= 49 && e.which <= 52) {
      nudgeColumn(e.which - 49, 1);
    }
    if(e.which == 13) {
      $('.checkresults').trigger('click');
    }
  });
}
Template.glyphstable.endNum = function(e, t) {
  return Session.get('endNum')||5;
}
Template.glyphstable.score = function(e, t) {
  return Session.get('playerScore')||0;
}
Template.glyphstable.events({
  'click .checkresults': function (e, t) {
    var rows = $('tr.glyphrow td:last-child span').map(function(pos, el) {
      el = $(el);
      var glyphId = $(el).attr('glyphid');

      var res = $(el).parents('tr').find('td span[glyphid]').map(function(sPos, sEl) {
        sEl = $(sEl);
        var sParent = sEl.parent();
        var sGlyphId = sEl.attr('glyphId');

        var matches = (sGlyphId == glyphId);
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
      celebrateWin(getNewGlyphs);
      changePlayerScore(1);
    }

    //changePlayerScore(pass ? 1 : -1);

    return pass;
  },
});

Template.glyphsrows.events({
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

Session.set('loadingNewGlyphs', true);

Tracker.autorun(function() {

  Meteor.subscribe('glyphSet', 
    Session.get('atGlyphSet'), 
    Session.get('startNum'), 
    Session.get('endNum'), 
    function(inArg) {
      Session.set('loadingNewGlyphs', false);
    });
});