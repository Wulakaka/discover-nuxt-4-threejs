import * as d3 from "d3";

export const parser = d3.timeParse("%H:%M");

export const y = d3
  .scaleTime()
  .range([0, 100])
  .domain([parser("10:30")!, parser("20:30")!]);
