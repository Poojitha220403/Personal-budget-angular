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

  backgroundColor: string[] = [
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
      console.log(budgetData);
      console.log(Array.isArray(budgetData));
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
    dataSource.datasets[0].data = budget.map(obj => Number(obj.budget)); // Convert to number
    dataSource.datasets[0].backgroundColor = this.backgroundColor;
    dataSource.labels = budget.map(obj => obj.title);

    const ctx = <HTMLCanvasElement>document.getElementById('myChart');
    if (ctx) {
      const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: dataSource,
      });
    }
  }

  // Add this method to your HomepageComponent
createDonutChart(budget: IBudget[]) {
  // Set dimensions for the SVG canvas
  const width = 400;
  const height = 400;
  const margin = 40;

  // Create an SVG element
  const svg = d3.select('#myDonutChart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  // Define the radius for the donut chart
  const radius = Math.min(width, height) / 2 - margin;

  // Define a color scale
  const color = d3.scaleOrdinal(this.backgroundColor);

  // Create the pie generator
  const pie = d3.pie<IBudget>()
    .value(d => Number(d.budget)) // Use the budget as value
    .sort(null);

  // Create the arc generator
  const arc = d3.arc<d3.PieArcDatum<IBudget>>()
    .innerRadius(radius * 0.5) // Inner radius for the donut
    .outerRadius(radius); // Outer radius for the donut

  // Generate pie data
  const pieData = pie(budget);

  // Create the donut chart slices
  svg.selectAll('slice')
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i.toString())) // Set color based on index
    .attr('stroke', '#fff') // Stroke for better visibility
    .style('stroke-width', '2px');

  // Optional: Add labels to the donut chart
  svg.selectAll('text')
    .data(pieData)
    .enter()
    .append('text')
    .transition() // Transition for smooth appearance
    .attr('transform', d => `translate(${arc.centroid(d)})`) // Position the label
    .attr('dy', '0.35em') // Vertical alignment
    .text(d => `${d.data.title}: ${d.data.budget}`); // Label content
}


 }
