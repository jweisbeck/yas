
"use strict";

var Slider = function(){
    this.el = null;
    this.container = null;
    this.slides = null;
    this.sets = [];
    this.next = null;
    this.prev = null;
    this.pager = null;
    this.state = {
            current: 0,
            widthOffset: 0,
            slideTotal: 0,
            pagination: []
        };
    this.settings = {
            pagination: false,
            sliderPadding: 0,
            dynamic: false,
            container: '.slides-wrap',
            el: '#slider',
            autoplay: false,
            interval: 2000,
            animation: true
        };

};

Slider.prototype = {

    init: function(opts) {

        if (!document.querySelector || !('classList' in document.body)) return false;
        
        // set up user options on settings
        this.mergeOpts(opts);

        // set base options
        this.el = document.querySelector(this.settings.el);
        this.container = this.el.querySelector(this.settings.container);
        this.next = this.el.querySelector('#next');
        this.prev = this.el.querySelector('#prev');
        this.slides = Array.prototype.slice.call(this.el.querySelectorAll('.slide'));
        this.state.widthOffset = this.el.offsetWidth;
        this.state.slideTotal = this.slides.length;

        if(this.settings.pagination){
            this.addPagination();
        }

        if(this.settings.autoplay){
            this.autoplay();
        }
        
        this.loadImages(this.configureSlides);

        if(this.next) this.addNavHandlers(this.next, this.goToNext);
        if(this.prev) this.addNavHandlers(this.prev, this.goToPrev);
      
        this.container.addEventListener('transitionend', this.updateAfterTrans); // (TK - need to add vendor API variations). Option fire callback after each transition

        // if this is running, js obviously works, so remove no-js controls and swap in 2 through n slide images if present
        this.el.classList.remove('nojs');
    },

    autoplay: function() {
        var self = this;
        setInterval(function(){
            self.goToNext();
        }, 2000)
    },

    configureSlides: function() {

        if(this.settings.dynamic){
           
            // init process to calculate # of slide items to show per slide  
            this.slides.forEach(function(slide) {
                slide.classList.remove('slide');
                slide.classList.add('slag');
            });

            this.calculateDynamicContainers();
            this.onResize(this.calculateDynamicContainers.bind(this));
        } else {
            this.onResize(this.recalcSlidePositions);
        }

        this.recalcSlidePositions();
    },

    loadImages: function(fn) {
        var targets = Array.prototype.slice.call(this.container.querySelectorAll('.js-load')),
            imgs = [],
            frag = document.createDocumentFragment();

        if(targets.length){
            targets.forEach(function(img, i) {
                var src = img.getAttribute('data-src');
                var img = document.createElement('img');
                img.setAttribute('src', src);
                img.setAttribute('data-slide', i);
                imgs.push(img);
            });

            this.container.innerHTML = "";
            var slidesLen = this.slides.length,
                lazyLoadDelta = (slidesLen - targets.length);

            for (var i = 0; i < slidesLen; i++) {
                if(i < lazyLoadDelta ){
                    // skip slides that aren't set for lazy loading. They should always be referenced in an <img> to fulfill failed PE qualification test
                    frag.appendChild(this.slides[i]);
                } else {
                    this.slides[i].replaceChild(imgs[i-lazyLoadDelta], this.slides[i].querySelector('.js-load')); // load the image into the right position
                    frag.appendChild(this.slides[i]);
                }
            }
           
            this.container.appendChild(frag);
        }

        fn.call(this);
    },

    recalcSlidePositions: function(){
        // on browser resize, we need to recalculate the slide's left position so they are correctly spaced amongst themselves,
        // or weird margin and overlapping will begin to occur. This ensures the slides stay 'synced' to the size of their parent 
        // container, which SHOULD be a percentage of viewport width bc it's a responsive design, right?
        var self = this, elGroup;

        this.state.widthOffset = this.el.offsetWidth; // set width for a single slide or single dynamic container       

        if(this.settings.dynamic){
            elGroup = this.sets;
        } else {
            elGroup = this.slides;
        }

        elGroup.forEach(function(slide, i) {
            // set up initial position of all the slides (ignore padding)
            slide.style.left = self.state.widthOffset * i + "px";
        });

        this.traverse(true);
    },

    calculateDynamicContainers: function(){

        var slideWidth = this.slides[0].offsetWidth,
            containerWidth = this.el.offsetWidth,
            slidesPerGroup = Math.floor(containerWidth/slideWidth),
            groupCount = Math.ceil(this.slides.length/slidesPerGroup),
            docFrag = document.createDocumentFragment();

        this.sets = []; // empty sets before recalculation

        //first empty out slides
        this.container.innerHTML = "";

        for (var i = 0; i < groupCount; i++) {
            var groupEl = document.createElement('div');
            groupEl.classList.add('slide-group');
            
            var end = slidesPerGroup*(i+1) > this.slides.length ? this.slides.length : slidesPerGroup*(i+1),
                start = i*slidesPerGroup > this.slides.length ? this.slides.length-1 : i*slidesPerGroup,
                slideChunk = this.slides.slice(start, end );

            slideChunk.forEach(function(slide) {
                groupEl.appendChild(slide);
            });

            this.sets.push(groupEl);
            docFrag.appendChild(groupEl); // append to docFrag first to avoid multiple page re-paints
        };  

        this.container.appendChild(docFrag); // append all new slide groups in one go to avoie multiple browser re-paints

        this.state.slideTotal = groupCount;

        if(this.state.current > this.state.slideTotal-1) {
            this.state.current = this.state.slideTotal-1;
        } 

        this.recalcSlidePositions(true);

        if(this.settings.pagination){
            this.addPagination(true); // need to re-add pagination with the correct number of slides
        }
    },

    onResize: function(fn, time) {
        var timeout, self = this;
        window.onresize = function(){
            clearTimeout(self.timeout);
            self.timeout = setTimeout(fn, 150);    
        };
    },

    addNavHandlers: function(el, fn) {
        el.addEventListener('click', fn.bind(this), false);
    },

    addPagination: function(isRecalculation){
        var self = this;

        this.pager = this.pager || this.el.querySelector('.pagination');

        if(this.pager && isRecalculation){
            this.el.removeChild(this.pager);
            this.pager.innerHTML = ""; // using innerHTML bc is also safely removes event listeners, I think :)
            this.pager = null;
        }

        if(!this.pager){
            this.pager = document.createElement('nav');
            this.pager.classList.add('pagination');
        }

            for (var i = 0; i < this.state.slideTotal; i++) {
                var btn = document.createElement('button');
                btn.setAttribute('data-page', i);
                btn.classList.add('pagination__btn');
                var txt = document.createTextNode(i+1);
                btn.appendChild(txt);
                this.addNavHandlers(btn, this.goToSlide);
                //btn.addEventListener('click', self.goToSlide.bind(self), false);
                self.pager.appendChild(btn);                
            };

            this.el.appendChild(this.pager);
            this.state.pagination = Array.prototype.slice.call(this.pager.querySelectorAll('.pagination__btn'));

        if(isRecalculation) this.markActives();
    },

    goToSlide: function(e){
        var target = e.target, 
            slide = target.getAttribute('data-page');

        this.state.current = this.state.current >= this.state.slideTotal ? 0 : +slide;

        this.traverse();
    },

    goToNext: function(){
        this.state.current++;
        this.state.current = this.state.current >= this.state.slideTotal ?  0 : this.state.current;
        this.traverse();
    },

    goToPrev: function(){
        this.state.current--;
        this.state.current = this.state.current < 0 ? this.state.slideTotal-1 : this.state.current;
        this.traverse();
    },

    markActives: function(init){
        var elGroup;

        // need to mark the right slides:
        // If we're in dynamic container mode, active needs to be set on the divs wrapping the slides
        if(this.settings.dynamic){
            elGroup = this.sets;
        } else {
            // Not in dynamic container mode, so apply active states to the slides themselves
            elGroup = this.slides;
        }

        // remove any active class if it exists and apply .active to the current slide element
        this.container.querySelector('.active') ? this.container.querySelector('.active').classList.remove('active') : null;
        if(this.state.pagination[this.state.current]) {
            elGroup[this.state.current].classList.add('active');
        } else {
            elGroup[0].classList.add('active');
        }

        // update the paginator's active element
        if(this.settings.pagination){
            this.pager.querySelector('.active') ? this.pager.querySelector('.active').classList.remove('active') : null;
            if(this.state.pagination[this.state.current]) {
              this.state.pagination[this.state.current].classList.add('active');  
          } else {
            this.state.pagination[0].classList.add('active');
          }
        }      
    },

    traverse: function(noanim){
        if(noanim === true || !this.settings.animation){
            // if the traverse is happening because of a browser resize, we don't want the animation to happen
            // it looks bad and is probably distracting to the user. So we temporarily apply a class that 'turns off' the 
            // transition animations while we're in a resize event.
            this.container.classList.add('no-anim');
        } else {
            // Otherwise, traverse is running as a result of a user event, in which case we definitely want the animation to happen
            /// (unless specified as false in this.settings.animation)
            this.container.classList.remove('no-anim');
        }

        //this.transition(this.container, 'transition', 'none');
        this.transition(this.container, 'transform', 'translateX( ' + -(this.state.current*this.state.widthOffset) + 'px)'); 
        this.markActives(false);               
    },

    /// THIS TK
    appendSlide: function(){
        // after animation ends, re-position slide that was just moved off stage to end of slideshow, 
        // this is necessary to run an infinite loop-style animation
    },

    transition: function(el, prop, value){
        var vendors = ['-moz-','-webkit-','-o-','-ms-','-khtml-',''];
        
        for(var i=0, l = vendors.length; i<l; i++) {
            el.style[this.toCamelCase(vendors[i] + prop)] = value;
        }

    },

    toCamelCase: function(str){
        return str.toLowerCase().replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
    },

    mergeOpts: function(opts){
        if(opts){
            for(var opt in this.settings ){
                this.settings[opt] = opts[opt] === undefined ? this.settings[opt] : opts[opt];
            };
        }

    }
};

// Optionally do `module.exports = Slider;` here, for CommonJS compat

var slidy = new Slider();
slidy.init({
    el: "#slider",
    dynamic: true,
    pagination: true
});



