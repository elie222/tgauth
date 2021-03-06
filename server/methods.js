Meteor.methods({
	_TGtakeToken: function (token) {
		serverLoginCode = Math.random().toString(36).slice(-8);
		_TGSessions.upsert({
			token:token
		},{
			$set: {
				token:token,
				server_code:serverLoginCode,
				status:"open",
				dob: new Date()
			}
		});
		return serverLoginCode;
	},
	_TGlogin: function (botCode, userObj) {
		if(_TGSessions.findOne({server_code: botCode, status: "open"})) {
			var userId = null;
			var user = Meteor.users.findOne({'profile.tgId': userObj.profile.tgId});

			if ( !user ) {
				userId = Accounts.createUser(userObj);
			} else {
				userId = user._id;
			}

			var stampedLoginToken = Accounts._generateStampedLoginToken();

			Accounts._insertLoginToken(userId, stampedLoginToken);

			_TGSessions.update({server_code: botCode, status: "open"}, {
				$set: { dob: new Date(), status: "close" }
			});

			Streamy.broadcast(botCode, { token: stampedLoginToken.token });
			return 'ok';
		} else {
			return '';
		}
	}
});