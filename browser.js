$(document).ready(loaded);

var CLIENT_ID = "95kcdctowquugcd7ic6rt5hcnb09qo";
var GAME = "Dota 2";
var STREAMS_BY_GAME_URL = "https://api.twitch.tv/kraken/streams/?game=" + GAME + "&limit={{limit}}";

var numStreams = 25;
var checkboxData = {
	'new-window-checkbox': false,
	'use-popout-checkbox': false
}

function loaded() {

	// bind handlers
	$(".settings-header").click(settingsClick);
	$(".settings-input-box").change(numStreamsInputChanged);
	$(".reload-view-header").click(loadStreams);
	$("input[type='checkbox']").change(checkboxChange);

	// retrieve streams from twitch
	loadStreams();
}

function checkboxChange() {
	var checkbox = $(this);
	var id = checkbox.attr('id');
	var status = $("#" + id).is(':checked');
	var key = 'dota2-twitch-browser-data-' + id;
	checkboxData[id] = status;
	localStorage.setItem(key, status);
	log(checkboxData);
}

function loadStreams() {

	// look for values in local storage
	loadFromStorage();

	$(".stream-loading-error").hide();
	$(".stream-container").empty();
	$(".stream-container").hide();
	$(".stream-loading").show();

	// num-numeric limit - lock to 25
	if (!$.isNumeric(numStreams)) {
		numStreams = 25;
		$(".settings-input-box").val(numStreams);		
	}

	var query = STREAMS_BY_GAME_URL.replace("{{limit}}", numStreams);
	log(query);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", query);
	xhr.setRequestHeader("Client-ID", CLIENT_ID);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var resp = JSON.parse(xhr.responseText);
				receiveStreamResponse(resp);
			} else {
				receiveStreamErrorResponse(xhr.status);
			}
		}
	};
	xhr.send();
}

function receiveStreamResponse(resp) {

	var streams = resp.streams;
	$.each(streams, function(index, el) {
		var el = buildStreamEl(index, el);
		$(".stream-container").append(el);
	});
	$(".stream-container").show();

	$(".stream-link-container").click(streamClick);

	$(".stream-loading").hide();
}

function streamClick() {
	var stream = $(this);
	var streamChannel = stream.attr('id');

	var url = 'https://www.twitch.tv/' + streamChannel;
	if (checkboxData['use-popout-checkbox']) {
		url = 'https://player.twitch.tv/?volume=1&channel=' + streamChannel;
	}

	var name = '';
	var opts = '';
	if (checkboxData['new-window-checkbox']) {
		name = '_blank';
		opts = 'menubar=no,width=800,height=500'
	}

	window.open(
		url,
		name,
		opts
	);
}

function buildStreamEl(index, stream) {

	var streamChannel = stream.channel.name;
	var streamStatus = stream.channel.status;
	var streamImg = stream.preview.small;

	var streamEl = $(
		'<div/>', {
			id: streamChannel,
			class: 'stream-link-container clearfix'
		}
	);

	var streamImgEl = $(
		'<div/>', {
			id: 'stream-img-' + index,
			class: 'stream-link-image',
			css: {
				"background-image": "url(" + streamImg + ")"
			}
		}
	);

	var streamTextEl = $(
		'<div/>', {
			id: 'stream-text-' + index,
			class: 'stream-link-text',
			html: "<p class='stream-link-text-title'>" + streamChannel + ":</p><p class='stream-link-text-status'>" + streamStatus + "</p>"
			
		}
	);

	streamEl.append(streamImgEl);
	streamEl.append(streamTextEl);
	return streamEl;
}

function receiveStreamErrorResponse(code) {
	if (code != 200) {
		$("." + code).show();
	}

	$(".stream-loading").hide();
}

function settingsClick() {
	$(".settings-container").slideToggle(500);
}
function numStreamsInputChanged() {
	var numStreamsInput = $(this).val();
	localStorage.setItem("dota2-twitch-browser-data-numStreams", numStreamsInput);
}

function log(msg) {
	console.log(msg);
}

function debug(msg) {
	console.warn("DEBUG - Dota 2 Twitch Browser - DEBUG");
	console.warn(msg);
}

function loadFromStorage() {
	var temp = localStorage.getItem("dota2-twitch-browser-data-numStreams");
	if (temp) numStreams = temp;
	$(".settings-input-box").val(numStreams);

	$.each(checkboxData, function(o) {
		var key = "dota2-twitch-browser-data-" + o;
		temp = localStorage.getItem(key);
		if (temp !== undefined) {
			checkboxData[o] = temp == 'true';
		} else {
			checkboxData[o] = false;
		}
		$("#" + o).prop('checked', checkboxData[o]);
	});
}