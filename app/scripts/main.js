
"use strict";

var Slider = function(){
    this.el = document.querySelector('#slider');
    this.container = null;
    this.slides = Array.prototype.slice.call(this.el.querySelectorAll('.slide'));
    this.sets = [];
    this.next = document.querySelector('#next');
    this.prev = document.querySelector('#prev');
    this.pager = null;
    this.state = {
            current: 0,
            widthOffset: this.el.offsetWidth,
            slideTotal: this.slides.length
        };
    this.settings = {
            pagination: false,
            sliderPadding: 0,
            dynamic: false,
            container: '.slides-wrapper',
            autoplay: false,
            interval: 2000
        };

};

Slider.prototype = {

    init: function(opts) {
        
        // set up user options on settings
        this.mergeOpts(opts);
        this.container = document.querySelector(this.settings.container);

        this.loadImages(this.configureSlides.bind(this));

        if(this.settings.pagination){
            this.addPagination();
        }

        if(this.settings.autoplay){
            this.autoplay();
        }

        this.addNavHandlers(this.next, this.goToNext);
        this.addNavHandlers(this.prev, this.goToPrev);
        this.container.addEventListener('transitionend', this.updateAfterTrans); // (TK - need to add vendor API variations). Option fire callback after each transition

        // if this is running, js obviously works, so remove no-js controls and swap in 2 through n slide images if present
        var nojs = document.querySelector('.nojs');
        nojs.classList.remove('nojs')
    },

    autoplay: function() {
        var self = this;
        setInterval(function(){
            self.goToNext();
        }, this.settings.interval)
    },

    configureSlides: function() {

        if(this.settings.dynamic){
            this.settings.pagination = false
            // init process to calculate # of slide items to show per slide  
            this.slides.forEach(function(slide) {
                slide.classList.remove('slide');
                slide.classList.add('slag');
            });

            this.calculateDynamicContainers();
            this.onResize(this.calculateDynamicContainers);
            this.recalcSlidePositions();
        } else {
            this.recalcSlidePositions(true);
            this.onResize(this.recalcSlidePositions);
        }
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

            for (var i = 0; i < this.slides.length; i++) {
                if(i == 0 ){
                    // skip first slide, which should always be referenced in an <img> to fulfill failed PE qualification test
                    frag.appendChild(this.slides[i]);
                } else {
                    this.slides[i].appendChild(imgs[i-1]);
                    frag.appendChild(this.slides[i]);
                }
            }
           
            this.container.appendChild(frag);
        }

        fn();
    },

    recalcSlidePositions: function(resize){
        // on browser resize, we need to recalculate the slide's left position so they are correctly spaced amongst themselves,
        // or weird margin and overlapping will begin to occur. This ensures the slides stay 'synced' to the size of their parent 
        // container, which SHOULD be a percentage of viewport width bc it's a responsive design, right?
        var self = this;
        this.state.widthOffset = this.el.offsetWidth; // set width for a single slide or single dynamic container       

        var elGroup;
        if(this.settings.dynamic){
            elGroup = this.sets;
        } else {
            elGroup = this.slides;
        }

        elGroup.forEach(function(slide, i) {
            // set up initial position of all the slides (ignore padding)
            slide.style.left = self.state.widthOffset * i + "px";
        });

        this.traverse(resize);
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

        // console.log('slide width: ' + slideWidth);
        // console.log('container width: ' + containerWidth);
        // console.log('================\n');


        // console.log('groupsCount: ' + groupCount);
        // console.log('================\n');
        // console.log('slidesPerGroup: ' + slidesPerGroup);
        // console.log('================\n');


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
        
        var slideDelta = this.state.slideTotal - groupCount;

        if(this.state.slideTotal == this.state.current+1){
            this.state.current = groupCount-1;
        }

        //this.state.current = this.state.slideTotal == this.state.current+1 ? groupCount-1 : this.state.current+1;
        this.state.slideTotal = groupCount;

        this.markActives(false);
        this.recalcSlidePositions(true);


        console.log('AFTER state.current: ' + this.state.current);
        console.log('AFTER slideTotal: ' + this.state.slideTotal);
    },

    onResize: function(fn, time) {
        var timeout, self = this;
        window.onresize = function(){
            clearTimeout(timeout);
            timeout = setTimeout( function(){
                fn.call(self, true);
            }, time || 150);
        }
    },

    addNavHandlers: function(el, fn) {
        el.addEventListener('click', fn.bind(this), false);
    },

    addPagination: function(){
        var self = this;
        this.pager = document.querySelector('.pagination');

        if(!this.pager){
            this.pager = document.createElement('nav');
            this.pager.classList.add('pagination');
            //container.appendChild(pager);
            this.el.parentNode.insertBefore(this.pager, this.el.nextSibiling);
        }

            this.slides.forEach(function(slide, i) {
                var btn = document.createElement('button');
                btn.setAttribute('data-page', i);
                btn.classList.add('pagination__btn');
                var txt = document.createTextNode(i+1);
                btn.appendChild(txt);
                btn.addEventListener('click', self.goToSlide.bind(self), false);
                self.pager.appendChild(btn);
            });

            this.state.pagination = Array.prototype.slice.call(this.pager.querySelectorAll('.pagination__btn'));
            this.markActives(true);
    },

    goToSlide: function(e){
        var target = e.target, 
            slide = target.getAttribute('data-page');

        this.state.current = this.state.current >= this.state.slideTotal ? this.state.current = 0 : +slide;

        this.traverse();
    },

    goToNext: function(){

        this.state.current++;

        this.state.current = this.state.current >= this.state.slideTotal ? this.state.current = 0 : this.state.current;

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
        if(this.settings.dynamic && !init){
            elGroup = this.sets;
        } else {
            // Not in dynamic container mode, so apply active states to the slides themselves
            elGroup = this.slides;
        }

        this.container.querySelector('.active') ? this.container.querySelector('.active').classList.remove('active') : null;
        elGroup[this.state.current].classList.add('active');

        if(this.state.pagination){
            this.pager.querySelector('.active') ? this.pager.querySelector('.active').classList.remove('active') : null;
            this.state.pagination[this.state.current].classList.add('active');
        }      
    },

    traverse: function(resize){
        if(resize === true){
            // if the traverse is happening because of a browser resize, we don't want the animation to happen
            // it looks bad and is probably distracting to the user. So we apply a class that 'turns off' the 
            // transition animations while we're in a resize event.
            this.container.classList.add('no-anim');
        } else {
            // Otherwise, traverse is running as a result of a user event, in which case we definitely want the animation to happen
            this.container.classList.remove('no-anim');
        }

        //this.transition(this.container, 'transition', 'none');
        this.transition(this.container, 'transform', 'translateX( ' + -(this.state.current*this.state.widthOffset) + 'px)');                
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

        this.markActives(false);
    },

    toCamelCase: function(str){
        return str.toLowerCase().replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
    },

    mergeOpts: function(opts){
        for(var opt in this.settings ){
            this.settings[opt] = opts[opt];
        };
    }
};


    var slidy = new Slider();
    slidy.init({
        pagination: true,
        dynamic: true,
        container: '.slides-wrap'
        //autoplay: true,
        //interval: 5000 // for autoplay true only
    });




