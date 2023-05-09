import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  url = new URL(BACKEND_URL);
  throttleTimer;
  batchSize = 30;
  batchCount = 0;

  constructor(headerConfig, {
    data = [],
    url = "",
    isSortLocally = false,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url.pathname = url;
    this.isSortLocally = isSortLocally;


    this.render();
  }

  getTemplate() {
    return `
    <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${ this.getHeaderTemplate(this.sorted.id, this.sorted.order)}
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

  async render() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.getTemplate();
    this.element = tmp.firstElementChild;
    this.subElements = this.getSubElements();

    this.subElements.header.addEventListener("pointerdown", this.sortClick);
    await this.loadData();
    document.addEventListener("scroll", this.handleInfiniteScroll);
  }

  async loadData(id = this.sorted.id, order = this.sorted.order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', (this.batchSize * this.batchCount).toString());
    this.url.searchParams.set('_end', (this.batchSize * (this.batchCount + 1)).toString());

    this.subElements.loading.style.display = "block";

    let response = await fetch(this.url.toString());
    const newData = await response.json();
    if (newData.length < this.batchSize) {
      this.removeInfiniteScroll();
    }
    this.data.push(...newData);
    this.subElements.body.append(...this.renderData(newData));

    this.subElements.loading.style.display = "none";
  }

  renderData(data) {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.getDataTemplate(data);
    return tmp.children;
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

  getDataTemplate(data = this.data) {
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
      return h.template ? h.template([item]) : `<div class="sortable-table__cell">${item[h.id]}</div>`;
    }).join('');
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

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  }


  sortOnClient(id = this.sorted.id, order = this.sorted.order) {
    if (this.data.length) {
      this.sortData(id, order);
      this.subElements.header.innerHTML = this.getHeaderTemplate();
      this.subElements.body.innerHTML = this.getDataTemplate();
    }
  }



  async sortOnServer(id, order) {
    this.resetData();
    this.subElements.header.innerHTML = this.getHeaderTemplate();
    await this.loadData(id, order);
    this.batchCount++;
  }

  resetData() {
    this.batchCount = 0;
    this.data = [];
    this.subElements.body.innerHTML = "";
  }

  sortData(id = this.sorted.id, order = this.sorted.order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order]; // undefined

    if (typeof direction === 'undefined') {
      throw new Error(`Unknown sorting value: ${order}`);
    }

    const headerConf = this.headerConfig.find(f => f.id = this.sorted.id);

    const sortFunction = {
      user: (a, b) => { return direction * headerConf.userCompareFunction(a, b);},
      string: (a, b) => { return direction * a[id].localeCompare(b[id], ["ru", "en"], {caseFirst: 'upper'});},
      number: (a, b) => { return direction * (a[id] - b[id]);},
    };

    this.data = [...this.data.sort(sortFunction[headerConf.sortType])];
  }

  handleInfiniteScroll = () => {
    this.throttle(async () => {
      const endOfPage =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      if (endOfPage) {
        await this.loadData(this.sorted.id, this.sorted.order);
        this.batchCount++;
      }
    }, 1000);
  };

  throttle = (callback, time) => {
    if (this.throttleTimer) {return;}
    this.throttleTimer = true;
    setTimeout(() => {
      callback();
      this.throttleTimer = false;
    }, time);
  };

  removeInfiniteScroll = () => {
    document.removeEventListener("scroll", this.handleInfiniteScroll);
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeInfiniteScroll();
    this.element = null;
    this.subElements = {};
  }
}
