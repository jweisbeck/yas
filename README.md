##Don't want to worry about non-modern browsers? Don't need oodles of features??

This is Yet Another Slider (YAS). BUT, it is a bit special: it doesn't need jQuery (uses ES5 APIs) and it only has two main features. In my experience building sliders, the two most important features to making clients happy: pagination and dynamic container calculation. This slider has those features, and nothing else (it's responsive, too, but that's a baseline for everything nowadays, not a feature).

This script is less than 2kb minified and gzipped. There is no library dependency, so there isn't the hidden cost of also loading a library like jQuery.

###Progressively Enhanced

This project covers broswsers that don't support ES5 features like the classList API. Those browsers get shown the first item in the carousel as a static slide sans any carousel functionality (that's actually the default state of the slider with the full version enhanced from the basic state). We could say this is "component Progressive Enhancement", where the slider handles its own PE workflow and doesn't depend on a global PE workflow, such as the common ".no-js" class on the <html> element.

####Progressive Enhancement workflow
TK




##TK

* Feature: Provide callback after slide is done animating. Useful for loading things like video.
* Feature: swipe gestures for touch devices, maybe?

