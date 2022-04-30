import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Col, Row, Container } from 'react-bootstrap';
import { useState, useEffect } from "react";
import ReactLoading from 'react-loading';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import './prism.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const lpVolumeQuery = {query: "query ($contract: String!) {pool(contract: $contract) {asset0 {volume24h, volume7d}}}", variables: {contract: null}}
const stakingAddress = "terra1p7jp8vlt57cf8qwazjg58qngwvarmszsamzaru";
const vaultAddress = "terra1xw3h7jsmxvh6zse74e4099c6gl03fnmxpep76h";
const prismUstLP = "terra19d2alknajcngdezrdhq40h6362k92kz23sz62u";
const lunaUstLP = "terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552";

const lpPairs = [
  "terra19d2alknajcngdezrdhq40h6362k92kz23sz62u",
  "terra1czynvm64nslq2xxavzyrrhau09smvana003nrf",
  "terra1yxgq5y6mw30xy9mmvz9mllneddy9jaxndrphvk",
  "terra1persuahr6f8fm6nyup0xjc7aveaur89nwgs5vs",
  "terra1kqc65n5060rtvcgcktsxycdt2a4r67q2zlvhce",
  "terra1r38qlqt69lez4nja5h56qwf4drzjpnu8gz04jd"
]

const exchangeVolumeFee = 0.001;
const bondedAssetsFee = 0.1;
const unbondedAssetsFee = 1;
const decimals = 10**12;

function Span1 ({ children }) {
  return (
    <span>&emsp;&emsp;{children}</span>
  )
}

function Span2 ({ children }) {
  return (
    <span>&emsp;&emsp;&emsp;&emsp;{children}</span>
  )
}

