##DON'T CARE ABOUT NON-MODERN BROWSERS? DON'T NEED OODLES OF FEATURES?

This is Yet Another Slider (YAS). BUT, it is a bit special: it doesn't need jQuery (uses ES5 APIs) and it only has two main features. In my experience building sliders, the two most important features to making clients happy: pagination and dynamic container calculation. This slider has those features, and nothing else (it's responsive, too, but that's a baseline for everything nowadays, not a feature).

###Progressively Enhanced

This project covers broswsers that don't support ES5 features like the classList API. Those browsers get shown the first item in the carousel as a static slide sans any carousel functionality (that's actually the default state of the slider with the full version enhanced from the basic state).


##TK

* Refactor: Multiple sliders per page: Put slider on prototype and instantiate a new instance when init() is called
* Feature: Provide callback after slide is done animating. Useful for loading things like video.
* Feature: Auto-play
* Feature: swipe gestures for touch devices
* Feature: Some facility to lazy load images, for perf.

