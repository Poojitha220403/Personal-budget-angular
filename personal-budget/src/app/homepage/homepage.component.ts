import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import * as d3Shape from 'd3-shape';
import { Arc } from 'd3-shape';
import { DataService, IBudget } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, AfterViewInit {

  backgroundColor: String[] = [
    '#ffcd56',
    '#ff6384',
    '#36a2eb',
    '#fd6b19',
    '#ffe633',
    '#74ff33',
    '#da33ff'
  ];

  constructor(private http: HttpClient, private dataService: DataService) { }

  ngAfterViewInit(): void {
    // Subscribe to budget data and then create charts
    this.dataService.getData().subscribe((budgetData: IBudget[]) => {
      this.createChart(budgetData);
      this.createDonutChart(budgetData);
    });
  }

  ngOnInit(): void { }

  // Creating a pie chart using Chart.js
  createChart(budget: IBudget[]) {
    let dataSource: any = {
      datasets: [
        {
          data: [], // Initialize empty
          backgroundColor: [],
        }
      ],
      labels: [] // Initialize empty
    };

    // Map budget data to Chart.js dataset
    dataSource['datasets'][0].data = budget?.map(obj => obj.value);
    dataSource['datasets'][0].backgroundColor = this.backgroundColor;
    dataSource['labels'] = budget?.map(obj => obj.title);

    var ctx = <HTMLCanvasElement>document?.getElementById('myChart');
    if (ctx) {
      var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: dataSource,
      });
    }
  }

  // Creating a donut chart using D3.js
  createDonutChart(myDonutData: IBudget[]) {
    var width = 400;
    var height = 400;
    var margin = 40;
    var radius = Math.min(width, height) / 2 - margin;
    var donutWidth = 75;
    var color = d3.scaleOrdinal().range(this.backgroundColor);

    var svg: any = d3.select('#myDonutChart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var arc: Arc<any, d3Shape.DefaultArcObject> = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - donutWidth)
      .cornerRadius(3)
      .padAngle(0.015);

    var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Pie layout for IBudget data
    var pie = d3.pie<IBudget>()
      .value((d: IBudget) => d.value) // Extract 'value' from IBudget
      .sort(null);

    var data_points = pie(myDonutData);

    // Creating the arcs for the donut chart
    var path = svg.selectAll('path')
      .data(data_points)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: any) => color(d.data.title))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Adding polylines to link arcs with labels
    svg.selectAll('allPolylines')
      .data(data_points)
      .enter()
      .append('polyline')
      .attr('stroke', 'black')
      .style('fill', 'none')
      .attr('stroke-width', 1)
      .attr('points', (d: any) => {
        var posA = arc.centroid(d);
        var posB = outerArc.centroid(d);
        var posC = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    // Adding labels
    svg.selectAll('allLabels')
      .data(data_points)
      .enter()
      .append('text')
      .text((d: any) => d.data.title)
      .attr('transform', (d: any) => {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('text-anchor', (d: any) => {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      });
  }
}
