var dailies = (localStorage.getItem("mtDailies")) ? 
    JSON.parse(localStorage.getItem("mtDailies")) : [];
var weeklies = (localStorage.getItem("mtWeeklies")) ? 
    JSON.parse(localStorage.getItem("mtWeeklies")) : [];
var todo = (localStorage.getItem("mtTodo")) ? 
    JSON.parse(localStorage.getItem("mtTodo")) : [];
var weeklyReset = (localStorage.getItem("mtWeekReset")) ? 
    JSON.parse(localStorage.getItem("mtWeekReset")) : 1;

$(document).ready(function(){
  // Initialize
  var mt = serverTime(new Date());
  
  if (weeklyReset !== 1){
    $('#weeklyReset').html("Change Reset To Dojo");
  }
  // Check lists
  dailies = checkList(dailies, mt);
  localStorage.setItem("mtDailies", JSON.stringify(dailies));
  weeklies = checkWeek(weeklies, mt, weeklyReset);
  localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  // Populate lists
  updateList($('#listDailies'), dailies);
  updateList($('#listWeeklies'), weeklies);
  
  // App Logic
  setInterval(function(){ 
    mt = serverTime(new Date());
    if (mt.hr == 0 && mt.min == 0) {
      dailies = checkList(dailies, mt);
      localStorage.setItem("mtDailies", JSON.stringify(dailies));
      weeklies = checkWeek(weeklies, mt, weeklyReset);
      localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
      updateList($('#listDailies'), dailies);
      updateList($('#listWeeklies'), weeklies);
    }
    if (mt.hr >= 12){
      var m = "pm";
      var hr = mt.hr - 12;
    } else {
      var m = "am";
      var hr = mt.hr;
    }
    if (hr == 0) hr = 12;
    $('#currentTime').html(hr + ":" + ((mt.min < 10)?"0" + mt.min : mt.min) + m);
    $('#currentDate').html(days[mt.day] + ", " + months[mt.date[0]] + " " + mt.date[1] + ", " + mt.date[2]);
    
    // Display Daily Time Left
    var dailyTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1], mt.hr, mt.min)), 
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1] + 1, 0, 0))
    );
    
    var dailyHr = Math.floor(dailyTimeLeft / 60);
    dailyTimeLeft -= dailyHr * 60;
    $('#dailiesTimer').html(dailyHr + "h " + dailyTimeLeft +
                           "m<br><div class='reset'>TIL RESET</div>");
    
    // Display Weekly Time Left
    var weekDay = (mt.day-weeklyReset < 0)?(mt.day-weeklyReset)+7:(mt.day-weeklyReset);
    var weeklyOffset = 7 - weekDay;
    var weeklyTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1], mt.hr, mt.min)), 
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1] + weeklyOffset, 0, 0))
    );
    var weeklyDay = Math.floor(weeklyTimeLeft / (60 * 24));
    weeklyTimeLeft -= Math.floor(weeklyDay * 60 * 24);
    var weeklyHr = Math.floor(weeklyTimeLeft / 60);
    weeklyTimeLeft -= weeklyHr * 60;
    if (weeklyDay == 0){
      $('#weekliesTimer').html(weeklyHr + "h " + weeklyTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    } else {
      $('#weekliesTimer').html(weeklyDay + "d " + weeklyHr + "h " + weeklyTimeLeft + "m<br><div class='reset'>TIL RESET</div>");
    } 
  }, 1000);
});

$('button').on('click', function(){
  var btn = $(this);
  var txt = btn.prev();
  var val = txt.val();
  if (val){
    // Reset input
    txt.val('');
    
    // Add task to localStorage
    if (btn.parent().prev().attr('id') == "listDailies"){
      dailies.push([val,""]);
      dailies.sort();
      updateList('#listDailies', dailies);
      localStorage.setItem("mtDailies", JSON.stringify(dailies));
    } else if (btn.parent().prev().attr('id') == "listWeeklies"){
      weeklies.push([val,""]);
      weeklies.sort();
      updateList('#listWeeklies', weeklies);
      localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
    } else {
      // todo list
    }
  }
});

