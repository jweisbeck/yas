
"use strict";

var Slider = function(){
    this.el = document.querySelector('#slider');
    this.container = null;
    this.slides = Array.prototype.slice.call(this.el.querySelectorAll('.slide'));
    this.sets = [];
    this.slideImgs = Array.prototype.slice.call(this.el.querySelectorAll('.slide img'));
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
            container: '.slides-wrapper'
        };

};

Slider.prototype = {

    init: function(opts) {
        
        // set up user options on settings
        this.mergeOpts(opts);
        this.container = document.querySelector(this.settings.container);

        if(this.settings.dynamic){
            this.settings.pagination = false
            // init process to calculate # of slide items to show per slide  
            this.slides.forEach(function(slide) {
                slide.classList.remove('slide');
                slide.classList.add('slag');
            });

            this.calculateDynamicContainers();
            this.dynamicContainerEvents();
            this.setInitialPositions();
        } else {
            this.setInitialPositions();
        }

        if(this.settings.pagination){
            this.addPagination();
        }

        this.addNavHandlers(this.next, this.goToNext);
        this.addNavHandlers(this.prev, this.goToPrev);
        this.container.addEventListener('transitionend', this.updateAfterTrans); // option fire callback after each transition

        // if this is running, js obviously works, so remove no-js controls
        var nojs = document.querySelector('.nojs');
        nojs.classList.remove('nojs')

    },

    setInitialPositions: function(){
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
 
        this.state.current = 0;
        this.state.slideTotal = groupCount;
        this.markActives(false);
        this.setInitialPositions();
        this.traverse();

    },

    dynamicContainerEvents: function(){
        var timeout, self = this;
        window.onresize = function(){
            clearTimeout(timeout);
            timeout = setTimeout( function(){
                self.calculateDynamicContainers();
            }, 150);
        }

    },

    addNavHandlers: function(el, fn) {
        el.addEventListener('click', fn.bind(this), false);
    },

    updateAfterTrans: function(){
        //this.appendSlide();
    },

    addPagination: function(){
        pager = document.querySelector('.pagination');

        if(!pager){
            pager = document.createElement('nav');
            pager.classList.add('pagination');
            //container.appendChild(pager);
            this.el.parentNode.insertBefore(pager, el.nextSibiling);
        }

            this.slides.forEach(function(slide, i) {
                var btn = document.createElement('button');
                btn.setAttribute('data-page', i);
                btn.classList.add('pagination__btn');
                var txt = document.createTextNode(i+1);
                btn.appendChild(txt);
                btn.addEventListener('click', goToSlide, false);
                pager.appendChild(btn);
            });

            this.state.pagination = Array.prototype.slice.call(pager.querySelectorAll('.pagination__btn'));
            this.markActives(true);
    },

    goToSlide: function(e){
        var target = e.target, 
            slide = target.getAttribute('data-page');

        this.state.current = +slide;

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

    traverse: function(){
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
    });




