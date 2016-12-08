var vid360 = React.createClass({
  render: function() {
    return (
		<a-scene id="myscene">
		  <a-assets>
			<video crossorigin autoplay loop muted webkit-playsinline playsinline id="video1"  src="https://ucarecdn.com/bcece0a8-86ce-460e-856b-40dac4875f15/" ></video>
		  </a-assets>
		   <a-videosphere src="#video1"></a-videosphere>
		</a-scene>
    );
  }
});

ReactDOM.render(<vid360 />, document.querySelector('#container'));
