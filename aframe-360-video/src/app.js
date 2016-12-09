var Vid360 = React.createClass({
  render: function() {
    var dom =  ( <a-scene id="myscene">
			  <a-assets>
				<video crossorigin autoplay loop muted webkit-playsinline playsinline id="video1"  src="ClashofClans360.mp4" ></video>
			  </a-assets>
			   <a-videosphere src="#video1"></a-videosphere>
		</a-scene>)
    return (
	dom
    );
  }
});
console.log(Vid360);
ReactDOM.render(<Vid360 />, document.querySelector('#container'));
