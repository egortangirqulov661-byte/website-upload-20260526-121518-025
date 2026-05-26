function initMoviePlayer(streamUrl) {
  const video = document.getElementById('movie-player');
  const cover = document.querySelector('[data-player-cover]');
  const playButton = document.querySelector('[data-play-button]');
  let attached = false;

  function attach() {
    if (attached || !video || !streamUrl) return;
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    if (cover) cover.classList.add('is-hidden');
    if (video) {
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }

  if (cover) cover.addEventListener('click', play);
  if (playButton) playButton.addEventListener('click', play);
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
  }
}
