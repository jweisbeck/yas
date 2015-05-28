##Don't want to worry about non-modern browsers? Don't need oodles of features??

This is Yet Another Slider (YAS). BUT, it is a bit special: it doesn't need jQuery (uses ES5 APIs) and it only has two main features. In my experience building sliders, the two most important features to making clients happy: pagination and dynamic container calculation. This slider has those features, and nothing else (it's responsive, too, but that's a baseline for everything nowadays, not a feature).

This script is less than 2kb minified and gzipped. There is no library dependency, so there isn't the hidden cost of also loading a library like jQuery.

###How to Use
Use the provided markup in `index.html` as a starting point for your slider. 
Here's how you start the slider with JavaScript:

```
var slidy = new Slider();
slidy.init(); // will start the slider with default options

// Here's all the optional settings you can pass on init()
slidy.init({
	el: '#slider', // REQUIRED. class or id selector of the root slider element
    pagination: false, // default is true
    dynamic: true, // default is false
    container: '.slides-wrap', // default is .slides-wrap, but you can change
    autoplay: true // default is false 
    animation: false // default is true
    interval: 5000 // for autoplay true only
});
```

###Options

* El: This is the only reuqired argument. It must refer to the root html element that wraps the entire slider. 
* Pagination: Adds numbered pagination to the slider. The slider automatically keeps track of the current slide, appending the class `active` to the current slide
* Dynamic: Helps with showing multiple slides in one view. When the browser is re-sized, the slider will automatically recalculate the number of viewable slides based on the CSS controlling the slides. See the rules for `.slide` and `.slag` in the accompanying main.css stylesheet. You'll see they have media query rules controlling their width in percent. When the media query fires as a browser changes size, the slider will notice when the slides have changed width have changed and recalculate the slideshow to show the correct number of slides at once. It's easier to see this behavior by running the sample and making the `dynamic` option `true`.
* Container: Set the viewport wrapper element class name around the slides
* Autoplay: Does what it says
* Interval: sets the slide time interval when `autoplay` is set to `true`

###Progressively Enhanced

This project covers broswsers that don't support ES5 features like the classList API. Those browsers get shown the first item in the carousel as a static slide sans any carousel functionality (that's actually the default state of the slider with the full version enhanced from the basic state). We could say this is "component Progressive Enhancement", where the slider handles its own PE workflow and doesn't depend on a global PE workflow, such as the common ".no-js" class on the <html> element.

####Progressive Enhancement workflow
TK




##TK

* Multiple sliders per page
* Feature: Provide callback after slide is done animating. Useful for loading things like video.
* Feature: swipe gestures for touch devices, maybe?

