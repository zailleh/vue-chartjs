function dataHandler (newData, oldData) {
  if (oldData) {
    let chart = this.$data._chart

    // Get new and old DataSet Labels
    let newDatasetLabels = newData.datasets.map((dataset) => {
      return dataset.label
    })

    let oldDatasetLabels = oldData.datasets.map((dataset) => {
      return dataset.label
    })

    // Stringify 'em for easier compare
    const oldLabels = JSON.stringify(oldDatasetLabels)
    const newLabels = JSON.stringify(newDatasetLabels)

    // Check if Labels are equal and if dataset length is equal
    if (newLabels === oldLabels && oldData.datasets.length === newData.datasets.length) {
      newData.datasets.forEach((dataset, i) => {
        // Get new and old dataset keys
        const oldDatasetKeys = Object.keys(oldData.datasets[i])
        const newDatasetKeys = Object.keys(dataset)

        // Get keys that aren't present in the new data
        const deletionKeys = oldDatasetKeys.filter((key) => {
          return key !== '_meta' && newDatasetKeys.indexOf(key) === -1
        })

        // Remove outdated key-value pairs
        deletionKeys.forEach((deletionKey) => {
          delete chart.data.datasets[i][deletionKey]
        })

        // Update attributes individually to avoid re-rendering the entire chart
        for (const attribute in dataset) {
          if (dataset.hasOwnProperty(attribute)) {
            chart.data.datasets[i][attribute] = dataset[attribute]
          }
        }
      })

      if (newData.hasOwnProperty('labels')) {
        chart.data.labels = newData.labels
        this.$emit('labels:update')
      }
      if (newData.hasOwnProperty('xLabels')) {
        chart.data.xLabels = newData.xLabels
        this.$emit('xlabels:update')
      }
      if (newData.hasOwnProperty('yLabels')) {
        chart.data.yLabels = newData.yLabels
        this.$emit('ylabels:update')
      }
      chart.update()
      this.$emit('chart:update')
    } else {
      if (chart) {
        chart.destroy()
        this.$emit('chart:destroy')
      }
      this.renderChart(this.chartData, this.options)
      this.$emit('chart:render')
    }
  } else {
    if (this.$data._chart) {
      this.$data._chart.destroy()
      this.$emit('chart:destroy')
    }
    this.renderChart(this.chartData, this.options)
    this.$emit('chart:render')
  }
}

function updateChartParams (oldParams, newParams) {
  const chart = this.$data._chart;

  if (chart && newParams.data.datasets && oldParams.data.datasets) {
    const newDataString = JSON.stringify(newParams.options);
    const oldDataString = JSON.stringify(oldParams.options);

    if (newDataString !== oldDataString) {
      Object.assign(chart.options, newParams.options);
    }

    dataHandler(newParams.data, oldParams.data);
  } else {
    if (chart) {
      chart.destroy();
      this.$emit('chart:destroy');
    }
    this.renderChart(newParams.data, newParams.options);
    this.$emit('chart:render');
  }
}

export const reactiveData = {
  data () {
    return {
      chartData: null
    }
  },

  watch: {
    'chartData': dataHandler
  }
}

export const reactiveProp = {
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  watch: {
    'chartData': dataHandler
  }
}

export const reactiveChart = {
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => {}
    },
    chartOptions: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    chartParams() {
      return {
        data: this.chartData,
        options: Object.assign({}, this.options, this.chartOptions)
      };
    }
  },
  watch: {
    chartParams: updateChartParams,
  }
}

export default {
  reactiveData,
  reactiveProp
  reactiveChart,
}
