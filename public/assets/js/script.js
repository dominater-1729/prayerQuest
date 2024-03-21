

// scrollbar 
$(document).ready(function () {
  var listItems = $("#scrollar li");

  if (listItems.length > 5) {
    $("#scrollar").addClass("scrollbar-container");
  }
});
// scrollbar 

// loader 
$(document).ready(function () {
  $(".loader-wrapper").fadeIn();
  setTimeout(function () {
    $(".loader-wrapper").fadeOut();
  }, 1000);
});
// loader

// a prevent 
$(document).ready(function () {
  $("a").click(function (e) {
    if ($(this).attr("href") === "#") {
      e.preventDefault();
    }
  });
});


// donation modal 

// postcoment modal 
$(document).ready(function () {
  $(".post-comment").click(function () {
    $("#postcomment").modal("show");
  });
});

// sticky navbar 
$(document).ready(function () {
  var navbar = $("header .navbar");

  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      navbar.addClass("sticky");
    } else {
      navbar.removeClass("sticky");
    }
  });
});

