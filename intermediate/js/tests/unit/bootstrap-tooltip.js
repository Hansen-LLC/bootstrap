$(function(){module("bootstrap-tooltip");test("should be defined on jquery object",function(){var a=$("<div></div>");ok(a.tooltip,"popover method is defined")});test("should return element",function(){var a=$("<div></div>");ok(a.tooltip()==a,"document.body returned")});test("should expose default settings",function(){ok(!!$.fn.tooltip.defaults,"defaults is defined")});test("should remove title attribute",function(){var a=$('<a href="#" rel="tooltip" title="Another tooltip"></a>').tooltip();ok(!a.attr("title"),
"title tag was removed")});test("should add data attribute for referencing original title",function(){var a=$('<a href="#" rel="tooltip" title="Another tooltip"></a>').tooltip();equals(a.attr("data-original-title"),"Another tooltip","original title preserved in data attribute")});test("should place tooltips relative to placement option",function(){$.support.transition=!1;var a=$('<a href="#" rel="tooltip" title="Another tooltip"></a>').appendTo("#qunit-fixture").tooltip({placement:"bottom"}).tooltip("show");
ok($(".tooltip").hasClass("fade bottom in"),"has correct classes applied");a.tooltip("hide")});test("should always allow html entities",function(){$.support.transition=!1;var a=$('<a href="#" rel="tooltip" title="<b>@fat</b>"></a>').appendTo("#qunit-fixture").tooltip("show");ok($(".tooltip b").length,"b tag was inserted");a.tooltip("hide");ok(!$(".tooltip").length,"tooltip removed")});test("should respect custom classes",function(){var a=$('<a href="#" rel="tooltip" title="Another tooltip"></a>').appendTo("#qunit-fixture").tooltip({template:'<div class="tooltip some-class"><div class="tooltip-arrow"/><div class="tooltip-inner"/></div>'}).tooltip("show");
ok($(".tooltip").hasClass("some-class"),"custom class is present");a.tooltip("hide");ok(!$(".tooltip").length,"tooltip removed")})});
