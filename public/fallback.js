document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-logo img, .footer-logo-img').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      var sibling = this.nextElementSibling;
      if (sibling) sibling.style.display = 'block';
    });
  });
});
