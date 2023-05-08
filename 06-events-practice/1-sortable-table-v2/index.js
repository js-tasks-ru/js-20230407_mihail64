export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}, isSortLocally = true) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.sortData(sorted.id, sorted.order);
    this.render();
    this.subElements.header.addEventListener("pointerdown", this.sortClick);
  }

  getTemplate() {
    return `
    <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaderTemplate(this.sorted.id, this.sorted.order)}
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

  getHeaderTemplate() {
    return this.headerConfig.map(item => {return `
    <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order=${ this.sorted.id === item.id ? this.sorted.order : ""}>
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

  sortClick = (event) => {
    let div = event.target.closest('[data-sortable="true"]');
    if (!div) {return;}

    if (this.sorted.id === div.dataset.id) {
      this.sorted.order = this.sorted.order === 'desc' ? 'asc' : 'desc';
    } else {
      this.sorted.id = div.dataset.id;
      this.sorted.order = 'desc';
    }

    this.sort();
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

  sort () {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }


  sortOnClient() {
    this.sortData(this.sorted.id, this.sorted.order);
    this.subElements.header.innerHTML = this.getHeaderTemplate();
    this.subElements.body.innerHTML = this.getDataTemplate();

  }

  sortOnServer() {
    throw new Error('Not implemented');
  }

  sortData() {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[this.sorted.order]; // undefined

    if (typeof direction === 'undefined') {
      throw new Error(`Unknown sorting value: ${this.sorted.order}`);
    }

    if (this.sorted.userCompareFunction) {
      this.data.sort((a, b) => {
        return direction * this.sorted.userCompareFunction(a, b);
      });
    } else {
      const dataType = typeof this.data[0][this.sorted.id];
      switch (dataType) {
      case 'string':
        this.data.sort((a, b) => {
          return direction * (a[this.sorted.id].localeCompare(b[this.sorted.id], ["ru", "en"], {caseFirst: 'upper'}));
        });
        break;
      case 'number':
        this.data.sort((a, b) => {
          return direction * (a[this.sorted.id] - b[this.sorted.id]);
        });
        break;
      default:
        throw new Error(`unknown sorting type ${dataType}`);
      }
    }
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
