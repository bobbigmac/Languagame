
Template.registeredUsers.events({
	'click .make-user-admin': function(event, template) {
		Meteor.users.update(this._id, { $addToSet: { roles: 'admin' }});
	},
	'click .demote-user-admin': function(event, template) {
		Meteor.users.update(this._id, { $pull: { roles: 'admin' }});
	}
});

Template.unaudioGlyphs.rendered = function() {
	// $(document).off('error');
	// $(document).on('error', function(e) {
	// 	console.log('error event', e);
	// });
};

Template.unaudioGlyphs.events({
  'click .frame-audio': function(event, template) {
  	var glyphId = this._id;
  	// console.log('glyphId', glyphId, this);
  	// return false;

    var audio = $('.my-audio').get(0);
    var anchor = $(event.currentTarget);
    if(anchor) {
      var url = anchor.attr('href');
      var filename = anchor.attr('download');
      if(url && filename) {
        if(!$('.my-frame').length) {
          $(document).append('<iframe class="my-frame"></iframe>');
        }
        var $frame = $('.my-frame');
        var frame = $frame.get(0);
        frame.src = url;
      }

      $('.my-frame').off('load');
      $('.my-frame').on('load', function() {
      	videoElement = frame.contentDocument.querySelector('html /deep/ video');
      	if(videoElement) {
	      	videoElement.addEventListener('ended', function(e) {
	      		var xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function() {
							if (this.readyState == 4 && this.status == 200) {
								//console.log(this);
	        			var fileUrl = window.URL.createObjectURL(this.response);
	        			audio.src = fileUrl;

					      var saved = Audios.insert(this.response, function (err, fileObj) {
					      	if(err) {
					      		console.log('error', err, 'removing', saved._id);
					      		if(saved && saved._id) {
						      		Audios.remove({ _id: saved._id });
						      	}
					      	} else {
					      		var glyphIds = [glyphId];
					      		if(glyphId.indexOf('sc_') === 0) {
					      			glyphIds.push(glyphId.replace('sc_', 'tc_'));
					      		}
					      		if(glyphId.indexOf('tc_') === 0) {
					      			glyphIds.push(glyphId.replace('tc_', 'sc_'));
					      		}
					      		
					      		var updates = glyphIds.reduce(function(prev, glyphId) {
							        if(Glyphs.update({ _id: glyphId }, {
							        	$set: {
							        		a: fileObj._id
							        	}
							        })) {
								        return prev+1;
								      }
								      return prev;
					      		}, 0);

						        if(updates) {
			        				audio.play();//verify sound file by playing it (again)

			        				//Next one...
			        				var seconds = (21+(17*Math.random()));
			        				console.log('got that one, getting another in', seconds, 'seconds');
			        				Meteor.setTimeout(function() {
			        					$('.frame-audio:first').trigger('click');
			        				}, seconds*1000);
			        			}
		        			}
					      });
							}
						};
						xhr.open('GET', e.srcElement.currentSrc);
	          xhr.setRequestHeader("Accept", "audio/mpeg");
						xhr.responseType = 'blob';
						xhr.send();
					});
				} else {
					console.log('No video element, try that one again');
				}
      });
    }
    //TODO: Want to catch document-level error for 'refused to display [url] in a frame'
    
    //To allow downloads, need to run with:
    //  google-chrome --disable-web-security 
    //Also needs to block referer: https://chrome.google.com/webstore/detail/referer-control/hnkcfpcejkafcihlgbojoidoihckciin?hl=en
    //return false;
  }
});

Template.unaudioGlyphs.helpers({
	unaudioGlyphs: function() {
		return Glyphs.find({ a: { $exists: false }}, { sort: { pop: 1 }});
	},
	unaudioCount: function() {
		return Counts.get('count-unaudio-glyphs')||0;
	},
	lang: function() {
		var lang = (this._id+'').split('_')[0];
		if(lang == 'sc' || lang == 'tc') {
			return 'cn';
		}
		return lang;
	},
  ttsUrl: function() {
		var lang = (this._id+'').split('_')[0];
    var gLang = googleLangs[lang];
    if(gLang) {
      return 'https://translate.google.com/translate_tts?ie=UTF-8&q='+this.value+'&tl='+gLang+'&total=1&idx=0&client=t&prev=input';
    }
  }
});

