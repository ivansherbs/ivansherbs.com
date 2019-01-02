//var tag = document.createElement('script');
//tag.id = 'video-script';
//tag.src = 'https://www.youtube.com/iframe_api';
//var firstScriptTag = document.getElementsByTagName('script')[0];
//firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-iframe', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'verticalCentered': false
        }
    });
}

function onPlayerReady(event) {
    player.setPlaybackRate(0.5);
    player.mute();
}

function showFullscreenContent() {
    $('.fullscreen .container, .fullscreen .ih-bg-container').css({
        opacity: 1
    });
}

function onPlayerStateChange(event) {
    switch (event.data) {
        case YT.PlayerState.PLAYING:
            $('.ih-page-loader').css({
                opacity: 0,
                visibility: 'hidden'
            });
            showFullscreenContent();
            break;
        case YT.PlayerState.ENDED:
            player.seekTo(0);
            break;
    }
}

$(document).ready(function () {
	//// video player initialization
    //updateVideoIframe();
    //$(window).resize(function() {
    //    updateVideoIframe();
    //});

	// fullPage.js initialization
	$('#fullpage').fullpage({
        scrollingSpeed: 1000,
        loopHorizontal: false,
        verticalCentered: false,
        controlArrows: false,
        recordHistory: true
    });

	$('#icvideo').iziModal({
        iframe : true,
        title: ' ',
        closeButton: true,
        headerColor: '#000000',
        overlayColor: 'rgba(0, 0, 0, 0.8)',
        width: '80%'
	});

	$('#ichistory').iziModal({
        title: ' ',
        closeButton: true,
        headerColor: '#000000',
        overlayColor: 'rgba(0, 0, 0, 0.8)',
        width: '80%'
	});
});

function updateVideoIframe() {
    $videoContainer = $('.video-container');
    var contWidth = $videoContainer.width();
    var contHeight = $videoContainer.height() + 50;
    var ratio = 0.5625;

	var width = 0;
	var height = 0;
    var margin = 0;

    if (ratio < contHeight / contWidth) {
        height = contHeight;
        width = height / ratio;
        margin = Math.round((width - contWidth) / 2);
    } else {
        width = contWidth;
        height = width * ratio;
    }

	var $iframe = $('#video-iframe').css({
		width: width + 'px',
		height: height + 'px',
        margin: '0 0 0 -' + margin + 'px'
    });
}
