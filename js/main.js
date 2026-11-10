(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  document.querySelectorAll("form[data-enquiry-form]").forEach(bindForm);
  document.querySelectorAll("form[data-firm-form]").forEach(bindForm);

  function bindForm(form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("[type=submit]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }

      var honey = form.querySelector("[name=_honey]");
      if (honey && honey.value) {
        show(status, "ok", "Thank you. Your enquiry has been sent.");
        form.reset();
        return;
      }

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });
      payload._template = "table";
      payload._captcha = "false";

      if (submit) {
        submit.disabled = true;
        submit.dataset.label = submit.textContent;
        submit.textContent = "Sending...";
      }

      fetch("https://formsubmit.co/ajax/hamzatsvj@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          }).catch(function () {
            return { ok: response.ok, data: {} };
          });
        })
        .then(function (result) {
          var data = result.data || {};
          var flag = data.success;
          var message = typeof data.message === "string" ? data.message : "";
          var accepted =
            result.ok &&
            (flag === true ||
              flag === "true" ||
              flag === undefined ||
              /activate|confirm your email/i.test(message));

          if (!accepted) {
            throw new Error(message || "Could not send the enquiry. Please try again.");
          }

          if (/activate|confirm your email/i.test(message)) {
            show(
              status,
              "ok",
              "The form is waiting for a one-time email confirmation. Once that is done, enquiries will arrive as normal."
            );
          } else {
            show(
              status,
              "ok",
              "Thank you. We have your enquiry and will check the details, then pass it to one specialist firm in your area."
            );
            form.reset();
          }
        })
        .catch(function () {
          show(
            status,
            "err",
            "Sorry, the enquiry could not be sent just now. Please wait a moment and try again, or email hamzatsvj@gmail.com."
          );
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.label || "Send enquiry";
          }
        });
    });
  }

  function show(el, kind, text) {
    if (!el) return;
    el.className = "form-status is-visible " + kind;
    el.textContent = text;
  }
})();
