var vidapp = React.createClass({
  render: function() {
    return (
	<a-scene id="myscene">
	<a-assets>
		<video crossorigin autoplay loop muted webkit-playsinline playsinline id="video1"  src="http://104.199.225.214/Tests/aframe-360-video/Space%20Engine%20in%20Immersive%20360%20Video.mp4" ></video>
	</a-assets>
		<a-videosphere src="#video1"></a-videosphere>
	</a-scene>
    );
  }
});

ReactDOM.render(<vidapp />, document.querySelector('#container'));
