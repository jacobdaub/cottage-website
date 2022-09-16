const monthProperties = Object.freeze([
  { name: "January", days: 31 },
  { name: "February", days: 28 },
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 }
]);

const weekdayNames = Object.freeze(["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"]);

/*
 * Create a div representing a calendar. The style of the days in the
 * calendar can be configured.
 *
 * Param:
 * monthName: the name of the month (ie. "July")
 * numDays: number of days in the month (28, 30, 31)
 * startOffset: an int weekday offset of the first day of the month (0-6)
 * classNames: an array where each element, if defined, will be used as the
 *             css class name for that day in the month
 *
 * Returns:
 * The calendar div element.
 */
function createCalendarElement(monthName, numDays, startOffset, classNames)
{
  var div = document.createElement("div");

  // Month
  var monthDiv = document.createElement("div");
  var monthNode = document.createTextNode(monthName);
  monthDiv.classList.add("month-name");
  monthDiv.appendChild(monthNode);
  div.appendChild(monthDiv);

  // Weekdays
  var weekdayList = document.createElement("ul");
  weekdayList.classList.add("weekdays");
  weekdayNames.forEach(function(dayName) {
    var dayItem = document.createElement("li");
    var dayText = document.createTextNode(dayName);
    dayItem.appendChild(dayText);
    weekdayList.appendChild(dayItem);
  });
  div.appendChild(weekdayList);
  
  // Days
  var dayList = document.createElement("ul");
  dayList.classList.add("days");

  // Unnumbered days, accounting for offset:
  for (var i = 0; i < startOffset; i++)
  {
    var dayItem = document.createElement("li");
    var dayText = document.createTextNode("");
    dayItem.appendChild(dayText);
    dayList.appendChild(dayItem);
  }

  // Numbered days:
  for (var i = 1; i <= numDays; i++)
  {
    var dayItem = document.createElement("li");
    var dayText = document.createTextNode(i);
    if (classNames[i]) {
      dayItem.classList.add(classNames[i]);
    }
    dayItem.appendChild(dayText);
    dayList.appendChild(dayItem);
  }
  div.appendChild(dayList);

  div.classList.add("calendar-item");

  return div;
}

/*
 * Creates a representation of a season, using multiple calendar objects
 * which are styled to represent availability of the cottages.
 *
 * Parameters:
 * data: An object which represents a cottage season and availability. Will
 * contain the bounds of the cottage season as well as a list of reservations
 * which limit the availability of the cottage.
 * appendTo: The calendar divs will be appended to this div
 *
 * Returns:
 * Nothing
 */
function createCalendars(data, appendTo)
{
  var season = data.season;
  var offset = season.start.weekdayOffset;
  for (var month = season.start.month; month <= season.end.month; month++)
  {
    // Convert from human-convention to zero-indexed
    var indexedMonth = month - 1;
    var monthInfo = monthProperties[indexedMonth];

    var dayClasses = [];
    if (month === season.start.month)
    {
      for (var day = 1; day < season.start.day; ++day)
      {
        dayClasses[day] = "day-off-season";
      }
    }

    if (month === season.end.month)
    {
      for (var day = season.end.day; day <= monthInfo.days; ++day)
      {
        dayClasses[day] = "day-off-season";
      }
    }

    data.reservations.forEach(function (reservation) {
      if (reservation.start.month === month || reservation.end.month === month) {
        var start = (reservation.start.month === month) ? reservation.start.day : 1;
        var end = (reservation.end.month === month) ? reservation.end.day : monthInfo.days;
        for (var day = start; day <= end; day++)
        {
          dayClasses[day] = "day-reserved";
        }
      }
      else if (reservation.start.month < month && reservation.end.month > month)
      {
        for (var day = 1; day <= monthInfo.days; day++)
        {
          dayClasses[day] = "day-reserved";
        }
      }
    });

    appendTo.appendChild(createCalendarElement(monthInfo.name, monthInfo.days, offset, dayClasses));
    offset = (offset + monthInfo.days) % 7;
  }
}
