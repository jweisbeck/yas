
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
        widthOffset: el.offsetWidth,
        slideTotal: slides.length
    },
    settings = {
        pagination: false,
        sliderPadding: 0,
        dynamic: false,
        container: '.slides-wrapper'
    };


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

        addNavHandlers(next, goToNext);
        addNavHandlers(prev, goToPrev);
        container.addEventListener('transitionend', updateAfterTrans); // option fire callback after each transition

        // if this is running, js obviously works, so remove no-js controls
        var nojs = document.querySelector('.nojs');
        nojs.classList.remove('nojs')

    }

    function setInitialPositions(){
        state.widthOffset = el.offsetWidth; // set width for a single slide or single dynamic container       

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
            containerWidth = el.offsetWidth,
            slidesPerGroup = Math.floor(containerWidth/slideWidth),
            groupCount = Math.ceil(slides.length/slidesPerGroup),
            docFrag = document.createDocumentFragment();


        sets = []; // empty sets before recalculation

        //first empty out slides
        container.innerHTML = "";

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
            
            var end = slidesPerGroup*(i+1) > slides.length ? slides.length : slidesPerGroup*(i+1),
                start = i*slidesPerGroup > slides.length ? slides.length-1 : i*slidesPerGroup,
                slideChunk = slides.slice(start, end );

            slideChunk.forEach(function(slide) {
                groupEl.appendChild(slide);
            });

            sets.push(groupEl);

            docFrag.appendChild(groupEl); // append to docFrag first to avoid multiple page re-paints
        };  

        container.appendChild(docFrag); // append all new slide groups in one go to avoie multiple browser re-paints
 
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
        
        state.current++;

        state.current = state.current >= state.slideTotal ? state.current = 0 : state.current;

        traverse();

    }

    function goToPrev(){

        state.current--;
        state.current = state.current < 0 ? state.slideTotal-1 : state.current;

        traverse();

    }

    function markActives(init){
        var elGroup;

        // need to mark the right slides:
        // If we're in dynamic container mode, active needs to be set on the divs wrapping the slides
        if(settings.dynamic && !init){
            elGroup = sets;
        } else {
            // Not in dynamic container mode, so apply active states to the slides themselves
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
        markActives(false);
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