function PrismProtocol () {
  const [price, setPrice] = useState();
  const [revenues, setRevenues] = useState();
  const [bondedAssets, setBondedAssets] = useState();
  const [unbondedAssets, setUnbondedAssets] = useState();
  const [exchangeVolume, setExchangeVolume] = useState();
  const [totalValueLocked, setTotalValueLocked] = useState();
  const [lockedLiqidity, setLockedLiqidity] = useState();
  const [yearlyRevenue, setYearlyRevenue] = useState();
  const [isLoaded, setLoading] = useState();
  var pieData = {};

  useEffect(() => {
    async function fetchData () {
      const promises = [];

      var yearlyRevenue_ = 0;
      var totalLocked = 0;
      var totalBonded = 0;
      var prismPrice = 0;
      var lunaPrice = 0;

      var lockedLiqidity = 0;
      var weeklyVolume = 0;
      var dailyVolume = 0;

      lpPairs.forEach((item, i) => {
        lpVolumeQuery.variables.contract = item;
        promises.push(axios.post("https://api.prismprotocol.workers.dev/", lpVolumeQuery));
        promises[promises.length - 1].then(
          data => {
            weeklyVolume += data.data.data.pool.asset0.volume7d / decimals;
            dailyVolume += data.data.data.pool.asset0.volume24h / decimals;
          }
        );
        promises.push(axios.get(`https://lcd.terra.dev/terra/wasm/v1beta1/contracts/${item}/store?query_msg=eyJwb29sIjp7fX0%3D`));
        promises[promises.length - 1].then(
          data => {
            data = data.data.query_result.assets;
            lockedLiqidity += data[0].amount * 2;
            //LP contains same $ amount of each token
          }
        );
      });

      promises.push(axios.get(`https://lcd.terra.dev/terra/wasm/v1beta1/contracts/${prismUstLP}/store?query_msg=eyJwb29sIjp7fX0%3D`));
      promises[promises.length - 1].then(
        data => {
          data = data.data.query_result.assets;
          prismPrice = data[1].amount / data[0].amount;
        }
      );

      promises.push(axios.get(`https://lcd.terra.dev/terra/wasm/v1beta1/contracts/${lunaUstLP}/store?query_msg=eyJwb29sIjp7fX0%3D`));
      promises[promises.length - 1].then(
        data => {
          data = data.data.query_result.assets;
          lunaPrice = data[0].amount / data[1].amount;
        }
      );

      promises.push(axios.get(`https://lcd.terra.dev/wasm/contracts/${vaultAddress}/store?query_msg=%7B%22state%22:%7B%7D%7D`));
      promises[promises.length - 1].then(
        data => {
          totalLocked = data.data.result.total_bond_amount / decimals;
        }
      )

      promises.push(axios.get(`https://lcd.terra.dev/wasm/contracts/${stakingAddress}/store?query_msg=%7B%22bond_amount%22:%7B%7D%7D`));
      promises[promises.length - 1].then(
        data => {
          totalBonded = data.data.result / decimals;
        }
      )

      await Promise.all(promises);

      var avrgDailyVolume = ((weeklyVolume + dailyVolume * 7) / 14) * prismPrice;

      totalLocked = totalLocked * lunaPrice;
      lockedLiqidity = lockedLiqidity / decimals * prismPrice;
      totalBonded = totalBonded * lunaPrice;

      var revenues_ = {}
      revenues_["Bonded Asset Fees"] = totalBonded * bondedAssetsFee;
      revenues_["Unbonded Asset Fees"] = (totalLocked - totalBonded) * unbondedAssetsFee;
      revenues_["Exchange Fees"] = avrgDailyVolume * 365 * exchangeVolumeFee

      yearlyRevenue_ = Object.values(revenues_).reduce((partialSum, a) => partialSum + a, 0);

      setTotalValueLocked(totalLocked + lockedLiqidity);
      setUnbondedAssets(totalLocked - totalBonded);
      setBondedAssets(totalBonded);

      setExchangeVolume(avrgDailyVolume * 365);
      setLockedLiqidity(lockedLiqidity);

      setYearlyRevenue(yearlyRevenue_);
      setRevenues(revenues_);
      setPrice(prismPrice);

      setLoading(true)
    };

    setRevenues({})
    fetchData();
  }, []);

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
  }else{
    pieData = {

    }
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
          <h1>Prism Protocol(PRISM)</h1>
        </Row>
        <br />
        <Row>
          <Col lg={6}>
            <h3>Revenue Breakdown</h3>
            <span>Total Value Locked: {totalValueLocked.toLocaleString()}M$</span>
            <span>Total Revenue: {yearlyRevenue.toLocaleString()}M$</span>
            <span>Total Daily Revenue: {(yearlyRevenue / 365).toLocaleString()}M$</span>
            <span>PRISM price: {price.toLocaleString()}$</span>
            <br />
            <span>Locked in Bonded Assets: {(bondedAssets + unbondedAssets).toLocaleString()}M$</span>
            <Span1>Staked Assets:</Span1>
            <Span2>Staked in Prism: {bondedAssets.toLocaleString()}M$</Span2>
            <Span2>Staked Fee: {(bondedAssetsFee * 100).toLocaleString()}%</Span2>
            <Span2>Revenue: {revenues["Bonded Asset Fees"].toLocaleString()}M$</Span2>
            <Span2>Daily Revenue: {(revenues["Bonded Asset Fees"] / 365).toLocaleString()}M$</Span2>
            <Span1>Untaked Assets:</Span1>
            <Span2>Untaked in Prism: {unbondedAssets.toLocaleString()}M$</Span2>
            <Span2>Untaked Fee: {(unbondedAssetsFee * 100).toLocaleString()}%</Span2>
            <Span2>Revenue: {revenues["Unbonded Asset Fees"].toLocaleString()}M$</Span2>
            <Span2>Daily Revenue: {(revenues["Unbonded Asset Fees"] / 365).toLocaleString()}M$</Span2>
            <br />
            <span>Locked in Liqidity Pools: {lockedLiqidity.toLocaleString()}M$</span>
            <Span1>Volume: {exchangeVolume.toLocaleString()}M$</Span1>
            <Span1>Exchange Fee: {(exchangeVolumeFee * 100).toLocaleString()}%</Span1>
            <Span1>Revenue: {revenues["Exchange Fees"].toLocaleString()}M$</Span1>
            <Span1>Daily Revenue: {(revenues["Exchange Fees"] / 365).toLocaleString()}M$</Span1>
          </Col>
          <Col lg={6}>
            <Pie data={pieData} options={options} height="100px"/>
          </Col>
        </Row>
      </Container>
    ) : (
      <div className="loading">
        <ReactLoading type={"spinningBubbles"} color={"#ffffff"} height={100} width={100} />
      </div>
    )
  );
};

export default PrismProtocol;
