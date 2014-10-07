module.exports = Em.Component.extend({
    tagName: 'div',
    classNames: ['highcharts'],
    // series: null,
    // contentChanged: function() {
    //     this.rerender();
    // }.observes('series'),
  
    updateSeries: function () {
        // TODO: a better updateSeries
        this.initializeChart();
    },
    didInsertElement: function() {
        Em.$("#"+this.chartId).highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Revenue by Product'
            },
            legend: {
                enabled: false
            },
            xAxis: {
                title: {
                    text: 'Product Number'
                }
            },
            series: this.get('series')
        });
    },
    willDestroyElement: function () {
        Em.$("#"+this.chartId).highcharts().destroy();
    }
});
