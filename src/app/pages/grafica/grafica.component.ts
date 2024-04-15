import { Component, ElementRef, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { HorasService } from 'src/app/services/horas.service';

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.css']
})
export class GraficaComponent implements OnInit {

  data: { colaborador: string, horas: number }[] = [];
  tipoGrafico: string = 'barras';
  // dataPie : { name: string, value: number }[] = [];
  // dataBubble: { name: string, value: number, radius: number }[] = [];

  constructor(public horasService: HorasService){


    this.horasService.horasTotalesPorColaborador.forEach((value, key) => {
      // Para cada entrada del mapa, creamos un objeto con la estructura requerida y lo añadimos al array 'data'
      this.data.push({
          colaborador: key,
          horas: value.horasCompensacion
      });
  });

  }

  ngOnInit(): void {
    this.createChart();
    // window.addEventListener('resize', () => {
    //   this.createChart();
    // });
  }

  createChart(){
    // console.log('CREAR GRAFICO: '+this.tipoGrafico)
    if (this.tipoGrafico === 'barras'){
      this.createChartBarras();
    }else if (this.tipoGrafico === 'tarta'){
      // this.createChartTarta();
    }else if (this.tipoGrafico === 'burbuja'){
      // this.crearChartBurbujas();
    }
  }

  createChartBarras(): void {
    d3.select("#chart").selectAll("*").remove();

    const margin = { top: 50, right: 20, bottom: 90, left: 60 };
    const width = window.innerWidth * 0.8 - margin.left - margin.right;
    const height = window.innerHeight * 0.35 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define una escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(this.data.map(d => d.colaborador))
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(this.data, d => d.horas)!]);

    // Agregar un degradado al relleno de las barras
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").style("stop-color", "#a6c9f0");
    gradient.append("stop").attr("offset", "100%").style("stop-color", "#4b93e0");

    // Agregar un filtro para el sombreado
    const filter = defs.append("filter").attr("id", "drop-shadow");
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 4).attr("result", "blur");
    filter.append("feOffset").attr("in", "blur").attr("dx", 2).attr("dy", 2).attr("result", "offsetBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks(10));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2)-60)
      .attr("dy", "1em")
      .text("Horas Realizadas");

    svg.selectAll(".bar")
      .data(this.data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.colaborador)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.horas))
      .attr("height", d => height - y(d.horas))
      .style("fill", "url(#bar-gradient)") // Aplicar el degradado al relleno de las barras
      .style("filter", "url(#drop-shadow)"); // Aplicar el sombreado a las barras

    // Agregar los nombres de los colaboradores dentro de las barras
    svg.selectAll(".text")
      .data(this.data)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => x(d.colaborador)! + x.bandwidth() / 2)
      .attr("y", d => y(d.horas) - 5) // Ajusta la posición vertical
      .attr("dy", "0.50em")
      .attr("dx", "0.130em")
      .attr("transform", d => "rotate(-90," + (x(d.colaborador)! + x.bandwidth() / 2) + "," + (y(d.horas) - 5) + ")")
      .style("font-size", "20px") // Ajusta el tamaño de la fuente
      .text(d => d.colaborador);

}



  // crearChartBurbujas(){
  //   // Datos para el gráfico de burbujas
  //   this.dataBubble = this.data.map(item => {
  //     // Calcula el radio como una proporción de las visitas
  //     const radius = item.visits * 0.8; // Puedes ajustar el factor de escala según tus necesidades

  //     // Retorna un nuevo objeto con la estructura deseada
  //     return {
  //       name: item.country,
  //       value: item.visits,
  //       radius: radius
  //     };
  //   });

  //   // Dimensiones del gráfico
  //   const margin = { top: 50, right: 20, bottom: 90, left: 60 };
  //   const width = window.innerWidth * 0.8 - margin.left - margin.right;
  //   const height = window.innerHeight * 0.6 - margin.top - margin.bottom;

  //   const svg = d3.select("#chart")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom);

  //   // Escala para los radios de las burbujas
  //   const radiusScale = d3.scaleLinear()
  //     .domain([0, d3.max(this.dataBubble.map(d => d.value || 0)) as number]) // Asegurarse de manejar valores undefined
  //     .range([5, 50]);

  //   // Escala de colores
  //   const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  //   // Crear las burbujas
  //   const bubbles = svg.selectAll("circle")
  //       .data(this.dataBubble)
  //       .enter()
  //       .append("circle")
  //       .attr("cx", d => Math.random() * (width - 100) + 50)
  //       .attr("cy", d => Math.random() * (height - 100) + 50)
  //       .attr("r", d => radiusScale(d.value || 0)) // Asegurarse de manejar valores undefined
  //       .attr("fill", (d, i) => colorScale(String(i))) // Asignar color de relleno basado en el índice de los datos
  //       .attr("class", "bubble")
  //       // .on("mouseover", (event, d) => {
  //       //     tooltip.style("visibility", "visible").text(d.name + ": " + d.value);
  //       // })
  //       // .on("mousemove", (event) => {
  //       //     tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
  //       // })
  //       // .on("mouseout", () => {
  //       //     tooltip.style("visibility", "hidden");
  //       // })
  //       .on("click", (event, d) => {
  //         tooltip.style("visibility", "visible").text(d.name + ": " + d.value);
  //     });


  //   // Crear el elemento de tooltip con la clase y estilos deseados
  //   const tooltip = d3.select(".chart-container").append("div")
  //     .attr("class", "tooltipBubble")
  //     .style("visibility", "hidden")
  //     .style("position", "absolute")
  //     .style("text-align", "center")
  //     .style("padding", "6px")
  //     .style("font", "12px sans-serif")
  //     .style("background", "lightsteelblue")
  //     .style("border", "0.5px solid steelblue")
  //     .style("border-radius", "5px")
  //     .style("pointer-events", "none")
  //     .style("opacity", "1");
  // }

  // createChartTarta() {

  //   d3.select("#chart").selectAll("*").remove();

  //   this.dataPie = this.data.map(item => ({ name: item.country, value: item.visits }));

  //   const margin = { top: 50, right: 20, bottom: 90, left: 60 };
  //   const width = window.innerWidth * 0.8 - margin.left - margin.right;
  //   const height = window.innerHeight * 0.6 - margin.top - margin.bottom;
  //   const radius = Math.min(width, height) / 2;

  //   const color = d3.scaleOrdinal()
  //     .domain(this.dataPie.map(d => d.name))
  //     .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse());

  //   const pie = d3.pie<{ name: string, value: number }>()
  //     .sort(null)
  //     .value(d => d.value);

  //   const arc = d3.arc<any, d3.DefaultArcObject>()
  //     .innerRadius(0)
  //     .outerRadius(Math.min(width, height) / 2 - 1);

  //   const labelRadius = (<any>arc.outerRadius)() * 0.8;

  //   const arcLabel = d3.arc()
  //     .innerRadius(labelRadius)
  //     .outerRadius(labelRadius);

  //   const arcs = pie(this.dataPie);

  //   // const svg = d3.select(this.elementRef.nativeElement).select('.chart-container')
  //   const svg = d3.select("#chart")

  //     // .append('svg')
  //     .attr('width', width)
  //     .attr('height', height)
  //     .attr('viewBox', [-width / 2, -height / 2, width, height])
  //     .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

  //   svg.append('g')
  //     .attr('stroke', 'white')
  //     .selectAll('path')
  //     .data(arcs)
  //     .join('path')
  //     .attr('fill', d => color(d.data.name) as string) // Convertir a string
  //     .attr('d', arc as any) // Convertir a any
  //     .append('title')
  //     .text(d => `${d.data.name}: ${d.data.value}`);


  //   // svg.append('g')
  //   //   .attr('font-size', 12)
  //   //   // .attr('text-anchor', 'middle')
  //   //   .selectAll('text')
  //   //   .data(arcs)
  //   //   .join('text')
  //   //   .attr('transform', d => {
  //   //     const [x, y] = arc.centroid(d as unknown as d3.DefaultArcObject);
  //   //     const angle = (d.startAngle + d.endAngle) / 2; // Calcular el ángulo medio
  //   //     const xOffset = Math.cos(angle) * (radius - 10); // Ajustar el offset para evitar solapamientos
  //   //     const yOffset = Math.sin(angle) * (radius - 10);
  //   //     return `translate(${x + xOffset}, ${y + yOffset})`;
  //   //   })
  //   //   .call(text => text.append('tspan')
  //   //     .attr('y', '-0.4em')
  //   //     .attr('font-weight', 'bold')
  //   //     .text(d => d.data.name))
  //   //   .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append('tspan')
  //   //     .attr('x', 0)
  //   //     .attr('y', '0.7em')
  //   //     .attr('fill-opacity', 0.7)
  //   //     .text(d => d.data.value));

  // }

}
