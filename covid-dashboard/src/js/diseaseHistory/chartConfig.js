const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartScale = 10e6;

function parseDate(string) {
  const date = new Date(string);
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

const chartConfig = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 0,
        hoverBorderWidth: 2,
        borderColor: 'darkred',
        fill: true,
        backgroundColor: 'red',
        barPercentage: 1.25,
      },
    ],
  },
  options: {
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        ticks: {
          callback: (label) => parseDate(label),
        },
      }],
      yAxes: [{
        ticks: {
          callback: (value) => `${value / chartScale}M`,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label(tooltipItem, data) {
          let label = data.labels[tooltipItem.index];
          let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          label = parseDate(label);
          value = (value / chartScale).toFixed(2);
          return `${label}: ${value} M`;
        },
      },
    },
  },
};

export default chartConfig;
