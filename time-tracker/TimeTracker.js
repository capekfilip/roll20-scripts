/**
 * TimeTracker.js
 *
 * @author Filip Čapek - capekfilip@capekfilip.cz
 * @version 0.1
 * @date September 28, 2015
 * @date updated September 28, 2015
 */
 
 var TimeTracker = (function() {
	'use strict'; 
	var version = 0.1,
	author = 'Filip Č.';
	
	var fields = {
		feedbackName: 'TimeTracker',
		// feedbackImg: 'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
	};
	
	var flags = {
		archive: false,
	};
	
	/**
	 * Init
	 */
	var init = function() {
		if (!state.timetracker)
			{state.timetracker = {};}
	};
	
	/**
	* Send feedback message
	*/
	var sendFeedback = function(msg) {
		var content = '/w GM '
				// + '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
				// 	+ '<img src="' + fields.feedbackImg + '">' 
				// + '</div>'
				+ msg;
			
		sendChat(fields.feedbackName,content,null,(flags.archive ? {noarchive:true}:null));
	};
	
	/**
	 * Send public message
	 */
	var sendPublic = function(msg) {
		if (!msg) 
			{return undefined;}
		var content = '/desc ' + msg;
		sendChat('',content,null,(flags.archive ? {noarchive:true}:null));
	}; 
	
	/**
	 * Handle chat message event
	 */ 
	var handleChatMessage = function(msg) { 
		var args = msg.content,
			senderId = msg.playerid,
			selected = msg.selected; 
			
		if (msg.type === 'api'
		&& playerIsGM(senderId)
		&& args.indexOf('!time') === 0) {
			args = args.replace('!time','').trim();
			if (args.indexOf('-help') === 0) {
				showHelp(); 
			} else if (args.indexOf('-init') === 0) {
				args = args.replace('-init','').trim();
				doInitTime(args);
			}else if (args.indexOf('-plus') === 0) {
				args = args.replace('-plus','').trim();
				doPlusTime(args);
			} else if (args.indexOf('-show') === 0) {
				doShowTime();   
			} else {
				sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
				showHelp(); 
			}
		}
	};
	
	/**
	 * Show help message
	 */ 
	var showHelp = function() {
		var content = 
			'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
					+'TimeTracker v'+version
				+'</div>'
				+'<div style="padding-left:10px;margin-bottom:3px;">'
					+'<p>Tracking ingame time.</p>'
				+'</div>'
				
				+'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: serif;">!time <i>-help</i></span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
		            	+'<p>This command displays the help.</p>'
		            +'</div>'
				+'</div>'
				+'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: serif;">!time <i>-init</i> time</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Set the current time.</p>'
			            +'This command requires 1 parameter:'
			            +'<ul>'
			            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
			            +'<b><span style="font-family: serif;">time</span></b> -- The numeric value of time in hours and minitues. Example <b>10:30</b>.'
			            +'</li> '
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: serif;">!time <i>-plus</i> time</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Add hours and minutes to current time.</p>'
			            +'This command requires 1 parameter:'
			            +'<ul>'
			            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
			            +'<b><span style="font-family: serif;">time</span></b> -- The numeric value of time in hours and minitues. Example <b>10:30</b>.'
			            +'</li> '
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: serif;">!time <i>-show</i></span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
		            	+'<p>This command displays the current time.</p>'
		            +'</div>'
				+'</div>'
   			+'</div>'; 

		sendFeedback(content); 
	};
	
	/**
	* First time entry
	*/
	var doInitTime = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 3) {
			sendError('Invalid time syntax');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
			
		var newTime = {
			hours: hours,
			minutes: minutes
		};
		
		state.timetracker = newTime;
		
		var content = 'Time has been set.';
		
		sendFeedback(content);
		doShowTime();
	};
	
	/**
	* Add how much time past from init
	*/
	var doPlusTime = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 3) {
			sendError('Invalid time syntax');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
		
		var oldTotalSeconds = (state.timetracker.hours * 3600) + (state.timetracker.minutes * 60);
		var newTotalSeconds = (hours * 3600) + (minutes * 60);
		
		var newTimeSeconds = oldTotalSeconds + newTotalSeconds;
		
		var newDays = Math.floor(newTimeSeconds / 86400);
		var newHours = Math.floor((newTimeSeconds % 86400) / 3600);
		var newMinutes = Math.floor(((newTimeSeconds % 86400) % 3600) / 60);	
					
		var newTime = {
			hours: newHours,
			minutes: newMinutes
		};
		
		state.timetracker = newTime;
		
		var content = 'Time has been updated.'
		
		sendFeedback(content);
		doShowTime();
	};
	
	/**
	 * Show current ingame time
	 */
	var doShowTime = function() {
		var disp = state.timetracker.hours+':'+state.timetracker.minutes;
		sendPublic(disp);
	}; 
	
	/**
	* Write to log if its ready
	*/
	var checkInstall = function() {
		log('-=> TimeTracker v'+version+' is ready! <=-');
	}; 
	
	 /**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
	};
 
	return {
		init: init,
		registerAPI: registerAPI,
		checkInstall: checkInstall
	};
	 
 }());

on("ready", function() {
	'use strict'; 
	TimeTracker.init(); 
	TimeTracker.registerAPI();
	TimeTracker.checkInstall();
});