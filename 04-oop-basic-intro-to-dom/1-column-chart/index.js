export default class ColumnChart {
  chartHeight = 50
  subElements

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);

    this.render();
  }


  getTemplate () { return `
  <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title"> Total ${this.label} ${this.getLinkTemplate()}</div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
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

  update(data = []) {
    if (!data.length) {
      this.element.classList.add("column-chart_loading");
    }

    this.data = data;
    this.subElements.body.innerHTML = this.getDataTemplate();
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
