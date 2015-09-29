<img style="float: right;" src="https://raw.githubusercontent.com/capekfilip/roll20-scripts/master/time-tracker/thumb.png" alt="TimeTracker">
# TimeTracker.js

Script for virtual tabletop web application Roll20.net. Tracking ingame time and events like lamps, torches and long duration spells (Mage Armor).

## Help

	!time -help
This command displays the help.

	!time -setformat &lt;timeformat&gt;
Set the show time format.

This command requires 1 parameter:
- **&lt;timeformat&gt;** -- The numeric value of time format. **Parametr must be only 12 or 24**. Default value is **24**. Example **12**.

	!time -set <hours>:<minutes>
Set the current time.

This command requires 2 parameters:
- **&lt;hours&gt;** -- The numeric value of hours. **Must be in 24-hours time format**. Example **10**.
- **&lt;minutes&gt;** -- The numeric value of minutes. Example **30**.


	!time -plus <hours>:<minutes>
Add hours and minutes to current time. This ammount of time is even automatically deductive from events duration.

This command requires 2 parameters:
- **&lt;hours&gt;** -- The numeric value of how much hours add to current time. Example **1**.
- **&lt;minutes&gt;** -- The numeric value of how much minutes add to current time. Example **28**.

	!time -show
This command displays the current time.

	!time -addevent <name>:<hours>:<minutes>
Add a event to list and automatically track it&apos;s duration if is used **!time plus** command.

This command requires 3 parameters:
- **&lt;name&gt;** -- String of the event name. Example **PC&apos;s Mage Armor**.
- **&lt;hours&gt;** -- The numeric value of how much hours duration event have. Example **8**.
- **&lt;minutes&gt;** -- The numeric value of how much minutes duration event have. Example **0**.

	!time -events
This command displays the active events and it&apos;s remaining duration.