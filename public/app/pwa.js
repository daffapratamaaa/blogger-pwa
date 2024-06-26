if (typeof Lazy !== "function") {
  /**
   * Fungsi Lazy
   * menggunakan HTML5 localStorage
   *
   * Lisensi: MIT
   */
  (function(e) {
    var t = [];

    function n(e) { 
      "function" == typeof e && (n.lazied || t.executed ? e.call(window, { type: "LOCAL_STORAGE" }) : t.push(e)) 
    }

    function o() { 
      0 == document.documentElement.scrollTop && 0 == document.body.scrollTop || (t.execute({ type: "SCROLL" }), window.removeEventListener("scroll", o)) 
    }

    function c() { 
      t.execute({ type: "CLICK" }), document.body.removeEventListener("click", c) 
    }

    function d() { 
      n.lazied || t.executed || (document.body.addEventListener("click", c), window.addEventListener("scroll", o), o()), document.removeEventListener("DOMContentLoaded", d) 
    }

    t.executed = !1, n.lazied = localStorage.getItem(e.key) === e.value, t.execute = function() { 
      if (!1 === this.executed) { 
        this.executed = !0, n.lazied = !0, localStorage.getItem(e.key) !== e.value && localStorage.setItem(e.key, e.value); 
        for (let e = 0; e < this.length; e++) {
          "function" == typeof this[e] && this[e].apply(window, arguments), this.splice(e, 1), e-- 
        } 
      } 
    }, "complete" === document.readyState || "loading" !== document.readyState || null !== document.body ? d() : document.addEventListener("DOMContentLoaded", d), 
    this[e.name] = n
  }).call(typeof globalThis !== "undefined" ? globalThis : window, { name: "Lazy", key: "LOCAL_LAZY", value: "true" });
}

(function(app) {
  /**
   * Keluar dari fungsi
   * jika serviceWorker tidak tersedia
   */
  if (!("serviceWorker" in navigator)) {
    return;
  }

  /**
   * Fungsi pembantu untuk mengelompokkan log
   */
  var groupLog = function(title, logs) {
    if (app.consoleLogs === true) {
      console.groupCollapsed.apply(console, Array.isArray(title) ? title : [title]);
      logs.forEach(function(log) { console.log.apply(console, Array.isArray(log) ? log : [log]); });
      console.groupEnd();
    }
  };

  /**
   * Daftarkan Workbox Service Worker
   */
  navigator.serviceWorker
    .register(app.serviceWorker, {
      scope: "/",
    })
    .then(function(registration) {
      var logs = [];
      if (registration.scope) {
        logs.push(["Scope: " + registration.scope]);
      }
      if (registration.active && registration.active.scriptURL) {
        logs.push(["Script: " + registration.active.scriptURL]);
      }
      logs.push(
        ["Build by: Daffa Pratama Nur Ardiansyah"],
        ["Developer site: https://www.daffapratama.com"]
      );

      groupLog(
        [
          "%cService Worker: Registered Successfully",
          "color: green"
        ],
        logs
      );
    })
    .catch(function(error) {
      groupLog(
        [
          "%cService Worker: Registration Failed",
          "color: red"
        ],
        ["Error:", error]
      );
    });

  /**
   * Fungsi pembantu untuk menginisialisasi OneSignal
   */
  var initializeOneSignal = function(config) {
    return function(OneSignal) {
      OneSignal.init(config)
        .then(function() {
          var logs = [
            ["Version:", OneSignal.VERSION]
          ];

          var config = OneSignal.config;
          var subscription = OneSignal.User.PushSubscription;
          var notification = OneSignal.Notifications;
          var origin = window.location.origin;

          if (config) {
            logs.push(["App ID:", config.appId]);
            logs.push(["Origin:", config.origin]);
            logs.push(["Site Name:", config.siteName]);

            var userConfig = config.userConfig;

            if (userConfig) {
              if (userConfig.serviceWorkerParam) {
                logs.push(["Scope:", origin + userConfig.serviceWorkerParam.scope]);
              }
              logs.push(["Script:", origin + userConfig.path + userConfig.serviceWorkerPath]);
            }
          }

          if (subscription.id) {
            logs.push(["Subscription ID:", subscription.id]);
          }

          logs.push(["Notification:", notification.permissionNative]);

          groupLog(
            [
              "%cOneSignal: Initialized Successfully",
              "color: green"
            ],
            logs
          );
        })
        .catch(function(error) {
          groupLog(
            [
              "%cOneSignal: Initialization Failed",
              "color: red"
            ],
            ["Error:", error]
          );
        });
    };
  };

  /**
   * Inisialisasi OneSignal jika diaktifkan
   */
  if (app.oneSignalEnabled) {
    var oneSignalConfig = Object.assign({}, app.oneSignalConfig);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(
      initializeOneSignal(oneSignalConfig)
    );

    /**
     * Muat OneSignal SDK hanya jika diperlukan
     * Menggunakan Lazy untuk memuat javascript secara malas demi performa yang lebih baik
     *
     */
    if (typeof OneSignal === "undefined") {
      Lazy(function() {
        var script = document.createElement("script");
        script.type = "text/javascript"; // Pastikan script dianggap sebagai JavaScript biasa
        script.src = app.oneSignalSDK;
        script.async = true;
        script.defer = true;
        var firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      });
    }
  }
})({
  "consoleLogs": true,
  "serviceWorker": "/app/serviceworker.js",
  "oneSignalEnabled": true,
  "oneSignalSDK": "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js",
  "oneSignalConfig": {
    "appId": "43495d43-a969-4458-a957-3246c25eadf2",
    "allowLocalhostAsSecureOrigin": true
  }
});
