(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.querySelector("[data-video-player]");
    var overlay = document.querySelector("[data-video-overlay]");
    var playButton = document.querySelector("[data-video-play]");
    var status = document.querySelector("[data-video-status]");

    if (!video || !playButton) {
      return;
    }

    var source = video.getAttribute("data-src");
    var hasLoaded = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadVideo() {
      if (!source) {
        setStatus("当前影片暂未配置播放源");
        return;
      }

      if (hasLoaded) {
        video.play().catch(function () {});
        return;
      }

      hasLoaded = true;
      setStatus("正在加载播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪");
          video.play().catch(function () {});
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源已就绪");
          video.play().catch(function () {});
        }, { once: true });
      } else {
        setStatus("您的浏览器不支持当前 m3u8 播放方式");
      }
    }

    playButton.addEventListener("click", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      loadVideo();
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
