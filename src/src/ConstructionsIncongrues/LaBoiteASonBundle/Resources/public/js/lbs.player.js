	var context;
	var contextloop;
	var canvas;
	var canvasloop;
	var duration;
	var loop_start=0;
	var loop_end;
	var is_looped=false;
	var current_time;
	var drag_flag=0;
	var drag_flag_volume=0;
	var mouse_is_down_loop=0;
	var mouse_is_down_volume=0;
	var mouse_is_down_volume_y=0;
	var mouse_is_down_x;
	var current_volume=100;

	//$(document).ready(function() {
	function init_the_player(){
		//console.log(loop_start);
		canvas = document.getElementById('waveform');
		context = canvas.getContext('2d');
		canvasloop = document.getElementById('looppoints');
		contextloop = canvasloop.getContext('2d');
		canvasvolume = document.getElementById('volume-canvas');
		contextvolume = canvasvolume.getContext('2d');
		canvastext = document.getElementById('canvasdisplaytime');
		contexttext = canvastext.getContext('2d');
		//context.rect(0,0, 720, 80);
		//context.fillStyle = "rgba(255, 255, 255, 0.4)";
		//context.fill();
		$( "#link-sample" ).dialog({
            autoOpen: false,
            resizable: false,
            draggable: false,
            show: "blind",
            hide: "explode"
        });
        $( "#clipboard-button" ).click(function() {
            $( "#link-sample" ).dialog( "open" );
            $( "#link-selection" ).dialog( "close" );
            return false;
        });
        $('#link-sample-input').click(function(){$(this).select();});
        $( "#link-selection" ).dialog({
            autoOpen: false,
            resizable: false,
            draggable: false,
            show: "blind",
            hide: "explode"
        });
        $( "#clipboard-selection-button" ).click(function() {
            $( "#link-selection" ).dialog( "open" );
            $('#link-selection-input').val("url?loop_start="+loop_start+"&loop_end="+loop_end);
            $( "#link-sample" ).dialog( "close" );

            return false;
        });
 		$('#link-selection-input').click(function(){$(this).select();});
        $( "#clipboard-button" ).click(function() {
            $( "#dialog" ).dialog( "open" );
            return false;
        });
		$( "#download-button" ).button({
            icons: {
                primary: "ui-icon-arrowthickstop-1-s"
            },
            text: false
        });
        $( "#download-selection-button" ).button({
            icons: {
                primary: "ui-icon-grip-dotted-horizontal"
            },
            text: false
        });
        $( "#clipboard-button" ).button({
            icons: {
                primary: "ui-icon-clipboard"
            },
            text: false
        });
        $( "#clipboard-selection-button" ).button({
            icons: {
                primary: "ui-icon-copy"
            },
            text: false
        });
		$("#reset-loop").button({
			text: false,
			icons: {
				primary: "ui-icon ui-icon-arrowthick-2-e-w"
			}
		}).click(function(){
			reset_loop();
		});
		

		$( "#progressbar" ).progressbar({
			value: 0
		});
		$('#waveform').bind('mouseup',function(e) {
			mouse_is_down_loop=0;
		});
		$('#waveform').bind('mousedown',function(e) {
			if(drag_flag==0){
			var offset = $(this).offset();
			seekAudio((e.clientX - offset.left)/$('#waveform').width()*duration);
			}
			mouse_is_down_loop=1;
			var offset = $(this).offset();
			mouse_is_down_x=e.clientX - offset.left;


		});
		$('#waveform').mousemove(function(emove){
			if(mouse_is_down_loop==1){
				drag_flag=1;
				var offset = $(this).offset();
				if((emove.clientX - offset.left)>mouse_is_down_x){
					loop_start=(mouse_is_down_x)/$('#waveform').width()*duration;
					loop_end=(emove.clientX - offset.left)/$('#waveform').width()*duration;
					$('#slider-loop').slider({values: [ (mouse_is_down_x)/$('#waveform').width()*1000, (emove.clientX - offset.left)/$('#waveform').width()*1000 ]});
				}else{
					loop_end=(mouse_is_down_x)/$('#waveform').width()*duration;
					loop_start=(emove.clientX - offset.left)/$('#waveform').width()*duration;
					$('#slider-loop').slider({values: [  (emove.clientX - offset.left)/$('#waveform').width()*1000 , (mouse_is_down_x)/$('#waveform').width()*1000]});
				}
				update_loop_points();
				update_canvas_time(loop_start);
			}else{					
				drag_flag=0;
			}
				
		});
		$('#waveform').mouseleave(function(e){
			mouse_is_down_loop=0;
			drag_flag=0;
		});
		$( "#play" ).button({
            text: false,
            icons: {
                primary: "ui-icon-play"
            }
        })
		$('#play').bind('mouseup',function(e) {
			mouse_is_down_volume=0;
			if(drag_flag_volume==0){
			//play
			//alert($('#play').text());
			if($('#play').text()==="play"){
				document.getElementById('player').play();
				$( "#play" ).button({
					label: "pause",
					icons: {
						primary: "ui-icon-pause"
					}
				});
			}else{
				document.getElementById('player').pause();
				$( "#play" ).button({
					label: "play",
					icons: {
						primary: "ui-icon-play"
					}
				});	
			}
		}
	});
		$('#play').bind('mousedown',function(e) {
			
			mouse_is_down_volume=1;
			var offset = $(this).offset();
			mouse_is_down_volume_y=e.clientY - offset.top;

		});
		$('#play').mousemove(function(emove){
			if(mouse_is_down_volume==1){
				drag_flag_volume=1;
				var offset = $(this).offset();
				contextvolume.clearRect(0, 0, 86, 86);
				current_volume=current_volume-(emove.clientY - offset.top - mouse_is_down_volume_y)*2.;
				if(current_volume>200){current_volume=200;}
				if(current_volume<0){current_volume=0;}
				mouse_is_down_volume_y=(emove.clientY - offset.top )/1.;
				setVolume(current_volume);
			}else{					
				drag_flag_volume=0;
			}
		});
		$('#play').mouseleave(function(e){
			mouse_is_down_volume=0;
			drag_flag_volume=0;
		});

		$( "#slider-loop" ).slider({
		range: true,
		min: 0,
		max: 1000,
		values: [ loop_start/duration*1000, loop_end/duration*1000 ],
		slide: function( event, ui ) {
			//console.log(ui.values[ 0 ]);
			loop_start = ui.values[ 0 ]/1000.0*duration;
			loop_end = ui.values[ 1 ]/1000.0*duration;
			contextloop.clearRect(0, 0, $('#waveform').width(), 80);
			contextloop.beginPath();
			contextloop.moveTo(ui.values[ 0 ]/1000.0*$('#waveform').width(),0);
			contextloop.lineTo(ui.values[ 0 ]/1000.0*$('#waveform').width(),80);
			contextloop.moveTo(ui.values[ 1 ]/1000.0*$('#waveform').width(),0);
			contextloop.lineTo(ui.values[ 1 ]/1000.0*$('#waveform').width(),80);
			contextloop.strokeStyle = "rgba(255, 0, 0, 1)";
			contextloop.stroke();
			contexttext.clearRect(0,0,2000,80);
			contexttext.font="10px Arial";
			contexttext.fillText("0:00",0,12);
			contexttext.fillText(seconds_to_string(duration),$('#canvasdisplaytime').width()-28,12);
			contexttext.fillText(seconds_to_string(loop_start),ui.values[ 0 ]/1000.0*$('#waveform').width()-24,12);
			contexttext.fillText(seconds_to_string(loop_end),ui.values[ 1 ]/1000.0*$('#waveform').width(),12);
			
			//is_looped=true;
			//update_loop_points();
		}
		});
		

		
		//alert($('#player-container').width());
		$('#divpng').width($('#player-container').width()-140);
		//alert($('#divpng').width());
		$('#looppoints').attr('width', $('#player-container').width()-140 );
		$('#looppoints').attr('height', $('#divpng').height() );
		$('#waveform').attr('width', $('#player-container').width()-140 );
		$('#waveform').attr('height', $('#divpng').height() );
		$('#progressbar').width($('#player-container').width()-140 );
		$('#slider-loop').width($('#player-container').width()-140 );
		$('#divcanvaslooppoints').width($('#player-container').width()-140 );
		$('#divcanvastime').width($('#player-container').width()-140 );
		$('#divcanvasdisplaytime').width($('#player-container').width()-140 );
		$('#canvasdisplaytime').attr('width', $('#player-container').width()-140 );
		$('#canvasdisplaytime').attr('height', 15 );
		
		window.addEventListener('resize', resizeCanvas, false);
		document.getElementById('player').addEventListener('progress', getPercentProg, false);
		document.getElementById('player').addEventListener("loadedmetadata", metadataok, false);
		//console.log(document.getElementById('player'));
		setVolume(current_volume);
		
	}
	//});