Template.adminStats.helpers({
	glyphCount: function() {
		return Counts.get('count-glyphs')||0;
	},
	unaudioCount: function() {
		return Counts.get('count-unaudio-glyphs')||0;
	},
	glyphsetCount: function() {
		return Counts.get('count-glyphsets')||0;
	},
	possibleCount: function() {
		return Counts.get('count-possible-glyphsets')||0;
	},
	userCount: function() {
		return Meteor.users.find().count();
	}
});

Template.registeredUsers.helpers({
	userScores: function() {
		var filter = {};
		if(Meteor.userId()) {
			//filter['_id'] = { $ne: Meteor.userId() };
		}
		return Meteor.users.find(filter, { sort: { 'profile.score': -1 }});
	}
});

Template.availableGlyphsets.events({
	'click .revive-glyphset': function() {
		if(this._id) {
			Glyphsets.update({ _id: this._id }, { $set: { live: true }, $unset: { rank: "" }});
		}
	},
	'click .delete-glyphset': function() {
		if(this._id) {
			Glyphsets.update({ _id: this._id }, { $set: { live: false }});
			Meteor.call('recalc-ranks');
		}
	},
});

Template.availableGlyphsets.helpers({
	glyphsets: function() {
		return Glyphsets.find({}, { sort: { rank: -1 }});
	},
	glyphsetCount: function() {
		return Glyphsets.find().count();
	}
});

function savePotential(_id, eng) {
	if(_id) {
		var params = {};
		if(eng) {
			params.eng = eng;
		}
		Meteor.call('import-possible', _id, params);
	}
}

Template.englishCell.events({
	'click .save-potential': function(event, template) {
		if(this) {
			var parentData = Template.parentData(3) || Template.parentData(2) || Template.parentData();
			if(parentData && parentData._id) {
				savePotential(parentData._id, ''+this);
			}
		}
		$('#adding-glyph-modal:visible').modal('hide');
	}
});

Template.addingModal.events({
	'keypress': btnPrimaryOnEnter,
	'click .delete-possible-glyph': function(event, template) {
		PossibleGlyphsets.update({ _id: this._id }, { $set: {
			hide: true
		}});
		template.$(template.find('.btn-default:last')).trigger('click');
	},
	'click .save-new-glyph': function(event, template) {
		var text = (template.find('.new-glyph-english').value);
		if(text) {
			savePotential(this._id, ''+text);
			template.$(template.find('.btn-default:last')).trigger('click');
		}
	},
	'shown.bs.modal': function(event, template) {
		template.$('input[type="text"]:first').focus().select();
	}
});

Template.possibleGlyphsets.events({
	'click .save-possible-glyphset': function(event, template) {
		Session.set('newGlyphId', this._id);
	}
});

Template.possibleGlyphsets.helpers({
	glyphsets: function() {
		return PossibleGlyphsets.find({}, { sort: { pop: 1 } });
	},
	glyphsetCount: function() {
		return PossibleGlyphsets.find().count();
	},
	allEngs: function() { return allEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); },
	bestEngs: function() { return bestEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); }
});

Template.addingModal.helpers({
	newGlyph: function() {
		var _id = Session.get('newGlyphId');
		if(_id) {
			return PossibleGlyphsets.findOne({ _id: _id });
		}
	},
	allEngs: function() { return allEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); },
	bestEngs: function() { return bestEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); }
});

Template.adminGlyphsetrow.events({
	'keypress input[type="text"]': function(event, template) {
		var key = event.which;
		if(key === 13) {
			var val = template.$(event.target).val();
			if(val) {
				var lang = this.key;
				var gs = Template.parentData(0);
				if(lang && gs && gs._id && val) {
					Meteor.call('set-glyphset-lang', gs._id, lang, val);
				}
			}
		}
	}
});

Template.adminGlyphsetrow.helpers({
	firstMissingLang: function(langs) {
		var gs = Template.parentData(1);
		for(var pos=0; pos < langs.length; pos++) {
			if(langs[pos]) {
				if(!gs[langs[pos]]) {
					return langs[pos].google;
				}
			}
		}
	}
});