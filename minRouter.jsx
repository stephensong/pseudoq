// Renders the application for the given route
var Application = React.createClass({
  render: function() {
    switch (this.props.location[0])  {
    case '':
      return <div><h1>Index Page</h1></div>;

    default:
      return <div><h1>Not Found</h1></div>;
    }
  }
});

// Split location into `/` separated parts, then render `Application` with it
function handleNewHash() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
  var application = <Application location={location} />;
  ReactDOM.render(application, document.getElementById('react-app'));
}

// Handle the initial route and browser navigation events
handleNewHash()
window.addEventListener('hashchange', handleNewHash, false);