function setVolume(vol){
				//contextvolume.beginPath();
      			// contextvolume.rect(0,0,80,80);
      			// contextvolume.fillStyle = "rgba(0, 109, 204, 1)";
      			// contextvolume.fill();
				contextvolume.beginPath();
      			contextvolume.arc(40, 40, 30, -0.5 * Math.PI, current_volume/200.0*-2*Math.PI-0.5 * Math.PI, true);
      			contextvolume.lineWidth = 15;
      			contextvolume.strokeStyle = 'gray';
      			contextvolume.stroke();
      			
      			document.getElementById('player').volume=vol/200.;
}

function getPercentProg() {
	var theplayer = document.getElementById('player');
	var endBuf = theplayer.buffered.end(0);
	var soFar = parseInt(((endBuf / theplayer.duration) * 100));
	$( "#progressbar" ).progressbar({
		value: soFar
	});
}

function resizeCanvas() {
	$('#divpng').width($('#player-container').width()-140);
	$('#looppoints').attr('width', $('#player-container').width()-140 );
	$('#looppoints').attr('height', $('#divpng').height() );
	$('#waveform').attr('width', $('#player-container').width()-140 );
	$('#waveform').attr('height', $('#divpng').height() );
	$('#progressbar').width($('#player-container').width()-140 );
	$('#slider-loop').width($('#player-container').width()-140 );
	$('#divcanvaslooppoints').width($('#player-container').width()-140 );
	$('#divcanvastime').width($('#player-container').width()-140 );
	$('#divcanvasdisplaytime').width($('#player-container').width()-140 );
	$('#canvasdisplaytime').attr('width', $('#player-container').width()-140 );
	update_loop_points();
	update_canvas_time(current_time);
}

