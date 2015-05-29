##Don't want to worry about non-modern browsers? Don't need oodles of features??

This is Yet Another Slider (YAS). BUT, it is a bit special: it doesn't need jQuery (uses ES5 APIs) and it only has a couple features, as noted in the options below. (it's responsive, too, but that's a baseline for everything nowadays, not a feature). Since this project makes use of newer APIs, it will only work in browsers that support `querySelector` and `classList`, notably excluding IE9 and below. But old browsers aren't completely left out. See the section on progressive enhancement below.

This script is less than 2kb minified and gzipped. As mentioned, there is no library dependency, so there isn't the hidden cost of also loading a library like jQuery.

###How to Use
Use the provided markup in `index.html` as a starting point for your slider. 
Here's how you start the slider with JavaScript:

```
var slidy = new Slider();
slidy.init({el: '#slider'}); // will start the slider with default options

// Here's all the optional settings you can pass on init()
slidy.init({
	el: '#slider', // REQUIRED. class or id selector of the root slider element
    pagination: true, // default is false
    dynamic: true, // default is false
    container: '.slides-wrap', // default is .slides-wrap, but you can change
    autoplay: true // default is false 
    animation: false // default is true
    interval: 5000 // for autoplay true only
});
```

###Options

* El: This is the only required argument. It must refer to the root html element that wraps the entire slider. 
* Pagination: Adds numbered pagination to the slider. The slider automatically keeps track of the current slide, appending the class `active` to the current slide
* Dynamic: Helps with showing multiple slides in one view. When the browser is re-sized, the slider will automatically recalculate the number of viewable slides based on the CSS controlling the slides. See the rules for `.slide` and `.slag` in the accompanying main.css stylesheet. You'll see they have media query rules controlling their width in percent. When the media query fires as viewport changes size, the slider will notice and recalculate the slides to show the correct number of  at once. It's easier to see this behavior by running the sample and making the `dynamic` option `true`.
* Container: Set the viewport wrapper element class name around the slides
* Autoplay: Does what it says
* Interval: sets the slide time interval when `autoplay` is set to `true`

###Progressively Enhanced

This project covers broswsers that don't support ES5 features like the classList API. Those browsers get shown the first item in the carousel as a static slide sans any carousel functionality (that's actually the default state of the slider with the full version enhanced from the basic state). We could say this is "component Progressive Enhancement", where the slider handles its own PE workflow and doesn't depend on a global PE workflow, such as the common ".no-js" class on the <html> element.

####Progressive Enhancement workflow
_TK ..._




##TK
* Feature: Provide callback after slide is done animating. Useful for loading things like video.
* Feature: swipe gestures for touch devices, maybe?

