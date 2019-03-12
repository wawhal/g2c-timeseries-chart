import React from 'react';
import { Line } from 'react-chartjs-2';
import graphql2chartjs from 'graphql2chartjs';
import gql from 'graphql-tag';
import './App.css';

class App extends React.Component {
  state = {
    chartjsData: {}
  }
  async componentDidMount() {
    const { client } = this.props;
    // initialize g2c
    const g2c = new graphql2chartjs();

    let latestTime = null;
    
    // load initial data
    client.query({
      query: firstQuery
    }).then((resp) => {
      // add the received data to g2c and update state
      g2c.add(resp.data, () => lineChartOptions);
      this.setState({
        chartjsData: g2c.data
      });

      // update the timestamp of the last received entry
      if (resp.data.stocks.length) {
        latestTime = resp.data.stocks[0].data_t;
      }

      // subscribe to a notification with newest data in the database
      client.subscribe({
        query: lastEntrySubscription
      }).subscribe({
        next(event) {
          // if the data is not stale, fetch new data and add to g2c
          if (event.data.stocks.length) {
            if (!latestTime || event.data.stocks[0].data_t > latestTime) {
              fetchMore()
            }
          }
        },
        error(err) {
          console.error(err);
        }
      })
    })

    const fetchMore = () => {
      client.query({
        query: fetchMoreQuery,
        variables: {
          time: latestTime || "2019-03-12T19:16:45.640128+00:00"
        }
      }).then((resp) => {
        if (resp.data.stocks.length) {
          g2c.add(resp.data, () => lineChartOptions);
          latestTime = resp.data.stocks[0].data_t;
          this.setState({
            chartjsData: g2c.data
          });
        }
      })
    }
  }
  render() {
    return (
      <Line
        data={this.state.chartjsData}
        options={{
          scales: {
            xAxes: [{
              type: 'time',
              distribution: 'series'
            }]
          },
          bezierCurve : false
        }}
        height="100px"
      />
    )
  }
}

const firstQuery = gql`
query {
  stocks: last_ten_minute_stocks (
    where: {
      name: {
        _eq: "Company 1"
      }
    }
    order_by: {
      time: desc
    }
  ) {
    name
    data_y: price
    data_t: time
  }
}
`

const lastEntrySubscription = gql`
subscription {
  stocks: last_ten_minute_stocks (
    limit: 1
    order_by: {
      time: desc
    }
  ) {
    data_t: time
  }
}
`;

const fetchMoreQuery = gql`
query ($time: timestamptz) {
  stocks: last_ten_minute_stocks (
    where: {
      _and: [
        {
          time: {
            _gt: $time
          }
        },
        {
          name: {
            _eq: "Company 1"
          }
        }
      ]
    }
  ) {
    name
    data_y: price
    data_t: time
  }
} 
`;

const lineChartOptions = {
  chartType: 'line',
  fill: false,
  borderColor: 'brown',
  pointBackgroundColor: 'brown'
}

export default App;
