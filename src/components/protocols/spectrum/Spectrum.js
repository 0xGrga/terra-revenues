import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend}from"chart.js";
import { Col, Row, Container } from 'react-bootstrap';
import { useState, useEffect } from "react";
import ReactLoading from 'react-loading';
import { Pie, Line } from 'react-chartjs-2';
import React from "react";
import axios from "axios";
import "./spectrum.scss";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const decimals = 10**12;

function Spectrum () {
  const [governanceLocked, setGovernanceLocked ] = useState();
  const [totalValueLocked, setTotalValueLocked] = useState();
  const [lockedLiqidity, setLockedLiqidity] = useState();
  const [yearlyRevenue, setYearlyRevenue] = useState();
  const [tvlTimeline, setTvlTimeLine] = useState();
  const [vaultData, setVaultData] = useState();
  const [revenues, setRevenues] = useState();
  const [isLoaded, setLoading] = useState();
  const [price, setPrice] = useState();
  const [lKey, setlKey] = useState();
  let pieData = {};
  let tvlData = {};

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    async function fetchData () {
      const promises = [];

      promises.push(axios.get('https://specapi.azurefd.net/api/data?type=dashboard'));
      promises[promises.length - 1].then(
        data => {
          setPrice(parseFloat(data.data.spec.price));
          setTotalValueLocked(parseFloat(data.data.tvl.total) / decimals);
          setYearlyRevenue(parseFloat(data.data.stat.last7.earning) * 52 / decimals);
          setGovernanceLocked(parseFloat(data.data.tvl.gov) / decimals);
          setLockedLiqidity(parseFloat(data.data.tvl.lpVaults) / decimals);

          setTvlTimeLine(data.data.tvl.previousValues.map(item => {
            item.total = parseInt(item.total) / decimals;
            item.date = new Date(Date.parse(item.date)).toLocaleDateString("en-US");
            return item
          }).reverse());
        }
      )
      promises.push(axios.get('https://specapi.azurefd.net/api/data?type=lpVault'));
      promises[promises.length - 1].then(
        data => {
          const vaults = [];
          for (const [key, value] of Object.entries(data.data.stat.pairs)){
            const firstToken = key.split("|")[1];
            var secondToken = key.split("|")[2];

            if(secondToken === undefined){
              continue;
            }

            if(secondToken.length === 44){
              secondToken = data.data.tokenInfos[secondToken].symbol;
            }else{
              const tokenS = {
                "uusd": "UST",
                "uluna": "LUNA"
              };
              secondToken = tokenS[secondToken];
            }


            const tokenInfo = data.data.tokenInfos[firstToken];
            if(tokenInfo){
              vaults.push({
                symbol: `${tokenInfo.symbol}-${secondToken}`,
                farm: data.data.poolInfos[key].farm,
                tvl: parseInt(value.tvl) / decimals,
                apr: value.specApr * 100,
                dpr: value.dpr * 100
              });
            }
          }


          setVaultData(vaults);
        }
      )

      await Promise.all(promises);
      setLoading(true);

    };
    if(!isLoaded){
      setRevenues({})
      fetchData();
    }
  }, [vaultData, isLoaded]);

  function sortSymbol (key) {
    function compareObjects(object1, object2, key){
      const obj1 = object1[key];
      const obj2 = object2[key];
      var value = 0;

      if(obj1 < obj2){
        value = 1;
      }
      if(obj2 < obj1){
        value = -1;
      }
      setlKey(key);
      return value;
    }
    if(key === lKey){
      setVaultData(vaultData.reverse())
    }else{
      setVaultData(vaultData.sort((vault1, vault2) => {
        return compareObjects(vault1, vault2, key);
      }));
    }


    forceUpdate();
  }



  if(isLoaded){
    pieData = {
      labels: Object.keys(revenues),
      datasets: [
        {
          data: Object.values(revenues),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    tvlData = {
      labels: tvlTimeline.map(i => i.date),
      datasets: [
        {
          label: "TVL",
          data: tvlTimeline.map(i => i.total),
          backgroundColor: 'rgba(200, 200, 200, 1)',
          borderColor: 'rgba(200, 200, 200, 1)',
          pointRadius: 0
        }
      ]
    }
  }else{
    pieData = {}
    tvlData = {}
  }
  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (f) {
            return `${f.label}: ${f.raw.toLocaleString()}M$`;
          }
        }
      }
    },
  }

  return (
    isLoaded ? (
      <Container className="dashboard">
        <Row>
          <h1>Spectrum Protocol(SPEC)</h1>
        </Row>
        <Row>
          <Col lg={6}>
            <h3>Revenue Breakdown</h3>
            <span>Total Value Locked: {totalValueLocked.toLocaleString()}M$</span>
            <span>Locked in Governance: {governanceLocked.toLocaleString()}M$</span>
            <span>Locked in Liqidity Pools: {lockedLiqidity.toLocaleString()}M$</span>
            <span>Total Revenue: {yearlyRevenue.toLocaleString()}M$</span>
            <span>Total Daily Revenue: {(yearlyRevenue / 365).toLocaleString()}M$</span>
            <span>SPEC price: {price.toLocaleString()}$</span>
          </Col>
          <Col lg={6}>
            {/* Add info about diffrent fees */}
            {/* <Pie data={pieData} options={options} height="10px"/> */}
          </Col>
        </Row>
        <Row>
          <h3>Total Value Locked Timeline</h3>
          <Line options={options} data={tvlData} />
        </Row>
        <Row>
          <h3>{vaultData.length} Vaults:</h3>
          <table>
            <tbody>
              <tr>
                <td onClick={() => sortSymbol("symbol")}>Vault Symbol</td>
                <td onClick={() => sortSymbol("farm")}>Protocol</td>
                <td onClick={() => sortSymbol("tvl")}>TVL (M$)</td>
                <td onClick={() => sortSymbol("apr")}>Yearly Return</td>
                <td onClick={() => sortSymbol("dpr")}>Daily Return</td>
              </tr>
              {vaultData.map((item, i) => (
                <tr key={i}>
                  <td>{item.symbol.toLocaleString()}</td>
                  <td>{item.farm.toLocaleString()}</td>
                  <td>{item.tvl.toLocaleString()}</td>
                  <td>{item.apr.toLocaleString()}%</td>
                  <td>{item.dpr.toLocaleString()}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Row>
      </Container>
    ) : (
      <div className="loading">
        <ReactLoading type={"spinningBubbles"} color={"#ffffff"} height={100} width={100} />
      </div>
    )
  );
};

export default Spectrum;
