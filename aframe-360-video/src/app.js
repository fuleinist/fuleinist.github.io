var Entity = React.createClass({
  render: function() {
    var entity =  (<a-videosphere src="#video1"></a-videosphere>)
    return (
	entity
    );
  }
});
console.log(Entity);
ReactDOM.render(<Entity />, document.querySelector('#entities'));
