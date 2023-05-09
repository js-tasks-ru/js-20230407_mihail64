import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50
  subElements
  url = new URL(BACKEND_URL);
  data = []

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = data => data,
    url = "",
    from = "",
    to = "",
  } = {}) {
    this.data = data;
    this.label = label;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.url.pathname = url;
    this.from = from;
    this.to = to;

    this.render();
    if (from && to) {
      this.update(from, to);
    }
  }

  getTemplate () { return `
  <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title"> Total ${this.label} ${this.getLinkTemplate()}</div>
      <div class="column-chart__container">
            ${this.getHeaderTemplate()}
        <div data-element="body" class="column-chart__chart">
            ${this.getDataTemplate()}
        </div>
      </div>
  </div>
  `;}

  getLinkTemplate () {
    return this.link ? `<a href=${this.link} class="column-chart__link">View all</>` : ``;
  }

  getDataTemplate () {
    const max = Math.max(...this.data);

    return this.data.map(item => {
      const percent = Math.round(item / max * 100);
      const val = Math.floor(item * this.chartHeight / max);
      return `<div style="--value: ${val}" data-tooltip="${percent}%"></div>`;
    }).join("");
  }

  getHeaderTemplate () {
    return ` <div data-element="header" class="column-chart__header">${this.value}</div>`;
  }


  render() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.getTemplate();
    this.element = tmp.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");

    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);
    let response = await fetch(this.url.toString());
    let result = await response.json();

    this.data = Object.values(result);
    this.value = this.data.reduce((partialSum, a) => partialSum + a, 0);
    this.subElements.header.innerHTML = this.getHeaderTemplate();
    this.subElements.body.innerHTML = this.getDataTemplate();

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    return result; //добавил только для теста
  }


  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
