
<head>
	<link rel="stylesheet" href="http://code.jquery.com/ui/1.9.0/themes/base/jquery-ui.css">
	
	<script type="text/javascript" src="../js/jquery-1.8.2.js"></script>
	<script type="text/javascript" src="../js/jquery-ui-1.9.1.custom.min.js"></script>
	<script type="text/javascript" src="../js/lbs.player.js"></script>
	<script>

	$(document).ready(function() {

		the_player("./beak.ogg", "./beak.png", 100, 200, function(res){
			$('#test').append($(res));
			init_the_player();
		});
	});
	</script>

</head>
<body style="margin:0px">
	<div id="test">
	</div>

</body>