function metadataok() {
	
	duration = document.getElementById('player').duration;
	//console.log("mdok", duration);
	
	update_loop_points();
	update_canvas_time(current_time);

}

function update_canvas_time(_current_time){
	current_time=_current_time;
	//console.log(current_time + " / " + loop_start + " / " + loop_end);
	if(_current_time<loop_start || _current_time>loop_end){
		document.getElementById("player").currentTime = loop_start;
		_current_time=loop_start;
	}
	context.clearRect(0, 0, $('#waveform').width(), 80);
	context.beginPath();
	context.moveTo(_current_time/duration*$('#waveform').width(), 0);
	context.lineTo(_current_time/duration*$('#waveform').width(), 80);
	context.strokeStyle = "rgba(255, 127, 36, 1.)";
	context.stroke();
	context.lineWidth = 0;
	context.beginPath();
	context.rect(0,0, (_current_time/duration*$('#waveform').width()), 80);
	context.fillStyle = "rgba(255, 127, 36, 0.25)";
	context.fill();
	
}

function seconds_to_string(secs) {
    sec_numb    = secs;
    var hours   = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = Math.ceil(sec_numb - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = minutes+':'+seconds;
    return time;
}

function seekAudio(newtime) {
	document.getElementById("player").currentTime = newtime;
}

function reset_loop(){
	$( "#slider-loop" ).slider({values: [ 0, $('#waveform').width() ]});
	contextloop.clearRect(0, 0, $('#waveform').width(), 80);
	loop_start =0;
	loop_end = duration;
	is_looped=false;
}

function update_loop_points(s, e){
	
	if(loop_end==null){
		loop_end=duration;
	}
	//loop_start = $('#slider-loop').slider('values')[ 0 ]/1000.0*duration;
	//loop_end = $('#slider-loop').slider('values')[ 1 ]/1000.0*duration;
//console.log("ulp");
//console.log(loop_start, loop_end);
	if(mouse_is_down_loop==0){
		$('#slider-loop').slider({values: [ loop_start/duration*1000, loop_end/duration*1000 ]});
		update_canvas_time(loop_start);
		seekAudio(loop_start);
	}


	contextloop.clearRect(0, 0, $('#waveform').width(), 80);
	contextloop.beginPath();
	contextloop.moveTo($('#slider-loop').slider('values')[ 0 ]/1000.0*$('#waveform').width(),0);
	contextloop.lineTo($('#slider-loop').slider('values')[ 0 ]/1000.0*$('#waveform').width(),80);
	contextloop.moveTo($('#slider-loop').slider('values')[ 1 ]/1000.0*$('#waveform').width(),0);
	contextloop.lineTo($('#slider-loop').slider('values')[ 1 ]/1000.0*$('#waveform').width(),80);
	contextloop.strokeStyle = "rgba(255, 0, 0, 1)";
	contextloop.stroke();
	
	contexttext.font="10px Arial";
	//console.log('aaa');
	contexttext.clearRect(0,0,2000,80);
	contexttext.font="10px Arial";
	contexttext.fillText("0:00",0,12);
	contexttext.fillText(seconds_to_string(duration),$('#canvasdisplaytime').width()-28,12);
	contexttext.fillText(seconds_to_string(loop_start),$('#slider-loop').slider('values')[ 0 ]/1000*$('#waveform').width()-24,12);
	contexttext.fillText(seconds_to_string(loop_end),$('#slider-loop').slider('values')[ 1 ]/1000*$('#waveform').width(),12);
}


function the_player(ogg_file_path, png_file_path, lstart, lend, cb){
	if(loop_end!=null){
		loop_end=lend;
	}
	if(loop_start!=null){
		loop_start=lstart;
	}else{
		loop_start=0;
	}

	
	var retstring="<div id='player-container' style='width:100%;padding:0px;background-color:rgba(225, 225, 225, 1);padding:5px;'> <div id='link-sample' title='lien vers le sample' style='font-size:10pt;'> <p><input style='width:100%;' id='link-sample-input' type='text' value='"+ogg_file_path+"'></input></p> </div> <div id='link-selection' title='lien vers la selection' style='font-size:10pt;'> <p><input style='width:100%;' id='link-selection-input' type='text' value='"+"'></input></p> </div> <div id='div-play-button' style='width:80px;float:left;padding-top:6px;margin-top:10px'> <button id='play' style='position:relative;margin-left:10px;width:60px;height:60px;-webkit-border-radius: 400px;-moz-border-radius: 400px;border-radius: 400px;'>play</button> <canvas width='80' height='80' id='volume-canvas' style='margin-top:-70px'></canvas> </div> <div id='div-waveform' style='float:left;'> <div id='progressbar' style='height:6px;background:#aaa;border:0px;'></div> <div id='divpng'><img src='"+png_file_path+"' width='100%' height='80'/></div> <div id='divcanvaslooppoints' style='margin-top:-80px'><canvas id='looppoints'  style='width:100%;height:80px;' ></canvas></div> <div id='divcanvastime' style='margin-top:0px'><canvas id='waveform' style='width:100%;height:80px;margin-top:-80px'></canvas></div> <div id='slider-loop' class='ui-slider ui-slider-horizontal ui-widget ui-widget-content ' style='font-size: 50%;margin-left:0px;border:0px;color:#aaa;background:#aaa;background-color:#aaa;'></div> <div id='divcanvasdisplaytime' style='margin-top:0px;'  ><canvas id='canvasdisplaytime' style='width:100%;height:15px;'></canvas></div> </div> <div id='download-button' style='float:left;width:45px;height:21px;margin-left:5px;'><button>T&eacute;l&eacute;charger le son</button></div> <div id='download-selection-button' style='float:left;width:45px;height:21px;margin-left:5px;'><button>T&eacute;l&eacute;charger la selection</button></div> <div id='clipboard-button' style='float:left;width:45px;height:21px;margin-left:5px;'><button>Lien vers le son</button></div> <div id='clipboard-selection-button' style='float:left;width:45px;height:21px;margin-left:5px;'><button>Lien vers la selection</button></div> <audio preload='metadata' id='player' src='"+ogg_file_path+"' ontimeupdate='update_canvas_time(this.currentTime);'></audio> <div id='clear' style='clear:both;'></div> </div>";
	cb(retstring);

}

