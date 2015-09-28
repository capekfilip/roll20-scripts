/**
 * TimeTracker.js
 *
 * @author Filip Čapek - capekfilip@capekfilip.cz
 * @version 0.2
 * @date September 28, 2015
 * @date updated September 28, 2015
 */
 
 var TimeTracker = (function() {
	'use strict'; 
	var version = 0.2,
	author = 'Filip Č.';
	
	var fields = {
		feedbackName: 'TimeTracker',
		feedbackImg: 'https://raw.githubusercontent.com/capekfilip/roll20-scripts/master/time-tracker/thumb.png',
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
		if (!state.timetracker.timeformat)
			{state.timetracker.timeformat = 24;}
	};
	
	/**
	 * Send an error
	 */ 
	var sendError = function(msg) {
		sendFeedback('<span style="color: red; font-weight: bold;">'+msg+'</span>'); 
	}; 
	
	/**
	* Send feedback message
	*/
	var sendFeedback = function(msg) {
		var content = '/w GM '
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + fields.feedbackImg + '">' 
				+ '</div>'
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
			} else if (args.indexOf('-setformat') === 0) {
				args = args.replace('-setformat','').trim();
				doSetFormat(args);
			} else if (args.indexOf('-init') === 0) {
				args = args.replace('-init','').trim();
				doInitTime(args);
			} else if (args.indexOf('-plus') === 0) {
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
		            +'<b><span style="font-family: serif;">!time <i>-setformat</i> timeformat</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Set the show time format.</p>'
			            +'This command requires 1 parameter:'
			            +'<ul>'
			            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
			            +'<b><span style="font-family: serif;">timeformat</span></b> -- The numeric value of time format. <b>Parametr must be only 12 or 24.</b> Default value is 24. Example <b>12</b>.'
			            +'</li> '
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: serif;">!time <i>-init</i> time</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Set the current time.</p>'
			            +'This command requires 1 parameter:'
			            +'<ul>'
			            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
			            +'<b><span style="font-family: serif;">time</span></b> -- The numeric value of time in hours and minitues. <b>Must be in 24-hours time format.</b> Example <b>10:30</b>.'
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
			            +'<b><span style="font-family: serif;">time</span></b> -- The numeric value of time in hours and minitues. Example <b>1:23</b>.'
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
	* Set the current ingame time
	*/
	var doInitTime = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 3) {
			sendError('Invalid time syntax.');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
		
		if (isNaN(hours) || isNaN(minutes)) {
			sendError('Invalid time syntax.');
			return;
		}
			
		if (hours < 10) {
			var hours = '0'+hours;
		}
		
		if (minutes < 10) {
			var minutes = '0'+minutes;
		}	
			
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
			sendError('Invalid time syntax.');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
			
		if (isNaN(hours) || isNaN(minutes)) {
			doShowTime();
			return;
		} else {
			var oldTotalSeconds = (state.timetracker.hours * 3600) + (state.timetracker.minutes * 60);
			var newTotalSeconds = (hours * 3600) + (minutes * 60);
			
			var newTimeSeconds = oldTotalSeconds + newTotalSeconds;
			
			var newDays = Math.floor(newTimeSeconds / 86400);
			var newHours = Math.floor((newTimeSeconds % 86400) / 3600);
			var newMinutes = Math.floor(((newTimeSeconds % 86400) % 3600) / 60);
			
			if (newHours < 10) {
				var newHours = '0'+newHours;
			}
			
			if (newMinutes < 10) {
				var newMinutes = '0'+newMinutes;
			}	
						
			var newTime = {
				hours: newHours,
				minutes: newMinutes
			};
			
			state.timetracker = newTime;
			
			var content = 'Time has been updated.';
			
			sendFeedback(content);
			doShowTime();	
		}
	};
	
	/**
	 * Convert time to 12-hours
	 */
	 var timeConvert = function(time) {
		// Check correct time format and split into components
		time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
		
		if (time.length > 1) { // If time format correct
			time = time.slice (1);  // Remove full string match value
			time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
			time[0] = +time[0] % 12 || 12; // Adjust hours
		}
		return time.join (''); // return adjusted time or original string
	 };
	 
	/**
	 * Set show time format
	 */
	var doSetFormat = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 2) {
			sendError('Invalid time format syntax.');
			return;
		}
		
		var timeformat = parseInt(args[0]);
		
		if (timeformat != 24 && timeformat != 12) {
			sendError('Invalid time format syntax.');
			return;
		}
		
		state.timetracker.timeformat = timeformat;
		
		var content = 'Show format has been set to '+timeformat+'-hours time.';
		
		sendFeedback(content);
	};
	
	/**
	 * Show current ingame time
	 */
	var doShowTime = function() {
		var time = state.timetracker.hours+':'+state.timetracker.minutes;
		var disp = '<span style="text-align: center;">The current time is</span>'
			+'<br><span style="text-align: center; font-weight: bold; font-size: 150%">'+time+'</span>';
		
		if (state.timetracker.timeformat == 12) {
			var timeConverted = timeConvert(time);
			var dispConverted = '<span style="text-align: center;">The current time is</span>'
			+'<br><span style="text-align: center; font-weight: bold; font-size: 150%">'+timeConverted+'</span>';
			
			sendPublic(dispConverted);
		} else {
			sendPublic(disp);
		}
	}; 
	
	/**
	* Write to log if its ready
	*/
	var loadMessage = function() {
		log('-=> TimeTracker v'+version+' is ready! Show format is set to '+state.timetracker.timeformat+'-hours time. <=-');
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
		loadMessage: loadMessage
	};
	 
 }());

on("ready", function() {
	'use strict'; 
	TimeTracker.init(); 
	TimeTracker.registerAPI();
	TimeTracker.loadMessage();
});