(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.play-button');
    var media = video ? video.querySelector('source') : null;
    var streamUrl = media ? media.getAttribute('src') : '';
    var started = false;
    var hlsInstance = null;

    function begin() {
      if (!video || !streamUrl) {
        return;
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 40,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        begin();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
