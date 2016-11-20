/* 
 * Copyright (C) 2016 Matheus Castello
 * 
 *  There is no peace only passion
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * FLOW CONFIGS
 */
const DEBUG_DELETE = false;

/**
 * Request CPU AWAKE FOR THIS APP
 */
tizen.power.request("CPU", "CPU_AWAKE");

/**
 * Config the MproEntity DB
 */
MproEntity.enableIndexedDB();
MproEntity.indexedDBVersion = 2;

/**
 * Check if the app has called from app Control schedule
 */
var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
const isCalledFromSchedule = reqAppControl && reqAppControl.appControl.uri;

if (isCalledFromSchedule)
{
	tizen.power.turnScreenOn();
	navigator.vibrate(2000);
	alert(reqAppControl.appControl.uri);
}
else
{
	alert("OIA");
	console.log("The application was not launched with Application Control.");
	// could you run this in the correct time?
	/*var data = new Date(2016, 7, 29, 4, 8);
	var alarm = new tizen.AlarmAbsolute(data);
	var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/view", "http://www.tizen.org");
	tizen.alarm.add(alarm, "JeVm8ef038.MyTimeClock", appControl);*/
}

/**
 * TAU page controll events
 */
(function() {

	var page = document.getElementById("pageIndicatorPage") || document.getElementById("pageIndicatorCirclePage"),
	changer = document.getElementById("hsectionchanger"),
	sections = document.querySelectorAll("section"),
	sectionChanger,
	elPageIndicator = document.getElementById("pageIndicator"),
	pageIndicator,
	pageIndicatorHandler;

	page.addEventListener( "pagebeforeshow", function() {
		// make PageIndicator
		pageIndicator =  tau.widget.PageIndicator(elPageIndicator, { numberOfPages: sections.length });
		pageIndicator.setActive(0);
		// make SectionChanger object
		sectionChanger = new tau.widget.SectionChanger(changer, {
			circular: true,
			orientation: "horizontal",
			useBouncingEffect: true,
		});
	});

	page.addEventListener( "pagehide", function() {
		// release object
		sectionChanger.destroy();
		pageIndicator.destroy();
	});

	pageIndicatorHandler = function (e) {
		pageIndicator.setActive(e.detail.active);
	};

	changer.addEventListener("sectionchange", pageIndicatorHandler, false);

	/**
	 * Query for the entries for today
	 */
	function listToday()
	{
		// clear list
		$("#listToday").html("");
		
		var dtt = new Date();
		var dtn = new Date();
		dtt.setHours(0, 0, 0, 0);

		// select * from TimeClock where TimeClock.Time between datezero and datenow
		var q = MproEntity.query(TimeClock);
			q.where(TimeClock.class.Time.field)
					.between(dtt.getTime(), dtn.getTime())
				.execute(
					function(r)
					{
						for(var i = 0; i < r.length; i++)
						{
							var dt = new Date(r[i].Time);
							
							$("#listToday").append(
								"<span class='" + (r[i].In ? 'in' : 'out') + "'>" +
								((dt.getHours()<10?'0':'') + dt.getHours()) + ":" + ((dt.getMinutes()<10?'0':'') + dt.getMinutes()) + ":" + ((dt.getSeconds()<10?'0':'') + dt.getSeconds()) + "<br>" +
								"</span>"
							);
			
							if(i % 2)
							{
								var delta = r[i].Time - r[i-1].Time;
			
								var seconds = Math.floor((delta)/1000);
								var minutes = Math.floor(seconds/60);
								var hours = Math.floor(minutes/60);
								var days = Math.floor(hours/24);
			
								hours = hours-(days*24);
								minutes = minutes-(days*24*60)-(hours*60);
								seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
			
								$("#listToday").append(
									"<span class='total'>" +
									((hours<10?'0':'') + hours) + ":" + ((minutes<10?'0':'') + minutes) + ":" + ((seconds<10?'0':'') + seconds) + "<br>" +
									"</span>"
								);
							}
						}
					}
				);
	}

	/**
	 * Handle bessel events
	 */
	document.addEventListener("rotarydetent", function(event)
	{
		var besselRight = (event.detail.direction === "CW");
		var besselLeft = (event.detail.direction === "CCW");
		var activeSection = sectionChanger.getActiveSectionIndex();
		
		if (besselRight) 
		{ 
			// to next stage
			if (activeSection < sections.length - 1)
			{
				sectionChanger.setActiveSection(activeSection + 1, 30);
			}
			else // end
				navigator.vibrate(100);
		} 
		else if(besselLeft)
		{
			// to previous stage
			if (activeSection > 0)
			{
				sectionChanger.setActiveSection(activeSection - 1, 30);
			}
			else // end
				navigator.vibrate(100);
		}

		// if the stage is the list of entries
		if(sectionChanger.getActiveSectionIndex() == 1)
		{
			// get the actual date and clear list
			var dt = new Date();
			$("#dtToday").text(dt.getDate() + "/" + (parseInt(dt.getMonth()) + 1) + "/" + dt.getFullYear());
			
			listToday();
		}

	}, false);

	/**
	 * Handle 
	 */
	document.addEventListener('tizenhwkey', function(e) {
		if(e.keyName == "back")
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
	});

	if(DEBUG_DELETE)
		MproEntity.getAll(TimeClock, function(r)
		{
			for(var i = 0; i < r.length; i++)
			{
				r[i].Delete();
			}
		});

	/**
	 * Handle check in click
	 */
	$("#timeClockIn").click(function()
	{
		MproEntity.getAll(TimeClock, function(res)
		{
			if(res.length)
			{
				// verify if the last entry is an out
				if(res[res.length -1].In)
				{
					alert("Clock Out Expected!");
				}
				else
				{
					// the last entry is an out then save new in
					var tc = new TimeClock();
					tc.Time = Date.now();
					tc.In = true;
					tc.Save();
					alert("Saved");
				}
			}
			else
			{
				// has no entrys then ok save new in
				var tc = new TimeClock();
				tc.Time = Date.now();
				tc.In = true;
				tc.Save();
				alert("Saved");
			}
		});
	});

	/**
	 * Handle check out click
	 */
	$("#timeClockOut").click(function()
	{
		MproEntity.getAll(TimeClock, function(res)
		{
			if(res.length)
			{
				// verify if the last entry is an in
				if(res[res.length -1].Out)
				{
					alert("Clock In Expected!");
				}
				else
				{
					// the last entry is an in then save new out
					var tc = new TimeClock();
					tc.Time = Date.now();
					tc.Out = true;
					tc.Save();
					alert("Saved");
				}
			}
			else
			{
				// has no entries then an in has to be done
				alert("Clock In Expected!");
			}
		});
	});
}()); // end of TAU
