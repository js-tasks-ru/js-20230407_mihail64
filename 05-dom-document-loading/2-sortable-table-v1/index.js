export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getTemplate() {
    return `
    <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaderTemplate()}
    </div>

    <div data-element="body" class="sortable-table__body">
        ${this.getDataTemplate()}
    </div>

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>

  </div>
  `;
  }

  getHeaderTemplate(sortField = "", sortOrder = "") {
    return this.headerConfig.map(item => {return `
    <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order=${ sortField === item.id ? sortOrder : ""}>
      <span>${item.title}</span>
      ${ item.sortable ? `
      <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>
      ` : ''}
    </div>
    `;
    }).join('');
  }

  getDataTemplate() {
    return this.data.map(item => {
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
      ${this.getDataRowTemplate(item)}
      </a>
      `;
    }).join("");
  }

  getDataRowTemplate(item) {
    return this.headerConfig.map(h => {
      return `
            ${h.template ? h.template() : '<div class="sortable-table__cell">' + item[h.id] + '</div>'}`;
    }).join('');
  }

  render() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.getTemplate();
    this.element = tmp.firstElementChild;
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

  sort(fieldValue, orderValue) {
    const dataType = typeof this.data[0][fieldValue];
    const sortFunc = {
      'string': this.sortByStringField,
      'number': this.sortByNumberField
    };
    if (sortFunc[dataType] === undefined) {
      throw new Error(`unknown sorting field type ${dataType}`);
    }
    this.data = sortFunc[dataType](this.data, fieldValue, orderValue);
    this.subElements.header.innerHTML = this.getHeaderTemplate(fieldValue, orderValue);
    this.subElements.body.innerHTML = this.getDataTemplate();
  }

  sortByStringField(arr, field, param = "asc") {
    const order = {
      "asc": (a, b) => a[field].localeCompare(b[field], ["ru", "en"], { sensitivity: "case", caseFirst: "upper" }),
      "desc": (a, b) => b[field].localeCompare(a[field], ["ru", "en"], { sensitivity: "case", caseFirst: "upper" })
    };
    if (order[param] === undefined) {
      throw new Error(`unknown sorting type ${param}`);
    }
    return [...arr].sort(order[param]);
  }

  sortByNumberField(arr, field, param = "asc") {
    const order = {
      "asc": (a, b) => a[field] - b[field],
      "desc": (a, b) => b[field] - a[field]
    };
    if (order[param] === undefined) {
      throw new Error(`unknown sorting type ${param}`);
    }
    return [...arr].sort(order[param]);
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