$("input").on('keyup', function (e) {
    if (e.keyCode == 13) {
        $(this).next().click();
    }
});

$('#weeklyReset').on('click', function(){
  var v = $(this).html();
  console.log(v);
  if (v == "Change Reset To Bosses"){
    weeklyReset = 5;
    $(this).html("Change Reset To Dojo");
  } else {
    weeklyReset = 1;
    $(this).html("Change Reset To Bosses");
  }
  localStorage.setItem("mtWeekReset", weeklyReset);
});

$('ul').on('click', 'li', function(){
  var e = $(this);
  e.toggleClass("complete");
  var id = e.index();
  var list = e.parent().attr('id');
  if (list == "listDailies"){
    if (dailies[id][1] == ""){
      var d = serverTime(new Date());
      dailies[id][1] = d.date;
    } else {
      dailies[id][1] = "";
    }
    localStorage.setItem("mtDailies", JSON.stringify(dailies));
  } else if (list == "listWeeklies") {
    if (weeklies[id][1] == ""){
      var d = serverTime(new Date());
      weeklies[id][1] = d.date;
    } else {
      weeklies[id][1] = "";
    }
    localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  } else {
    
  }
});

$('ul').on('contextmenu', 'li', function(e){
  e.preventDefault();
  var el = $(this);
  var id = el.index();
  var list = el.parent().attr('id');
  if (list == "listDailies"){
    dailies.splice(id, 1);
    dailies.sort();
    updateList('#listDailies', dailies);
    localStorage.setItem("mtDailies", JSON.stringify(dailies));
  } else if (list == "listWeeklies") {
    weeklies.splice(id, 1);
    weeklies.sort();
    updateList('#listWeeklies', weeklies);
    localStorage.setItem("mtWeeklies", JSON.stringify(weeklies));
  } else {
    
  }
});

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November",
              "December"];

function serverTime(t) {
  return {"hr" : t.getUTCHours(),
          "min" : t.getUTCMinutes(),
          "day" : t.getUTCDay(),
          "date" : [t.getUTCMonth(), 
                    t.getUTCDate(), 
                    t.getUTCFullYear()]};
}

 // datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
function dateDiff(datepart, fromdate, todate) {	
  datepart = datepart.toLowerCase();	
  var diff = todate - fromdate;	
  var divideBy = { w:604800000, 
                   d:86400000, 
                   h:3600000, 
                   n:60000, 
                   s:1000 };	
  return Math.floor(diff/divideBy[datepart]);
}

function updateList(l, a){
  l = $(l);
  l.html("");
  for (var i = 0; i < a.length; i++){
    // Add task to list
    var task = "<li class=\"task" + ((a[i][1] == "") ? "" : " complete") + "\">" + a[i][0] + "</li>";
    l.append(task);
  }
}

function checkList(l, mt){
  for (var i = 0; i < l.length; i++){
    if (l[i][1][0] != mt.date[0] ||
        l[i][1][1] != mt.date[1] ||
        l[i][1][2] != mt.date[2]) {
      l[i][1] = "";
    }
  }
  return l;
}

function checkWeek(l, mt, wk){
  var weekDay = (mt.day-wk < 0)?(mt.day-wk)+7:(mt.day-wk);
  var weeklyOffset = 7 - weekDay;
  for (var i = 0; i < l.length; i++){
    var weeklyTimeLeft = dateDiff(
      "n",
      new Date(Date.UTC(l[i][1][2], l[i][1][0], l[i][1][1], 0, 0)), 
      new Date(Date.UTC(mt.date[2], mt.date[0], mt.date[1] + weeklyOffset, 0, 0))
    );
    if (weeklyTimeLeft <= 0) {
      l[i][1] = "";
    }
  }
  return l;
}
