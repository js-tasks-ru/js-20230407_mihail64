class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }
  initialize () {
    document.addEventListener("pointerover", this.pointerover);
  }

  pointerover = (e) => {
    const target = e.target;
    const tooltip = target.closest('[data-tooltip]');
    if (tooltip) {
      this.render(tooltip.dataset.tooltip);
      tooltip.addEventListener("pointerout", this.pointerout);
      tooltip.addEventListener("pointermove", this.pointermove);
    }
  }
  pointerout = (e) => {
    e.target.removeEventListener("pointerout", this.pointerout);
    e.target.removeEventListener("pointermove", this.pointermove);
    this.remove();
  }

  pointermove = (e) => {
    const shift = 10;
    const left = e.clientX + shift;
    const top = e.clientY + shift;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  render (text) {
    const tooltip = document.createElement('div');
    tooltip.className = "tooltip";
    tooltip.textContent = text;
    this.element = tooltip;
    document.querySelector("body").append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    document.removeEventListener("pointerover", this.pointerover);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
