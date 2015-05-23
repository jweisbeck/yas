
/*
    DON'T CARE ABOUT <IE9? DON'T NEED OODLES OF FEATURES?
    This is Yet Another Slider (YAS). BUT, it is a bit special: it doesn't need jQuery and it only has two key features.
    I've slung my fair share of sliders, and in my experience, two features are the most important to making clients happy: 
    pagination and dynamic sizing. This slider has those features, and nothing else.

*/

"use strict";

var el = document.querySelector('#slider'),
    container,
    slides = Array.prototype.slice.call(el.querySelectorAll('.slide')),
    sets = [],
    slideImgs = Array.prototype.slice.call(el.querySelectorAll('.slide img')),
    next = document.querySelector('#next'),
    prev = document.querySelector('#prev'),
    pager = null,
    state = {
        current: 0,
        dir: 'next',
        widthOffset: el.offsetWidth,
        slideTotal: slides.length,
        isAnimating: false
    },
    settings = {
        pagination: false,
        slideHeight: null,
        sliderPadding: 0,
        dynamic: false,
        container: ''
    }


    function init(opts) {
        
        // set up user options on settings
        mergeOpts(opts);

        container = document.querySelector(settings.container);

        if(settings.dynamic){
            settings.pagination = false
            // init process to calculate # of slide items to show per slide  
            slides.forEach(function(slide) {
                slide.classList.remove('slide');
                slide.classList.add('slag');
            });

            calculateDynamicContainers();
            dynamicContainerEvents();
            setInitialPositions();
        } else {
            setInitialPositions();
        }

        if(settings.pagination){
            addPagination();
        }

        // set the slide width (which can change as viewport resizes)
        state.slideWidth = el.offsetWidth;        
        settings.slideHeight ? el.style.height = settings.slideHeight + sliderPadding + "px" : null;        

        addNavHandlers(next, goToNext);
        addNavHandlers(prev, goToPrev);
        container.addEventListener('transitionend', updateAfterTrans); // option fire callback after each transition

    }

    function setInitialPositions(){
        var elGroup;
        if(settings.dynamic){
            elGroup = sets;
        } else {
            elGroup = slides;
        }

        elGroup.forEach(function(slide, i) {
            // set up initial position of all the slides (ignore padding)
            slide.style.left = state.widthOffset * i + "px";
        });
    }

    function calculateDynamicContainers(){

        var slideWidth = slides[0].offsetWidth,
            containerWidth = el.offsetWidth;

        sets = []; // empty sets before recalculation

        //container.removeChild(container.firstChild); 
        while(container.firstChild){
            container.removeChild(container.firstChild);    
        }

        // console.log('slide width: ' + slideWidth);
        // console.log('container width: ' + containerWidth);
        // console.log('================\n');

        
        var slidesPerGroup = Math.floor(containerWidth/slideWidth),
            groupCount = Math.ceil(slides.length/slidesPerGroup);

        // console.log('groupsCount: ' + groupCount);
        // console.log('================\n');
        // console.log('slidesPerGroup: ' + slidesPerGroup);
        // console.log('================\n');


        for (var i = 0; i <= groupCount; i++) {
            var groupEl = document.createElement('div');
            groupEl.classList.add('slide-group');
            sets.push(groupEl);
        };

        for (var i = 0; i < groupCount; i++) {
            var end = slidesPerGroup*(i+1) > slides.length ? slides.length : slidesPerGroup*(i+1);
            var start = i*slidesPerGroup > slides.length ? slide.length-1 : i*slidesPerGroup;
            var slideChunk = slides.slice(start, end );

            slideChunk.forEach(function(slide) {
                sets[i].appendChild(slide);
            });
            
        }

        for (var i = 0; i < groupCount; i++) {
            container.appendChild(sets[i]);
        };
 
        state.current = 0;
        state.slideTotal = groupCount;
        markActives(false);
        setInitialPositions();
        traverse();

    }

    function dynamicContainerEvents(){
        var timeout;
        window.onresize = function(){
            clearTimeout(timeout);
            timeout = setTimeout( function(){
                calculateDynamicContainers();
            }, 150);
        }

    }

    function addNavHandlers(el, fn) {
        el.addEventListener('click', fn, false);
    }

    function updateAfterTrans(){
        appendSlide();
    }

    function handleResize(){
        var that = this;
    }

    function addPagination(){
        pager = document.querySelector('.pagination');

        if(!pager){
            pager = document.createElement('nav');
            pager.classList.add('pagination');
            //container.appendChild(pager);
            el.parentNode.insertBefore(pager, el.nextSibiling);
        }

            slides.forEach(function(slide, i) {
                var btn = document.createElement('button');
                btn.setAttribute('data-page', i);
                btn.classList.add('pagination__btn');
                var txt = document.createTextNode(i+1);
                btn.appendChild(txt);
                btn.addEventListener('click', goToSlide, false);
                pager.appendChild(btn);
            });

            state.pagination = Array.prototype.slice.call(pager.querySelectorAll('.pagination__btn'));
            markActives(true);
    }

    function goToSlide(e){
        var target = e.target, 
            slide = target.getAttribute('data-page');

        state.current = +slide;

        traverse();
    }

    function goToNext(){
        state.dir = 'next';
        
        state.current++;

        state.current = state.current >= state.slideTotal ? state.current = 0 : state.current;

        traverse();

        //console.log(state.current);
    }

    function goToPrev(){
        state.dir = 'prev';
        //console.log(state.current)
        
        state.current--;
        state.current = state.current < 0 ? state.slideTotal-1 : state.current;

        traverse();

        //console.log(state.current);
    }

    function markActives(init){
        var elGroup;
        if(settings.dynamic && !init){
            elGroup = sets;
        } else {
            elGroup = slides;
        }

        container.querySelector('.active') ? container.querySelector('.active').classList.remove('active') : null;
        elGroup[state.current].classList.add('active');

        if(state.pagination){
            pager.querySelector('.active') ? pager.querySelector('.active').classList.remove('active') : null;
            state.pagination[state.current].classList.add('active');
        }      
    }

    function traverse(){
        transition(container, 'transform', 'translateX( ' + -(state.current*state.widthOffset) + 'px)');
        markActives(false);
    }

    /// THIS TK
    function appendSlide(){
        // after animation ends, re-position slide that was just moved off stage to end of slideshow, 
        // this is necessary to run an infinite loop-style animation
    }

    function transition(el, prop, value){
        var vendors = ['-moz-','-webkit-','-o-','-ms-','-khtml-',''];
        for(var i=0,l=vendors.length;i<l;i++) {
            el.style[toCamelCase(vendors[i] + prop)] = value;
        }
    }

    function toCamelCase(str){
        return str.toLowerCase().replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
    };

    function mergeOpts(opts){
        for(var opt in settings ){
            settings[opt] = opts[opt];
        };
    }

    init({
        pagination: true,
        dynamic: true,
        container: '.slides-wrap'
    });




