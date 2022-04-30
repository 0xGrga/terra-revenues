import "./dashboard.scss";

function Dashboard () {
  return (
    <div className="dashboard">
      <h1>Welcome to Terra Revenues</h1>
      <pre>Purpuse of Terra Revenues is simple, to help people look at revenues of protocols on terra chain</pre>
      <br />
      <h4>Incomming Protocols</h4>
      <ul>
        <li><a href="https://mirrorprotocol.app/" target="_blank" rel="noopener noreferrer" >Mirror Protocol</a></li>
        <li><a href="https://app.anchorprotocol.com/" target="_blank" rel="noopener noreferrer" >Anchor Protocol</a></li>
        <li><a href="https://app.marsprotocol.io/#/redbank" target="_blank" rel="noopener noreferrer" >Mars Protocol</a></li>
        <li><a href="https://app.edgeprotocol.io/pool" target="_blank" rel="noopener noreferrer" >Edge Protocol</a></li>
        <li><a href="https://app.astroport.fi/swap" target="_blank" rel="noopener noreferrer" >Astroport</a></li>
        <li><a href="https://app.terraswap.io/" target="_blank" rel="noopener noreferrer" >Terraswap</a></li>
        <li><a href="https://app.apollo.farm/" target="_blank" rel="noopener noreferrer" >Apollo DAO</a></li>
      </ul>
    </div>
  );
};

export default Dashboard;
