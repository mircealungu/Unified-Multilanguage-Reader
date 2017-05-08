import $ from 'jquery';
import config from '../config';
import Speaker from './Speaker';

var speaker = new Speaker();

$(document).ready(function() {
    var start;

    $(config.HTML_ZEEGUUTAG).on('mousedown', function(e) {
        start = new Date().getTime();
    });
    $(config.HTML_ZEEGUUTAG).on('mouseleave', function(e) {
        start = 0;
    });
    $(config.HTML_ZEEGUUTAG).on('mouseup', function(e) {
        if (new Date().getTime() >= (start + config.SPEECH_DELAY)) {
            /* Retrieve textual content of the parent only. */
            var text = $(this).clone()      //clone element
                              .children()   //select all children
                              .remove()     //remove all children
                              .end()        //back to selected element
                              .text();      //retrieve text
            speaker.speak(text, FROM_LANGUAGE);  
        } 
    });

});