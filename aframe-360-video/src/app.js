var vid360 = React.createClass({
  render: function() {
    return (
		<div key="vid360">
			<a-scene id="myscene">
			  <a-assets>
				<video crossorigin autoplay loop muted webkit-playsinline playsinline id="video1"  src="ClashofClans360.mp4" ></video>
			  </a-assets>
			   <a-videosphere src="#video1"></a-videosphere>
			</a-scene>
		</div>
    );
  }
});

ReactDOM.render(<vid360 />, document.querySelector('#container'));
